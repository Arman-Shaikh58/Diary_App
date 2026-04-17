import crypto from "node:crypto";

/**
 * Encrypts plaintext content using AES-256-GCM with a per-user key.
 * A unique 16-byte IV is generated for each encryption operation.
 */
export function encryptContent(plaintext: string, hexKey: string) {
  const key = Buffer.from(hexKey, "hex"); // 32 bytes
  const iv = crypto.randomBytes(16); // unique IV per entry

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
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
export function decryptContent(
  cipherBase64: string,
  ivHex: string,
  tagHex: string,
  hexKey: string
): string {
  const key = Buffer.from(hexKey, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(cipherBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag); // integrity check — throws if tampered

  try {
    return (
      decipher.update(encrypted).toString("utf8") +
      decipher.final("utf8")
    );
  } catch {
    throw new Error("DECRYPTION_FAILED");
  }
}

/**
 * Generates a new 256-bit encryption key (hex-encoded).
 * Called once per user at registration time.
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
