import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { UserModel } from "../models/user.model";
import { generateEncryptionKey } from "./encryption.context";
import prisma from "../config/database";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use";
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseRefreshExpiry(): Date {
  const match = JWT_REFRESH_EXPIRES.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms =
    unit === "d" ? value * 86400000 :
    unit === "h" ? value * 3600000 :
    unit === "m" ? value * 60000 :
    value * 1000;

  return new Date(Date.now() + ms);
}

export const AuthContext = {
  async register(email: string, username: string, password: string) {
    // Check email uniqueness
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw { status: 409, code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Generate per-user encryption key
    const encryptionKey = generateEncryptionKey();

    // Create user
    const user = await UserModel.create({ email, username, passwordHash, encryptionKey });

    // Issue tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    // Store refresh token hash
    await prisma.refreshToken.create({
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

  async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw { status: 401, code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw { status: 401, code: "UNAUTHORIZED", message: "Invalid email or password" };
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
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

  async refresh(refreshTokenRaw: string) {
    const tokenHash = hashToken(refreshTokenRaw);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw { status: 401, code: "UNAUTHORIZED", message: "Invalid or expired refresh token" };
    }

    const accessToken = generateAccessToken(stored.userId);

    return { accessToken };
  },

  async logout(refreshTokenRaw: string) {
    const tokenHash = hashToken(refreshTokenRaw);

    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  },

  verifyAccessToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { sub: string };
    } catch {
      throw { status: 401, code: "UNAUTHORIZED", message: "Invalid or expired access token" };
    }
  },
};
