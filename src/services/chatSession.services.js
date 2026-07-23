const { AppError } = require("../utils/appError");
const { getKeyMessage, getMessage, deleteKeyMessage, addKeyMessages, getOneKeyMessage, deleteMessage } = require("./pg.services");


const getChatSessionService = async({username}) => {
    const keyMessage = await getKeyMessage({username});
    return keyMessage
}

const getCreateChatSessionService = async ({username, userMessage}) => {
    const chatSession = crypto.randomUUID();
    await addKeyMessages({username, chatSession, userMessage});
    const keyMessage = getOneKeyMessage({username, chatSession});
    return keyMessage
}

const getChatSessionMessagesService = async({username, chatSession}) => {
    message = await getMessage({username, chatSession});
    if (message.length < 1) {
        throw new AppError("Tidak Session Chat Tidak Ditemukan", 430)
    }
    return message
}

const deleteChatSessionService = async({username, chatSession}) => {
    const result = await deleteKeyMessage({username, chatSession});
    await deleteMessage({username, chatSession})
    return result
}

module.exports = { getChatSessionService, getCreateChatSessionService, getChatSessionMessagesService, deleteChatSessionService }
