const { OLLAMA_URL } = require("../constant/env")
const axios = require("axios");

const chatApi = async (payload) => {
    const response =  await axios.post(
        OLLAMA_URL + '/api/chat', 
        payload, 
        {
            responseType: 'json',
            timeout: 0
        }
    )
    console.log(response)
    return response
}

module.exports = {chatApi}