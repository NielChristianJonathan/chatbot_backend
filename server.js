const app = require("./app")
// import { initDatabase } from "./src/config/database.js";
const repositories = require("./src/config/database.js");
const { sequelize } = require("./src/config/oracle.js");
const redis = require("./src/config/redis.js")

const start = async() => {
    // await repositories.initDatabase();
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    await redis.connectRedis();
    app.listen(3000, () =>{
        console.log("Server running on port 3000");
    });
}

start();