import type { JwtUser } from "@/lib/jwt";
import { dashboardRepo } from "@/repositories/dashboard.repository";

export const dashboardService = {
  ensureDashboardAccess(user: JwtUser) {
    if (!["VIEWER", "ANALYST", "ADMIN"].includes(user.role)) {
      throw { status: 403, message: "Forbidden", code: "FORBIDDEN" };
    }
  },

  async getSummary(user: JwtUser) {
    this.ensureDashboardAccess(user);
    return dashboardRepo.getSummary();
  },

  async getRecent(user: JwtUser, limit?: number) {
    this.ensureDashboardAccess(user);

    const safeLimit = limit && limit > 0 && limit <= 50 ? limit : 5;
    return dashboardRepo.getRecent(safeLimit);
  },

  async getTrends(user: JwtUser, months?: number) {
    this.ensureDashboardAccess(user);

    const safeMonths = months && months > 0 && months <= 24 ? months : 6;
    return dashboardRepo.getTrends(safeMonths);
  },
};
