import { handleRoute } from "@/lib/handler";
import { recordController } from "@/controllers/record.controller";

type ctx = {
  params: Promise<{ id: string }>;
};

export const GET = handleRoute(async (req, context: ctx) => {
  const { id } = await context.params;
  return recordController.getById(req, id);
});

export const PATCH = handleRoute(async (req, context: ctx) => {
  const { id } = await context.params;
  return recordController.update(req, id);
});

export const DELETE = handleRoute(async (req, context: ctx) => {
  const { id } = await context.params;
  return recordController.remove(req, id);
});
