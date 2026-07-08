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
                description: `Selalu gunakan tools ini untuk Mendapatkan detail container, request detail, tipe request, ekspor, impor, `,
                parameters: {
                    type: "object",
                    properties: {
                        // Postgress
                        // id_req: {type: "string", description: "merupakan id request 15 karakter dengan 3 huruf disambung dengan 12 angka acak, contoh: DEL267000133062"},
                        // container_no: {type:"string", description: "nomor kontainer, contoh: HPCU2228633"},
                        // vessel_name: {type: "string", description: "nama vessel atau kapal, contoh: MERATUS SAMPIT"},
                        // request_type: {type: "string", description: "nama tipe, contoh ekspor/impor ubah ekspor menjadi E, dan impor menjadi I"},
                        // limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
                        
                        // Oracle 
                        request_id: {type: "string", description: "merupakan id request 15 karakter dengan 3 huruf disambung dengan 12 angka acak, contoh: DEL267000133062"},
                        terminal_code: {type: "string", description: "merupakan kode terminal, ambil ketika user bilang terminal code atau kode terminal, contoh: T009, TP1Z3"},
                        terminal_name: {type: "string", description: "merupakan nama terminal, contoh: Tanjung Priok 1"},
                        container_number: {type: "string", description: "merupakan nomor kontainer 11 karakter dengan 4 huruf disambung dengan 7 angka acak, contoh: TAKU6091615"},
                        point: {type: "string", description: "merupakan point, contoh: 20260708C711077"},
                        vessel_name: {type: "string", description: "merupakan nama kapal, contoh: TANTO SAUDARA"},
                        voyage: {type: "string", description: "Kode voyage dengan format XXXX-NNNN, yaitu 4 huruf diikuti tanda '-' dan 4 angka. Contoh: TNSD-0001."},
                        e_i:  {type: "string", description: "Kode e_i dengan nilai: E,I, H, TI, TH, T"},
                        container_size: {type: "string", description: "ukuran container dengan nilai 40, 45, 20"}, 
                        container_type: {type: "string", description: "tipe container dengan nilai UC, OT, HQ, DRY, RFR, FLT, TNK"}, 
                        container_status: {type: "string", description: "status container dengan nilai Empty atau Full"}, 
                        iso_code: {type: "string", description: "status container dengan nilai Empty atau Full"},
                        limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
                    },
                    required: []
                },
            },
            // Postgress
            // handler: async ({id_req, container_no, vessel_name, request_type, limit}) => {

            //     return await tool.get_container_detail(id_req, container_no, vessel_name, request_type, limit)
            // }

            // Oracle
            handler: async ({request_id, terminal_code, terminal_name, container_number, point, vessel_name, voyage, e_i, container_size, container_type, container_status, iso_code, limit}) => {
                console.log("Masuk container Detail")
                console.log(tool)
                return await tool.get_container_detail(request_id, terminal_code, terminal_name, container_number, point, vessel_name, voyage, e_i, container_size, container_type, container_status, iso_code, limit)
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
                        // Postgres
                        // name: {type: "string", description: "Nama customer, contoh: ZIVO HANIA PERKASA"},
                        // customer_code: {type: "string", description: "Nama customer, contoh: ZIVO HANIA PERKASA"},
                        // limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}

                        // Oracle
                        terminal_code: { type: "string", description: "Kode terminal. Contoh: TPM, PTL"},
                        terminal_name: { type: "string", description: "Nama terminal. Contoh: Terminal Petikemas Makasar, Terminal Petikemas Pantoloan"},
                        customer_id: { type: "string", description: "ID pelanggan. Contoh: 56680"},
                        customer_code: { type: "string", description: "Kode pelanggan. Contoh: 2X167948"},
                        customer_name: { type: "string", description: "Nama pelanggan atau perusahaan. Contoh: MITRA TIRTA LOKALESTARI"},
                        npwp: { type: "string", description: "Nomor Pokok Wajib Pajak (NPWP) pelanggan. Contoh: 01.447.238.5-331.000"},
                        limit: { type: "number", description: "Jumlah maksimum data yang dikembalikan. Default 1 jika tidak diisi atau bernilai kurang dari atau sama dengan 0." }
                    },
                    required: []
                }, 
            },
            // Postgres
            // handler: async ({name, customer_code, limit}) => {
            //     return await tool.get_customer_info(name, customer_code, limit)
            // }

            // Oracle
            handler: async ({terminal_code, terminal_name, customer_id, customer_code, customer_name, npwp, limit}) => {
                return await tool.get_customer_info(terminal_code, terminal_name, customer_id, customer_code, customer_name, npwp, limit)
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
                        // Postgress
                        // customer_name: {type: "string", description: "Nama customer"}

                        // Oracle
                        terminal_code: {type: "string", description: "merupakan kode terminal, ambil ketika user bilang terminal code atau kode terminal, contoh: T009, TP1Z3"},
                        terminal_name: {type: "string", description: "merupakan nama terminal, contoh: Tanjung Priok 1"},
                        request_id: {type: "string", description: "merupakan id request 15 karakter dengan 3 huruf disambung dengan 12 angka acak, contoh: DEL267000133062"},
                        service_code: { type: "string", description: "Kode layanan (Service Code). Contoh: REC, DEL"},
                        service_name: { type: "string", description: "Nama layanan (Service Name). Contoh: RECEIVING, DELIVERY"},
                        customer_code: { type: "string", description: "Kode pelanggan (Customer Code). Contoh: 5400591"},
                        customer_name: { type: "string", description: "Nama pelanggan atau perusahaan."},
                        npwp: { type: "string", description: "Nomor Pokok Wajib Pajak (NPWP) pelanggan. Contoh: 03.218.406.1-701.000"},
                        voyage: { type: "string", description: "Kode voyage kapal dengan format XXXX-NNNN (4 huruf, tanda '-', lalu 4 angka). Contoh: TNSD-0001."},
                        vessel_name: { type: "string", description: "Nama kapal (Vessel Name). Contoh: MERATUS BORNEO"},
                        status: { type: "string", description: "Status permintaan atau transaksi. nilai: P atau S"},
                        payment_code: { type: "string", description: "Kode pembayaran (Payment Code). Contoh: 12509700003667"},
                        trade_type: { type: "string", description: "Jenis perdagangan (Trade Type). Contoh: I, O" },
                        limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
                    },
                    required: []
                }, 
            },
            // Postgress
            // handler: async ({customer_name}) => {
            //     return await tool.get_pranota(customer_name)
            // }

            // Oracle
            handler: async ({terminal_code, terminal_name, request_id, service_code, service_name, customer_code, customer_name, npwp, voyage, vessel_name, status, payment_code, trade_type, limit}) => {
                return await tool.get_pranota(terminal_code, terminal_name, request_id, service_code, service_name, customer_code, customer_name, npwp, voyage, vessel_name, status, payment_code, trade_type, limit)
            }
        }
    },
    // Tools Untuk Service
    {
        key: "servis, service",
        tool: {
            type: "function",
            function: {
                name: `get_service`,
                description: `Mendapatkan detail service`,
                parameters: {
                    type: "object",
                    properties: {
                        // Oracle
                        terminal_code: {type: "string", description: "merupakan kode terminal, ambil ketika user bilang terminal code atau kode terminal, contoh: T009, TP1Z3"},
                        terminal_name: {type: "string", description: "merupakan nama terminal, contoh: Tanjung Priok 1"},
                        service_code: {type: "string", description: "Kode layanan (Service Code). Contoh: SAR, RTC"},
                        service_name: {type: "string", description: "Nama layanan (Service Name). Contoh: STACKING EX STRIPPING, RELOCATION LINI 1 LINI 2 STUFFING - COC"},
                        limit: {type: "number", description: "Jumlah maksimum data yang dikembalikan. Default 1 jika tidak diisi atau bernilai kurang dari atau sama dengan 0." }
                    },
                    required: []
                }, 
            },
            // Oracle
            handler: async ({terminal_code, terminal_name, service_code, service_name, limit}) => {
                return await tool.get_service(terminal_code, terminal_name, service_code, service_name, limit)
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