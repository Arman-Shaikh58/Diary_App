"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.EntryModel = {
    async upsert(data) {
        return database_1.default.diaryEntry.upsert({
            where: {
                uq_user_date: {
                    userId: data.userId,
                    entryDate: data.entryDate,
                },
            },
            create: {
                userId: data.userId,
                entryDate: data.entryDate,
                title: data.title,
                contentCipher: data.contentCipher,
                contentIv: data.contentIv,
                contentTag: data.contentTag,
                mood: data.mood,
            },
            update: {
                title: data.title,
                contentCipher: data.contentCipher,
                contentIv: data.contentIv,
                contentTag: data.contentTag,
                mood: data.mood,
                isDeleted: false,
            },
            include: {
                images: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
    },
    async findByDate(userId, entryDate) {
        return database_1.default.diaryEntry.findFirst({
            where: {
                userId,
                entryDate,
                isDeleted: false,
            },
            include: {
                images: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
    },
    async findByMonth(userId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month
        return database_1.default.diaryEntry.findMany({
            where: {
                userId,
                entryDate: {
                    gte: startDate,
                    lte: endDate,
                },
                isDeleted: false,
            },
            select: {
                id: true,
                entryDate: true,
                mood: true,
                images: {
                    select: { id: true },
                    take: 1,
                },
            },
            orderBy: { entryDate: "asc" },
        });
    },
    async findById(id) {
        return database_1.default.diaryEntry.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
    },
    async update(id, data) {
        return database_1.default.diaryEntry.update({
            where: { id },
            data,
            include: {
                images: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
    },
    async softDelete(id) {
        return database_1.default.diaryEntry.update({
            where: { id },
            data: { isDeleted: true },
        });
    },
};
//# sourceMappingURL=entry.model.js.map