const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");


const properties_get_service = {
    terminal_code: {type: "string", description: "merupakan kode terminal, ambil ketika user bilang terminal code atau kode terminal, contoh: T009, TP1Z3"},
    terminal_name: {type: "string", description: "merupakan nama terminal, contoh: Tanjung Priok 1"},
    service_code: {type: "string", description: "Kode layanan (Service Code). Contoh: SAR, RTC"},
    service_name: {type: "string", description: "Nama layanan (Service Name). Contoh: STACKING EX STRIPPING, RELOCATION LINI 1 LINI 2 STUFFING - COC"},
    limit: {type: "number", description: "Jumlah maksimum data yang dikembalikan. Default 1 jika tidak diisi atau bernilai kurang dari atau sama dengan 0." }
}

const get_service_Oracle = async (terminal_code, terminal_name, service_code, service_name, limit) => {
    try {
        console.log(`===========================================================`)
        console.log(`Service Tools`)
        console.log(`===========================================================`)
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
                AND (:LIMIT IS NULL OR ROWNUM <= :LIMIT)
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

module.exports = {get_service_Oracle, properties_get_service}