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
        console.log("HAloooooo")
        const body = req.body;
        console.log(body)
        const username = req.user.username;
        const terminalCode = req.user.terminalCode;
        const userMessage = body.message?.trim();
        const sessionId = body.sessionId?.trim();
        const accessToken = body.cookies;

        console.log("++++++++++++++++++++++++++++++++++++");
        console.log(terminalCode);
        console.log("++++++++++++++++++++++++++++++++++++");
        const {message} = req.body;
        console.log(message)
        // const {username} = req.user
        // console.log(username)
        const result = await chatService.chatService({userMessage, sessionId, accessToken, terminalCode});
        return res.json(result);
    } catch (err) { 
        next(err);
    }
}

module.exports = { getFaq, chat };