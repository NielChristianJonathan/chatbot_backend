const app = require("./app")
import { initDatabase } from "./src/config/database";

const start = async() => {
    await initDatabase();
    app.listen(3000, () =>{
        console.log("Server running on port 3000");
    });
}

start();