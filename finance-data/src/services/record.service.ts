import type { JwtUser } from "@/lib/jwt";
import { recordRepo } from "@/repositories/record.repository";

type createInput = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  notes?: string;
};

type updateInput = Partial<createInput>;

type listFilters = {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export const recordService = {
  async create(user: JwtUser, input: createInput) {
    //only for adminn
    if (user.role !== "ADMIN") {
      throw { status: 403, message: "not authorized" };
    }
    return recordRepo.create({
      ...input,
      createdBy: user.id,
    });
  },
  async list(user: JwtUser, filters: listFilters) {
    //only for analyst and admin
    if (user.role === "VIEWER") {
      throw { status: 403, message: "not authorized" };
    }
    return recordRepo.list(filters);
  },

  async getById(user: JwtUser, id: string) {
    if (!["ANALYST", "ADMIN"].includes(user.role)) {
      throw { status: 403, message: "not authorized" };
    }
    const record = await recordRepo.findById(id);
    if (!record) {
      throw { status: 404, message: "record not found" };
    }
    return record;
  },
  async update(user: JwtUser, id: string, data: updateInput) {
    if (user.role !== "ADMIN") {
      throw { status: 403, message: "not authorized" };
    }

    const existing = await recordRepo.findById(id);
    if (!existing) {
      throw { status: 404, message: "record not found" };
    }
    return recordRepo.update(id, data);
  },

  async remove(user: JwtUser, id: string) {
    if (user.role !== "ADMIN") {
      throw { status: 403, message: "not authorized" };
    }

    const existing = await recordRepo.findById(id);
    if (!existing) {
      throw { status: 404, message: "record not found" };
    }
    return recordRepo.softDelete(id);
  },
};
