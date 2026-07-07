const OracleDB = require("oracledb")
const env = require("../constant/env.js")


const dbConfig = {
    user: env.TOSHUB_USER,
    password: env.TOSHUB_PASSWORD,
    connectString : env.TOSHUB_CONNECTSTRING
}

const connectOracle = async() => {
    OracleDB.initOracleClient({
        libDir: "D:/Oracle/instantclient_23_0"
    })
    return await OracleDB.getConnection(dbConfig);
}


module.exports = {connectOracle}