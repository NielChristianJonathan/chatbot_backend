const repositories = require("../../config/database.js");

const get_container_detail_Pg = async (id_req, container_no, vessel_name, request_type, limit) => {
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

module.exports = {get_container_detail_Pg}