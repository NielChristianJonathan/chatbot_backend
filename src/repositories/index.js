const env = require("../constant/env.js")
const { get_container_detail_Pg } = require("./postgresDb/getContainerDetail.js")
const { get_customer_info_Pg } = require("./postgresDb/getCustomerInfo.js")
const { get_pranota_Pg } = require("./postgresDb/getPranota.js")
const { get_terminal_Pg } = require("./postgresDb/getTerminal.js")


const Tools = {
    "local": {
        get_customer_info: get_customer_info_Pg,
        get_container_detail: get_container_detail_Pg,
        get_pranota: get_pranota_Pg,
        get_terminal: get_terminal_Pg 
    },
    "company": {
       get_customer_info: 1
    }
}

module.exports = {Tools}