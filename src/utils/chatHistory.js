const { USER, ASSISTANT } = require("../constant/const");
const { get, set, del, chache } = require("./chache");

const MAX_TURNS = 10
const HISTORY_PREFIX = "history:"

const getHistory = (sessionId) => {
    return get(`${HISTORY_PREFIX}${sessionId}`) || []
}

const appendHistory = (sessionId, pertanyaan, jawaban) => {
    const history = getHistory(sessionId);

    history.push({role: USER, content: pertanyaan});
    history.push({role: ASSISTANT, content: jawaban});

    const trimmed = history.slice(-MAX_TURNS*2);
    set(`${HISTORY_PREFIX}${sessionId}`, trimmed, 1200);
}

const clearHistory = (sessionId) => {
    del(`${HISTORY_PREFIX}${sessionId}`) 
}

const formatChache = (sessionId) => {
    return getHistory(sessionId);
}

module.exports = { getHistory, appendHistory, clearHistory, formatChache}