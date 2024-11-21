import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 256-bit key
const IV_LENGTH = 16; // IV length for AES encryption

// Encrypt Function
function encryptResponse(response) {
  console.log('Encryption Key (during encryption):', ENCRYPTION_KEY.toString('hex')); // Log the key
  const iv = crypto.randomBytes(IV_LENGTH); // Generate IV
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv); // Use the key
  let encrypted = cipher.update(response, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

// Decrypt Function
function decryptResponse(encrypted, iv) {
  console.log('Encryption Key (during decryption):', ENCRYPTION_KEY.toString('hex')); // Log the key
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex')); // Use the key
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Test the functions
const testData = 'This is a test response for encryption.';
const { encryptedData, iv } = encryptResponse(testData);

console.log('Encrypted Data:', encryptedData);
console.log('IV:', iv);

try {
  const decryptedData = decryptResponse(encryptedData, iv);
  console.log('Decrypted Data:', decryptedData);

  if (decryptedData === testData) {
    console.log('Encryption and Decryption are consistent!');
  } else {
    console.log('Decrypted data does not match the original input.');
  }
} catch (err) {
  console.error('Decryption failed:', err.message);
}
