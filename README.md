This is Finance Data Processing assignment for Zorvyn

the tech stack used is

- Next
- React
- Prisma
- zod
- jsonwebtoken
- tailwind
- bcrypt

a dashboard where people will be able to view summary, trends and recent updations etc
admin has more access so can do more

the admin has access to update roles
Admin User Management APIs.

ALL Apis

Use this full checklist in Postman.

**Auth**

1. `POST /api/auth/register`

- Body:

```json
{
  "name": "Viewer One",
  "email": "viewer1@example.com",
  "password": "password123"
}
```

- Expect: `201`, returns `token`, `user.role = VIEWER`

2. `POST /api/auth/login`

- Body:

```json
{ "email": "viewer1@example.com", "password": "password123" }
```

- Expect: `200`, returns `token`

3. Negative

- Duplicate register -> `409`
- Wrong password -> `401`
- Invalid email/body -> `400`

**Records** 4. `POST /api/records` (ADMIN token)

- Body:

```json
{
  "amount": 1000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-02T00:00:00.000Z",
  "notes": "test income"
}
```

- Expect: `201`

5. `GET /api/records?page=1&limit=10` (ADMIN or ANALYST)

- Expect: `200`, `items` + `meta`

6. `GET /api/records/{id}` (ADMIN or ANALYST)

- Expect: `200`

7. `PATCH /api/records/{id}` (ADMIN)

- Body:

```json
{ "notes": "updated note" }
```

- Expect: `200`

8. `DELETE /api/records/{id}` (ADMIN)

- Expect: `200` (soft delete)

9. Soft delete verification

- `GET /api/records/{id}` -> `404`
- `GET /api/records` -> deleted row not present

10. RBAC negative

- `POST /api/records` with ANALYST/VIEWER -> `403`
- `GET /api/records` with VIEWER -> `403`

**Dashboard** (VIEWER + ANALYST + ADMIN all allowed) 11. `GET /api/dashboard/summary` -> `200` 12. `GET /api/dashboard/recent?limit=5` -> `200` 13. `GET /api/dashboard/trends?months=6` -> `200`

**Users (Admin only)** 14. `GET /api/users` (ADMIN) -> `200` 15. `PATCH /api/users/{id}/role` (ADMIN)

- Body:

```json
{ "role": "ANALYST" }
```

- Expect: `200`

16. `PATCH /api/users/{id}/status` (ADMIN)

- Body:

```json
{ "status": "INACTIVE" }
```

- Expect: `200`

17. RBAC negative on user routes

- Any above with ANALYST/VIEWER token -> `403`

Base URL:

- `http://localhost:3000`

Auth header format:

- `Authorization: Bearer <token>`
