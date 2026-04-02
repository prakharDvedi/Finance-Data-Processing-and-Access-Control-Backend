import request from "supertest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Auth integration", () => {
  test("register + login returns JWT", async () => {
    const email = `user_${Date.now()}@example.com`;

    const registerRes = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
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

  test("viewer is blocked from creating a record", async () => {
    // to check viewe role cannot create records we will register a new user and not assign any role so it will be viewer by default then try to create record with that user and it should fail with 403
    const email = `viewer_${Date.now()}@example.com`;
    const password = "password123";

    const registerRes = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "viewer",
        email,
        password,
      });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(BASE_URL).post("/api/auth/login").send({
      email,
      password,
    });

    expect(loginRes.status).toBe(200);
    const viewToken = loginRes.body.token as string;

    const createRes = await request(BASE_URL)
      .post("/api/records")
      .set("Authorization", `Bearer ${viewToken}`)
      .send({
        amount: 1000,
        type: "INCOME",
        category: "Salary",
        date: new Date().toISOString(),
        notes: "viewer should fail",
      });

    expect(createRes.status).toBe(403);
  });
});
