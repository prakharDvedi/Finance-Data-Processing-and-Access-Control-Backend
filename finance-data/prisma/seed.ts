import { PrismaClient, Role, UserStatus, RecordType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin User",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: password,
    },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: password,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@example.com" },
    update: {
      name: "Analyst User",
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
      passwordHash: password,
    },
    create: {
      name: "Analyst User",
      email: "analyst@example.com",
      passwordHash: password,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {
      name: "Viewer User",
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
      passwordHash: password,
    },
    create: {
      name: "Viewer User",
      email: "viewer@example.com",
      passwordHash: password,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.financeRecord.createMany({
    data: [
      {
        amount: 5000,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date("2026-01-05T00:00:00.000Z"),
        notes: "January salary",
        createdBy: admin.id,
        isDeleted: false,
      },
      {
        amount: 1200,
        type: RecordType.EXPENSE,
        category: "Rent",
        date: new Date("2026-01-07T00:00:00.000Z"),
        notes: "Monthly rent",
        createdBy: admin.id,
        isDeleted: false,
      },
      {
        amount: 600,
        type: RecordType.EXPENSE,
        category: "Groceries",
        date: new Date("2026-02-03T00:00:00.000Z"),
        notes: "Food and essentials",
        createdBy: analyst.id,
        isDeleted: false,
      },
      {
        amount: 5200,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date("2026-02-05T00:00:00.000Z"),
        notes: "February salary",
        createdBy: admin.id,
        isDeleted: false,
      },
      {
        amount: 900,
        type: RecordType.EXPENSE,
        category: "Utilities",
        date: new Date("2026-03-10T00:00:00.000Z"),
        notes: "Electricity + internet",
        createdBy: viewer.id,
        isDeleted: false,
      },
      {
        amount: 5400,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date("2026-03-05T00:00:00.000Z"),
        notes: "March salary",
        createdBy: admin.id,
        isDeleted: false,
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
