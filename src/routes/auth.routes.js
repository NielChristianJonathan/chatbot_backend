const express = require('express');
const { loginValidation } = require('../middleware/loginValidation');
const { loginController, registerController, refreshController } = require('../controllers/auth.controller');
const { registerValidation } = require('../middleware/registerValidation');
const { validationAccessToken } = require('../middleware/verifyAccessToken');
const { validationRefreshToken } = require('../middleware/verifyRefreshToken');


const router = express.Router()

router.post("/login", loginValidation, loginController )
router.post("/register", registerValidation, registerController )
router.post("/refresh", validationRefreshToken, refreshController)

module.exports = router