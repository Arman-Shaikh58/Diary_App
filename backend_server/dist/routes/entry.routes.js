"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const entry_protocol_1 = require("../protocols/entry.protocol");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// All entry routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Entry CRUD
router.get("/", entry_protocol_1.EntryProtocol.getMonthEntries);
router.get("/:date", entry_protocol_1.EntryProtocol.getEntryByDate);
router.post("/", entry_protocol_1.EntryProtocol.createEntry);
router.put("/:id", entry_protocol_1.EntryProtocol.updateEntry);
router.delete("/:id", entry_protocol_1.EntryProtocol.deleteEntry);
// Image endpoints
router.post("/:id/images", upload_middleware_1.uploadMiddleware, entry_protocol_1.EntryProtocol.uploadImages);
router.delete("/:entryId/images/:imageId", entry_protocol_1.EntryProtocol.deleteImage);
exports.default = router;
//# sourceMappingURL=entry.routes.js.map