// import express from "express";
// import { processMessage, getConversationHistory } from "../controllers/chatbotController.js";
// import authUser from "../middleware/authUser.js";

// const router = express.Router();

// // Route to process user message
// router.post("/message", authUser, async (req, res) => {
//     const { message } = req.body;
//     const { userId } = req.body;
//     const response = await processMessage(message, userId);
//     res.json(response);
// });

// // Route to get conversation history
// router.get("/history", authUser, async (req, res) => {
//     const { userId } = req.body;
//     const response = await getConversationHistory(userId);
//     res.json(response);
// });

// export default router; 

// backend/routes/chatbotRoute.js
import express from "express";
import { processMessage, getConversationHistory } from "../controllers/chatbotController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// POST /api/chatbot/message
// Use authUser if you want only logged-in users to save history; otherwise omit authUser.
// Below we allow optional auth: if token present, use req.userId, else allow body.userId
router.post("/message", authUser, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId || req.body.userId || null;
    const response = await processMessage(message, userId, req);
    return res.json(response);
  } catch (err) {
    console.error("Chatbot /message error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/chatbot/history?userId=...
// This can be protected with authUser too; but we'll support query fallback.
router.get("/history", authUser, async (req, res) => {
  try {
    const userId = req.userId || req.query.userId || null;
    const response = await getConversationHistory(userId);
    return res.json(response);
  } catch (err) {
    console.error("Chatbot /history error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
