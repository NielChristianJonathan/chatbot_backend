const { poolPg } = require("../../config/supabase")
const { ollamaEmbed } = require("../../services/chatbot.service")
const { cosineSimilarity } = require("../../services/role.service")

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
                console.log(`id_req: ${id_req}`)
                console.log(`container_no: ${container_no}`)
                console.log(`vessel_name: ${vessel_name}`)
                console.log(`request_type: ${request_type}`)
                const limitValue = parseInt(limit) || 1;
                console.log(`limitvalue: ${limitValue}`)
                const basic = await poolPg.query(`
                    SELECT
                        COUNT(*) AS total_container, COUNT(*) FILTER (WHERE ei = 'E') AS total_ekspor, COUNT(*) FILTER (WHERE ei = 'I') AS total_impor,(SELECT STRING_AGG(container_no, ', ') FROM (SELECT container_no FROM request_detail ORDER BY RANDOM() LIMIT $1 ) c ) AS contoh_container
                    FROM request_detail;
                    `, [limitValue]
                );
                console.log("Basic:")
                console.log(basic.rows)
                if (id_req) {
                    const result = await poolPg.query(`
                        select 
                            rh.id_req, rd.ei as jenis_bongkaran, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type,rd.disch_load , rd.container_no,  rd.carrier_code, rd.start_date, rd.end_date, rd.container_disch_date, rd.container_delivery_date, rd.container_pol
                        from request_header rh 
                        left join request_detail rd on rd.id_req  = rh.id_req
                        where rh.id_req = $1
                        limit $2;
                        `, [id_req, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else if (container_no){
                    const result = await poolPg.query(`
                        select 
                            rh.id_req, rd.ei as jenis_bongkaran, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type,rd.disch_load , rd.container_no,  rd.carrier_code, rd.start_date, rd.end_date, rd.container_disch_date, rd.container_delivery_date, rd.container_pol
                        from request_header rh 
                        left join request_detail rd on rd.id_req  = rh.id_req
                        where rd.container_no = $1
                        limit $2;
                        `, [container_no, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else if (vessel_name) {
                    const result = await poolPg.query(`
                        select 
                            rh.id_req, rd.ei as jenis_bongkaran, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as tujuan,rh.fpod as tujuan,rh.pol,rh.trade_type,rd.disch_load , rd.container_no,  rd.carrier_code, rd.start_date, rd.end_date, rd.container_disch_date, rd.container_delivery_date, rd.container_pol
                        from request_header rh 
                        left join request_detail rd on rd.id_req  = rh.id_req
                        where rh.vessel_name = $1
                        limit $2;
                        `, [vessel_name, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else if (request_type) {
                    const result = await poolPg.query(`
                        select 
                            rh.id_req, rd.ei as jenis_bongkaran, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type,rd.disch_load , rd.container_no,  rd.carrier_code, rd.start_date, rd.end_date, rd.container_disch_date, rd.container_delivery_date, rd.container_pol
                        from request_header rh 
                        left join request_detail rd on rd.id_req = rh.id_req
                        where rd.ei = $1
                        limit $2;
                        `, [request_type, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else {
                    return {summary: basic.rows}
                } 
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
                console.log(`id_req: ${id_req}`)
                console.log(`terminal_name: ${terminal_name}`)
                if (id_req) {
                    const result = await poolPg.query(`
                        select
                            mt.terminal_name, rh.id_req, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type
                        from mst_terminal mt 
                        join request_header rh  on mt.terminal_id = rh.terminal_id 
                        and mt.org_id = rh.org_id
                        where rh.id_req = $1
                        limit 10
                        `, [id_req]
                    );
                    return result.rows
                } else if (terminal_name){
                    const result = await poolPg.query(`
                        select
                            mt.terminal_name, rh.id_req, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type
                        from mst_terminal mt 
                        join request_header rh  on mt.terminal_id = rh.terminal_id 
                        and mt.org_id = rh.org_id
                        where mt.terminal_name = $1
                        limit 10
                        `, [terminal_name]
                    );
                    return result.rows
                } else {
                    const result = await poolPg.query(`
                        select
                            mt.terminal_name, rh.id_req, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type
                        from mst_terminal mt 
                        join request_header rh  on mt.terminal_id = rh.terminal_id 
                        and mt.org_id = rh.org_id
                        limit 5
                        `
                    );
                    return result.rows
                }
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
                console.log(`nama: ${name}`)
                console.log(`customer_code: ${customer_code}`)
                const limitValue = parseInt(limit) || 1;
                console.log(`limitvalue: ${limitValue}`)
                const basic = await poolPg.query(`
                    SELECT 
                        (select count(1) as total_customer_master from mst_customer) as total_customer_keseluruhan, COUNT(DISTINCT mc."CUSTOMER_CODE") AS jumlah_customer_pada_request, count(*) as jumlah_pesanan, (SELECT STRING_AGG(format('%s (%s)', name_val, code_val), ', ') FROM (SELECT name_val, code_val FROM (SELECT DISTINCT mc2."NAME" AS name_val, mc2."CUSTOMER_CODE" AS code_val FROM request_header rh2 JOIN mst_customer mc2 ON rh2.customer_code = mc2."CUSTOMER_CODE") distinct_pairs ORDER BY RANDOM() LIMIT $1) c) AS contoh_nama_code_customer 
                    FROM request_header rh 
                    LEFT JOIN mst_customer mc 
                    ON rh.customer_code = mc."CUSTOMER_CODE";
                    `
                    , [limitValue])


                if (name) {
                    const result = await poolPg.query(`
                        select 
                            mc."NAME" , mc."CUSTOMER_CODE", rh.id_req, rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type
                        from request_header rh 
                        join mst_customer mc on
                            rh.customer_code = mc."CUSTOMER_CODE"
                        where mc."NAME" = $1
                        limit $2;
                        `, [name, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else if (customer_code){
                    const result = await poolPg.query(`
                        select 
                            mc."NAME" , mc."CUSTOMER_CODE", rh.id_req,  rh.request_date, rh.terminal_id,rh.vessel_id, rh.vessel_name, rh.vessel_name, rh.etd, rh.eta, rh.payment_status,rh.pod as asal_kota,rh.fpod as tujuan,rh.pol,rh.trade_type
                        from request_header rh 
                        join mst_customer mc on
                            rh.customer_code = mc."CUSTOMER_CODE"
                        where rh.customer_code = $1
                        limit $2;
                        `, [customer_code, limitValue]
                    );
                    return {summary: basic.rows,data: result.rows}
                } else {
                    return {summary: basic.rows}
                }
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
                if (customer_name) {
                    const result = await poolPg.query(`
                        select 
                            ph."BILLER_REQ_ID" as request_id, ph."TRX_NUMBER", pd."DESCRIPTION" , pd."COMPONENT_NAME" , pd."CONTAINER_TYPE" , pd."CONTAINER_STATUS", pd."BASIC_TARIF" , ph."TERMINAL_CODE", ph."SERVICE_GROUP_NAME", ph."CUSTOMER_NAME", ph."VESSEL_NAME", ph."VESSEL_VOYAGE", ph."TRADE_TYPE"  
                        from pranota_header ph 
                        join pranota_detail pd on
                            ph."BILLER_REQ_ID" = pd."BILLER_REQ_ID" 
                        where ph."CUSTOMER_NAME" = $1  ;
                        `, [customer_name]
                    );
                    return result.rows
                } else {
                    const result = await poolPg.query(`
                        select 
                            ph."BILLER_REQ_ID" as request_id, ph."TRX_NUMBER", pd."DESCRIPTION" , pd."COMPONENT_NAME" , pd."CONTAINER_TYPE" , pd."CONTAINER_STATUS", pd."BASIC_TARIF" , ph."TERMINAL_CODE", ph."SERVICE_GROUP_NAME", ph."CUSTOMER_NAME", ph."VESSEL_NAME", ph."VESSEL_VOYAGE", ph."TRADE_TYPE"  
                        from pranota_header ph 
                        join pranota_detail pd on
                            ph."BILLER_REQ_ID" = pd."BILLER_REQ_ID" 
                        ;
                        `
                    );
                    return result.rows
                }
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