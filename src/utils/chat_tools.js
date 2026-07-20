const { SYSTEM, USER, ASSISTANT } = require("../constant/const");
const { OLLAMA_MODEL } = require("../constant/env");
const { minusToken, inputMessage } = require("../services/pg.services");

const getMessage = ({base_prompt, history, prompt}) => {
    const message = [
        {
            role:SYSTEM,
            content: base_prompt
        },
        ...history,
        { role: USER, content: prompt}
    ]
    return message
}

const getPayload = ({message, temperature, tools=[]}) => {
    const payload = {
        model: OLLAMA_MODEL,
        messages: message,
        stream: false,
        options: { temperature, num_ctx: 8192 },
        tools: tools
    };
    return payload
}

const getToken = ({response}) => {
    const promptTokens = response.data.prompt_eval_count ?? 0;
    const completionTokens = response.data.eval_count ?? 0;
    const totalToken = promptTokens + completionTokens
    return ({promptTokens, completionTokens, totalToken})
}

const getRagMessage = ({context, prompt}) => {
    const pesan = `CONTEXT:
${context}

Pertanyaan:
${prompt}`;
    return pesan
}

const updateDatabase = async({totalToken=null, username, chatSession, tools=null, tool_result=null, rag=null, prompt_eval_count=null, eval_count=null, response, prompt=''}) => {
    await minusToken({totalToken, username})
    
    await inputMessage({
        sessionId: chatSession,
        username,
        role: USER,
        context: prompt
    })
    await inputMessage({
        sessionId: chatSession,
        username,
        role: ASSISTANT,
        context: response.data.message.content
    })
    console.log("Berhasil")
}

module.exports = {getMessage, getPayload, getToken, getRagMessage, updateDatabase}