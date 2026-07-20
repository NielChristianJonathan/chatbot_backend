const { getKeyMessageService, getMessageService } = require("../services/users.service");

const getKeyMessageController = async(req, res, next) => {
    try {
        const {username} = req.user;
        console.log("===============================")
        console.log(req.user);
        console.log("===============================")
        const result = await getKeyMessageService({username})
        res.ok(result);
    } catch(err) {
        console.log(err);
        throw err
    }
}

const getMessageController = async(req, res, next) => {
    try {
        const {username} = req.user;
        const chatSession = req.headers.chatsession
        const result = await getMessageService({username, chatSession})
        console.log(result)
        res.ok(result)
    } catch {
        throw err
    }
}

module.exports = {getKeyMessageController, getMessageController}