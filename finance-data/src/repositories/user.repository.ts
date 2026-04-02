import { prisma } from "@/lib/prisma";
export const userRepo = {
  listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  updateRole(id: string, role: "VIEWER" | "ANALYST" | "ADMIN") {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },

  updateStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: "VIEWER",
      },
    });
  },
};
