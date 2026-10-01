import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import { createApp } from "../src/server.js";

const users = new Map();
const sessions = new Map();
const authStore = {
  async createUser(details) {
    if (users.has(details.email)) return null;
    const user = { id: `user-${users.size + 1}`, ...details };
    users.set(user.email, user);
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  },
  async findByEmail(email) {
    return users.get(email) ?? null;
  },
  async createSession(userId) {
    const token = `session-${userId}`;
    sessions.set(token, userId);
    return token;
  },
  async findUserForSession(token) {
    const user = [...users.values()].find((item) => item.id === sessions.get(token));
    return user ? { id: user.id, name: user.name, email: user.email, phone: user.phone } : null;
  },
  async deleteSession(token) {
    sessions.delete(token);
  },
  async updateProfile(userId, profile) {
    const user = [...users.values()].find((item) => item.id === userId);
    if (!user) return null;
    Object.assign(user, profile);
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  },
};

let server;
let baseUrl;
before(async () => {
  server = createServer(createApp({
    authStore,
    store: { async findForAccount() { return []; } },
    clientUrl: "http://localhost:5173",
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => new Promise((resolve) => server.close(resolve)));

const postJson = (path, body, cookie) => fetch(`${baseUrl}${path}`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    ...(cookie ? { cookie } : {}),
  },
  body: JSON.stringify(body),
});

test("signup, login, account session, and logout work", async () => {
  const invalidSignup = await postJson("/api/auth/signup", {
    name: "A",
    email: "not-an-email",
    phone: "123",
    password: "short",
  });
  assert.equal(invalidSignup.status, 400);

  const signup = await postJson("/api/auth/signup", {
    name: "Taylor Patient",
    email: "Taylor@Example.com",
    phone: "555-010-1234",
    password: "patient-pass-123",
  });
  assert.equal(signup.status, 201);
  const user = (await signup.json()).user;
  assert.equal(user.email, "taylor@example.com");
  assert.equal("passwordHash" in user, false);

  const cookie = signup.headers.get("set-cookie").split(";")[0];
  assert.match(signup.headers.get("set-cookie"), /HttpOnly/);
  const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } });
  assert.equal((await me.json()).user.id, user.id);

  const duplicate = await postJson("/api/auth/signup", {
    name: "Taylor Patient",
    email: "taylor@example.com",
    phone: "555-010-1234",
    password: "patient-pass-123",
  });
  assert.equal(duplicate.status, 409);

  const incorrectLogin = await postJson("/api/auth/login", {
    email: "taylor@example.com",
    password: "wrong-password",
  });
  assert.equal(incorrectLogin.status, 401);

  const logout = await postJson("/api/auth/logout", {}, cookie);
  assert.equal(logout.status, 200);
  const afterLogout = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } });
  assert.equal(afterLogout.status, 401);

  const login = await postJson("/api/auth/login", {
    email: "taylor@example.com",
    password: "patient-pass-123",
  });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.id, user.id);
});