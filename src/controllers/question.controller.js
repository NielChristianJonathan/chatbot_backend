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
        console.log("======================================")
        console.log("Masuk Sini")
        console.log("======================================")
        const username = req.user.username;
        const terminalCode = req.user.terminalCode;
        const userMessage = req.body.message?.trim();
        const terminalAccess = req.user.terminalAccess;
        const {chatSession} = req.params;
        console.log(chatSession);
        const result = await chatService.chatService({userMessage, terminalCode, terminalAccess, username, chatSession});
        console.log(result);
        return res.set("chatsession", chatSession).ok(result);
    } catch (err) { 
        next(err);
    }
}

module.exports = { getFaq, chat };