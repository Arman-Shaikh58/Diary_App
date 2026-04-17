"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContext = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
const encryption_context_1 = require("./encryption.context");
const database_1 = __importDefault(require("../config/database"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use";
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
function generateAccessToken(userId) {
    return jsonwebtoken_1.default.sign({ sub: userId }, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES,
    });
}
function generateRefreshToken() {
    return node_crypto_1.default.randomBytes(64).toString("hex");
}
function hashToken(token) {
    return node_crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function parseRefreshExpiry() {
    const match = JWT_REFRESH_EXPIRES.match(/^(\d+)([dhms])$/);
    if (!match)
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = unit === "d" ? value * 86400000 :
        unit === "h" ? value * 3600000 :
            unit === "m" ? value * 60000 :
                value * 1000;
    return new Date(Date.now() + ms);
}
exports.AuthContext = {
    async register(email, username, password) {
        // Check email uniqueness
        const existing = await user_model_1.UserModel.findByEmail(email);
        if (existing) {
            throw { status: 409, code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" };
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_SALT_ROUNDS);
        // Generate per-user encryption key
        const encryptionKey = (0, encryption_context_1.generateEncryptionKey)();
        // Create user
        const user = await user_model_1.UserModel.create({ email, username, passwordHash, encryptionKey });
        // Issue tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken();
        // Store refresh token hash
        await database_1.default.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(refreshToken),
                expiresAt: parseRefreshExpiry(),
            },
        });
        return {
            user: { id: user.id, email: user.email, username: user.username },
            accessToken,
            refreshToken,
        };
    },
    async login(email, password) {
        const user = await user_model_1.UserModel.findByEmail(email);
        if (!user) {
            throw { status: 401, code: "UNAUTHORIZED", message: "Invalid email or password" };
        }
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            throw { status: 401, code: "UNAUTHORIZED", message: "Invalid email or password" };
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken();
        await database_1.default.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(refreshToken),
                expiresAt: parseRefreshExpiry(),
            },
        });
        return {
            user: { id: user.id, email: user.email, username: user.username },
            accessToken,
            refreshToken,
        };
    },
    async refresh(refreshTokenRaw) {
        const tokenHash = hashToken(refreshTokenRaw);
        const stored = await database_1.default.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            throw { status: 401, code: "UNAUTHORIZED", message: "Invalid or expired refresh token" };
        }
        const accessToken = generateAccessToken(stored.userId);
        return { accessToken };
    },
    async logout(refreshTokenRaw) {
        const tokenHash = hashToken(refreshTokenRaw);
        await database_1.default.refreshToken.updateMany({
            where: { tokenHash },
            data: { revoked: true },
        });
    },
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
            throw { status: 401, code: "UNAUTHORIZED", message: "Invalid or expired access token" };
        }
    },
};
//# sourceMappingURL=auth.context.js.map