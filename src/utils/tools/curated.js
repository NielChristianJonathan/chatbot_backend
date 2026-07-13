const { poolPg } = require("../../config/supabase")
const env = require("../../constant/env")
const { handleError } = require("../../middleware/handleError")
const { Tools } = require("../../repositories")
const { properties_get_container_detail } = require("../../repositories/oracleDb/getContainerDetail.js")
const { properties_get_customer_info } = require("../../repositories/oracleDb/getCustomerInfo.js")
const { properties_get_pranota } = require("../../repositories/oracleDb/getPranota.js")
const { properties_get_service } = require("../../repositories/oracleDb/getServiceInfo.js")
const { properties_get_terminal } = require("../../repositories/oracleDb/getTerminal.js")
const { properties_get_vessel } = require("../../repositories/oracleDb/getVessel.js")
const { ollamaEmbed } = require("../../services/chatbot.service")
const { cosineSimilarity } = require("../../services/role.service")
const { getTools} = require('./tool.js')

const tool = Tools[env.DB_MODE];
const keyTool = [
    getTools(
        {
            name: `get_container_detail`,
            key:"detail container, vessel pada container mana, ekspor, import",
            description: `Selalu gunakan tools ini untuk Mendapatkan detail container, dimana container berada, di terminal mana container berada, request detail, tipe request, ekspor, impor`,
            properties: properties_get_container_detail,
            handler: async ({request_id, terminal_code, terminal_name, container_number, point, vessel_name, voyage, e_i, container_size, container_type, container_status, iso_code, limit}) => {
                console.log("Masuk container Detail")
                console.log(tool)
                return await tool.get_container_detail(request_id, terminal_code, terminal_name, container_number, point, vessel_name, voyage, e_i, container_size, container_type, container_status, iso_code, limit)
            }
        }
    ),
    // getTools(
    //     {
    //         name: `get_terminal`,
    //         key: "Dimana request terminal",
    //         description: `Selalu gunakan tools ini untuk segala hal yang berhubungan dengan terminal, mencari di terminal mana suatu request terjadi`,
    //         properties: properties_get_terminal,
    //         handler: async ({id_req, terminal_name}) => {
    //             return await tool.get_terminal(id_req, terminal_name)
    //         }
    //     }
    // ),
    getTools(
        {
            name: `get_customer_info`,
            key: "request dari customer ",
            description: `Selalu gunakan tools ini untuk segala hal yang berhubungan dengan customer, mencari detail request dari customer, total customer`,
            properties: properties_get_customer_info,
            handler: async ({terminal_code, terminal_name, customer_id, customer_code, customer_name, npwp, limit}) => {
                return await tool.get_customer_info(terminal_code, terminal_name, customer_id, customer_code, customer_name, npwp, limit)
            }
        }
    ),
    getTools(
        {
            name: `get_pranota`,
            key: "pranote, nota, invoice, request id",
            description: `Selalu gunakan tools ini untuk  mencari nomor request id, segala hal yang berhubungan dengan nota, Mendapatkan detail pranota/invoice, mencari nomor request id. Wajib menggunakan terminal_code bukan terminal_name`,
            properties: properties_get_pranota,
            handler: async ({terminal_code, terminal_name, request_id, service_code, service_name, customer_code, customer_name, npwp, voyage, vessel_name, status, payment_code, trade_type, limit}) => {
                return await tool.get_pranota(terminal_code, terminal_name, request_id, service_code, service_name, customer_code, customer_name, npwp, voyage, vessel_name, status, payment_code, trade_type, limit)
            }
        }
    ),
    getTools(
        {
            name: `get_service`,
            key: "servis, service,, terminal",
            description: `Selalu gunakan tools ini untuk segala hal yang berhubungan dengan service, Mendapatkan detail service`,
            properties: properties_get_service,
            handler: async ({terminal_code, terminal_name, service_code, service_name, limit}) => {
                return await tool.get_service(terminal_code, terminal_name, service_code, service_name, limit)
            }
        }
    ),
    getTools(
        {
            name: `get_vessel`,
            key: "kapal, vessel",
            description: `Selalu gunakan tools ini untuk segala hal yang berhubungan dengan kapal, Mendapatkan detail vessel, kapal, limit booking, sisa booking, total booking. Dan wajib menggunakan terminal_code bukan terminal_name atau voyage`,
            properties: properties_get_vessel,
            handler: async ({terminal_code, terminal_name, voyage, vessel_name, limit}) => {
                return await tool.get_vessel(terminal_code, terminal_name, voyage, vessel_name, limit)
            }
        }
    ),
]


let cachedToolEmbed = null;

const getToolEmbed = async (keyTool) => {
    const toolEmbeds = [];
    for (const intool of keyTool) {
        const embedTool =  await ollamaEmbed(intool.key);
        
        toolEmbeds.push ({tool: intool.tool.function.name, embed: embedTool})
    }
    return toolEmbeds
}


const getOrInitToolEmbed = async () => {
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


const getTool = (embedMessage, embedTool, threshold = 0) => {
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