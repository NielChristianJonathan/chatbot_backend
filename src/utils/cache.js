const redis = require("../config/redis.js");
const getHistory = async({accessToken}) => {
    const cache = redis.getRedis()
    let history = await cache.lRange(`chat:${accessToken}`,0,-1);
    history = history.map(item => JSON.parse(item))
    return history
}

const pushMessage = async({accessToken, message, answer}) => {
    const cache = redis.getRedis()
    await cache.rPush(`chat:${accessToken}`, JSON.stringify(message));
    await cache.rPush(`chat:${accessToken}`, JSON.stringify(answer));
    await cache.lTrim(`chat:${accessToken}`, -5, -1)
}

module.exports = { getHistory, pushMessage }