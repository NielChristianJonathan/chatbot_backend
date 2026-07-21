const express = require("express");
require("dotenv").config();
const cors = require("cors");
const questionRoutes = require("./src/routes/question.routes.js");
const updateRoutes = require("./src/routes/update.routes.js");
const authRoutes = require("./src/routes/auth.routes.js");
const refreshRoutes = require("./src/routes/refresh.routes.js");
const usersRoutes = require("./src/routes/users.routes.js");
const planRoutes = require("./src/routes/plan.routes.js");
const { handleError } = require("./src/middleware/handleError.js");
const cookieParser = require("cookie-parser");
const { handlerResponse } = require("./src/middleware/handleResponse.js");
const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
    exposedHeaders: ["chatSession"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(handlerResponse);
app.use("/auth", authRoutes);
app.use("/question", questionRoutes);
app.use("/update",updateRoutes);
app.use("/refresh", refreshRoutes);
app.use("/users",usersRoutes);
app.use("/plan", planRoutes);

app.use(handleError);

module.exports = app;