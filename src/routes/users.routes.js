const express = require("express");
const { validationAccessToken } = require("../middleware/verifyAccessToken");
const { getKeyMessageController } = require("../controllers/user.controller");
const router = express.Router();

router.get("/keyMessages", validationAccessToken, getKeyMessageController);
module.exports = router