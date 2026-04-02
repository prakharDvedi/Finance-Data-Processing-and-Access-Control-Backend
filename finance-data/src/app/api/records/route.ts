import { handleRoute } from "@/lib/handler";
import { recordController } from "@/controllers/record.controller";

export const POST = handleRoute((req) => recordController.create(req));
export const GET = handleRoute((req) => recordController.list(req));