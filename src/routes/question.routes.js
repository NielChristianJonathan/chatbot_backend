const express = require('express')
const router = express.Router()
const questionController = require('../controllers/question.controller');
const { validationAccessToken } = require('../middleware/verifyAccessToken');

console.log(questionController);
router.get('/faq', validationAccessToken, questionController.getFaq)
router.post('/', validationAccessToken, questionController.chat)

module.exports = router