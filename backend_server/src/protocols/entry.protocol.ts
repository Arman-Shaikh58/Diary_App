import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { EntryContext } from "../contexts/entry.context";
import { CloudinaryContext } from "../contexts/cloudinary.context";
import { ImageModel } from "../models/image.model";
import { EntryModel } from "../models/entry.model";

const createEntrySchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  title: z.string().max(255).optional(),
  content: z.string().min(1, "Content is required"),
  mood: z.string().max(50).optional(),
});

const updateEntrySchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  mood: z.string().max(50).optional(),
});

export const EntryProtocol = {
  async getMonthEntries(req: AuthenticatedRequest, res: Response) {
    try {
      const month = req.query.month as string;
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Query param 'month' must be YYYY-MM" },
        });
      }

      const entries = await EntryContext.getMonthEntries(req.userId!, month);
      return res.status(200).json({ success: true, data: entries });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async getEntryByDate(req: AuthenticatedRequest, res: Response) {
    try {
      const date = req.params.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Date param must be YYYY-MM-DD" },
        });
      }

      const entry = await EntryContext.getByDate(req.userId!, date);
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: { code: "ENTRY_NOT_FOUND", message: "No entry exists for this date" },
        });
      }

      return res.status(200).json({ success: true, data: entry });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async createEntry(req: AuthenticatedRequest, res: Response) {
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
      const result = await EntryContext.createOrUpdate(req.userId!, entry_date, content, title, mood);

      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async updateEntry(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
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
      const result = await EntryContext.updateEntry(req.userId!, id, content, title, mood);

      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async deleteEntry(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await EntryContext.deleteEntry(req.userId!, id);
      return res.status(200).json({ success: true, data: { message: "Entry deleted" } });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async uploadImages(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No images provided" },
        });
      }

      // Verify entry ownership
      const entry = await EntryModel.findById(id);
      if (!entry || entry.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You do not own this entry" },
        });
      }

      // Check image count limit
      const currentCount = await ImageModel.countByEntryId(id);
      if (currentCount + files.length > 10) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Maximum 10 images per entry" },
        });
      }

      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cloudResult = await CloudinaryContext.uploadImage(
          file.buffer,
          req.userId!,
          file.originalname
        );

        const image = await ImageModel.create({
          entryId: id,
          userId: req.userId!,
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
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },

  async deleteImage(req: AuthenticatedRequest, res: Response) {
    try {
      const imageId = req.params.imageId as string;

      const image = await ImageModel.findById(imageId);
      if (!image || image.userId !== req.userId) {
        return res.status(404).json({
          success: false,
          error: { code: "ENTRY_NOT_FOUND", message: "Image not found or unauthorized" },
        });
      }

      // Delete from Cloudinary
      await CloudinaryContext.deleteImage(image.cloudinaryId);

      // Delete DB record
      await ImageModel.deleteById(imageId);

      return res.status(200).json({ success: true, data: { message: "Image deleted" } });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Server error" },
      });
    }
  },
};
