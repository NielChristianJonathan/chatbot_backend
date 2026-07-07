const { createClient } = require("redis");
const env = require("../constant/env");
let client;
const connectRedis = async () => {
    console.log("Connecting Redis...")
    client = createClient({
        // url: `rediss://default:${env.UPSTASH_REDIS_REST_TOKEN}@${env.UPSTASH_REDIS_REST_URL}:${env.UPSTASH_REDISH_PORT}`
        url: `rediss://default:gQAAAAAAAjiMAAIgcDJlODZkMDU0ZmIxZGE0YWQxODMwNDM0YTllZmQ0YjMzOA@fit-anemone-145548.upstash.io:6379`
    });
    client.on("error", (err) => {
        console.log("Redis Client Error", err);
    });

    await client.connect();
    console.log("Redis Connected")
    }

const getRedis = () => {
    return client
}

module.exports = { connectRedis, getRedis }