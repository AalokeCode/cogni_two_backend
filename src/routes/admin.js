const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { success, error } = require("../utils/responses");

const router = express.Router();
const prisma = new PrismaClient();

const updateCreditsSchema = z.object({
  credits: z.number().int().min(0),
});

router.put("/users/:id/credits", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateCreditsSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { credits: validated.credits },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
      },
    });

    return success(res, user, "Credits updated successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    if (err.code === "P2025") {
      return error(res, "User not found", 404);
    }
    next(err);
  }
});

module.exports = router;
