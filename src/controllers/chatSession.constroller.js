const { getChatSessionService, getChatSessionMessagesService, deleteChatSessionService, getCreateChatSessionService } = require("../services/chatSession.services");

const getChatSessionController = async (req, res, next) => {
    try {
        const {username} = req.user;
        const result = await getChatSessionService({username});
        res.ok(result);
    } catch (error) {
        throw error
    }
}

const getCreateChatSession = async(req, res, next) => {
    try {
        console.log("MASUKKKK")
        const {username} = req.user;
        const {message} = req.body;
        const result = await getCreateChatSessionService({username, userMessage: message});
        console.log("====================")
        console.log(result)
        console.log("====================")
        res.ok(result);
    } catch (error) {
        throw error
    }
}

const getChatSessionMessagesController = async (req, res, next) => {
    try {
        console.log("HALOOO")
        const {username} = req.user;
        const {chatSession} = req.params;
        console.log(chatSession)
        const result = await getChatSessionMessagesService({username, chatSession});
        res.ok(result);
    } catch (error) {
        console.log(error.statusCode);
        throw error
    }
}

const deleteChatSessionController = async(req, res, next) => {
    const {username} = req.user;
    const {chatSession} = req.params;
    const result = await deleteChatSessionService({username, chatSession});
    res.ok(result);
}

module.exports = { getChatSessionController, getCreateChatSession, getChatSessionMessagesController, deleteChatSessionController }