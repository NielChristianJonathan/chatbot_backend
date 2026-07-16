const { poolPg } = require("../config/supabase");
const { formatChache, appendHistory } = require("../utils/chatHistory");
const { getTool, getOrInitToolEmbed } = require("../utils/tools/curated");
const { ollamaEmbed, ollamaChatTool, ollamaChatRAG, ollamaChatBoth, ollamaChat } = require("./chatbot.service");
const { search_nearest_vector, inputMessage, updateDate } = require("./pg.services");
const { getRole, getOrInitKeyEmbed } = require("./role.service");
const redis = require("../config/redis.js");
const { BASE_PROMPT, TOOLS_PROMPT, RAG_PROMPT } = require("../utils/tools/generic.js");
const { getHistory, pushMessage } = require("../utils/cache.js");
const { USER, ASSISTANT } = require("../constant/const.js");
const service = {}
const temperature = 0.7

const chatService = async (args) => {
    const {userMessage, accessToken, terminalCode, terminalAccess, username, chatSession} =args;
    const debug = '';
    await updateDate({username});
    try {
        let base_prompt = BASE_PROMPT(terminalAccess);
        let message = {
            role: USER,
            content: userMessage
        };
        const history = await getHistory({chatSession})
        let ans = null
        
        // ==============================================================================================================
        const embContext = await getOrInitKeyEmbed();
        
        const embedMessage = await ollamaEmbed(userMessage);
        const role = getRole(embedMessage, embContext);
        console.log(role)

        if (role === "TOOLS") {
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool);
            ans = await ollamaChatTool({base_prompt, prompt: userMessage, temperature, tools, history, username, chatSession});
        } else if ( role === "RAG" ){
            console.log(`Masuk RAG`)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatRAG({base_prompt, prompt: userMessage, temperature, context: injectPrompt, history, chatSession, username});
        } else if ( role === "BOTH") {
            console.log("BOOOTTHHHHHH")
            const embedTool = await getOrInitToolEmbed();
            const tools = getTool(embedMessage, embedTool)
            const injectPrompt = await search_nearest_vector(embedMessage);
            ans = await ollamaChatTool({base_prompt, prompt: userMessage, temperature, tools, history, terminalCode, username, chatSession});
            // ans = await ollamaChatBoth({base_prompt, prompt: userMessage, 0.1, injectPrompt, tools, history, username, AccessTokenn})
        } else {
            base_prompt = `${base_prompt}`
            ans = await ollamaChat({base_prompt, prompt: userMessage, temperature, history, chatSession, username})
        }
        const answer = {
            role: ASSISTANT,
            content: ans
        }
        // appendHistory(accessToken, userMessage, ans);
        // ==============================================================================================================
        await pushMessage({accessToken, message, answer})
        


        return [{jawaban: ans}]
    } catch (err) {
        throw err
    }
    
}

module.exports = { chatService }