"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryProtocol = void 0;
const zod_1 = require("zod");
const entry_context_1 = require("../contexts/entry.context");
const cloudinary_context_1 = require("../contexts/cloudinary.context");
const image_model_1 = require("../models/image.model");
const entry_model_1 = require("../models/entry.model");
const createEntrySchema = zod_1.z.object({
    entry_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    title: zod_1.z.string().max(255).optional(),
    content: zod_1.z.string().min(1, "Content is required"),
    mood: zod_1.z.string().max(50).optional(),
});
const updateEntrySchema = zod_1.z.object({
    title: zod_1.z.string().max(255).optional(),
    content: zod_1.z.string().optional(),
    mood: zod_1.z.string().max(50).optional(),
});
exports.EntryProtocol = {
    async getMonthEntries(req, res) {
        try {
            const month = req.query.month;
            if (!month || !/^\d{4}-\d{2}$/.test(month)) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Query param 'month' must be YYYY-MM" },
                });
            }
            const entries = await entry_context_1.EntryContext.getMonthEntries(req.userId, month);
            return res.status(200).json({ success: true, data: entries });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async getEntryByDate(req, res) {
        try {
            const date = req.params.date;
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Date param must be YYYY-MM-DD" },
                });
            }
            const entry = await entry_context_1.EntryContext.getByDate(req.userId, date);
            if (!entry) {
                return res.status(404).json({
                    success: false,
                    error: { code: "ENTRY_NOT_FOUND", message: "No entry exists for this date" },
                });
            }
            return res.status(200).json({ success: true, data: entry });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async createEntry(req, res) {
        try {
            const parsed = createEntrySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid request body",
                        details: parsed.error.errors,
                    },
                });
            }
            const { entry_date, content, title, mood } = parsed.data;
            const result = await entry_context_1.EntryContext.createOrUpdate(req.userId, entry_date, content, title, mood);
            return res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async updateEntry(req, res) {
        try {
            const id = req.params.id;
            const parsed = updateEntrySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid request body",
                        details: parsed.error.errors,
                    },
                });
            }
            const { content, title, mood } = parsed.data;
            const result = await entry_context_1.EntryContext.updateEntry(req.userId, id, content, title, mood);
            return res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async deleteEntry(req, res) {
        try {
            const id = req.params.id;
            await entry_context_1.EntryContext.deleteEntry(req.userId, id);
            return res.status(200).json({ success: true, data: { message: "Entry deleted" } });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async uploadImages(req, res) {
        try {
            const id = req.params.id;
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "No images provided" },
                });
            }
            // Verify entry ownership
            const entry = await entry_model_1.EntryModel.findById(id);
            if (!entry || entry.userId !== req.userId) {
                return res.status(403).json({
                    success: false,
                    error: { code: "FORBIDDEN", message: "You do not own this entry" },
                });
            }
            // Check image count limit
            const currentCount = await image_model_1.ImageModel.countByEntryId(id);
            if (currentCount + files.length > 10) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Maximum 10 images per entry" },
                });
            }
            const uploadedImages = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const cloudResult = await cloudinary_context_1.CloudinaryContext.uploadImage(file.buffer, req.userId, file.originalname);
                const image = await image_model_1.ImageModel.create({
                    entryId: id,
                    userId: req.userId,
                    cloudinaryId: cloudResult.cloudinaryId,
                    url: cloudResult.url,
                    secureUrl: cloudResult.secureUrl,
                    format: cloudResult.format,
                    width: cloudResult.width,
                    height: cloudResult.height,
                    bytes: cloudResult.bytes,
                    displayOrder: currentCount + i,
                });
                uploadedImages.push({
                    id: image.id,
                    secureUrl: image.secureUrl,
                    format: image.format,
                    width: image.width,
                    height: image.height,
                });
            }
            return res.status(201).json({ success: true, data: uploadedImages });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
    async deleteImage(req, res) {
        try {
            const imageId = req.params.imageId;
            const image = await image_model_1.ImageModel.findById(imageId);
            if (!image || image.userId !== req.userId) {
                return res.status(404).json({
                    success: false,
                    error: { code: "ENTRY_NOT_FOUND", message: "Image not found or unauthorized" },
                });
            }
            // Delete from Cloudinary
            await cloudinary_context_1.CloudinaryContext.deleteImage(image.cloudinaryId);
            // Delete DB record
            await image_model_1.ImageModel.deleteById(imageId);
            return res.status(200).json({ success: true, data: { message: "Image deleted" } });
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                success: false,
                error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
            });
        }
    },
};
//# sourceMappingURL=entry.protocol.js.map