const app = require("./app")
// import { initDatabase } from "./src/config/database.js";
const repositories = require("./src/config/database.js")
const redis = require("./src/config/redis.js")

const start = async() => {
    await repositories.initDatabase();
    await redis.connectRedis();
    app.listen(3000, () =>{
        console.log("Server running on port 3000");
    });
}

start();