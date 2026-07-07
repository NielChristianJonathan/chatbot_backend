const repositories = require("../../config/database.js");
const get_terminal_Pg = async (id_req, terminal_name) => {
    const poolPg = repositories.getDb();
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

module.exports = {get_terminal_Pg}