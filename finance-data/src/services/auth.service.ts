import { comparePassword, hashPassword } from "@/lib/pass";
import { signJwt } from "@/lib/jwt";
import { userRepo } from "@/repositories/user.repository";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw { status: 409, message: "Email already in use" };
    }

    const passHash = await hashPassword(input.password);
    const user = await userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash: passHash,
    });

    const token = signJwt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return { token, user: toSafeUser(user) };
  },

  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw { status: 401, message: "Invalid email or password" };
    }

    if (user.status !== "ACTIVE") {
      throw { status: 403, message: "User is inactive" };
    }

    const token = signJwt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return { token, user: toSafeUser(user) };
  },
};
