import { loginSchema, registerSchema } from "@/schema/auth";
import { authService } from "@/services/auth.service";

export const authController = {
  async register(req: Request): Promise<Response> {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const result = await authService.register(input);
    return Response.json(result, { status: 201 });
  },

  async login(req: Request): Promise<Response> {
    const body = await req.json();
    const input = loginSchema.parse(body);
    const result = await authService.login(input);
    return Response.json(result, { status: 200 });
  },
};
