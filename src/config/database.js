const env = require('../constant/env.js');
const { connectOracle } = require('./oracle');
const { poolPg } = require('./supabase.js');

let db;

const initDatabase = async () => {
    const db = env.DB_MODE === "lokal"? await connectOracle : poolPg
}

const getDb = () => {
    return db
}

module.exports = { initDatabase, getDb }

