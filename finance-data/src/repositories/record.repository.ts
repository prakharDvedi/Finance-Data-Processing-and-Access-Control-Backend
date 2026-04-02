import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type listFilter = {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export const recordRepo = {
  create(data: {
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    date: string;
    notes?: string;
    createdBy: string;
  }) {
    return prisma.financeRecord.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });
  },

  async list(filters: listFilter) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FinanceRecordWhereInput = {
      isDeleted: false,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            date: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.financeRecord.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.financeRecord.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById(id: string) {
    return prisma.financeRecord.findFirst({
      where: { id, isDeleted: false },
    });
  },

  update(
    id: string,
    data: Partial<{
      amount: number;
      type: "INCOME" | "EXPENSE";
      category: string;
      date: string;
      notes?: string;
    }>,
  ) {
    return prisma.financeRecord.update({
      where: { id },
      data: {
        ...(data.amount !== undefined
          ? { amount: new Prisma.Decimal(data.amount) }
          : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
  },

  softDelete(id: string) {
    return prisma.financeRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
