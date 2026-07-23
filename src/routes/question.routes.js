const express = require('express')
const router = express.Router()
const questionController = require('../controllers/question.controller');
const { validationAccessToken } = require('../middleware/verifyAccessToken');
const { createChatSession } = require('../middleware/createChatSession');
const { checkAIToken } = require('../middleware/checkAIToken');
const { chatSessionValidation } = require('../middleware/chatSessionValidation');


console.log(questionController);
router.get('/faq', validationAccessToken, questionController.getFaq)
router.post('/:chatSession', validationAccessToken, chatSessionValidation, checkAIToken,questionController.chat)

module.exports = router