const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';
// Derive a 32-byte key from JWT_SECRET or fallback
const secret = process.env.JWT_SECRET || 'supersecretkey123';
const ENCRYPTION_KEY = crypto.scryptSync(secret, 'salt', 32);

/**
 * Encrypts a plain text string using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string|null} - The encrypted text (IV:AuthTag:EncryptedData) in hex, or null if text is falsy
 */
exports.encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(12); // GCM standard IV size
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        // Return format: IV:AuthTag:EncryptedData
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err) {
        console.error('Encryption failed:', err);
        return text; // Fallback to plain if something breaks
    }
};

/**
 * Decrypts text encrypted by the encrypt function
 * @param {string} encryptedText - The encrypted text in format IV:AuthTag:EncryptedData
 * @returns {string|null} - The decrypted plain text
 */
exports.decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;
    
    // Check if it's actually encrypted (looks for our delimiter)
    if (!encryptedText.includes(':')) {
        return encryptedText; // Legacy plaintext
    }

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) return encryptedText;

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedData = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error('Decryption failed:', err);
        return null; 
    }
};
