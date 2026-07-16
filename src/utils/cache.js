const redis = require("../config/redis.js");
const getHistory = async({chatSession}) => {
    const cache = redis.getRedis()
    let history = await cache.lRange(`chat:${chatSession}`,0,-1);
    history = history.map(item => JSON.parse(item))
    return history
}

const pushMessage = async({chatSession, message, answer}) => {
    const cache = redis.getRedis()
    await cache.rPush(`chat:${chatSession}`, JSON.stringify(message));
    await cache.rPush(`chat:${chatSession}`, JSON.stringify(answer));
    await cache.lTrim(`chat:${chatSession}`, -5, -1)
}

module.exports = { getHistory, pushMessage }