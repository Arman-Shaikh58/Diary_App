import { EntryModel } from "../models/entry.model";
import { ImageModel } from "../models/image.model";
import { UserModel } from "../models/user.model";
import { encryptContent, decryptContent } from "./encryption.context";
import { CloudinaryContext } from "./cloudinary.context";

export const EntryContext = {
  async createOrUpdate(
    userId: string,
    entryDate: string,
    content: string,
    title?: string,
    mood?: string
  ) {
    // Get user's encryption key
    const encryptionKey = await UserModel.getEncryptionKey(userId);
    if (!encryptionKey) {
      throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
    }

    // Encrypt content
    const { contentCipher, contentIv, contentTag } = encryptContent(content, encryptionKey);

    // Upsert entry
    const entry = await EntryModel.upsert({
      userId,
      entryDate: new Date(entryDate),
      title,
      contentCipher,
      contentIv,
      contentTag,
      mood,
    });

    return {
      id: entry.id,
      entryDate: entry.entryDate,
      title: entry.title,
      mood: entry.mood,
      images: entry.images.map((img) => ({
        id: img.id,
        secureUrl: img.secureUrl,
        displayOrder: img.displayOrder,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  },

  async getByDate(userId: string, dateStr: string) {
    const entry = await EntryModel.findByDate(userId, new Date(dateStr));
    if (!entry) {
      return null;
    }

    // Get encryption key
    const encryptionKey = await UserModel.getEncryptionKey(userId);
    if (!encryptionKey) {
      throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
    }

    // Decrypt content
    let content: string;
    try {
      content = decryptContent(
        entry.contentCipher,
        entry.contentIv,
        entry.contentTag,
        encryptionKey
      );
    } catch {
      throw { status: 422, code: "DECRYPTION_FAILED", message: "Failed to decrypt entry content" };
    }

    return {
      id: entry.id,
      entryDate: entry.entryDate,
      title: entry.title,
      content,
      mood: entry.mood,
      images: entry.images.map((img) => ({
        id: img.id,
        secureUrl: img.secureUrl,
        format: img.format,
        width: img.width,
        height: img.height,
        displayOrder: img.displayOrder,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  },

  async getMonthEntries(userId: string, monthStr: string) {
    const [yearStr, monthNum] = monthStr.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthNum, 10);

    const entries = await EntryModel.findByMonth(userId, year, month);

    return entries.map((entry) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      mood: entry.mood,
      hasImages: entry.images.length > 0,
    }));
  },

  async updateEntry(
    userId: string,
    entryId: string,
    content?: string,
    title?: string,
    mood?: string
  ) {
    // Verify ownership
    const entry = await EntryModel.findById(entryId);
    if (!entry || entry.userId !== userId) {
      throw { status: 403, code: "FORBIDDEN", message: "You do not own this entry" };
    }

    const updateData: Record<string, string | undefined> = {};

    if (title !== undefined) updateData.title = title;
    if (mood !== undefined) updateData.mood = mood;

    if (content !== undefined) {
      const encryptionKey = await UserModel.getEncryptionKey(userId);
      if (!encryptionKey) {
        throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
      }
      const encrypted = encryptContent(content, encryptionKey);
      Object.assign(updateData, encrypted);
    }

    const updated = await EntryModel.update(entryId, updateData);

    return {
      id: updated.id,
      entryDate: updated.entryDate,
      title: updated.title,
      mood: updated.mood,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },

  async deleteEntry(userId: string, entryId: string) {
    // Verify ownership
    const entry = await EntryModel.findById(entryId);
    if (!entry || entry.userId !== userId) {
      throw { status: 403, code: "FORBIDDEN", message: "You do not own this entry" };
    }

    // Delete images from Cloudinary
    for (const image of entry.images) {
      try {
        await CloudinaryContext.deleteImage(image.cloudinaryId);
      } catch {
        // Log but don't fail the deletion
        console.error(`Failed to delete Cloudinary image: ${image.cloudinaryId}`);
      }
    }

    // Delete image records
    await ImageModel.deleteByEntryId(entryId);

    // Soft-delete the entry
    await EntryModel.softDelete(entryId);
  },
};
