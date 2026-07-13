const { poolPg } = require("../config/supabase");
const { formatChache, appendHistory } = require("../utils/chatHistory");
const { getTool, getOrInitToolEmbed } = require("../utils/tools/curated");
const { ollamaEmbed, ollamaChatTool, ollamaChatRAG, ollamaChatBoth, ollamaChat } = require("./chatbot.service");
const { search_nearest_vector } = require("./pg.services");
const { getRole, getOrInitKeyEmbed } = require("./role.service");
const redis = require("../config/redis.js");
const { BASE_PROMPT, TOOLS_PROMPT, RAG_PROMPT } = require("../utils/tools/generic.js");
const service = {}
const temperature = 0.7

const chatService = async (args) => {
    const {userMessage, sessionId, accessToken, terminalCode, terminalAccess} =args;
    const debug = ''
    console.log(terminalAccess.map(item => `- Kode Terminal ${item.TERMINAL_CODE} dengan nama Terminal ${item.TERMINAL_NAME}`).join("\n"))
    try {
        let base_prompt = BASE_PROMPT(terminalAccess);
        let message = {
            role: 'user',
            content: userMessage
        } 
        const cache = redis.getRedis()
        const tes = await cache.lRange(
            `chat:${sessionId}`,
            0,
            -1
        );
        const histories = tes.map((item) => JSON.parse(item))
        let ans = null;
        // console.log('oooooooooooo')
        // console.log(histories)    
        // console.log('oooooooooooo')
        
        // if(!userMessage) return {data: "Masukan Pertanyaan..."}
        
        const history = formatChache(sessionId);

        const embContext = await getOrInitKeyEmbed();
        const embedMessage = await ollamaEmbed(userMessage);

        

        const role = getRole(embedMessage, embContext);
        console.log(role)

        if (role === "TOOLS") {
            base_prompt += `${base_prompt} --- ${TOOLS_PROMPT}`
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool);
            ans = await ollamaChatTool(base_prompt, userMessage, temperature, tools, history, terminalCode);
        } else if ( role === "RAG" ){
            base_prompt += `${base_prompt} --- ${RAG_PROMPT}`
            console.log(`Masuk RAG`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatRAG(base_prompt, userMessage, temperature, injectPrompt, history);
        } else if ( role === "BOTH") {
            console.log("BOOOTTHHHHHH")
            base_prompt += `${base_prompt} --- ${TOOLS_PROMPT}`
            // base_prompt = `${BASE_PROMPT} ---     ${TOOLS_PROMPT} --- ${RAG_PROMPT}`
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool)
            console.log(`Tools yang diambil:\n${tools.map((value) => value.function.name)}`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            console.log("hehe")
            ans = await ollamaChatTool(base_prompt, userMessage, temperature, tools, history, terminalCode);
            // ans = await ollamaChatBoth(base_prompt, userMessage, 0.1, injectPrompt, tools, history)
        } else {
            base_prompt = `${base_prompt}`
            ans = await ollamaChat(base_prompt, userMessage, temperature,)
        }
        const answer = {
            role: "assistant",
            content: ans
        }
        appendHistory(sessionId, userMessage, ans);
        // await cache.rPush(`chat:${sessionId}`, JSON.stringify(message));
        // await cache.rPush(`chat:${sessionId}`, JSON.stringify(answer));
        // const jawabanakhir = await cache.lRange(
        //     `chat:${sessionId}`,
        //     0,
        //     -1
        // );
        // console.log(jawabanakhir.map(item => JSON.parse(item)))
        console.log(history)
        // console.log('debug', debug)
        return {data: ans}
    } catch (err) {
        console.log(err)
    }
    
}

module.exports = { chatService }