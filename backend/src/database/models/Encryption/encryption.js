import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Retrieve the encryption key from environment variables
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 256-bit key
const IV_LENGTH = 16; // IV length for AES encryption

// Validate the encryption key
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('Invalid ENCRYPTION_KEY. Ensure it is a 256-bit (32-byte) hexadecimal key set in the .env file.');
}

/**
 * Encrypt a response
 * @param {string} response - The response to encrypt
 * @returns {Object} - The encrypted data and initialization vector (IV)
 */
export function encryptResponse(response) {
  try {
    console.log('Starting encryption...');
    const iv = crypto.randomBytes(IV_LENGTH); // Generate IV
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv); // Use the key
    let encrypted = cipher.update(response, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log('Encryption completed.');
    return { encryptedData: encrypted, iv: iv.toString('hex') };
  } catch (error) {
    console.error('Error during encryption:', error.message);
    throw new Error('Encryption failed.');
  }
}

/**
 * Decrypt an encrypted response
 * @param {string} encrypted - The encrypted data
 * @param {string} iv - The initialization vector (IV)
 * @returns {string} - The decrypted response
 */
export function decryptResponse(encrypted, iv) {
  try {

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error during decryption:', error.message);
    throw new Error('Decryption failed.');
  }
}

/**
 * Utility function to validate the encryption setup
 * @returns {boolean} - Returns true if encryption setup is valid
 */
export function validateEncryptionSetup() {
  try {
    const testString = 'test';
    const { encryptedData, iv } = encryptResponse(testString);
    const decryptedString = decryptResponse(encryptedData, iv);

    if (decryptedString === testString) {
      return true;
    } else {
      throw new Error('Decrypted value does not match original.');
    }
  } catch (error) {
    console.error('Encryption setup validation failed:', error.message);
    return false;
  }
}
