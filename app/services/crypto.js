const crypto = require('crypto');

function getKey() {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (raw) {
    const buffer = /^[0-9a-f]+$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
    if (buffer.length !== 32) {
      throw new Error('CREDENTIALS_ENCRYPTION_KEY must be 32 bytes (hex or base64).');
    }
    return buffer;
  }

  if (process.env.NODE_ENV !== 'production') {
    return crypto.createHash('sha256').update('dev-gameflip-key').digest();
  }

  throw new Error('CREDENTIALS_ENCRYPTION_KEY is required in production.');
}

function encryptSecret(plainText) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptSecret(cipherText) {
  const key = getKey();
  const buffer = Buffer.from(cipherText, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

module.exports = {
  encryptSecret,
  decryptSecret
};
