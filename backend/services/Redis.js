import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

let redis = null;
const memoryCache = new Map();
const memorySets = new Map();
const memoryLists = new Map();

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.warn("Upstash Redis initialization warning:", e.message);
}

export { redis };

export const getFromRedis = async (key) => {
  try {
    if (redis) return await redis.get(key);
  } catch (error) {
    console.warn(`Redis GET warning [${key}], falling back to memory:`, error.message);
  }
  return memoryCache.get(key) || null;
};

export const setInRedis = async (key, value, expirationInSeconds = null) => {
  try {
    if (redis) {
      if (expirationInSeconds) {
        return await redis.set(key, value, { ex: expirationInSeconds });
      }
      return await redis.set(key, value);
    }
  } catch (error) {
    console.warn(`Redis SET warning [${key}], falling back to memory:`, error.message);
  }
  memoryCache.set(key, value);
  if (expirationInSeconds) {
    setTimeout(() => memoryCache.delete(key), expirationInSeconds * 1000);
  }
  return "OK";
};

export const deleteFromRedis = async (key) => {
  try {
    if (redis) return await redis.del(key);
  } catch (error) {
    console.warn(`Redis DELETE warning [${key}]:`, error.message);
  }
  memoryCache.delete(key);
  memorySets.delete(key);
  memoryLists.delete(key);
  return 1;
};

export const existsInRedis = async (key) => {
  try {
    if (redis) return await redis.exists(key);
  } catch (error) {
    console.warn(`Redis EXISTS warning [${key}]:`, error.message);
  }
  return memoryCache.has(key) ? 1 : 0;
};

export const getManyFromRedis = async (keys) => {
  try {
    if (redis && keys?.length) return await redis.mget(...keys);
  } catch (error) {
    console.warn("Redis MGET warning:", error.message);
  }
  return keys.map((k) => memoryCache.get(k) || null);
};

export const deleteManyFromRedis = async (keys) => {
  try {
    if (redis && keys?.length) return await redis.del(...keys);
  } catch (error) {
    console.warn("Redis DELETE MANY warning:", error.message);
  }
  keys.forEach((k) => memoryCache.delete(k));
  return keys.length;
};

export const expireRedis = async (key, seconds) => {
  try {
    if (redis) return await redis.expire(key, seconds);
  } catch (error) {
    console.warn(`Redis EXPIRE warning [${key}]:`, error.message);
  }
  setTimeout(() => memoryCache.delete(key), seconds * 1000);
  return 1;
};

export const getRedisTTL = async (key) => {
  try {
    if (redis) return await redis.ttl(key);
  } catch (error) {
    console.warn(`Redis TTL warning [${key}]:`, error.message);
  }
  return -1;
};

export const incrementRedis = async (key, amount = 1) => {
  try {
    if (redis) return await redis.incrby(key, amount);
  } catch (error) {
    console.warn(`Redis INCREMENT warning [${key}]:`, error.message);
  }
  const curr = (memoryCache.get(key) || 0) + amount;
  memoryCache.set(key, curr);
  return curr;
};

export const decrementRedis = async (key, amount = 1) => {
  try {
    if (redis) return await redis.decrby(key, amount);
  } catch (error) {
    console.warn(`Redis DECREMENT warning [${key}]:`, error.message);
  }
  const curr = (memoryCache.get(key) || 0) - amount;
  memoryCache.set(key, curr);
  return curr;
};

export const pushToRedisList = async (key, value) => {
  try {
    if (redis) return await redis.rpush(key, value);
  } catch (error) {
    console.warn(`Redis RPUSH warning [${key}]:`, error.message);
  }
  const list = memoryLists.get(key) || [];
  list.push(value);
  memoryLists.set(key, list);
  return list.length;
};

export const setRedisList = async (key, values = []) => {
  try {
    if (redis) {
      await redis.del(key);
      if (Array.isArray(values) && values.length > 0) {
        return await redis.rpush(key, ...values);
      }
      return 0;
    }
  } catch (error) {
    console.warn(`Redis SET LIST warning [${key}]:`, error.message);
  }
  memoryLists.set(key, [...values]);
  return values.length;
};

export const getRedisList = async (key) => {
  try {
    if (redis) return await redis.lrange(key, 0, -1);
  } catch (error) {
    console.warn(`Redis LRANGE warning [${key}]:`, error.message);
  }
  return memoryLists.get(key) || [];
};

export const addToRedisSet = async (key, ...values) => {
  try {
    if (redis && values.length) return await redis.sadd(key, ...values);
  } catch (error) {
    console.warn(`Redis SADD warning [${key}]:`, error.message);
  }
  const set = memorySets.get(key) || new Set();
  values.forEach((v) => set.add(v));
  memorySets.set(key, set);
  return set.size;
};

export const removeFromRedisSet = async (key, ...values) => {
  try {
    if (redis && values.length) return await redis.srem(key, ...values);
  } catch (error) {
    console.warn(`Redis SREM warning [${key}]:`, error.message);
  }
  const set = memorySets.get(key);
  if (set) {
    values.forEach((v) => set.delete(v));
  }
  return 1;
};

export const getRedisSet = async (key) => {
  try {
    if (redis) return await redis.smembers(key);
  } catch (error) {
    console.warn(`Redis SMEMBERS warning [${key}]:`, error.message);
  }
  const set = memorySets.get(key);
  return set ? Array.from(set) : [];
};

export const setRedisHash = async (key, value = {}) => {
  try {
    if (redis) return await redis.hset(key, value);
  } catch (error) {
    console.warn(`Redis HSET warning [${key}]:`, error.message);
  }
  memoryCache.set(key, value);
  return "OK";
};

export const getRedisHash = async (key) => {
  try {
    if (redis) return await redis.hgetall(key);
  } catch (error) {
    console.warn(`Redis HGETALL warning [${key}]:`, error.message);
  }
  return memoryCache.get(key) || {};
};

export const clearRedis = async () => {
  try {
    if (redis) return await redis.flushdb();
  } catch (error) {
    console.warn("Redis FLUSHDB warning:", error.message);
  }
  memoryCache.clear();
  memorySets.clear();
  memoryLists.clear();
  return "OK";
};

export const testRedis = async () => {
  try {
    if (redis) {
      const result = await redis.ping();
      console.log("Redis connected:", result);
      return result;
    }
  } catch (error) {
    console.warn("Redis connection warning:", error.message);
  }
  return "PONG (Memory fallback)";
};

