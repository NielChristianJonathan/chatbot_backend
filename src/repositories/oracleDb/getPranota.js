const { sequelize } = require("../../config/oracle.js");
const { AppError } = require("../../utils/appError.js");

const properties_get_pranota = {
    terminal_code: {type: "string", description: "merupakan kode terminal pelabuhan"},
    request_id: {type: "string", description: "merupakan id request 15 karakter dengan 3 huruf disambung dengan 12 angka acak, contoh: DEL267000133062"},
    service_code: { type: "string", description: "Kode layanan (Service Code). Contoh: REC, DEL"},
    service_name: { type: "string", description: "Nama layanan (Service Name). Contoh: RECEIVING, DELIVERY"},
    customer_code: { type: "string", description: "Kode pelanggan (Customer Code). Contoh: 5400591"},
    customer_name: { type: "string", description: "Nama pelanggan atau perusahaan."},
    npwp: { type: "string", description: "Nomor Pokok Wajib Pajak (NPWP) pelanggan. Contoh: 03.218.406.1-701.000"},
    voyage: { type: "string", description: "Kode voyage kapal dengan format XXXX-NNNN (4 huruf, tanda '-', lalu 4 angka). Contoh: TNSD-0001."},
    vessel_name: { type: "string", description: "Nama kapal (Vessel Name). Contoh: MERATUS BORNEO"},
    status: { type: "string", description: "Status permintaan atau transaksi. nilai: P atau S"},
    payment_code: { type: "string", description: "Kode pembayaran (Payment Code). Contoh: 12509700003667"},
    trade_type: { type: "string", description: "Jenis perdagangan (Trade Type). Contoh: I, O" },
    limit: {type: "string", description: "jumlah data yang diminta, contoh: 5"}
}

const get_pranota_Oracle = async (terminal_code, terminal_name, request_id, service_code, service_name, customer_code, customer_name, npwp, voyage, vessel_name, status, payment_code, trade_type, limit) => {
    try {
        console.log(`===========================================================`)
        console.log(`Pranota Tools`)
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
            RH.*
            FROM (
                SELECT 
                    PH.TERMINAL_CODE 
                    , MT.TERMINAL_NAME 
                    , MT.PORT_CODE AS TERMINAL_PORT_CODE
                    , MT.STATUS AS TERMINAL_STATUS
                    , PH.BILLER_REQ_ID AS REQUEST_ID
                    , COALESCE(PH.INVOICE_NUMBER, PH.TRX_NUMBER) AS INVOICE_NUMBER
                    , PH.SERVICE_GROUP_CODE
                    , PH.SERVICE_GROUP_NAME
                    , PH.SERVICE_CODE
                    , PH.SERVICE_NAME 
                    , PH.CURRENCY 
                    , PH.CUSTOMER_CODE
                    , PH.CUSTOMER_NAME 
                    , PH.CUSTOMER_ADDRESS
                    , PH.NPWP
                    , PH.VESSEL_ID 
                    , PH.VESSEL_NAME
                    , PH.VESSEL_VOYAGE AS VOYAGE
                    , PH.AMOUNT 
                    , PH.PAYMENT_STATUS 
                    , TO_CHAR(PH.PAYMENT_DATE, 'YYYY-MM-DD HH24:MI:SS') AS PAYMENT_DATE
                    , DECODE(PH.STATUS, 'P', 'PAID', 'NOT PAID') AS STATUS
                    , PH.PAYMENT_CODE
                    , PH.TRADE_TYPE
                    , PH.PAYMENT_COMPLETED AS FLAG_PAYMENT
                    , PH.FLAG_INV_ARINVOICE AS FLAG_SEND_INVOICE
                    , PH.AMOUNT_INVOICE AS AMOUNT_SEND_INVOICE
                    , PH.EINVOICE_DATE AS SEND_INVOICE_DATE
                    , PH.DISCOUNT 
                    , PH.BILER_PAYMENT 
                    , PH.NO_INTEGRATION_SAP
                FROM STG_PRANOTA_HEADER PH
                JOIN STG_MST_TERMINAL MT ON PH.TERMINAL_CODE = MT.TERMINAL_CODE 
                WHERE 1 = 1
                    AND (:TERMINAL_CODE IS NULL OR UPPER(MT.TERMINAL_CODE) LIKE '%' || UPPER(:TERMINAL_CODE) || '%')
                    AND (:REQUEST_ID IS NULL OR UPPER(PH.BILLER_REQ_ID) LIKE '%' || UPPER(:REQUEST_ID) || '%')
                    AND (:SERVICE_CODE IS NULL OR UPPER(PH.SERVICE_CODE) LIKE '%' || UPPER(:SERVICE_CODE) || '%')
                    AND (:SERVICE_NAME IS NULL OR UPPER(PH.SERVICE_NAME) LIKE '%' || UPPER(:SERVICE_NAME) || '%')
                    AND (:CUSTOMER_CODE IS NULL OR UPPER(PH.CUSTOMER_CODE) LIKE '%' || UPPER(:CUSTOMER_CODE) || '%')
                    AND (:CUSTOMER_NAME IS NULL OR UPPER(PH.CUSTOMER_NAME) LIKE '%' || UPPER(:CUSTOMER_NAME) || '%')
                    AND (:NPWP IS NULL OR UPPER(PH.NPWP) LIKE '%' || UPPER(:NPWP) || '%')
                    AND (:VOYAGE IS NULL OR UPPER(PH.VESSEL_VOYAGE) LIKE '%' || UPPER(:VOYAGE) || '%')
                    AND (:VESSEL_NAME IS NULL OR UPPER(PH.VESSEL_NAME) LIKE '%' || UPPER(:VESSEL_NAME) || '%')
                    AND (:STATUS IS NULL OR UPPER(PH.STATUS) LIKE '%' || UPPER(:STATUS) || '%')
                    AND (:PAYMENT_CODE IS NULL OR UPPER(PH.PAYMENT_CODE) LIKE '%' || UPPER(:PAYMENT_CODE) || '%')
                    AND (:TRADE_TYPE IS NULL OR UPPER(PH.TRADE_TYPE) LIKE '%' || UPPER(:TRADE_TYPE) || '%')
                    AND (:LIMIT IS NULL OR ROWNUM <= :LIMIT)
            ) RH
            `, 
            {
                bind: {
                    TERMINAL_CODE: normalize_string(terminal_code),
                    // TERMINAL_NAME: normalize_string(terminal_name),
                    REQUEST_ID: normalize_string(request_id),
                    SERVICE_CODE: normalize_string(service_code),
                    SERVICE_NAME: normalize_string(service_name),
                    CUSTOMER_CODE: normalize_string(customer_code),
                    CUSTOMER_NAME: normalize_string(customer_name),
                    NPWP: normalize_string(npwp),
                    VOYAGE: normalize_string(voyage),
                    VESSEL_NAME: normalize_string(vessel_name),
                    STATUS: normalize_string(status),
                    PAYMENT_CODE: normalize_string(payment_code),
                    TRADE_TYPE: normalize_string(trade_type),
                    LIMIT: normalizeNumber(limit) ?? 1
                }
            }
        )
        console.log(result)
        return result
    } catch(err) {
        throw new AppError(err, 500)
    }
}

module.exports = {get_pranota_Oracle, properties_get_pranota}