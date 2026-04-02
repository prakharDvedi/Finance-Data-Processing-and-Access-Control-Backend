import { authController } from "@/controllers/auth.controller";
import { handleRoute } from "@/lib/handler";

export const POST = handleRoute((req) => authController.register(req));
