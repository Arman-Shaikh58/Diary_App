"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptContent = encryptContent;
exports.decryptContent = decryptContent;
exports.generateEncryptionKey = generateEncryptionKey;
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Encrypts plaintext content using AES-256-GCM with a per-user key.
 * A unique 16-byte IV is generated for each encryption operation.
 */
function encryptContent(plaintext, hexKey) {
    const key = Buffer.from(hexKey, "hex"); // 32 bytes
    const iv = node_crypto_1.default.randomBytes(16); // unique IV per entry
    const cipher = node_crypto_1.default.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag(); // 16-byte GCM tag
    return {
        contentCipher: encrypted.toString("base64"),
        contentIv: iv.toString("hex"),
        contentTag: tag.toString("hex"),
    };
}
/**
 * Decrypts AES-256-GCM ciphertext. Throws "DECRYPTION_FAILED" if
 * the auth tag check fails (data tampered).
 */
function decryptContent(cipherBase64, ivHex, tagHex, hexKey) {
    const key = Buffer.from(hexKey, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(cipherBase64, "base64");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag); // integrity check — throws if tampered
    try {
        return (decipher.update(encrypted).toString("utf8") +
            decipher.final("utf8"));
    }
    catch {
        throw new Error("DECRYPTION_FAILED");
    }
}
/**
 * Generates a new 256-bit encryption key (hex-encoded).
 * Called once per user at registration time.
 */
function generateEncryptionKey() {
    return node_crypto_1.default.randomBytes(32).toString("hex");
}
//# sourceMappingURL=encryption.context.js.map