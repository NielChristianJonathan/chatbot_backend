const { ollamaEmbed } = require("./chatbot.service");


let cachedKeyEmbed = null

const keyContext = {
    "RAG" : [
        "Apa itu aplikasi Praya?",
        "Apa itu request layanan?",
        "Apa itu pranota?",
        "Receiving, Delivery",
        "apa itu pranota, lolo",
        "Apa arti status PAID?",
        "Aturan"

    ],
    "TOOLS": [
        "ada berapa container saat ini?",
        "container dengan id ini sedang berada dimana",
        "customer dengan kode ini ada dimana",
        "pranote, nota, invoice",
        "Kapal, voyage, ETA, ETD",
        "dimana request ID",
        "Terminal informasi"
        
    ]
}

const getValEmbed = async (values) => {
    vals = [];
    for (val of values) {
        // console.log(val)
        embVal = await ollamaEmbed(val);
        vals.push(embVal);
        // console.log("BErha")
    }
    return vals
}

const getKeyEmbed = async (keyContext= keyContext) => {
    const keyEmbed = [];
    // console.log(keyContext)
    for (const [key, values] of Object.entries(keyContext)) {
        // console.log( values)
        embed_val = await getValEmbed(values);
        keyEmbed.push({key, embed_val})
    }
    return keyEmbed
}

const getOrInitKeyEmbed = async () => {
    // console.log(`masuk sini`)

    if (cachedKeyEmbed === null) {
        console.log(`Initializing key embeddings...`)
        cachedKeyEmbed = await getKeyEmbed(keyContext);
    }
    // console.log(`mengambil data embed...`)
    return cachedKeyEmbed
}

const cosineSimilarity = (embUserMessage, embContext) => {
    let dot = 0;
    let normEmbUserMessage = 0;
    let normEmbContext = 0;

    for (let i = 0; i < embUserMessage.length ; i++) {
        dot += embUserMessage[i] * embContext[i];
        normEmbUserMessage += embUserMessage[i] * embUserMessage[i];
        normEmbContext += embContext[i] * embContext[i];
    }
    return dot / (Math.sqrt(normEmbUserMessage) * Math.sqrt(normEmbContext))
}

const getRole = (embedMessage, embContext) => {
    let bestRole = null;
    let bestDif = 0;
    const roleValue = Object.fromEntries(
        embContext.map (val => [val.key, 0])
    )
    
    for (const {key, embed_val} of embContext){
        let max = 0;
        for (const val of embed_val) {
            max = Math.max(cosineSimilarity(embedMessage, val), max) 
        }
        console.log(`${key}: ${max}`)
        if (max >= 0.45) {
            roleValue[key] = 1
        }
    }
    if (roleValue.TOOLS && roleValue.RAG) {
        return "BOTH"
    }
    if (roleValue.TOOLS) {
        return "TOOLS"
    }
    if (roleValue.TOOLS) {
        return "RAG"
    }
    return "SKIP"
}

module.exports = {getOrInitKeyEmbed, getRole, cosineSimilarity}