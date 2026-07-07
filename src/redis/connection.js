const { createClient } = require('redis');
const { env, redis } = require('../../constants');

const PREFIX = redis.PREFIX_CACHE;
const log  = (...a) => console.log(PREFIX, ...a);
const warn = (...a) => console.warn(PREFIX, ...a);
const err  = (...a) => console.error(PREFIX, ...a);

function buildUrl() {
    if (env.REDIS_URL) return env.REDIS_URL;

    const host = env.REDIS_HOST;
    const port = env.REDIS_PORT || '6379';
    const pwd  = env.REDIS_PASSWORD || '';
    const tls  = String(env.REDIS_TLS || '').toLowerCase() === 'true';

    if (!host) throw new Error('REDIS_HOST is required');
    if (!/^\d+$/.test(port)) throw new Error(`REDIS_PORT invalid: ${port}`);

    const auth   = pwd ? `:${encodeURIComponent(pwd)}@` : '';
    const scheme = tls ? 'rediss' : 'redis';
    return `${scheme}://${auth}${host}:${port}`;
}

const url = buildUrl();
const useTls = url.startsWith('rediss://');
const hostname = new URL(url).hostname;
const redactedUrl = url.replace(/:\/\/[^@]*@/, '://****@');

const redisClient = createClient({
    url,
    disableOfflineQueue: true,
    pingInterval: 4 * 60 * 1000,
    socket: {
        connectTimeout: 10_000,
        keepAlive: 30_000,
        ...(useTls && { tls: true, servername: hostname }),
        reconnectStrategy: (retries) => {
            const base = Math.min(retries * 200, 5_000);
            const jitter = Math.floor(Math.random() * 500);
            const delay = base + jitter;
            warn(`reconnect #${retries}, next try in ${delay}ms`);
            return delay;
        },
    },
});

redisClient
    .on('connect',      () => log(`connecting to ${redactedUrl}`))
    .on('ready',        () => log('ready'))
    .on('end',          () => warn('connection closed'))
    .on('reconnecting', () => warn('reconnecting...'))
    .on('error',        (e) => err('client error:', e.message));

(async () => {
    try { await redisClient.connect(); }
    catch (e) { err('initial connect failed (reconnect will retry):', e.message); }
})();

let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    log(`received ${signal}, closing connection...`);
    try {
        await redisClient.quit();
        log('closed gracefully');
    } catch (e) {
        err('shutdown error:', e.message);
        try { await redisClient.disconnect(); } catch {}
    }
}   
process.once('SIGINT',  () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

module.exports = redisClient;
