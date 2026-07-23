const express = require("express");
const { validationAccessToken } = require("../middleware/verifyAccessToken");
const { getChatSessionMessagesController, deleteChatSessionController, getChatSessionController, getCreateChatSession } = require("../controllers/chatSession.constroller");
const { chatSessionValidation } = require("../middleware/chatSessionValidation");
const router = express.Router();

router.get("/", validationAccessToken, getChatSessionController);
router.post("/create", validationAccessToken, getCreateChatSession)
router.get("/:chatSession/messages", validationAccessToken, chatSessionValidation, getChatSessionMessagesController);
router.delete("/:chatSession", validationAccessToken, chatSessionValidation, deleteChatSessionController)

module.exports = router;