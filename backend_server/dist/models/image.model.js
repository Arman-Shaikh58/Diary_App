"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.ImageModel = {
    async create(data) {
        return database_1.default.entryImage.create({
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
    async findByEntryId(entryId) {
        return database_1.default.entryImage.findMany({
            where: { entryId },
            orderBy: { displayOrder: "asc" },
        });
    },
    async findById(id) {
        return database_1.default.entryImage.findUnique({
            where: { id },
        });
    },
    async deleteById(id) {
        return database_1.default.entryImage.delete({
            where: { id },
        });
    },
    async deleteByEntryId(entryId) {
        return database_1.default.entryImage.deleteMany({
            where: { entryId },
        });
    },
    async countByEntryId(entryId) {
        return database_1.default.entryImage.count({
            where: { entryId },
        });
    },
};
//# sourceMappingURL=image.model.js.map