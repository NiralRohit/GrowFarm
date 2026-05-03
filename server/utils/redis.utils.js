const redis = require('redis');
const authConfig = require('../config/auth.config');

let client;
const memoryStore = new Map(); // Simple in-memory fallback for development if Redis is disabled

if (authConfig.REDIS_ENABLED && process.env.NODE_ENV !== 'test') {
  client = redis.createClient({
    url: `redis://${authConfig.REDIS_HOST}:${authConfig.REDIS_PORT}`
  });

  client.on('error', (err) => {
    console.error('[Redis] Client Connection Error:', err.message);
  });

  client.connect()
    .then(() => console.log('///// Redis is connected successfully /////'))
    .catch(() => console.warn('[Redis] Connection failed. Using in-memory fallback.'));
} else {
  console.log('[Redis] Disabled in config. Using in-memory fallback.');
}

/**
 * Generic helper to set a value with TTL
 */
const setWithTtl = async (key, value, ttlSeconds) => {
  if (client?.isOpen) {
    return await client.set(key, value, { EX: ttlSeconds });
  }
  // Store in memory
  memoryStore.set(key, value);
  setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
  return 'OK';
};

/**
 * Generic helper to get a value
 */
const get = async (key) => {
  if (client?.isOpen) return await client.get(key);
  return memoryStore.get(key) || null;
};

/**
 * Generic helper to delete a key
 */
const del = async (key) => {
  if (client?.isOpen) return await client.del(key);
  return memoryStore.delete(key);
};

module.exports = {
  setWithTtl,
  get,
  del,
  client
};
