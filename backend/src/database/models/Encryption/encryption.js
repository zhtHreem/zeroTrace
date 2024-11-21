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

// Encrypt Function
export function encryptResponse(response) {
  console.log('Encryption Key (during encryption):', ENCRYPTION_KEY.toString('hex')); // Log the key
  const iv = crypto.randomBytes(IV_LENGTH); // Generate IV
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv); // Use the key
  let encrypted = cipher.update(response, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

// Decrypt Function
export function decryptResponse(encrypted, iv) {
  console.log('Encryption Key (during decryption):', ENCRYPTION_KEY.toString('hex'));
  console.log('IV (during decryption):', iv);
  console.log('Encrypted Data (during decryption):', encrypted);

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
