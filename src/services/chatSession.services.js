const { getKeyMessage, getMessage, deleteKeyMessage, addKeyMessages } = require("./pg.services");


const getChatSessionService = async({username}) => {
    const keyMessage = await getKeyMessage({username});
    return keyMessage
}

const getCreateChatSessionService = async ({username, userMessage}) => {
    const chatSession = crypto.randomUUID();
    await addKeyMessages({username, chatSession, userMessage})
    return chatSession
}

const getChatSessionMessagesService = async({username, chatSession}) => {
    message = await getMessage({username, chatSession});
    return message
}

const deleteChatSessionService = async({username, chatSession}) => {
    const result = await deleteKeyMessage({username, chatSession});
    return result
}

module.exports = { getChatSessionService, getCreateChatSessionService, getChatSessionMessagesService, deleteChatSessionService }
