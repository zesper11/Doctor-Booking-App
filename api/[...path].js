import "dotenv/config";
import Stripe from "stripe";
import { createApp } from "../Backend/src/server.js";
import { createAuthStore } from "../Backend/src/authStore.js";
import { createBookingStore } from "../Backend/src/bookingStore.js";

let appPromise;

const initializeApp = async () => {
  const store = createBookingStore();
  await store.connect();
  const authStore = createAuthStore(store.database());
  await authStore.initialize();
  const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
  return createApp({ stripe, store, authStore });
};

export default async function handler(request, response) {
  try {
    appPromise ??= initializeApp();
    const app = await appPromise;
    return app(request, response);
  } catch (error) {
    appPromise = null;
    console.error("Unable to initialize the API:", error.message);
    response.statusCode = 503;
    response.setHeader("Content-Type", "application/json");
    return response.end(JSON.stringify({ error: "The API is temporarily unavailable." }));
  }
}