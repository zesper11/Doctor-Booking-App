import assert from "node:assert/strict";
import { test } from "node:test";
import { createBookingStore } from "../src/bookingStore.js";

const createFakeMongoClient = () => {
  const documents = [];
  let index;
  let selectedDatabase;
  let closed = false;

  const matches = (document, query) => Object.entries(query).every(([key, value]) => {
    if (value && typeof value === "object" && "$lte" in value) {
      return document[key] <= value.$lte;
    }
    return document[key] === value;
  });

  const collection = {
    async createIndex(keys, options) {
      index = { keys, options };
    },
    async updateMany(query, update) {
      for (const document of documents.filter((item) => matches(item, query))) {
        Object.assign(document, update.$set);
      }
    },
    async insertOne(document) {
      const duplicate = documents.some((item) =>
        item.activeSlot && document.activeSlot &&
        item.doctorId === document.doctorId &&
        item.date === document.date &&
        item.time === document.time,
      );
      if (duplicate) throw Object.assign(new Error("Duplicate active slot"), { code: 11000 });
      documents.push(structuredClone(document));
    },
    async updateOne(query, update) {
      const document = documents.find((item) => matches(item, query));
      if (!document) return { matchedCount: 0 };
      Object.assign(document, update.$set);
      return { matchedCount: 1 };
    },
    async findOne(query) {
      const document = documents.find((item) => matches(item, query));
      return document ? structuredClone(document) : null;
    },
  };

  return {
    documents,
    get index() { return index; },
    get selectedDatabase() { return selectedDatabase; },
    get closed() { return closed; },
    client: {
      async connect() {},
      db(name) {
        selectedDatabase = name;
        return { collection: () => collection };
      },
      async close() { closed = true; },
    },
  };
};

test("MongoDB store reserves unique slots and persists booking state transitions", async () => {
  const fakeMongo = createFakeMongoClient();
  const store = createBookingStore({
    uri: "mongodb://localhost:27017",
    dbName: "booking-tests",
    client: fakeMongo.client,
  });
  await store.connect();

  assert.equal(fakeMongo.selectedDatabase, "booking-tests");
  assert.deepEqual(fakeMongo.index.options.partialFilterExpression, { activeSlot: true });
  assert.equal(fakeMongo.index.options.unique, true);

  const details = {
    doctorId: "doc1",
    doctorName: "Dr. Richard James",
    fee: 50,
    date: "2026-10-02",
    time: "10:00",
    patient: { name: "Taylor Patient", email: "taylor@example.com", phone: "555-010-1234" },
  };
  const booking = await store.reserve(details);
  assert.equal(booking.status, "pending");
  assert.equal(booking.activeSlot, true);
  assert.equal(await store.reserve(details), null);

  await store.attachCheckoutSession(booking.id, "cs_test_booking");
  const confirmed = await store.confirm(booking.id, "cs_test_booking", "pi_test_booking");
  assert.equal(confirmed.status, "confirmed");
  assert.equal((await store.confirm(booking.id, "cs_test_booking", "pi_test_booking")).status, "confirmed");

  const expiredBooking = await store.reserve({ ...details, time: "11:00" });
  fakeMongo.documents.find((item) => item.id === expiredBooking.id).expiresAt = new Date(Date.now() - 1000).toISOString();
  const replacement = await store.reserve({ ...details, time: "11:00" });
  assert.notEqual(replacement.id, expiredBooking.id);
  assert.equal(fakeMongo.documents.find((item) => item.id === expiredBooking.id).activeSlot, false);

  await store.close();
  assert.equal(fakeMongo.closed, true);
});