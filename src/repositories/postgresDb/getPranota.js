const get_pranota_Pg = async (customer_name) => {
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
module.exports = {get_pranota_Pg}