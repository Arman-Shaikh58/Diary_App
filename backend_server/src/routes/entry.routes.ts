import { Router } from "express";
import { EntryProtocol } from "../protocols/entry.protocol";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();

// All entry routes require authentication
router.use(authMiddleware);

// Entry CRUD
router.get("/", EntryProtocol.getMonthEntries);
router.get("/:date", EntryProtocol.getEntryByDate);
router.post("/", EntryProtocol.createEntry);
router.put("/:id", EntryProtocol.updateEntry);
router.delete("/:id", EntryProtocol.deleteEntry);

// Image endpoints
router.post("/:id/images", uploadMiddleware, EntryProtocol.uploadImages);
router.delete("/:entryId/images/:imageId", EntryProtocol.deleteImage);

export default router;
