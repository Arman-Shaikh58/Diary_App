/**
 * Encrypts plaintext content using AES-256-GCM with a per-user key.
 * A unique 16-byte IV is generated for each encryption operation.
 */
export declare function encryptContent(plaintext: string, hexKey: string): {
    contentCipher: string;
    contentIv: string;
    contentTag: string;
};
/**
 * Decrypts AES-256-GCM ciphertext. Throws "DECRYPTION_FAILED" if
 * the auth tag check fails (data tampered).
 */
export declare function decryptContent(cipherBase64: string, ivHex: string, tagHex: string, hexKey: string): string;
/**
 * Generates a new 256-bit encryption key (hex-encoded).
 * Called once per user at registration time.
 */
export declare function generateEncryptionKey(): string;
//# sourceMappingURL=encryption.context.d.ts.map