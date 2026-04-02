import request from "supertest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Finance backend integration", () => {
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
    // register a fresh user, default role is VIEWER, then try creating a record
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
    // using seeded analyst account directly
    const loginRes = await request(BASE_URL).post("/api/auth/login").send({
      email: "analyst@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);

    const analystToken = loginRes.body.token as string;

    // analyst should be able to list
    const listRes = await request(BASE_URL)
      .get("/api/records?page=1&limit=10")
      .set("Authorization", `Bearer ${analystToken}`);
    expect(listRes.status).toBe(200);

    // but not create
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

    // create
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

    // read
    const getRes = await request(BASE_URL)
      .get(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);

    // update
    const patchRes = await request(BASE_URL)
      .patch(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ notes: "updated by admin test" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.notes).toBe("updated by admin test");

    // soft delete
    const deleteRes = await request(BASE_URL)
      .delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe("Record removed");
  });

  test("dashboard summary returns expected aggregation fields", async () => {
    const adminLogin = await request(BASE_URL).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.token as string;

    const summaryRes = await request(BASE_URL)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body).toHaveProperty("total_income");
    expect(summaryRes.body).toHaveProperty("total_expense");
    expect(summaryRes.body).toHaveProperty("net");
    expect(summaryRes.body).toHaveProperty("byCategory");
    expect(Array.isArray(summaryRes.body.byCategory)).toBe(true);
  });

  test("soft deleted record is hidden from get and list", async () => {
    const adminLogin = await request(BASE_URL).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.token as string;

    // create a record specifically to delete
    const createRes = await request(BASE_URL)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 999,
        type: "EXPENSE",
        category: "TestDelete",
        date: new Date().toISOString(),
        notes: "to be soft deleted",
      });
    expect(createRes.status).toBe(201);
    const recordId = createRes.body.id as string;

    // soft delete it
    const deleteRes = await request(BASE_URL)
      .delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);

    // should not be found by id anymore
    const getRes = await request(BASE_URL)
      .get(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(404);

    // should not appear in list either
    const listRes = await request(BASE_URL)
      .get("/api/records?page=1&limit=100")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);

    const found = (listRes.body.items || []).find(
      (r: { id: string }) => r.id === recordId,
    );
    expect(found).toBeUndefined();
  });
});
