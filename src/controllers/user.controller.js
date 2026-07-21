const { getKeyMessageService, getMessageService, deleteKeyMessageService } = require("../services/users.service");

const getKeyMessageController = async(req, res, next) => {
    try {
        const {username} = req.user;
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
    } catch(err) {
        throw err
    }
}

const deleteKeyMessageController = async(req, res, next) => {
    try {
        const {username} = req.user;
        const chatSession = req.headers.chatsession;
        const result = await deleteKeyMessageService({username, chatSession});
        res.ok(result)
    } catch (error) {
        throw error
    }
    
}
module.exports = {getKeyMessageController, getMessageController, deleteKeyMessageController}