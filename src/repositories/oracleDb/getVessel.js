const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");

const properties_get_vessel = 
    {
        terminal_code: {type: "string", description: "merupakan kode terminal, ambil ketika user bilang terminal code atau kode terminal, contoh: T009, TP1Z3"},
        terminal_name: {type: "string", description: "merupakan nama terminal, contoh: Tanjung Priok 1"},
        voyage: {type: "string", description: "Kode voyage dengan format XXXX-NNNN, yaitu 4 huruf diikuti tanda '-' dan 4 angka. Contoh: TNSD-0001."},
        vessel_name: {type: "string", description: "merupakan nama kapal, contoh: TANTO SAUDARA"},
        limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
    }




const get_vessel_Oracle = async (terminal_code, terminal_name, voyage, vessel_name, limit) => {
    try {
        console.log(`===========================================================`)
        console.log(`Container Vessel`)
        console.log(`===========================================================`)
        console.log(`terminal_code: ${terminal_code}`)
        console.log(`terminal_name: ${terminal_name}`)
        console.log(`vessel_name: ${vessel_name}`)
        console.log(`voyage: ${voyage}`)
        console.log(`limit: ${limit}`)
        const normalize_string = (value="") => value ? `${value}`.trim() : '';
        const normalizeNumber = (value) => {
            if (value === undefined || value === null || value === "") {
                return null;
            }
            
            const number = Number(value);
            return Number.isNaN(number) ? null : number;
        };
        
        const [result] = await sequelize.query(`
            WITH 
                R_BILLING AS (
                    SELECT 
                        RH.VOYAGE 
                        , MT.TERMINAL_CODE 
                        , SUM(CASE 
                            WHEN RD.CONTAINER_SIZE IN (20,21) THEN 1 
                            WHEN RD.CONTAINER_SIZE IN (40,45) THEN 2 
                            ELSE 0 
                        END) COUNT_CONTAINER
                    FROM STG_REQUEST_HEADER RH 
                    JOIN STG_REQUEST_DETAIL RD ON RH.ID_REQ = RD.ID_REQ 
                    JOIN STG_MST_TERMINAL MT ON RH.TERMINAL_ID = MT.TERMINAL_ID AND RH.ORG_ID = MT.ORG_ID 
                    WHERE 1 = 1 AND RD.DISABLED = 'Y' AND RH.STATUS NOT IN ('PAID','CANCEL') AND RH.SERVICE_CODE IN ('REC','LCA','LCC','LCB','REX')
                    GROUP BY
                        RH.VOYAGE 
                        , MT.TERMINAL_CODE 
                    ORDER BY MT.TERMINAL_CODE DESC
                )
            SELECT 
                VSB.TML_CD AS TERMINAL_CODE
                , MT.TERMINAL_NAME 
                , MT.PORT_CODE AS TERMINAL_PORT_CODE
                , MT.STATUS AS TERMINAL_STATUS
                , VSB.VESSEL AS VESSEL_NAME
                , VSB.VOYAGE AS VOYAGE 
                , VSB.VESSEL_CODE AS VESSEL_ID
                , VSB.OPERATOR_ID AS OPERATOR_CODE
                , VSB.OPERATOR_NAME 
                , CASE
                    WHEN VSB.SERVICE_TYPE IN ('DOMESTIC') THEN 'DOMESTIK'
                    WHEN VSB.SERVICE_TYPE IN ('OVERSEA') THEN 'INTERNASIONAL'
                    ELSE VSB.SERVICE_TYPE
                END TRADE_TYPE
                , TO_CHAR(VSB.ETA, 'YYYY-MM-DD HH24:MI:SS') AS ETA
                , TO_CHAR(VSB.ETB, 'YYYY-MM-DD HH24:MI:SS') AS ETB
                , TO_CHAR(VSB.ETB, 'YYYY-MM-DD HH24:MI:SS') AS ETD
                , TO_CHAR(VSB.ETA, 'YYYY-MM-DD HH24:MI:SS') AS ATA
                , TO_CHAR(VSB.ETB, 'YYYY-MM-DD HH24:MI:SS') AS ATB
                , TO_CHAR(VSB.ETB, 'YYYY-MM-DD HH24:MI:SS') AS ATD
                , TO_CHAR(VSB.EARLY_STACK, 'YYYY-MM-DD HH24:MI:SS') AS EARLY_STACK
                , TO_CHAR(VSB.OPEN_STACK, 'YYYY-MM-DD HH24:MI:SS') AS OPEN_STACK
                , TO_CHAR(VSB.CLOSSING_TIME, 'YYYY-MM-DD HH24:MI:SS') AS CLOSING_TIME
                , TO_CHAR(VSB.START_WORK , 'YYYY-MM-DD HH24:MI:SS') AS START_WORK
                , TO_CHAR(VSB.END_WORK , 'YYYY-MM-DD HH24:MI:SS') AS END_WORK
                , VSB.ID_POL AS POL
                , VSB.POL AS POL_NAME
                , VSB.ID_POD AS POD
                , VSB.POD AS POD_NAME
                , VSB.LAST_PORT AS POR
                , VSB.LAST_PORT_NM AS POR_NAME
                , TO_NUMBER(NVL(VSB.CONTAINER_LIMIT, 0)) AS CONTAINER_LIMIT
                , (TO_NUMBER(NVL(RB.COUNT_CONTAINER, 0)) + TO_NUMBER(NVL(VSB.BOOKED,0))) AS TOTAL_BOOKING
                , TO_NUMBER(NVL(VSB.CONTAINER_LIMIT, 0)) - (TO_NUMBER(NVL(RB.COUNT_CONTAINER, 0)) + TO_NUMBER(NVL(VSB.BOOKED,0))) AS BOOING_LEFT
            FROM V_M_VSB_VOYAGE VSB
            JOIN STG_MST_TERMINAL MT ON VSB.TML_CD = MT.TERMINAL_CODE 
            LEFT JOIN R_BILLING RB ON RB.TERMINAL_CODE = VSB.TML_CD AND RB.VOYAGE = VSB.VOYAGE
            WHERE 1 = 1
                AND (:TERMINAL_CODE IS NULL OR UPPER(VSB.TML_CD) LIKE '%' || UPPER(:TERMINAL_CODE) || '%')
                AND (:TERMINAL_NAME IS NULL OR UPPER(MT.TERMINAL_NAME) LIKE '%' || UPPER(:TERMINAL_NAME) || '%')
                AND (:VOYAGE IS NULL OR UPPER(VSB.VOYAGE) LIKE '%' || UPPER(:VOYAGE) || '%')
                AND (:VESSEL_NAME IS NULL OR UPPER(VSB.VESSEL) LIKE '%' || UPPER(:VESSEL_NAME) || '%')
                AND (:LIMIT IS NULL OR ROWNUM <= :LIMIT)
            `,
            {
                bind: {
                    TERMINAL_CODE: normalize_string(terminal_code), // TP1Z3
                    TERMINAL_NAME: normalize_string(terminal_name), // Tanjung Priok 1 Zona 3
                    VOYAGE: normalize_string(voyage), // TNSD-0001
                    VESSEL_NAME: normalize_string(vessel_name), //TANTO SAUDARA
                    LIMIT: normalizeNumber(limit)
                }
            }
        )
        console.log("Masuk detail Oracle")
        console.log(result)
        return result
    } catch(err) {
        throw new AppError(err, 500)
    }
}


module.exports = {get_vessel_Oracle, properties_get_vessel}