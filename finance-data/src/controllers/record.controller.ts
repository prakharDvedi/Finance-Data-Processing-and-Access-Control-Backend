import { authenticate } from "@/lib/auth";
import { recordService } from "@/services/record.service";
import { createRecordSchema, updateRecordSchema } from "@/schema/records";

function parseQuery(url: string) {
  const u = new URL(url);
  const pageRaw = u.searchParams.get("page");
  const limitRaw = u.searchParams.get("limit");

  const page = pageRaw ? parseInt(pageRaw) : 1;
  const limit = limitRaw ? parseInt(limitRaw) : 10;

  if (Number.isNaN(page) || page < 1) {
    throw { status: 400, message: "Invalid page number" };
  }
  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    throw { status: 400, message: "Invalid limit" };
  }

  return {
    type:
      (u.searchParams.get("type") as "INCOME" | "EXPENSE" | null) ?? undefined,
    category: u.searchParams.get("category") ?? undefined,
    dateFrom: u.searchParams.get("dateFrom") ?? undefined,
    dateTo: u.searchParams.get("dateTo") ?? undefined,
    page,
    limit,
  };
}

export const recordController = {
    // create function recieves inputs as json return 201
  async create(req: Request) {
    const user = authenticate(req);
    const body = await req.json();
    const input = createRecordSchema.parse(body);
    const result = await recordService.create(user, input);
    return Response.json(result, { status: 201 });
  },
// list function will receive query params for filters and pagination returns 200
  async list(req: Request) {
    const user = authenticate(req);
    const filters = parseQuery(req.url);
    const result = await recordService.list(user, filters);
    return Response.json(result, { status: 200 });
  },
// getById function recieves record id as param return 200
  async getById(req: Request, id: string) {
    const user = authenticate(req);
    const result = await recordService.getById(user, id);
    return Response.json(result, { status: 200 });
  },
// update function recieves record id as param and inputs as json return 200
  async update(req: Request, id: string) {
    const user = authenticate(req);
    const body = await req.json();
    const input = updateRecordSchema.parse(body);
    const result = await recordService.update(user, id, input);
    return Response.json(result, { status: 200 });
  },
// remove function recieve record id as param return 200
  async remove(req: Request, id: string) {
    const user = authenticate(req);
    await recordService.remove(user, id);
    return Response.json({ message: "Record removed" }, { status: 200 });
  },
};