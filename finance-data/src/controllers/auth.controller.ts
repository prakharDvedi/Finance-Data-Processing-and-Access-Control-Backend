import { loginSchema, registerSchema } from "@/schema/auth";
import { authService } from "@/services/auth.service";

export const authController = {
  async register(req: Request) {
    const body = await req.json();
    const inputs = registerSchema.parse(body);
    const results = await authService.register(inputs);
    return (Response.json(results), { status: 201 });
  },
  async login(req: Request) {
    const body = await req.json();
    const inputs = loginSchema.parse(body);
    const results = await authService.login(inputs);
    return Response.json(results, { status: 200 });
  },
};
