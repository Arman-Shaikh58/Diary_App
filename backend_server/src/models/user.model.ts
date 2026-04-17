import prisma from "../config/database";

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  encryptionKey: string;
}

export const UserModel = {
  async create(data: CreateUserData) {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        encryptionKey: data.encryptionKey,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async getEncryptionKey(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { encryptionKey: true },
    });
    return user?.encryptionKey ?? null;
  },
};
