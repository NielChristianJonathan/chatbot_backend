const { addKeyMessages } = require("../services/pg.services");

const createChatSession = async (req, res, next) => {
    if (!req.headers["chatsession"]?.trim()) {
        req.headers["chatsession"] = crypto.randomUUID();
        const {username} = req.user;
        const {message} = req.body;

        await addKeyMessages({username, userMessage: message, chatSession: req.headers["chatsession"] })
    }
    next()
}

module.exports = {createChatSession}