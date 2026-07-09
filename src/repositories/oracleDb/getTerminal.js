const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");

const properties_get_terminal = 
    {
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
    }

const get_terminal_Oracle = async (request_id, terminal_code, terminal_name, container_number, point, vessel_name, voyage, e_i, container_size, container_type, container_status, iso_code, limit) => {
    try {
        console.log(`===========================================================`)
        console.log(`Terminal Container Tools`)
        console.log(`===========================================================`)
        console.log(`request_id: ${request_id}`)
        console.log(`terminal_code: ${terminal_code}`)
        console.log(`terminal_name: ${terminal_name}`)
        console.log(`container_number: ${container_number}`)
        console.log(`point: ${point}`)
        console.log(`vessel_name: ${vessel_name}`)
        console.log(`voyage: ${voyage}`)
        console.log(`e_i: ${e_i}`)
        console.log(`container_size: ${container_size}`)
        console.log(`container_status: ${container_status}`)
        console.log(`iso_code: ${iso_code}`)
        console.log(`limit: ${normalizeNumber(limit)}`)
        const normalize_string = (value="") => value ? `${value}`.trim() : '';
        const normalizeNumber = (value) => {
            if (value === undefined || value === null || value === "") {
                return 1;
            }
            
            const number = Number(value);
            
            if (Number.isNaN(number)) {
                return 1;
            }

            return number <= 0 ? 1 : number;
        };
        
        const [result] = await sequelize.query(`
            SELECT 
                CA.TML_CD AS TERMINAL_CODE
                , MT.TERMINAL_NAME 
                , MT.PORT_CODE AS TERMINAL_PORT_CODE
                , MT.STATUS AS TERMINAL_STATUS
                , CA.POINT 
                , CA.NO_CONTAINER AS CONTAINER_NUMBER
                , CA.E_I
                , CASE
                    WHEN MST.CLSS_CD IN ('IM') THEN 'I'
                    WHEN MST.CLSS_CD IN ('EX') THEN 'E'
                    ELSE 'UNKNOWN'
                END EI_FORBILL
                , CA.SIZE_CONT AS CONTAINER_SIZE
                , CA.TYPE_CONT AS CONTAINER_TYPE
                , CA.STATUS  AS CONTAINER_STATUS
                , CA.HEIGHT  AS CONTAINER_HEIGHT
                , CA.ISO_CODE
                , CA.TEMPERATURE 
                , TO_CHAR(TO_DATE(CA.PLUG_IN, 'DD-MM-YYYY HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS PLUGIN_DATE
                , TO_CHAR(TO_DATE(CA.PLUG_OUT, 'DD-MM-YYYY HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS PLUGOUT_DATE
                , CA.SLING
                , CA.OPERATOR AS OPERATOR_CODE
                , CA.OPERATOR_NAME 
                , CA.CONTAINER_OWNERSHIP
                , CA.HZ 
                , CA.IMO
                , CA.UN_NUMBER 
                , CA.GROSS_WEIGHT
                , CA.NET_WEIGHT 
                , CA.VGM_WEIGHT 
                , CA.SEAL_ID 
                , CA.COMODITY
                , CA.POD 
                , CA.POL
                , CA.FPOD
                , CA.POR
                , CA.VESSEL_CODE AS VESSEL_ID
                , CA.VESSEL AS VESSEL_NAME
                , CA.VOYAGE
                , CA.CALL_SIGN 
                , CA.BILLING_FLAG 
                , CA.BILLING_REQUEST_ID AS REQUEST_ID
                , CA.BILLING_PAIDTHRU AS PAIDTHRU
                , CA.CONT_LOCATION AS ACTIVITY
                , CA.LAST_POSITION AS POSITION_CONTAINER
                , CA.CRNT_POW_CD AS POW_CODE
            FROM V_CONTAINER_ACTIVITY  CA
            JOIN STG_POI_UT_MST MST ON CA.TML_CD = MST.TML_CD AND CA.POINT = MST.TML_UT_ID 
            JOIN STG_MST_TERMINAL MT ON CA.TML_CD = MT.TERMINAL_CODE 
            WHERE 1 = 1
                AND (:REQUEST_ID IS NULL OR UPPER(CA.BILLING_REQUEST_ID) LIKE '%' || UPPER(:REQUEST_ID) || '%')
                AND (:TERMINAL_CODE IS NULL OR UPPER(CA.TML_CD) LIKE '%' || UPPER(:TERMINAL_CODE) || '%')
                AND (:TERMINAL_NAME IS NULL OR UPPER(MT.TERMINAL_NAME) LIKE '%' || UPPER(:TERMINAL_NAME) || '%')
                AND (:CONTAINER_NUMBER IS NULL OR UPPER(CA.NO_CONTAINER) LIKE '%' || UPPER(:CONTAINER_NUMBER) || '%')
                AND (:POINT IS NULL OR UPPER(CA.POINT) LIKE '%' || UPPER(:POINT) || '%')
                AND (:VESSEL_NAME IS NULL OR UPPER(CA.VESSEL) LIKE '%' || UPPER(:VESSEL_NAME) || '%')
                AND (:VOYAGE IS NULL OR UPPER(CA.VOYAGE) LIKE '%' || UPPER(:VOYAGE) || '%')
                AND (:E_I IS NULL OR UPPER(CA.E_I) LIKE '%' || UPPER(:E_I) || '%')
                AND (:CONTAINER_SIZE IS NULL OR UPPER(CA.SIZE_CONT) LIKE '%' || UPPER(:CONTAINER_SIZE) || '%')
                AND (:CONTAINER_TYPE IS NULL OR UPPER(CA.TYPE_CONT) LIKE '%' || UPPER(:CONTAINER_TYPE) || '%')
                AND (:CONTAINER_STATUS IS NULL OR UPPER(CA.STATUS) LIKE '%' || UPPER(:CONTAINER_STATUS) || '%')
                AND (:ISO_CODE IS NULL OR UPPER(CA.ISO_CODE) LIKE '%' || UPPER(:ISO_CODE) || '%')
                AND (:LIMIT IS NULL OR ROWNUM <= :LIMIT)
            `,
            {
                bind: {
                    REQUEST_ID: normalize_string(request_id), // DEL260000008242
                    TERMINAL_CODE: normalize_string(terminal_code), // TP1Z3
                    TERMINAL_NAME: normalize_string(terminal_name), // Tanjung Priok 1 Zona 3
                    CONTAINER_NUMBER: normalize_string(container_number), //TAKU6091615
                    POINT: normalize_string(point), // 20260708C711077
                    VESSEL_NAME: normalize_string(vessel_name), //TANTO SAUDARA
                    VOYAGE: normalize_string(voyage), // TNSD-0001
                    E_I: normalize_string(e_i), //
                    CONTAINER_SIZE: normalize_string(container_size), // 40, 45, 20
                    CONTAINER_TYPE: normalize_string(container_type), // UC, OT, HQ, DRY, RFR, FLT, TNK
                    CONTAINER_STATUS: normalize_string(container_status), // Empty Full
                    ISO_CODE: normalize_string(iso_code), // 42P1, 4401
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


module.exports = {get_terminal_Oracle, properties_get_terminal}