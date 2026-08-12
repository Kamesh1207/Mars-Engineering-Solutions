/* =============================================
   AES-256-GCM Encryption / Decryption Utilities
   Protects PII (name, email, phone) at rest in the database.
   ============================================= */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // 128-bit IV
const TAG_LENGTH = 16;      // 128-bit auth tag
const ENCODING = 'hex';

/**
 * Get the encryption key from environment.
 * Must be a 64-char hex string (32 bytes).
 */
function getKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error(
            'ENCRYPTION_KEY must be a 64-character hex string (32 bytes).\n' +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a hex string in the format: iv:encrypted:authTag
 */
function encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') return '';

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag().toString(ENCODING);

    return `${iv.toString(ENCODING)}:${encrypted}:${authTag}`;
}

/**
 * Decrypt an encrypted string (iv:encrypted:authTag format).
 * Returns the original plaintext.
 */
function decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') return '';

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const key = getKey();
    const iv = Buffer.from(parts[0], ENCODING);
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt };
