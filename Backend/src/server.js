import { fileURLToPath } from "node:url";
import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { createAuthStore } from "./authStore.js";
import { createBookingStore } from "./bookingStore.js";

const doctors = {
  doc1: { name: "Dr. Richard James", fee: 50 },
  doc2: { name: "Dr. Emily Larson", fee: 60 },
  doc3: { name: "Dr. Sarah Patel", fee: 30 },
  doc4: { name: "Dr. Christopher Lee", fee: 40 },
  doc5: { name: "Dr. Jennifer Garcia", fee: 50 },
  doc6: { name: "Dr. Andrew Williams", fee: 50 },
  doc7: { name: "Dr. Christopher Davis", fee: 50 },
  doc8: { name: "Dr. Timothy White", fee: 60 },
  doc9: { name: "Dr. Ava Mitchell", fee: 30 },
  doc10: { name: "Dr. Jeffrey King", fee: 40 },
  doc11: { name: "Dr. Zoe Kelly", fee: 50 },
  doc12: { name: "Dr. Patrick Harris", fee: 50 },
  doc13: { name: "Dr. Chloe Evans", fee: 50 },
  doc14: { name: "Dr. Ryan Martinez", fee: 60 },
  doc15: { name: "Dr. Amelia Hill", fee: 30 },
};

const appointmentTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sessionCookieName = "prescripto_session";
const sessionMaxAge = 30 * 24 * 60 * 60;

const readSessionToken = (cookieHeader = "") => {
  const cookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));
  return cookie ? decodeURIComponent(cookie.slice(sessionCookieName.length + 1)) : "";
};

const setSessionCookie = (response, token) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAge}${secure}`,
  );
};

const clearSessionCookie = (response) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
};

const publicBooking = (booking) => ({
  id: booking.id,
  doctorId: booking.doctorId,
  doctorName: booking.doctorName,
  fee: booking.fee,
  date: booking.date,
  time: booking.time,
  patient: booking.patient,
  status: booking.status,
  confirmedAt: booking.confirmedAt,
});

export const createApp = ({
  stripe,
  store = createBookingStore(),
  authStore,
  clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173",
  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET,
} = {}) => {
  const app = express();
  app.use(cors({ origin: clientUrl, credentials: true }));

  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (request, response) => {
    if (!stripe || !webhookSecret) {
      return response.status(503).json({ error: "Stripe webhook is not configured." });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        request.headers["stripe-signature"],
        webhookSecret,
      );
    } catch {
      return response.status(400).json({ error: "Invalid Stripe signature." });
    }

    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      await store.confirm(bookingId, session.id, session.payment_intent);
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      await store.confirm(bookingId, session.id, session.payment_intent);
    } else if (event.type === "checkout.session.expired") {
      await store.release(bookingId);
    }
    return response.json({ received: true });
  });

  app.use(express.json());

  app.use(async (request, _response, next) => {
    try {
      request.user = authStore
        ? await authStore.findUserForSession(readSessionToken(request.headers.cookie))
        : null;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/signup", async (request, response) => {
    if (!authStore) return response.status(503).json({ error: "Account service is not configured." });
    const { name, email, phone, password } = request.body ?? {};
    if (
      typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
      typeof email !== "string" || email.length > 254 || !validEmail.test(email) ||
      typeof phone !== "string" || phone.trim().length < 7 || phone.trim().length > 30 ||
      typeof password !== "string" || password.length < 8 || password.length > 72
    ) {
      return response.status(400).json({ error: "Enter a valid name, email, phone, and password of at least 8 characters." });
    }

    const user = await authStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash: await bcrypt.hash(password, 12),
    });
    if (!user) return response.status(409).json({ error: "An account with this email already exists." });
    setSessionCookie(response, await authStore.createSession(user.id));
    return response.status(201).json({ user });
  });

  app.post("/api/auth/login", async (request, response) => {
    if (!authStore) return response.status(503).json({ error: "Account service is not configured." });
    const { email, password } = request.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return response.status(400).json({ error: "Enter your email and password." });
    }
    const user = await authStore.findByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    setSessionCookie(response, await authStore.createSession(user.id));
    return response.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  });

  app.get("/api/auth/me", (request, response) => {
    if (!authStore) return response.status(503).json({ error: "Account service is not configured." });
    if (!request.user) return response.status(401).json({ error: "Sign in to continue." });
    return response.json({ user: request.user });
  });

  app.patch("/api/auth/profile", async (request, response) => {
    if (!authStore) return response.status(503).json({ error: "Account service is not configured." });
    if (!request.user) return response.status(401).json({ error: "Sign in to continue." });
    const { name, phone } = request.body ?? {};
    if (
      typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
      typeof phone !== "string" || phone.trim().length < 7 || phone.trim().length > 30
    ) {
      return response.status(400).json({ error: "Enter a valid name and phone number." });
    }
    const user = await authStore.updateProfile(request.user.id, { name: name.trim(), phone: phone.trim() });
    return response.json({ user });
  });

  app.post("/api/auth/logout", async (request, response) => {
    if (authStore) await authStore.deleteSession(readSessionToken(request.headers.cookie));
    clearSessionCookie(response);
    return response.json({ ok: true });
  });

  app.get("/api/bookings", async (request, response) => {
    if (!request.user) return response.status(401).json({ error: "Sign in to view account bookings." });
    const bookings = await store.findForAccount(request.user.id);
    return response.json({ bookings: bookings.map(publicBooking) });
  });

  app.post("/api/checkout-session", async (request, response) => {
    if (!stripe) return response.status(503).json({ error: "Stripe is not configured on the server." });

    const { doctorId, date, time, patient } = request.body ?? {};
    const doctor = doctors[doctorId];
    const appointmentDate = new Date(`${date}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const daysAhead = (appointmentDate.getTime() - today.getTime()) / 86400000;

    if (
      !doctor ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ||
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate.toISOString().slice(0, 10) !== date ||
      daysAhead < 0 ||
      daysAhead > 90 ||
      !appointmentTimes.includes(time) ||
      typeof patient?.name !== "string" ||
      patient.name.trim().length < 2 ||
      patient.name.trim().length > 100 ||
      !validEmail.test(patient?.email ?? "") ||
      typeof patient?.phone !== "string" ||
      patient.phone.trim().length < 7 ||
      patient.phone.trim().length > 30
    ) {
      return response.status(400).json({ error: "Enter valid appointment and contact details." });
    }

    const booking = await store.reserve({
      ...(request.user ? { accountId: request.user.id } : {}),
      doctorId,
      doctorName: doctor.name,
      fee: doctor.fee,
      date,
      time,
      patient: {
        name: patient.name.trim(),
        email: patient.email.trim().toLowerCase(),
        phone: patient.phone.trim(),
      },
    });
    if (!booking) return response.status(409).json({ error: "That appointment slot is no longer available." });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: booking.patient.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: booking.fee * 100,
              product_data: { name: `Appointment with ${booking.doctorName}` },
            },
          },
        ],
        metadata: { bookingId: booking.id },
        success_url: `${clientUrl}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/appointment/${doctorId}?checkout=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      });
      await store.attachCheckoutSession(booking.id, session.id);
      return response.status(201).json({ checkoutUrl: session.url });
    } catch (error) {
      await store.release(booking.id);
      console.error("Stripe Checkout session creation failed:", error.message);
      return response.status(502).json({ error: "Unable to start payment. Please try again." });
    }
  });

  app.get("/api/checkout-session/:sessionId", async (request, response) => {
    if (!stripe) return response.status(503).json({ error: "Stripe is not configured on the server." });
    try {
      const session = await stripe.checkout.sessions.retrieve(request.params.sessionId);
      const booking = await store.find(session.metadata?.bookingId);
      if (
        session.mode !== "payment" ||
        session.payment_status !== "paid" ||
        session.status !== "complete" ||
        !booking ||
        booking.checkoutSessionId !== session.id
      ) {
        return response.status(402).json({ error: "Payment has not been completed." });
      }

      const confirmed = await store.confirm(booking.id, session.id, session.payment_intent);
      if (!confirmed) return response.status(409).json({ error: "This booking cannot be confirmed." });
      return response.json({ booking: publicBooking(confirmed), accessToken: confirmed.accessToken });
    } catch (error) {
      console.error("Stripe Checkout verification failed:", error.message);
      return response.status(400).json({ error: "Unable to verify this payment." });
    }
  });

  app.get("/api/bookings/:bookingId", async (request, response) => {
    const booking = await store.find(request.params.bookingId);
    const suppliedToken = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!booking || !suppliedToken || suppliedToken !== booking.accessToken) {
      return response.status(404).json({ error: "Booking not found." });
    }
    return response.json({ booking: publicBooking(booking) });
  });

  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
  app.use((error, _request, response, _next) => {
    console.error("Unhandled API error:", error);
    response.status(500).json({ error: "An unexpected server error occurred." });
  });

  return app;
};

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
  const store = createBookingStore();
  const port = Number(process.env.PORT ?? 4242);
  try {
    await store.connect();
    const authStore = createAuthStore(store.database());
    await authStore.initialize();
    const app = createApp({ stripe, store, authStore });
    app.listen(port, () => console.log(`Doctor booking API listening on port ${port}`));
  } catch (error) {
    await store.close();
    console.error("Unable to connect to MongoDB:", error.message);
    process.exitCode = 1;
  }
}