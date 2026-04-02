import { handleRoute } from "@/lib/handler";
import { userController } from "@/controllers/user.controller";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handleRoute(async (req, context: Ctx) => {
  const { id } = await context.params;
  return userController.updateRole(req, id);
});
