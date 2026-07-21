const express = require("express");
const { validationAccessToken } = require("../middleware/verifyAccessToken");
const { planUpgradeController } = require("../controllers/plan.controller");
const router = express.Router()

router.post("/upgrade", validationAccessToken, planUpgradeController);

module.exports = router;