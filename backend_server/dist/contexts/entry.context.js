"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryContext = void 0;
const entry_model_1 = require("../models/entry.model");
const image_model_1 = require("../models/image.model");
const user_model_1 = require("../models/user.model");
const encryption_context_1 = require("./encryption.context");
const cloudinary_context_1 = require("./cloudinary.context");
exports.EntryContext = {
    async createOrUpdate(userId, entryDate, content, title, mood) {
        // Get user's encryption key
        const encryptionKey = await user_model_1.UserModel.getEncryptionKey(userId);
        if (!encryptionKey) {
            throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
        }
        // Encrypt content
        const { contentCipher, contentIv, contentTag } = (0, encryption_context_1.encryptContent)(content, encryptionKey);
        // Upsert entry
        const entry = await entry_model_1.EntryModel.upsert({
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
    async getByDate(userId, dateStr) {
        const entry = await entry_model_1.EntryModel.findByDate(userId, new Date(dateStr));
        if (!entry) {
            return null;
        }
        // Get encryption key
        const encryptionKey = await user_model_1.UserModel.getEncryptionKey(userId);
        if (!encryptionKey) {
            throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
        }
        // Decrypt content
        let content;
        try {
            content = (0, encryption_context_1.decryptContent)(entry.contentCipher, entry.contentIv, entry.contentTag, encryptionKey);
        }
        catch {
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
    async getMonthEntries(userId, monthStr) {
        const [yearStr, monthNum] = monthStr.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthNum, 10);
        const entries = await entry_model_1.EntryModel.findByMonth(userId, year, month);
        return entries.map((entry) => ({
            id: entry.id,
            entryDate: entry.entryDate,
            mood: entry.mood,
            hasImages: entry.images.length > 0,
        }));
    },
    async updateEntry(userId, entryId, content, title, mood) {
        // Verify ownership
        const entry = await entry_model_1.EntryModel.findById(entryId);
        if (!entry || entry.userId !== userId) {
            throw { status: 403, code: "FORBIDDEN", message: "You do not own this entry" };
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (mood !== undefined)
            updateData.mood = mood;
        if (content !== undefined) {
            const encryptionKey = await user_model_1.UserModel.getEncryptionKey(userId);
            if (!encryptionKey) {
                throw { status: 401, code: "UNAUTHORIZED", message: "User not found" };
            }
            const encrypted = (0, encryption_context_1.encryptContent)(content, encryptionKey);
            Object.assign(updateData, encrypted);
        }
        const updated = await entry_model_1.EntryModel.update(entryId, updateData);
        return {
            id: updated.id,
            entryDate: updated.entryDate,
            title: updated.title,
            mood: updated.mood,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    },
    async deleteEntry(userId, entryId) {
        // Verify ownership
        const entry = await entry_model_1.EntryModel.findById(entryId);
        if (!entry || entry.userId !== userId) {
            throw { status: 403, code: "FORBIDDEN", message: "You do not own this entry" };
        }
        // Delete images from Cloudinary
        for (const image of entry.images) {
            try {
                await cloudinary_context_1.CloudinaryContext.deleteImage(image.cloudinaryId);
            }
            catch {
                // Log but don't fail the deletion
                console.error(`Failed to delete Cloudinary image: ${image.cloudinaryId}`);
            }
        }
        // Delete image records
        await image_model_1.ImageModel.deleteByEntryId(entryId);
        // Soft-delete the entry
        await entry_model_1.EntryModel.softDelete(entryId);
    },
};
//# sourceMappingURL=entry.context.js.map