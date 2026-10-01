import { createHash, randomBytes, randomUUID } from "node:crypto";

const hashSessionToken = (token) => createHash("sha256").update(token).digest("hex");

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
});

export const createAuthStore = (database) => {
  const users = database.collection("users");
  const sessions = database.collection("sessions");

  return {
    async initialize() {
      await users.createIndex({ email: 1 }, { unique: true, name: "unique_user_email" });
      await sessions.createIndex({ tokenHash: 1 }, { unique: true, name: "unique_session_token" });
      await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expire_old_sessions" });
    },
    async createUser({ name, email, phone, passwordHash }) {
      const user = {
        id: randomUUID(),
        name,
        email,
        phone,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      try {
        await users.insertOne(user);
        return publicUser(user);
      } catch (error) {
        if (error.code === 11000) return null;
        throw error;
      }
    },
    async findByEmail(email) {
      return users.findOne({ email });
    },
    async createSession(userId) {
      const token = randomBytes(32).toString("hex");
      await sessions.insertOne({
        tokenHash: hashSessionToken(token),
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return token;
    },
    async findUserForSession(token) {
      if (!token) return null;
      const session = await sessions.findOne({
        tokenHash: hashSessionToken(token),
        expiresAt: { $gt: new Date() },
      });
      if (!session) return null;
      const user = await users.findOne({ id: session.userId });
      return user ? publicUser(user) : null;
    },
    async deleteSession(token) {
      if (token) await sessions.deleteOne({ tokenHash: hashSessionToken(token) });
    },
    async updateProfile(userId, { name, phone }) {
      await users.updateOne({ id: userId }, { $set: { name, phone } });
      const user = await users.findOne({ id: userId });
      return user ? publicUser(user) : null;
    },
  };
};