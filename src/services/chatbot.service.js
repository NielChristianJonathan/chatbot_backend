
const { OLLAMA_EMBED_MODEL, OLLAMA_URL, OLLAMA_MODEL } = require("../constant/env");
const axios = require("axios");
const { search_nearest_vector, inputMessage, minusToken } = require("./pg.services");
const { getTerminalCode } = require("../repositories/terminal");
const { chatApi } = require("../utils/api");
const { getMessage, getPayload, getToken, getRagMessage, updateDatabase } = require("../utils/chat_tools");
const { ASSISTANT, TOOL, SYSTEM } = require("../constant/const");

const service = {};

service.ollamaChatBoth = async ({base_prompt, prompt, temperature = 0.5, context, tools, history = [], username, chatSession}) => {
    const pesan = getRagMessage({context, prompt})
    const messages = getMessage({base_prompt, history, pesan})
    try {
        return await service.runToolLoop( {messages, tools, temperature, iteration: 0, username, chatSession, rag: context});
    } catch(err) {
        throw err
    }
}

service.ollamaChatRAG = async ({base_prompt, prompt, temperature = 0.5, context, history = [], chatSession, username}) => {
    
    const pesan = getRagMessage({context, prompt})
    const message = getMessage({base_prompt, history, pesan})
    try {
        const payload = getPayload({message, temperature});

        const response = await chatApi(payload)
        const {promptTokens, completionTokens, totalToken} = getToken({response}) 
        
        await updateDatabase({
            chatSession,
            username,
            role: ASSISTANT,
            context: response.data.message.content,
            rag: context,
            prompt_eval_count: promptTokens, 
            eval_count: completionTokens, 
            totalToken,
            response
        })
        return response.data.message.content
    } catch(err) {
        throw error;
    }
}


service.ollamaChatTool = async ({base_prompt, prompt, temperature = 0.1, tools = [], history = [], username, chatSession}) => {
    const messages = getMessage({base_prompt, history, prompt})
    return await service.runToolLoop({messages, tools, temperature, iteration: 0, username, chatSession});
};

service.ollamaChat = async ({base_prompt, prompt, temperature = 0.5, history = [], chatSession, username}) => {
    const message = getMessage({base_prompt, history, prompt})
    try {
        const payload = getPayload({temperature, message})
        const response = await chatApi(payload);
        const {promptTokens, completionTokens, totalToken} = getToken({response}) 
        await updateDatabase({totalToken, username, chatSession, response})
        return response.data.message.content
    } catch(err) {
        throw error;
    }
}

service.runToolLoop = async ({messages, tools = [], temperature = 0.5, iteration, username, chatSession, rag = null}) => {
    if (iteration >= 3) {
        return "Maaf, saya tidak dapat menemukan jawaban yang cukup setelah beberapa percobaan.";
    }
    try {
        console.log(tools.map(item => item.function.name))
        const payload = getPayload({temperature, message: messages, tools})
        console.log(`[Iterasi ${iteration}] Memanggil Ollama...`);

        const response = await chatApi(payload)
        const {promptTokens, completionTokens, totalToken} = getToken({response}) 
        const message = response.data.message;
        
        const tool_calls = message.tool_calls || [];
        const toolUse = tool_calls.map(item => item.function.name)
        const toolResults = [];
        console.log("WOIIII")

        if (tool_calls.length <= 0) {
            console.log("Keluar");
            await updateDatabase({
                chatSession,
                username,
                role: ASSISTANT,
                context: message,
                rag,
                prompt_eval_count: promptTokens,
                eval_count: completionTokens,
                totalToken,
                response
            })
            return message.content;
        }

        messages.push({
            role: ASSISTANT,
            content: message.content || "",
            tool_calls: tool_calls
        });

        for (const toolCall of tool_calls) {
            const toool = tools.find(t => t.function.name === toolCall.function.name);
            if (!toool) {
                console.log(`Tool ${toolCall.function.name} tidak ditemukan, skip.`);
                continue;
            }
            console.log(`-----------------------------------------------`);
            console.log(`[Iterasi ${iteration}] Memanggil tool: ${toolCall.function.name}`, toolCall.function.arguments);
            console.log(`-----------------------------------------------`);

            const result = await toool.handler(toolCall.function.arguments);
            toolResults.push(result)
            messages.push({
                role: TOOL,
                tool_name: toolCall.function.name,
                content: JSON.stringify(result)
            });
            messages.push({
                role: SYSTEM,
                content: "Ingat: jawab HANYA dalam Bahasa Indonesia, jangan tampilkan format JSON/tabel mentah, jangan melakukan kalkulasi tambahan sendiri — cukup laporkan data yang relevan secara ringkas."
            });
        }
        await updateDatabase({
            chatSession,
            username,
            role: ASSISTANT,
            context: message,
            tools: toolUse,
            tool_result: toolResults,
            rag,
            prompt_eval_count: promptTokens,
            eval_count: completionTokens,
            totalToken,
            response
        })
        return await service.runToolLoop({messages, tools, temperature, iteration: iteration + 1, username, chatSession});

    } catch (error) {
        console.error(`Error di iterasi ${iteration}:`, error.message);
        throw error;
    }
};


service.normalizeEmbedding = (embedding) => {
    const norm = Math.sqrt(
        embedding.reduce((sum, value) => sum + value * value, 0)
    );

    return embedding.map(value => value / norm);
}


service.ollamaEmbed = async (message) => {
    
    try {
        // console.log(message);
        const payload = {
            model: OLLAMA_EMBED_MODEL,
            input: message
            // normalize_embeddings: true
        };
        const response = await axios.post(
            `${OLLAMA_URL}/api/embed`,
            payload
        );
        const result = service.normalizeEmbedding(response.data.embeddings[0]);
        // console.log(result)
        return result;
    } catch (err) {
        console.log(`error embed: gagal`);  
        throw err
    }
}


module.exports = service;