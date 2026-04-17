"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.UserModel = {
    async create(data) {
        return database_1.default.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash: data.passwordHash,
                encryptionKey: data.encryptionKey,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
            },
        });
    },
    async findByEmail(email) {
        return database_1.default.user.findUnique({
            where: { email },
        });
    },
    async findById(id) {
        return database_1.default.user.findUnique({
            where: { id },
        });
    },
    async getEncryptionKey(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { encryptionKey: true },
        });
        return user?.encryptionKey ?? null;
    },
};
//# sourceMappingURL=user.model.js.map