const { poolPg } = require("../../config/supabase")
const env = require("../../constant/env")
const { handleError } = require("../../middleware/handleError")
const { Tools } = require("../../repositories")
const { ollamaEmbed } = require("../../services/chatbot.service")
const { cosineSimilarity } = require("../../services/role.service")

const tool = Tools[env.DB_MODE];
const keyTool = [
    // Tools mencari detail container berdasarkan nomor container, nama vesel, id_req
    {
        key: "detail container, request detail, vessel pada container mana, ekspor, import, tipe request",
        tool: {
            type: "function",
            function: {
                name: `get_container_detail`,
                description: `Selalu gunakan tools ini untuk Mendapatkan detail container, request detail, tipe request, ekspor, impor`,
                parameters: {
                    type: "object",
                    properties: {
                        id_req: {type: "string", description: "merupakan id request 15 karakter dengan 3 huruf disambung dengan 12 angka acak, contoh: DEL267000133062"},
                        container_no: {type:"string", description: "nomor kontainer, contoh: HPCU2228633"},
                        vessel_name: {type: "string", description: "nama vessel atau kapal, contoh: MERATUS SAMPIT"},
                        request_type: {type: "string", description: "nama tipe, contoh ekspor/impor ubah ekspor menjadi E, dan impor menjadi I"},
                        limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
                    },
                    required: []
                },
            },
            handler: async ({id_req, container_no, vessel_name, request_type, limit}) => {

                return await tool.get_container_detail(id_req, container_no, vessel_name, request_type, limit)
            }
        }
    },
    // Tools mencari Request di terminal mana
    {
        key: "Dimana request terminal",
        tool: {
            type: "function",
            function: {
                // name: `get_terminal`,
                name: `get_terminal`,
                // description: `mendapatkan info terminal menggunakan nama terminal atau code terminal`,
                description: `Selalu gunakan tools ini untuk mencari di terminal mana suatu request terjadi`,
                parameters: {
                    type: "object",
                    properties: {
                        id_req: {type: "string", description: "id request, contoh: DEX267000138036, jika tidak ada dalam message, tidak usah dibuat"},
                        terminal_name: {type: "string", description: "nama terminal"},
                    },
                    required: []
                }, 
            },
            handler: async ({id_req, terminal_name}) => {
                return await tool.get_terminal(id_req, terminal_name)
            }
        }
    },
    // Tools mencari request dari customer
    {
        key: "request dari customer ",
        tool: {
            type: "function",
            function: {
                name: `get_customer_info`,
                description: `mencari detail request dari customer, total customer`,
                parameters: {
                    type: "object",
                    properties: {
                        name: {type: "string", description: "Nama customer, contoh: ZIVO HANIA PERKASA"},
                        customer_code: {type: "string", description: "Nama customer, contoh: ZIVO HANIA PERKASA"},
                        limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
                    },
                    required: []
                }, 
            },
            handler: async ({name, customer_code, limit}) => {
                return await tool.get_customer_info(name, customer_code, limit)
            }
        }
    },
    // Tools untuk mencari pranota detail, bisa berdasarka nama customer, berdasarkan nama vessel, biller_req_id, 
    {
        key: "pranote, nota, invoice",
        tool: {
            type: "function",
            function: {
                name: `get_pranota`,
                description: `Mendapatkan detail pranota/invoice`,
                parameters: {
                    type: "object",
                    properties: {
                        customer_name: {type: "string", description: "Nama customer"}
                    },
                    required: []
                }, 
            },
            handler: async ({customer_name}) => {
                return await tool.get_pranota(customer_name)
            }
        }
    }

]

let cachedToolEmbed = null;

const getToolEmbed = async (keyTool) => {
    const toolEmbeds = [];
    // console.log("MASUK getToolEmbed")
    for (const intool of keyTool) {
        // console.log("intool",intool.key)
        const embedTool =  await ollamaEmbed(intool.key);
        
        toolEmbeds.push ({tool: intool.tool.function.name, embed: embedTool})
    }
    // console.log(toolEmbeds)
    return toolEmbeds
}


const getOrInitToolEmbed = async () => {
    console.log("Masuk getOrInitToolEmbed")
    if (cachedToolEmbed === null) {
        console.log(`initializing tool embeddings...`);
        cachedToolEmbed = await getToolEmbed(keyTool);
    }
    return cachedToolEmbed
}


const getRatingTool = (embedMessage, embedTool) => {
    console.log
    return embedTool.map(value => ({
        ...value,
        rating: cosineSimilarity(embedMessage, value.embed)
    }))
}


const getTool = (embedMessage, embedTool, threshold = 0.5) => {
    const rated = getRatingTool(embedMessage, embedTool)
        .sort((a, b) => b.rating - a.rating);

    // console.log("Tool ratings:", rated.map(r => `${r.tool}: ${r.rating.toFixed(3)}`));

    const filtered = rated.filter(r => r.rating >= threshold).slice(0, 3);

    const toolNames = filtered.map(v => v.tool);
    
    const useTool = keyTool.filter((item) => 
        toolNames.includes(item.tool.function.name)
    ).map((val) => val.tool);

    return useTool;
};

module.exports = {getOrInitToolEmbed, getTool}