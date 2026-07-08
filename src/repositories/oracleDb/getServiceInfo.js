const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");

const get_service_Oracle = async (terminal_code, terminal_name, service_code, service_name, limit) => {
    try {
        const normalize_string = (value="") => value ? `${value}`.trim() : '';
        const normalizeNumber = (value) => {
            if (value === undefined || value === null || value === "") {
                return null;
            }
            const number = Number(value);
            return Number.isNaN(number) ? null : number;
        };
        const [result] = await sequelize.query(`
            SELECT 
                MS.*
                , CURSOR (
                    SELECT 
                        SC.SERVICE_CODE
                        , SC.SERVICE_NAME
                        , SC.COMPONENT_CODE
                        , SC.COMPONENT_NAME
                    FROM SERVICE_COMPONENT@SGBILLINGDEV.QA SC
                    WHERE 1 = 1 AND SC.SERVICE_CODE = MS.SERVICE_CODE AND SC.TERMINAL_CODE = MS.TERMINAL_CODE
                ) AS COMPONENT_LIST
            FROM (
            SELECT 
                MT.TERMINAL_CODE
                , MT.TERMINAL_NAME
                , MS.SERVICE_CODE
                , MS.SERVICE_NAME
            FROM MST_SERVICE@SGBILLINGDEV.QA MS
            JOIN MST_TERMINAL@SGBILLINGDEV.QA MT ON MS.TERMINAL_CODE = MT.TERMINAL_CODE
            WHERE 1 = 1 AND MS.STATUS = 'Active'
                AND (:TERMINAL_CODE IS NULL OR UPPER(MT.TERMINAL_CODE) LIKE '%' || UPPER(:TERMINAL_CODE) || '%')
                AND (:TERMINAL_NAME IS NULL OR UPPER(MT.TERMINAL_NAME) LIKE '%' || UPPER(:TERMINAL_NAME) || '%')
                AND (:SERVICE_CODE IS NULL OR UPPER(MS.SERVICE_CODE) LIKE '%' || UPPER(:SERVICE_CODE) || '%')
                AND (:SERVICE_NAME IS NULL OR UPPER(MS.SERVICE_NAME) LIKE '%' || UPPER(:SERVICE_NAME) || '%')
                FETCH FIRST :LIMIT ROWS ONLY
            ) MS
            `,
            {
                bind: {
                    TERMINAL_CODE: normalize_string(terminal_code),
                    TERMINAL_NAME: normalize_string(terminal_name),
                    SERVICE_CODE: normalize_string(service_code),
                    SERVICE_NAME: normalize_string(service_name),
                    LIMIT: normalizeNumber(limit) ?? 1,
                }
            }
        )
        console.log(result)
        return result
    } catch(err) {
        throw new AppError(err, 500)
    }
}

module.exports = {get_service_Oracle}