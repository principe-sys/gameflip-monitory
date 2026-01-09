const fs = require('fs');
const path = require('path');
const { getRedisClient } = require('./redis');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'sessions.json');

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

async function getSession(id) {
  const redis = getRedisClient();
  if (redis) {
    const raw = await redis.get(`gf:sessions:${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  const data = await readFileStore();
  return data[id] || null;
}

async function setSession(id, payload) {
  const redis = getRedisClient();
  const raw = JSON.stringify(payload);
  if (redis) {
    await redis.set(`gf:sessions:${id}`, raw);
    return;
  }
  const data = await readFileStore();
  data[id] = payload;
  await writeFileStore(data);
}

async function deleteSession(id) {
  const redis = getRedisClient();
  if (redis) {
    await redis.del(`gf:sessions:${id}`);
    return;
  }
  const data = await readFileStore();
  delete data[id];
  await writeFileStore(data);
}

module.exports = {
  getSession,
  setSession,
  deleteSession
};
