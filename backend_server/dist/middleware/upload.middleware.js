"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_IMAGE_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB || "10", 10);
/**
 * Multer middleware: in-memory storage, max 10MB per file.
 * Field name: "images", max 10 files per request.
 */
exports.uploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
    },
}).array("images", 10);
//# sourceMappingURL=upload.middleware.js.map