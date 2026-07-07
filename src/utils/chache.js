
const chache = new Map()

const set = (keys, data, ttl_seconds = 1200) => {
    const key = keys;
    chache.set(key, {
        data,
        expiresAt: Date.now() + ttl_seconds * 1000
    });
}

const get = (key) => {
    const entry = chache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        chache.delete(key)
        return null
    }
    return entry.data
}

const del = (key) => {
    cache.delete(key);
}

module.exports = { get, set, del, chache }