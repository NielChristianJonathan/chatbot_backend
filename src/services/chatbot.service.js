
const { OLLAMA_EMBED_MODEL, OLLAMA_URL, OLLAMA_MODEL } = require("../constant/env");
const axios = require("axios");
const { search_nearest_vector } = require("./pg.services");

const service = {};

service.ollamaChatBoth = async (prompt, temperature = 0.5, context, tools, history = []) => {
    messages = [
        {
            role:"sistem",
            content:`kamu adalah asisten database yang sedang menggunakan tools dan RAG
Gunakan informasi yang berada di user message, hasil RAG adalah informasi yang dapat digunakan untuk menjawab pertanyan user juga.
Jika tidak ada yang relevan, Gunakan tools yang tersedia untuk menjawab pertanyaan user.
Jika hasil dari satu tool tidak cukup atau tidak relevan untuk menjawab pertanyaan, coba panggil tool lain yang tersedia.
Jangan mengarang jawaban. Jawab hanya berdasarkan data yang didapat dari tools.
Jika setelah mencoba tools yang tersedia datanya masih tidak cukup, jelaskan ke user informasi tambahan apa yang dibutuhkan.
Berikut cara penggunaan tools
- vessel_name adalah nama kapal
- terminal_name adalah nama terminal
- terminal_code adalah kode terminal
- ei: jenis bongkaran (E = Ekspor, I= Impor)
- etd: estimasi waktu department / kepergian
- eta: estimasi waktu kedatangan
- total_customer_keseluruhan: total customer keseluruhan
- jumlah_customer_pada_request: total customer yang melakukan request`
        },
        ...history,
        {role: "assistant", content: context},
        {role: "user", content: `${prompt}`}
    ]
    
    try {
        return await service.runToolLoop( messages, tools, temperature, 0);
    } catch(err) {
        throw error
    }
}



service.ollamaChatRAG = async (prompt, temperature = 0.5, context, history = []) => {
    const pesan = `kamu adalah asisten 
Gunakan informasi berikut untuk menjawab, gunakan hanya yang relevan saja, jika tidak ada yang relevan, jawab dengan "Data tidak tersedia":
CONTEXT:
${context}

Pertanyaan:
${prompt}`;
    const message = [
        ...history,
        { role: "user", content: pesan}
    ]

    try {
        const payload = {
            model: OLLAMA_MODEL,
            messages: message,
            stream: false,
            options: { temperature, num_ctx: 8192 }
        };
        const response = await axios.post(
            OLLAMA_URL + '/api/chat', 
            payload, 
            {
            responseType: 'json',
            timeout: 0
        }
        );
        // console.log(response.data.message.content)
        return response.data.message.content


    } catch(err) {
        throw error;
    }
}


service.ollamaChatTool = async (prompt, temperature = 0.1, tools = [], history = []) => {
    const messages = [
        { 
            role: "system", 
            content: `Kamu adalah asisten database. Gunakan tools yang tersedia untuk menjawab pertanyaan user.
Jika hasil dari satu tool tidak cukup atau tidak relevan untuk menjawab pertanyaan, coba panggil tool lain yang tersedia.
Jangan mengarang jawaban. Jawab hanya berdasarkan data yang didapat dari tools.
Jika setelah mencoba tools yang tersedia datanya masih tidak cukup, jelaskan ke user informasi tambahan apa yang dibutuhkan.
Berikut cara penggunaan tools
- vessel_name adalah nama kapal
- terminal_name adalah nama terminal
- terminal_code adalah kode terminal
- ei: jenis bongkaran (E = Ekspor, I= Impor)
- etd: estimasi waktu department / kepergian
- eta: estimasi waktu kedatangan
- total_customer_keseluruhan: total customer keseluruhan
- jumlah_customer_pada_request: total customer yang melakukan request` 
        },
        ...history,
        { role: "user", content: prompt}
    ];
    return await service.runToolLoop( messages, tools, temperature, 0);
};

service.runToolLoop = async ( messages, tools = [], temperature, iteration) => {
    if (iteration >= 3) {
        return "Maaf, saya tidak dapat menemukan jawaban yang cukup setelah beberapa percobaan.";
    }

    try {
        const payload = {
            model: OLLAMA_MODEL,
            messages: messages,
            stream: false,
            options: { temperature, num_ctx: 8192 },
            tools: tools
        };

        console.log(`[Iterasi ${iteration}] Memanggil Ollama...`);
        const response = await axios.post(OLLAMA_URL + '/api/chat', payload, {
            responseType: 'json',
            timeout: 0
        });

        const message = response.data.message;
        const tool_calls = message.tool_calls || "";

        if (tool_calls.length === 0) {
            return message.content;
        }

        messages.push({
            role: "assistant",
            content: message.content || "",
            tool_calls: tool_calls
        });

        for (const toolCall of tool_calls) {
            const toool = tools.find(t => t.function.name === toolCall.function.name);
            if (!toool) {
                console.log(`Tool ${toolCall.function.name} tidak ditemukan, skip.`);
                continue;
            }

            console.log(`[Iterasi ${iteration}] Memanggil tool: ${toolCall.function.name}`, toolCall.function.arguments);
            const result = await toool.handler(toolCall.function.arguments);

            messages.push({
                role: "tool",
                content: JSON.stringify(result)
            });
        }
        return await service.runToolLoop(messages, tools, temperature, iteration + 1);

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
        console.log(err)
        console.log(`error embed: gagal`);  
    }
}


module.exports = service;