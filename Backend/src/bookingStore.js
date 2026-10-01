import { randomBytes, randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

export const createBookingStore = ({
  uri = process.env.MONGODB_URI,
  dbName = process.env.MONGODB_DB_NAME ?? "prescripto",
  client = uri ? new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }) : null,
} = {}) => {
  let bookings;
  let database;

  const getCollection = () => {
    if (!bookings) throw new Error("MongoDB booking store is not connected.");
    return bookings;
  };

  return {
    async connect() {
      if (!client) throw new Error("Set MONGODB_URI to connect to MongoDB.");
      await client.connect();
      database = client.db(dbName);
      bookings = database.collection("bookings");
      await bookings.createIndex(
        { doctorId: 1, date: 1, time: 1 },
        {
          unique: true,
          name: "one_active_booking_per_doctor_slot",
          partialFilterExpression: { activeSlot: true },
        },
      );
    },
    async reserve(details) {
      const collection = getCollection();
      const now = new Date();
      await collection.updateMany(
        { status: "pending", expiresAt: { $lte: now.toISOString() } },
        { $set: { status: "expired", activeSlot: false } },
      );

      const booking = {
        ...details,
        id: randomUUID(),
        accessToken: randomBytes(32).toString("hex"),
        status: "pending",
        activeSlot: true,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 35 * 60 * 1000).toISOString(),
      };

      try {
        await collection.insertOne(booking);
        return booking;
      } catch (error) {
        if (error.code === 11000) return null;
        throw error;
      }
    },
    async attachCheckoutSession(bookingId, sessionId) {
      const collection = getCollection();
      const result = await collection.updateOne(
        { id: bookingId, status: "pending" },
        { $set: { checkoutSessionId: sessionId } },
      );
      return result.matchedCount ? collection.findOne({ id: bookingId }) : null;
    },
    async confirm(bookingId, sessionId, paymentIntentId) {
      const collection = getCollection();
      const result = await collection.updateOne(
        { id: bookingId, checkoutSessionId: sessionId, status: "pending" },
        {
          $set: {
            status: "confirmed",
            paymentIntentId,
            confirmedAt: new Date().toISOString(),
          },
        },
      );
      const booking = await collection.findOne({ id: bookingId });
      if (result.matchedCount || (booking?.status === "confirmed" && booking.checkoutSessionId === sessionId)) {
        return booking;
      }
      return null;
    },
    async release(bookingId) {
      await getCollection().updateOne(
        { id: bookingId, status: "pending" },
        { $set: { status: "expired", activeSlot: false } },
      );
    },
    async find(bookingId) {
      return getCollection().findOne({ id: bookingId });
    },
    async findForAccount(accountId) {
      return getCollection()
        .find({ accountId, status: "confirmed" })
        .sort({ date: 1, time: 1 })
        .toArray();
    },
    database() {
      if (!database) throw new Error("MongoDB booking store is not connected.");
      return database;
    },
    async close() {
      if (client) await client.close();
    },
  };
};