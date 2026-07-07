const crypto = require('crypto');
const redisClient = require('./connection');
const { env, redis } = require('../../constants');

const PREFIX_CACHE = redis.PREFIX_CACHE;
const PREFIX_LOCK  = redis.PREFIX_LOCK;
const warn = (p, ...a) => console.warn(p, ...a);
const err  = (p, ...a) => console.error(p, ...a);

const DEFAULT_TTL = redis.DEFAULT_TTL;
const DEFAULT_LOCK_TTL_SEC = redis.DEFAULT_LOCK_TTL_SEC;
const NAMESPACE = env.REDIS_NAMESPACE || redis.NAMESPACE;
const NULL_SENTINEL = redis.NULL_SENTINEL;

const TIME = redis.TIME;
const inflight = new Map();

const k = (key) => `${NAMESPACE}:${key}`;
const lockKey = (key) => `${NAMESPACE}:lock:${key}`;

const RELEASE_LUA = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
else
    return 0
end
`;

const jitterTtl = (ttl) => {
    const range = Math.max(1, Math.floor(ttl * 0.1));
    return ttl + Math.floor(Math.random() * (range * 2)) - range;
};

const serialize = (v) => (v === null || v === undefined) ? NULL_SENTINEL : JSON.stringify(v);

const deserialize = (raw) => {
    if (raw === null) return undefined;
    if (raw === NULL_SENTINEL) return null;
    try { return JSON.parse(raw); } catch { return raw; }
};

const resolveTtl = (ttl) => {
    if (typeof ttl === 'function') return ttl(TIME) ?? DEFAULT_TTL;
    return ttl > 0 ? ttl : DEFAULT_TTL;
};

const fun = {};

fun.get = async (key, cb, ttl = DEFAULT_TTL) => {
    const fullKey = k(key);
    const effectiveTtl = resolveTtl(ttl);

    if (redisClient.isReady) {
        try {
            const raw = await redisClient.get(fullKey);
            if (raw !== null) return deserialize(raw);
        } catch (e) {
            warn(PREFIX_CACHE, `get(${key}) failed, falling through to cb:`, e.message);
        }
    }

    if (inflight.has(fullKey)) return inflight.get(fullKey);

    const promise = (async () => {
        const value = await cb();
        if (redisClient.isReady) {
            try {
                await redisClient.set(fullKey, serialize(value), { EX: jitterTtl(effectiveTtl) });
            } catch (e) {
                warn(PREFIX_CACHE, `set(${key}) failed:`, e.message);
            }
        }
        return value;
    })();

    inflight.set(fullKey, promise);
    try { return await promise; }
    finally { inflight.delete(fullKey); }
};

fun.set = async (key, value, ttl = DEFAULT_TTL) => {
    if (!redisClient.isReady) return false;
    try {
        await redisClient.set(k(key), serialize(value), { EX: jitterTtl(resolveTtl(ttl)) });
        return true;
    } catch (e) {
        warn(PREFIX_CACHE, `set(${key}) failed:`, e.message);
        return false;
    }
};

fun.remove = async (key) => {
    if (!redisClient.isReady) return 0;
    const keys = (Array.isArray(key) ? key : [key]).map(k);
    try { return await redisClient.del(keys); }
    catch (e) { warn(PREFIX_CACHE, 'remove failed:', e.message); return 0; }
};

fun.clearByPattern = async (pattern) => {
    if (!redisClient.isReady) return 0;
    const match = `${NAMESPACE}:*${pattern}*`;
    let deleted = 0;
    try {
        for await (const batch of redisClient.scanIterator({ MATCH: match, COUNT: 200 })) {
            const keys = Array.isArray(batch) ? batch : [batch];
            if (keys.length) deleted += await redisClient.del(keys);
        }
    } catch (e) {
        warn(PREFIX_CACHE, `clearByPattern(${pattern}) failed:`, e.message);
    }
    return deleted;
};

fun.acquire = async (key, ttlSeconds = DEFAULT_LOCK_TTL_SEC) => {
    if (!key) throw new Error('Lock key is required');
    if (!redisClient.isReady) {
        warn(PREFIX_LOCK, `acquire(${key}) skipped: redis not ready`);
        return null;
    }

    const fullKey = lockKey(key);
    const token = crypto.randomBytes(16).toString('hex');

    try {
        const ok = await redisClient.set(fullKey, token, { NX: true, EX: ttlSeconds });
        if (!ok) return null;

        return {
            token,
            release: async () => {
                try {
                    const result = await redisClient.eval(RELEASE_LUA, {
                        keys: [fullKey],
                        arguments: [token],
                    });
                    return result === 1;
                } catch (e) {
                    err(PREFIX_LOCK, `release(${key}) failed:`, e.message);
                    return false;
                }
            },
        };
    } catch (e) {
        err(PREFIX_LOCK, `acquire(${key}) failed:`, e.message);
        return null;
    }
};

fun.withLock = async (key, ttlSeconds, cb) => {
    const handle = await fun.acquire(key, ttlSeconds);
    if (!handle) {
        const e = new Error(`Lock busy: ${key}`);
        e.code = 'LOCK_BUSY';
        throw e;
    }
    try { return await cb(); }
    finally { await handle.release(); }
};

fun.TIME = TIME; 
module.exports = fun;
