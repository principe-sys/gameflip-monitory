const { createClient } = require('redis');

let client;
let connectPromise;

function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => {
      console.error('[REDIS] Client error:', err.message);
    });
  }

  if (!connectPromise) {
    connectPromise = client.connect().catch((err) => {
      console.error('[REDIS] Failed to connect:', err.message);
    });
  }

  return client;
}

module.exports = { getRedisClient };
