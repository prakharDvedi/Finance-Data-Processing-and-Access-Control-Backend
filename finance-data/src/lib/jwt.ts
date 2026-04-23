import jwt from "jsonwebtoken";
import { config } from "./config";

export type JwtUser = {
  id: string;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  name: string;
};

export function signJwt(user: JwtUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
}
