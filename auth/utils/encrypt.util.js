
import crypto from "crypto";
import fs from "fs";

const ALGORITHM = "aes-256-gcm";
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;

/**
 * Derives a 32-byte key from password and salt using PBKDF2
 */
export function deriveKey(password, salt) {
  const secret = password || process.env.ENCRYPT_PASSWORD || "SafeNet_Master_Key_2025_Secure!";
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, "sha256");
}

/**
 * Encrypts a buffer using AES-256-GCM
 * Returns combined buffer: [salt (16b)] + [iv (16b)] + [authTag (16b)] + [ciphertext]
 */
export function encryptBuffer(buffer, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return {
    combinedBuffer: combined,
    saltHex: salt.toString("hex"),
    ivHex: iv.toString("hex"),
    authTagHex: authTag.toString("hex"),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted buffer
 */
export function decryptBuffer(encryptedData, password) {
  if (encryptedData.length < 48) {
    throw new Error("Invalid encrypted payload: Data too short");
  }

  const salt = encryptedData.subarray(0, 16);
  const iv = encryptedData.subarray(16, 32);
  const authTag = encryptedData.subarray(32, 48);
  const ciphertext = encryptedData.subarray(48);

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted;
}

/**
 * Encrypts a file on disk
 */
export function encryptFile(filePath, password) {
  try {
    const fileData = fs.readFileSync(filePath);
    const { combinedBuffer } = encryptBuffer(fileData, password);
    const encPath = filePath + ".enc";
    fs.writeFileSync(encPath, combinedBuffer);
    return encPath;
  } catch (err) {
    console.error("File encryption error:", err.message);
    throw err;
  }
}

/**
 * Decrypts a file on disk
 */
export function decryptFile(filePath, password) {
  try {
    const fileData = fs.readFileSync(filePath);
    const decrypted = decryptBuffer(fileData, password);
    const outPath = filePath.replace(".enc", ".dec");
    fs.writeFileSync(outPath, decrypted);
    return outPath;
  } catch (err) {
    console.error("File decryption error:", err.message);
    throw err;
  }
}
