const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const auth = require("../middleware/auth");
const { success, error } = require("../utils/responses");
const { chatWithMentor } = require("../utils/gemini");

const router = express.Router();
const prisma = new PrismaClient();

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional(),
});

router.post("/chat", auth, async (req, res, next) => {
  try {
    const validated = chatSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { geminiApiKey: true },
    });

    let conversation;
    let conversationHistory = [];

    if (validated.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: validated.conversationId },
      });

      if (!conversation) {
        return error(res, "Conversation not found", 404);
      }

      if (conversation.userId !== req.user.userId) {
        return error(res, "Access denied", 403);
      }

      conversationHistory = conversation.messages || [];
    }

    const aiResponse = await chatWithMentor(
      validated.message,
      conversationHistory,
      user.geminiApiKey
    );

    const newMessages = [
      ...conversationHistory,
      { role: "user", content: validated.message, timestamp: new Date() },
      { role: "assistant", content: aiResponse, timestamp: new Date() },
    ];

    if (conversation) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { messages: newMessages },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user.userId,
          messages: newMessages,
        },
      });
    }

    return success(res, {
      conversationId: conversation.id,
      message: aiResponse,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

module.exports = router;
