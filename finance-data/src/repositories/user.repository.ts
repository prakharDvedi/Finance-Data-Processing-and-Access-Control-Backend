import { prisma } from "@/lib/prisma";
export const userRepo = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: "VIEWER" | "ANALYST" | "ADMIN";
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? "VIEWER",
      },
    });
  },
};
