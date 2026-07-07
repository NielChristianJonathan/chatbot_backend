const express = require("express");
const { validationRefreshToken } = require("../middleware/verifyRefreshToken");
const { refreshAccessController } = require("../controllers/refresh.controller");

const router = express.Router()

router.get("/accesstoken", validationRefreshToken, refreshAccessController)

module.exports = router