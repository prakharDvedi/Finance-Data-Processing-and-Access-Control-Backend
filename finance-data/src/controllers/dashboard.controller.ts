import { authenticate } from "@/lib/auth";
import { dashboardService } from "@/services/dashboard.service";

function parsePosInt(value: string | null, fallback: number, max: number) {
  if (!value) return fallback;
  const n = Number(value);
  if (Number.isNaN(n) || n < 1 || n > max) {
    throw {
      status: 400,
      message: "Invalid query parameter",
      code: "INVALID_QUERY",
    };
  }
  return n;
}

export const dashboardController = {
  async summary(req: Request) {
    const user = authenticate(req);
    const result = await dashboardService.getSummary(user);
    return Response.json(result, { status: 200 });
  },

  async recent(req: Request) {
    const user = authenticate(req);
    const u = new URL(req.url);
    const limit = parsePosInt(u.searchParams.get("limit"), 5, 50);

    const result = await dashboardService.getRecent(user, limit);
    return Response.json(result, { status: 200 });
  },

  async trends(req: Request) {
    const user = authenticate(req);
    const u = new URL(req.url);
    const months = parsePosInt(u.searchParams.get("months"), 6, 24);

    const result = await dashboardService.getTrends(user, months);
    return Response.json(result, { status: 200 });
  },
};
