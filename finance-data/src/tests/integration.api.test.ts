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

  test("analyst can read records but cannot create", async () => {
    const email = `analyst_${Date.now()}@example.com`;
    const password = "password123";

    // register -> default role is viewer -> login -> get token -> try to list records (should work) -> try to create record (should fail)
    const registerRes = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "Analyst User",
        email,
        password,
      });
    expect(registerRes.status).toBe(201);

    // promote to ANALYST directly in DB via existing admin endpoint is not possible here,
    // so im  using analyst account for  test
    const loginRes = await request(BASE_URL).post("/api/auth/login").send({
      email: "analyst@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);

    const analystToken = loginRes.body.token as string;

    const listRes = await request(BASE_URL)
      .get("/api/records?page=1&limit=10")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(listRes.status).toBe(200);

    const createRes = await request(BASE_URL)
      .post("/api/records")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        amount: 1200,
        type: "INCOME",
        category: "Salary",
        date: new Date().toISOString(),
        notes: "analyst create attempt",
      });

    expect(createRes.status).toBe(403);
  });

  test("admin can create, read, update, and soft delete record", async () => {
    const adminLogin = await request(BASE_URL).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.token as string;

    // create a record
    const createRes = await request(BASE_URL)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 2000,
        type: "INCOME",
        category: "Consulting",
        date: new Date().toISOString(),
        notes: "admin created",
      });

    expect(createRes.status).toBe(201);
    const recordId = createRes.body.id as string;
    expect(recordId).toBeTruthy();

    // reads
    const getRes = await request(BASE_URL)
      .get(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);

    // updates
    const patchRes = await request(BASE_URL)
      .patch(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ notes: "updated by admin test" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.notes).toBe("updated by admin test");

    // deletes -> soft delete
    const deleteRes = await request(BASE_URL)
      .delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });
});
