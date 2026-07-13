const chatService = require("../services/chat.service")

const getFaq = async (req, res, next) => {

    const faqs = [
        "sebutkan 5 customer code",
        "Sebutkan 5 nama terminal"
    ]
    console.log("Masukk")
    return res.json({faqs})

}

const chat = async (req, res, next) => {
    try {
        const username = req.user.username;
        const terminalCode = req.user.terminalCode;
        const userMessage = req.body.message?.trim();
        const sessionId = req.body.sessionId?.trim();
        const accessToken = req.cookies;
        const terminalAccess = req.user.terminalAccess;

        const {message} = req.body;
        console.log(message)
        // const {username} = req.user
        // console.log(username)
        const result = await chatService.chatService({userMessage, sessionId, accessToken, terminalCode, terminalAccess});
        return res.json(result);
    } catch (err) { 
        console.log(err)
        next(err);
    }
}

module.exports = { getFaq, chat };