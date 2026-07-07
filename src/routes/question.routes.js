const express = require('express')
const router = express.Router()
const questionController = require('../controllers/question.controller');
const { validationAccessToken } = require('../middleware/verifyAccessToken');
const { validationRefreshToken } = require('../middleware/verifyRefreshToken');

console.log(questionController);
router.get('/faq',validationRefreshToken, validationAccessToken, questionController.getFaq)
router.post('/', questionController.chat)

module.exports = router