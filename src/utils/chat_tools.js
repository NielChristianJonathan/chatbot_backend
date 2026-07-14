const { OLLAMA_MODEL } = require("../constant/env");

const getMessage = ({base_prompt, history, prompt}) => {
    const message = [
        {
            role:"sistem",
            content: `${base_prompt}`
        },
        ...history,
        { role: "user", content: prompt}
    ]
    return message
}

const getPayload = ({message, temperature}) => {
    console.log(message)
    const payload = {
        model: OLLAMA_MODEL,
        messages: message,
        stream: false,
        options: { temperature, num_ctx: 8192 }
    };
    // console.log(message)
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

module.exports = {getMessage, getPayload, getToken, getRagMessage}