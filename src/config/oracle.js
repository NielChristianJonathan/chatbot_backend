const OracleDB = require("oracledb")
const env = require("../constant/env.js")
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: env.TOSHUB_DIALECT,
  username: env.TOSHUB_USER,
  password: env.TOSHUB_PASSWORD,
  logging: false,
  dialectOptions: {
    connectString: env.TOSHUB_CONNECTSTRING,
  },
});

const dbConfig = {
    user: env.TOSHUB_USER,
    password: env.TOSHUB_PASSWORD,
    connectString : env.TOSHUB_CONNECTSTRING
}

const connectOracle = async() => {
    OracleDB.initOracleClient({
        libDir: "D:/Oracle/instantclient_23_0"
    })
    return await OracleDB.createPool(dbConfig);
}

module.exports = {connectOracle, sequelize}