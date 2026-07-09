const { poolPg } = require("../config/supabase");
const { formatChache, appendHistory } = require("../utils/chatHistory");
const { getTool, getOrInitToolEmbed } = require("../utils/tools/curated");
const { ollamaEmbed, ollamaChatTool, ollamaChatRAG, ollamaChatBoth, ollamaChat } = require("./chatbot.service");
const { search_nearest_vector } = require("./pg.services");
const { getRole, getOrInitKeyEmbed } = require("./role.service");
const redis = require("../config/redis.js");
const { BASE_PROMPT, TOOLS_PROMPT, RAG_PROMPT } = require("../utils/tools/generic.js");
const service = {}


const chatService = async (args) => {
    const {userMessage, sessionId, accessToken, terminalCode} =args;
    const debug = ''
    try {
        let base_prompt = ``;
        const cache = redis.getRedis()
        await cache.hSet("niel", "ini field", "ini value");
        
        if(!userMessage) return {data: "Masukan Pertanyaan..."}
        
        const history = formatChache(sessionId);
        const embContext = await getOrInitKeyEmbed();
        const embedMessage = await ollamaEmbed(userMessage);

        

        const role = getRole(embedMessage, embContext);
        console.log(role)

        let ans = null;
        if (role === "TOOLS") {
            base_prompt = `${BASE_PROMPT} --- ${TOOLS_PROMPT}`
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool);
            console.log(tools)
            ans = await ollamaChatTool(base_prompt, userMessage, 0.7, tools, history);
        } else if ( role === "RAG" ){
            base_prompt = `${BASE_PROMPT} --- ${RAG_PROMPT}`
            console.log(`Masuk RAG`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatRAG(base_prompt, userMessage, 0.5, injectPrompt, history);
        } else if ( role === "BOTH") {
            console.log("BOOOTTHHHHHH")
            base_prompt = `${BASE_PROMPT} --- ${TOOLS_PROMPT}`
            // base_prompt = `${BASE_PROMPT} ---     ${TOOLS_PROMPT} --- ${RAG_PROMPT}`
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool)
            console.log(`Tools yang diambil:\n${tools.map((value) => value.function.name)}`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            console.log("hehe")
            ans = await ollamaChatTool(base_prompt, userMessage, 0.7, tools, history);
            // ans = await ollamaChatBoth(base_prompt, userMessage, 0.1, injectPrompt, tools, history)
        } else {
            base_prompt = `${BASE_PROMPT}`
            ans = await ollamaChat(base_prompt, userMessage, 0.7, )
        }
        appendHistory(sessionId, userMessage, ans);
        // console.log('debug', debug)
        return {data: ans}
    } catch (err) {
        console.log(err)
    }
    
}

module.exports = { chatService }