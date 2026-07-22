const express = require("express");
const { validationAccessToken } = require("../middleware/verifyAccessToken");
const { getChatSessionMessagesController, deleteChatSessionController, getChatSessionController, getCreateChatSession } = require("../controllers/chatSession.constroller");
const router = express.Router();

router.get("/", validationAccessToken, getChatSessionController);
router.post("/create", validationAccessToken, getCreateChatSession)
router.get("/:chatSession/messages", validationAccessToken, getChatSessionMessagesController);
router.delete("/:chatSession", validationAccessToken, deleteChatSessionController)

module.exports = router;