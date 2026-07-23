const { getOneKeyMessage } = require("../services/pg.services");
const { AppError } = require("../utils/appError")

const chatSessionValidation = async (req, res, next) => {
    try {
        const {chatSession} = req.params;
        const {username} = req.user;
        console.log(chatSession)
        message = await getOneKeyMessage({username, chatSession});
        if (message.length < 1) {
            console.log("MAsuk euyyyy")
            throw new AppError("Tidak Session Chat Tidak Ditemukan", 430)
        }
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {chatSessionValidation}