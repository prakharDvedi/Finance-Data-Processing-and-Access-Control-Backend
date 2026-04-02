import request from "supertest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Auth integration", () => {
  test("register + login returns JWT", async () => {
    const email = `user_${Date.now()}@example.com`;

    const registerRes = await request(BASE_URL).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "password123",
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user.email).toBe(email);

    const loginRes = await request(BASE_URL).post("/api/auth/login").send({
      email,
      password: "password123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user.email).toBe(email);
  });
});
