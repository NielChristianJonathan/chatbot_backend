const { poolPg } = require("../config/supabase");
const { formatChache, appendHistory } = require("../utils/chatHistory");
const { getTool, getOrInitToolEmbed } = require("../utils/tools/curated");
const { ollamaEmbed, ollamaChatTool, ollamaChatRAG, ollamaChatBoth, ollamaChat } = require("./chatbot.service");
const { search_nearest_vector, inputMessage } = require("./pg.services");
const { getRole, getOrInitKeyEmbed } = require("./role.service");
const redis = require("../config/redis.js");
const { BASE_PROMPT, TOOLS_PROMPT, RAG_PROMPT } = require("../utils/tools/generic.js");
const service = {}
const temperature = 0.3

const chatService = async (args) => {
    const {userMessage, accessToken, terminalCode, terminalAccess, username} =args;
    const debug = ''
    console.log(terminalAccess.map(item => `- Kode Terminal ${item.TERMINAL_CODE} dengan nama Terminal ${item.TERMINAL_NAME}`).join("\n"))
    try {
        let base_prompt = BASE_PROMPT(terminalAccess);
        let message = {
            role: 'user',
            content: userMessage
        };
        await inputMessage({
            sessionId: accessToken, 
            username, 
            role: "User",
            context: userMessage
        })
        const cache = redis.getRedis()
        // const tes = await cache.lRange(
        //     `chat:${accessToken}`,
        //     0,
        //     -1
        // );
        // const histories = tes.map((item) => JSON.parse(item))
        let ans = null;
        // console.log('oooooooooooo')
        // console.log(histories)    
        // console.log('oooooooooooo')
        
        // if(!userMessage) return {data: "Masukan Pertanyaan..."}
        
        const history = formatChache(accessToken);

        const embContext = await getOrInitKeyEmbed();
        const embedMessage = await ollamaEmbed(userMessage);

        

        const role = getRole(embedMessage, embContext);
        console.log(role)

        if (role === "TOOLS") {
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool);
            ans = await ollamaChatTool({base_prompt, prompt: userMessage, temperature, tools, history, username, accessToken});
        } else if ( role === "RAG" ){
            console.log(`Masuk RAG`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatRAG({base_prompt, prompt: userMessage, temperature, context: injectPrompt, history, accessToken, username});
        } else if ( role === "BOTH") {
            console.log("BOOOTTHHHHHH")
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatTool({base_prompt, prompt: userMessage, temperature, tools, history, terminalCode, username, accessToken});
            // ans = await ollamaChatBoth({base_prompt, prompt: userMessage, 0.1, injectPrompt, tools, history, username, AccessTokenn})
        } else {
            base_prompt = `${base_prompt}`
            ans = await ollamaChat({base_prompt, prompt: userMessage, temperature, history, accessToken, username})
        }
        const answer = {
            role: "assistant",
            content: ans
        }
        appendHistory(accessToken, userMessage, ans);
        // await cache.rPush(`chat:${accessToken}`, JSON.stringify(message));
        // await cache.rPush(`chat:${accessToken}`, JSON.stringify(answer));
        // const jawabanakhir = await cache.lRange(
        //     `chat:${accessToken}`,
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