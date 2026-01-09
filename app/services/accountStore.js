const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getRedisClient } = require('./redis');
const { encryptSecret, decryptSecret } = require('./crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'accounts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function readFileStore() {
  ensureDataDir();
  if (!fs.existsSync(FILE_PATH)) {
    return {};
  }
  const raw = await fs.promises.readFile(FILE_PATH, 'utf8');
  return raw ? JSON.parse(raw) : {};
}

async function writeFileStore(data) {
  ensureDataDir();
  await fs.promises.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function listAccounts(userId) {
  const redis = getRedisClient();
  if (redis) {
    const raw = await redis.get(`gf:accounts:${userId}`);
    return raw ? JSON.parse(raw) : [];
  }
  const data = await readFileStore();
  return data[userId] || [];
}

async function saveAccounts(userId, accounts) {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(`gf:accounts:${userId}`, JSON.stringify(accounts));
    return;
  }
  const data = await readFileStore();
  data[userId] = accounts;
  await writeFileStore(data);
}

async function createAccount(userId, payload) {
  const accounts = await listAccounts(userId);
  const id = crypto.randomUUID();
  const account = {
    id,
    name: payload.name,
    apiKey: payload.apiKey,
    apiSecret: encryptSecret(payload.apiSecret),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  accounts.push(account);
  await saveAccounts(userId, accounts);
  return account;
}

async function updateAccount(userId, accountId, payload) {
  const accounts = await listAccounts(userId);
  const index = accounts.findIndex((item) => item.id === accountId);
  if (index === -1) {
    return null;
  }
  const existing = accounts[index];
  const updated = {
    ...existing,
    name: payload.name ?? existing.name,
    apiKey: payload.apiKey ?? existing.apiKey,
    apiSecret: payload.apiSecret ? encryptSecret(payload.apiSecret) : existing.apiSecret,
    updatedAt: new Date().toISOString()
  };
  accounts[index] = updated;
  await saveAccounts(userId, accounts);
  return updated;
}

async function deleteAccount(userId, accountId) {
  const accounts = await listAccounts(userId);
  const next = accounts.filter((item) => item.id !== accountId);
  await saveAccounts(userId, next);
  return next.length !== accounts.length;
}

function scrubAccount(account) {
  return {
    id: account.id,
    name: account.name,
    apiKey: account.apiKey,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt
  };
}

function getDecryptedSecret(account) {
  return decryptSecret(account.apiSecret);
}

module.exports = {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  scrubAccount,
  getDecryptedSecret
};
