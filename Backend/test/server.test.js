import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import { createApp } from "../src/server.js";

const bookings = new Map();
const store = {
  reserve(details) {
    if ([...bookings.values()].some((item) => item.doctorId === details.doctorId && item.date === details.date && item.time === details.time && item.status !== "expired")) return null;
    const booking = { ...details, id: `booking-${bookings.size + 1}`, accessToken: "test-token", status: "pending" };
    bookings.set(booking.id, booking);
    return booking;
  },
  attachCheckoutSession(id, sessionId) {
    const booking = bookings.get(id);
    booking.checkoutSessionId = sessionId;
    return booking;
  },
  confirm(id, sessionId, paymentIntentId) {
    const booking = bookings.get(id);
    if (!booking || booking.checkoutSessionId !== sessionId) return null;
    booking.status = "confirmed";
    booking.paymentIntentId = paymentIntentId;
    return booking;
  },
  release(id) {
    if (bookings.has(id)) bookings.get(id).status = "expired";
  },
  find(id) {
    return bookings.get(id) ?? null;
  },
};

let checkoutSession;
let checkoutExpiresAt;
const stripe = {
  checkout: {
    sessions: {
      async create(params) {
        checkoutExpiresAt = params.expires_at;
        checkoutSession = {
          id: "cs_test_paid",
          url: "https://checkout.stripe.test/session",
          mode: params.mode,
          status: "open",
          payment_status: "unpaid",
          metadata: params.metadata,
        };
        return checkoutSession;
      },
      async retrieve(sessionId) {
        if (sessionId !== checkoutSession?.id) throw new Error("Unknown session");
        return checkoutSession;
      },
    },
  },
  webhooks: {
    constructEvent() {
      return { type: "checkout.session.completed", data: { object: checkoutSession } };
    },
  },
};

let server;
let baseUrl;
before(async () => {
  server = createServer(createApp({ stripe, store, clientUrl: "http://localhost:5173" }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => new Promise((resolve) => server.close(resolve)));

const futureDate = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

const validBooking = (overrides = {}) => ({
  doctorId: "doc1",
  date: futureDate(),
  time: "10:00",
  patient: { name: "Taylor Patient", email: "taylor@example.com", phone: "555-010-1234" },
  ...overrides,
});

test("creates a Checkout session with the server-owned doctor fee", async () => {
  const response = await fetch(`${baseUrl}/api/checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBooking({ fee: 1 })),
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.checkoutUrl, "https://checkout.stripe.test/session");
  assert.equal(checkoutSession.mode, "payment");
  assert.equal(bookings.get(checkoutSession.metadata.bookingId).fee, 50);
  assert.ok(checkoutExpiresAt - Math.floor(Date.now() / 1000) >= 30 * 60);
});

test("rejects invalid appointment details and prevents a duplicate doctor slot", async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBooking({ time: "25:90" })),
  });
  assert.equal(invalidResponse.status, 400);

  const invalidDateResponse = await fetch(`${baseUrl}/api/checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBooking({ date: "2026-02-31", time: "12:00" })),
  });
  assert.equal(invalidDateResponse.status, 400);

  const duplicateResponse = await fetch(`${baseUrl}/api/checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBooking()),
  });
  assert.equal(duplicateResponse.status, 409);

  const differentDoctorResponse = await fetch(`${baseUrl}/api/checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBooking({ doctorId: "doc2" })),
  });
  assert.equal(differentDoctorResponse.status, 201);
});

test("confirms a booking only after Stripe reports paid", async () => {
  checkoutSession.status = "complete";
  const unpaidResponse = await fetch(`${baseUrl}/api/checkout-session/${checkoutSession.id}`);
  assert.equal(unpaidResponse.status, 402);

  checkoutSession.payment_status = "paid";
  checkoutSession.payment_intent = "pi_test_paid";
  const response = await fetch(`${baseUrl}/api/checkout-session/${checkoutSession.id}`);
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.booking.status, "confirmed");
  assert.equal(result.booking.id, bookings.get(checkoutSession.metadata.bookingId).id);
  assert.equal(result.accessToken, "test-token");
});

test("does not expose bookings without the booking access token", async () => {
  const bookingId = checkoutSession.metadata.bookingId;
  const denied = await fetch(`${baseUrl}/api/bookings/${bookingId}`);
  assert.equal(denied.status, 404);

  const allowed = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
    headers: { authorization: "Bearer test-token" },
  });
  assert.equal(allowed.status, 200);
  assert.equal((await allowed.json()).booking.status, "confirmed");
});