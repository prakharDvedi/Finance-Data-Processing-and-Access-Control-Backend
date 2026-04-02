import { prisma } from "@/lib/prisma";

type trendRow = {
  month: string;
  income: number;
  expense: number;
};

export const dashboardRepo = {
  async getSummary() {
    const [incomeAgg, expenseAgg, categoryAgg] = await Promise.all([
      prisma.financeRecord.aggregate({
        where: { isDeleted: false, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financeRecord.aggregate({
        where: { isDeleted: false, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.financeRecord.groupBy({
        by: ["category", "type"],
        where: { isDeleted: false },
        _sum: { amount: true },
        orderBy: { category: "asc" },
      }),
    ]);

    const total_income = Number(incomeAgg._sum.amount ?? 0);
    const total_expense = Number(expenseAgg._sum.amount ?? 0);

    const byCategory = categoryAgg.map((row) => ({
      category: row.category,
      type: row.type,
      total: Number(row._sum.amount ?? 0),
    }));

    return {
      total_income,
      total_expense,
      net: total_income - total_expense,
      byCategory,
    };
  },

  async getRecent(limit = 5) {
    const records = await prisma.financeRecord.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));
  },

  async getTrends(months = 6): Promise<trendRow[]> {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - (months - 1));

    const rows = await prisma.financeRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: start },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
      orderBy: { date: "asc" },
    });

    const bucket = new Map<string, trendRow>();

    for (const row of rows) {
      const d = new Date(row.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

      if (!bucket.has(key)) {
        bucket.set(key, { month: key, income: 0, expense: 0 });
      }

      const current = bucket.get(key)!;
      const amount = Number(row.amount);

      if (row.type === "INCOME") current.income += amount;
      if (row.type === "EXPENSE") current.expense += amount;
    }

    return Array.from(bucket.values());
  },
};
