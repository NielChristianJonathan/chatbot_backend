const repositories = require("../../config/database.js");

const get_customer_info_Pg = async (name, customer_code, limit) => {
    const poolPg = repositories.getDb();
    console.log(`Masuk sinii`)
    console.log(repositories.getDb)
    console.log(`PoolPg: ${poolPg}`)
    const limitValue = parseInt(limit) || 1;
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


module.exports = {get_customer_info_Pg}