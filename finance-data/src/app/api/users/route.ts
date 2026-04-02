import { handleRoute } from "@/lib/handler";
import { userController } from "@/controllers/user.controller";

export const GET = handleRoute((req) => userController.list(req));
