import prisma from "../config/database";

export interface CreateImageData {
  entryId: string;
  userId: string;
  cloudinaryId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  displayOrder?: number;
}

export const ImageModel = {
  async create(data: CreateImageData) {
    return prisma.entryImage.create({
      data: {
        entryId: data.entryId,
        userId: data.userId,
        cloudinaryId: data.cloudinaryId,
        url: data.url,
        secureUrl: data.secureUrl,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes ? BigInt(data.bytes) : null,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  },

  async findByEntryId(entryId: string) {
    return prisma.entryImage.findMany({
      where: { entryId },
      orderBy: { displayOrder: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.entryImage.findUnique({
      where: { id },
    });
  },

  async deleteById(id: string) {
    return prisma.entryImage.delete({
      where: { id },
    });
  },

  async deleteByEntryId(entryId: string) {
    return prisma.entryImage.deleteMany({
      where: { entryId },
    });
  },

  async countByEntryId(entryId: string) {
    return prisma.entryImage.count({
      where: { entryId },
    });
  },
};
