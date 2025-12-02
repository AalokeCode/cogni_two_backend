const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const auth = require("../middleware/auth");
const { success, error } = require("../utils/responses");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        learningStyle: true,
        geminiApiKey: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error(res, "User not found", 404);
    }

    return success(res, user);
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  geminiApiKey: z.string().nullable().optional(),
});

router.put("/update", auth, async (req, res, next) => {
  try {
    const validated = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: validated,
      select: {
        id: true,
        email: true,
        name: true,
        geminiApiKey: true,
      },
    });

    return success(res, user, "User updated successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

router.get("/credits", auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { credits: true },
    });

    if (!user) {
      return error(res, "User not found", 404);
    }

    return success(res, { credits: user.credits });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
