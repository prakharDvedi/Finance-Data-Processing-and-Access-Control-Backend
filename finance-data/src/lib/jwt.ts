import jwt from "jsonwebtoken";

export type JwtUser = {
  id: string;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  name: string;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return secret;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export function signJwt(user: JwtUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name,
    },
    getSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, getSecret()) as jwt.JwtPayload;
}
