const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");


properties_get_customer_info = {
    terminal_code: { type: "string", description: "Kode terminal. Contoh: TPM, PTL"},
    terminal_name: { type: "string", description: "Nama terminal. Contoh: Terminal Petikemas Makasar, Terminal Petikemas Pantoloan"},
    customer_id: { type: "string", description: "ID pelanggan. Contoh: 56680"},
    customer_code: { type: "string", description: "Kode pelanggan. Contoh: 2X167948"},
    customer_name: { type: "string", description: "Nama pelanggan atau perusahaan. Contoh: MITRA TIRTA LOKALESTARI"},
    npwp: { type: "string", description: "Nomor Pokok Wajib Pajak (NPWP) pelanggan. Contoh: 01.447.238.5-331.000"},
    limit: { type: "number", description: "Jumlah maksimum data yang dikembalikan. Default 1 jika tidak diisi atau bernilai kurang dari atau sama dengan 0." }
}

const get_customer_info_Oracle = async (terminal_code, terminal_name, customer_id, customer_code, customer_name, npwp, limit) => {
    try {
        console.log(`===========================================================`)
        console.log(`Customer Tools`)
        console.log(`===========================================================`)
        console.log(`terminal_code: ${terminal_code}`)
        console.log(`terminal_name: ${terminal_name}`)
        console.log(`customer_id: ${customer_id}`)
        console.log(`customer_name: ${customer_name}`)
        console.log(`npwp: ${npwp}`)
        console.log(`limit: ${limit}`)

        const normalize_string = (value="") => value ? `${value}`.trim() : '';
        const normalizeNumber = (value) => {
            if (value === undefined || value === null || value === "") {
                return null;
            }

            const number = Number(value);
            return Number.isNaN(number) ? null : number;
        };
        console.log("==============================")
        console.log(terminal_name   )
        console.log("==============================")
        const [result] = await sequelize.query(`
            SELECT 
                MC.*
                , CURSOR (
                    SELECT 
                        MCB.CUSTOMER_ID
                        , MCB.ACCOUNT_NO 
                        , MCB.BANK_ID
                        , MCB.CURRENCY
                        , MCB.AUTOCOLLECTION
                        , MCB.AUTOCOLLECTION_BM_BARANG
                    FROM MST_CUSTOMER_BANK_ACCOUNT @SGBILLINGDEV.QA MCB
                    WHERE MCB.CUSTOMER_ID = MC.CUSTOMER_ID AND MCB.BRANCH_ID = MC.BRANCH_ID
                ) AS BANK_DETAIL
                , CURSOR (
                    SELECT 
                        CO.CUSTOMER_ID
                        , CO.TERMINAL_CODE
                        , CO.OPERATOR_CODE
                        , MO.CDG_OPER_NAME AS OPERATOR_NAME
                        , CO.OPERATOR_MAIN
                    FROM CUSTOMER_OPERATOR@SGBILLINGDEV.QA CO
                    JOIN MST_OPERATOR@SGBILLINGDEV.QA MO ON CO.OPERATOR_CODE = MO.CDG_OPER_CODE
                    WHERE CO.CUSTOMER_ID = MC.CUSTOMER_ID AND CO.TERMINAL_CODE = MC.TERMINAL_CODE
                ) AS OPERATOR_LIST
            FROM (
                SELECT 
                    MT.TERMINAL_CODE
                    , MT.TERMINAL_NAME
                    , MT.BRANCH_ID
                    , MC.CUSTOMER_ID
                    , MC.CUSTOMER_CODE
                    , COALESCE(MC.NAME, MC.CUSTOMER_LABEL) AS CUSTOMER_NAME
                    , MC.ADDRESS AS CUSTOMER_ADDRESS
                    , MC.NPWP
                    , MC.EMAIL
                    , MC.PHONE
                    , MC.COMPANY_TYPE
                    , MC.CUSTOMER_GROUP
                    , MC.IS_SHIPPING_LINE
                    , MC.IS_EMKL
                    , MC.AUTOCOLLECTION_BM
                    , MC.SAP_BP_CODE
                FROM MST_CUSTOMER@SGBILLINGDEV.QA MC
                JOIN CUSTOMER_MAPPING@SGBILLINGDEV.QA CM ON MC.CUSTOMER_ID = CM.CUSTOMER_ID
                JOIN STG_MST_TERMINAL MT ON MT.BRANCH_ID = CM.BRANCH_ID
                WHERE 1 = 1 AND MC.STATUS_CUSTOMER = 'A' AND CM.STATUS_CUSTOMER = 'A' 
                    AND (:TERMINAL_CODE IS NULL OR UPPER(MT.TERMINAL_CODE) LIKE '%' || UPPER(:TERMINAL_CODE) || '%')
                    AND (:TERMINAL_NAME IS NULL OR UPPER(MT.TERMINAL_NAME) LIKE '%' || UPPER(:TERMINAL_NAME) || '%')
                    AND (:CUSTOMER_ID IS NULL OR UPPER(MC.CUSTOMER_ID) LIKE '%' || UPPER(:CUSTOMER_ID) || '%')
                    AND (:CUSTOMER_CODE IS NULL OR UPPER(MC.CUSTOMER_CODE) LIKE '%' || UPPER(:CUSTOMER_CODE) || '%')
                    AND (:CUSTOMER_NAME IS NULL OR UPPER(COALESCE(MC.NAME, MC.CUSTOMER_LABEL)) LIKE '%' || UPPER(:CUSTOMER_NAME) || '%')
                    AND (:NPWP IS NULL OR UPPER(MC.NPWP) LIKE '%' || UPPER(:NPWP) || '%')
                    AND (:LIMIT IS NULL OR ROWNUM <= :LIMIT)
            ) MC
            `,
            {
                bind: {
                    TERMINAL_CODE: normalize_string(terminal_code),
                    TERMINAL_NAME: normalize_string(terminal_name),
                    CUSTOMER_ID: normalize_string(customer_id),
                    CUSTOMER_CODE: normalize_string(customer_code),
                    CUSTOMER_NAME: normalize_string(customer_name),
                    NPWP: normalize_string(npwp),
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

module.exports = {get_customer_info_Oracle, properties_get_customer_info}