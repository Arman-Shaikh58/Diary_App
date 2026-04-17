"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryContext = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const stream_1 = require("stream");
exports.CloudinaryContext = {
    async uploadImage(buffer, userId, originalname) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({
                folder: `diary/${userId}`,
                resource_type: "image",
            }, (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Cloudinary upload failed"));
                }
                resolve({
                    cloudinaryId: result.public_id,
                    url: result.url,
                    secureUrl: result.secure_url,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    bytes: result.bytes,
                });
            });
            const readable = new stream_1.Readable();
            readable.push(buffer);
            readable.push(null);
            readable.pipe(stream);
        });
    },
    async deleteImage(cloudinaryId) {
        return cloudinary_1.default.uploader.destroy(cloudinaryId);
    },
};
//# sourceMappingURL=cloudinary.context.js.map