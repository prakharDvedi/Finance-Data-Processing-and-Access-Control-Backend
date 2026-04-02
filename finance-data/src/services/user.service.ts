import type { JwtUser } from "@/lib/jwt";
import { userRepo } from "@/repositories/user.repository";

type Role = "VIEWER" | "ANALYST" | "ADMIN";
type Status = "ACTIVE" | "INACTIVE";

function ensureAdmin(actor: JwtUser) {
  if (actor.role !== "ADMIN") {
    throw { Status: 403, message: "Forbidden", code: "FORBIDDEN" };
  }
}

export const userService = {
  async listUsers(actor: JwtUser) {
    ensureAdmin(actor);
    return userRepo.listUsers();
  },

  async updateRole(actor: JwtUser, userId: string, Role: Role) {
    ensureAdmin(actor);

    const target = await userRepo.findById(userId);
    if (!target) {
      throw { Status: 404, message: "User not found", code: "USER_NOT_FOUND" };
    }

    return userRepo.updateRole(userId, Role);
  },

  async updateStatus(actor: JwtUser, userId: string, Status: Status) {
    ensureAdmin(actor);

    const target = await userRepo.findById(userId);
    if (!target) {
      throw { Status: 404, message: "User not found", code: "USER_NOT_FOUND" };
    }

    return userRepo.updateStatus(userId, Status);
  },
};
