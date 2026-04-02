import { dashboardController } from "@/controllers/dashboard.controller";
import { handleRoute } from "@/lib/handler";

export const GET = handleRoute((req) => dashboardController.trends(req));
