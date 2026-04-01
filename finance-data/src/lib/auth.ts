import { verifyToken } from "./jwt";
import type { JwtUser } from "./jwt";

export function authenticate(req: Request): JwtUser {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    throw { status: 401, message: "Missing or invalid Authorization header" };
  }

  const token = auth.slice(7);
  const payload = verifyToken(token);

  if (!payload?.sub) {
    throw { status: 401, message: "Invalid token" };
  }

  if (payload.status !== "ACTIVE") {
    throw { status: 403, message: "User is inactive" };
  }

  return {
    id: payload.sub as string,
    email: payload.email as string,
    role: payload.role as JwtUser["role"],
    status: payload.status as JwtUser["status"],
    name: payload.name as string,
  };
}

export function authorize(user: JwtUser, roles: JwtUser["role"][]) {
  if (!roles.includes(user.role)) {
    throw { status: 403, message: "Forbidden" };
  }
}
