import prisma from "../config/database";

export interface CreateEntryData {
  userId: string;
  entryDate: Date;
  title?: string;
  contentCipher: string;
  contentIv: string;
  contentTag: string;
  mood?: string;
}

export interface UpdateEntryData {
  title?: string;
  contentCipher?: string;
  contentIv?: string;
  contentTag?: string;
  mood?: string;
}

export const EntryModel = {
  async upsert(data: CreateEntryData) {
    return prisma.diaryEntry.upsert({
      where: {
        uq_user_date: {
          userId: data.userId,
          entryDate: data.entryDate,
        },
      },
      create: {
        userId: data.userId,
        entryDate: data.entryDate,
        title: data.title,
        contentCipher: data.contentCipher,
        contentIv: data.contentIv,
        contentTag: data.contentTag,
        mood: data.mood,
      },
      update: {
        title: data.title,
        contentCipher: data.contentCipher,
        contentIv: data.contentIv,
        contentTag: data.contentTag,
        mood: data.mood,
        isDeleted: false,
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },

  async findByDate(userId: string, entryDate: Date) {
    return prisma.diaryEntry.findFirst({
      where: {
        userId,
        entryDate,
        isDeleted: false,
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },

  async findByMonth(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    return prisma.diaryEntry.findMany({
      where: {
        userId,
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        entryDate: true,
        mood: true,
        images: {
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { entryDate: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.diaryEntry.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },

  async update(id: string, data: UpdateEntryData) {
    return prisma.diaryEntry.update({
      where: { id },
      data,
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },

  async softDelete(id: string) {
    return prisma.diaryEntry.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
