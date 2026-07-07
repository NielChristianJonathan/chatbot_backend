const {Pool} = require("pg");
const { CONNECT_SUPABASE } = require("../constant/env");

const poolPg = new Pool({
    connectionString: CONNECT_SUPABASE
})
module.exports = {poolPg}