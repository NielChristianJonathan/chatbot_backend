const express = require('express')
const router = express.Router()
const questionController = require('../controllers/question.controller');
const { validationAccessToken } = require('../middleware/verifyAccessToken');
const { checkToken } = require('../middleware/checkToken');

console.log(questionController);
router.get('/faq', validationAccessToken    ,questionController.getFaq)
router.post('/', validationAccessToken, checkToken,questionController.chat)

module.exports = router