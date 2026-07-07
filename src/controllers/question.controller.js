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
        const result = await chatService.chatService(req.body, res, next);
        console.log(`result`)
        console.log(result)
        return res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { getFaq, chat };