import { authenticate } from "@/lib/auth";
import { updateRoleSchema, updateStatusSchema } from "@/schema/users";
import { userService } from "@/services/user.service";

export const userController = {
  async list(req: Request) {
    const actor = authenticate(req);
    const users = await userService.listUsers(actor);
    return Response.json(users, { status: 200 });
  },

  async updateRole(req: Request, id: string) {
    const actor = authenticate(req);
    const body = await req.json();
    const input = updateRoleSchema.parse(body);

    const user = await userService.updateRole(actor, id, input.role);
    return Response.json(user, { status: 200 });
  },

  async updateStatus(req: Request, id: string) {
    const actor = authenticate(req);
    const body = await req.json();
    const input = updateStatusSchema.parse(body);

    const user = await userService.updateStatus(actor, id, input.status);
    return Response.json(user, { status: 200 });
  },
};
