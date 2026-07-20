const express = require("express");
const { validationAccessToken } = require("../middleware/verifyAccessToken");
const { getKeyMessageController, getMessageController } = require("../controllers/user.controller");
const router = express.Router();

router.get("/keyMessages", validationAccessToken, getKeyMessageController);
router.get("/messages", validationAccessToken, getMessageController)
module.exports = router