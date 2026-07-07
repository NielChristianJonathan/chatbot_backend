const env = require('../constant/env.js');
const { connectOracle } = require('./oracle');
const { poolPg } = require('./supabase.js');

let db;

const initDatabase = async () => {
    console.log("Connecting database...")
    db = env.DB_MODE === "local"?  poolPg : await connectOracle()
    console.log("Database Connected")
    console.log(env.DB_MODE === "local"? "PG": "Oracle")
}

const getDb = () => {
    console.log("uhuyy")
    return db
}

module.exports = { initDatabase, getDb }

