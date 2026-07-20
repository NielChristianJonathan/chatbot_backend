const { getKeyMessage, getMessage } = require("./pg.services")

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

module.exports = {getKeyMessageService, getMessageService}