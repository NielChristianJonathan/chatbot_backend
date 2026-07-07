const { poolPg } = require("../config/supabase");
const { formatChache, appendHistory } = require("../utils/chatHistory");
const { getTool, getOrInitToolEmbed } = require("../utils/tools/curated");
const { ollamaEmbed, ollamaChatTool, ollamaChatRAG, ollamaChatBoth } = require("./chatbot.service");
const { search_nearest_vector } = require("./pg.services");
const { getRole, getOrInitKeyEmbed } = require("./role.service");
const redis = require("../config/redis.js")
const service = {}


const chatService = async (req, res) => {
    try {

        const userMessage = req.message?.trim();
        const sessionId = req.sessionId?.trim();
        const accessToken = req.cookies
        console.log(accessToken)
        
        if(!userMessage) return {data: "Masukan Pertanyaan..."}
        // console.log(userMessage)
        
        const history = formatChache(sessionId);
        // const embContext = await getOrInitKeyEmbed();
        const cache = redis.getRedis()
        await cache.hSet("niel", "ini field", "ini value");
        const p = await cache.hGetAll("niel")
        console.log(p)
        // const embedMessage = await ollamaEmbed(userMessage);
        // console.log(cache)

        // const role = getRole(embedMessage, embContext);
        // console.log("===============================================")
        // console.log(role)

        let ans = null;
        // if (role === "TOOLS") {
        //     const embedTool = await getOrInitToolEmbed();
        //     // console.log(embedTool)
        //     const tools = getTool(embedMessage, embedTool);
        //     ans = await ollamaChatTool(userMessage, 0.1, tools, history, 0);
        // } else if ( role === "RAG" ){
        //     const injectPrompt = await search_nearest_vector(embedMessage);
        //     ans = await ollamaChatRAG(userMessage, 0.5, injectPrompt, history);
        // } else if ( role === "BOTH") {
        //     console.log("BOTHHHHHHHHHHHHHHHHHH")
        //     const embedTool = await getOrInitToolEmbed();
        //     const tools = getTool(embedMessage, embedTool)
        //     const injectPrompt = await search_nearest_vector(embedMessage);
        //     console.log("hehe")
        //     ans = await ollamaChatBoth(userMessage, 0.1, injectPrompt, tools, history)
        // } else {
        //     ans = "Pertanyaanmu ga nyambung ya"
        // }
        // appendHistory(sessionId, userMessage, ans);

        return {data: ans}
    } catch (err) {
        console.log(err)
    }
    
}

module.exports = { chatService }