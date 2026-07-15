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
        const accessToken = req.cookies.accessToken;
        const terminalAccess = req.user.terminalAccess;
        const result = await chatService.chatService({userMessage, accessToken, terminalCode, terminalAccess, username});
        return res.json(result);
    } catch (err) { 
        console.log(err)
        next(err);
    }
}

module.exports = { getFaq, chat };