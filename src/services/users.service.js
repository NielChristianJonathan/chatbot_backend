const { getKeyMessage, getMessage, deleteKeyMessage } = require("./pg.services")

const getKeyMessageService = async({username}) => {
    const keyMessage = await getKeyMessage({username});
    return keyMessage
}

const getMessageService = async ({username, chatSession}) => {
    message = await getMessage({username, chatSession})
    // console.log(chatSession)
    console.log(message)
    return message
}

const deleteKeyMessageService = async ({username, chatSession}) => {
    const result = await deleteKeyMessage({username, chatSession});
    return result
}

module.exports = {getKeyMessageService, getMessageService, deleteKeyMessageService}