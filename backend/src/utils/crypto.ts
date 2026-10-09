import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'ascend_otp_super_secret_key_2026_secure';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ascend_bank_encryption_32_bytes_key!'; // 32 chars

/**
 * Generates a secure 6-digit OTP code using crypto.randomInt
 */
export function generateOtpCode(): string {
  // Generates integer in range [100000, 999999]
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes an OTP code with SHA-256 and salt
 */
export function hashOtpCode(code: string, email: string): string {
  return crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${email}:${code}`)
    .digest('hex');
}

/**
 * Validates OTP code against stored hash using timing-safe comparison
 */
export function verifyOtpHash(code: string, email: string, storedHash: string): boolean {
  const computedHash = hashOtpCode(code, email);
  if (computedHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}

// Ensure 32-byte key for AES-256
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypts sensitive bank details at rest using AES-256-GCM
 */
export function encryptData(plainText: string): string {
  const iv = crypto.randomBytes(12); // standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts sensitive bank details
 */
export function decryptData(cipherPackage: string): string {
  const parts = cipherPackage.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
