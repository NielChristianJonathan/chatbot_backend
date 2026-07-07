const express = require('express')
const { addKnowledgeController } = require('../controllers/update.controller')
const router = express.Router()

router.put("/knowledge", addKnowledgeController)

module.exports = router