const { OLLAMA_URL } = require("../constant/env")
const axios = require("axios");
const { AppError } = require("./appError");

const chatApi = async (payload) => {
    try {
        const response =  await axios.post(
            OLLAMA_URL + '/api/chat', 
            payload, 
            {
                responseType: 'json',
                timeout: 0
            }
        )
        return response
    } catch {
        throw new AppError(409, "Ollama Error")
    }
    
}

module.exports = {chatApi}