import express from "express";
import { processMessage, getConversationHistory } from "../controllers/chatbotController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// Route to process user message
router.post("/message", authUser, async (req, res) => {
    const { message } = req.body;
    const { userId } = req.body;
    const response = await processMessage(message, userId);
    res.json(response);
});

// Route to get conversation history
router.get("/history", authUser, async (req, res) => {
    const { userId } = req.body;
    const response = await getConversationHistory(userId);
    res.json(response);
});

export default router; 