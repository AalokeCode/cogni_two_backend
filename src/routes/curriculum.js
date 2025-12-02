const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const auth = require("../middleware/auth");
const { success, error } = require("../utils/responses");
const { generateCurriculum } = require("../utils/gemini");
const quizRouter = require("./quiz");

const router = express.Router();
const prisma = new PrismaClient();

router.use("/:curriculumId/quiz", quizRouter);

const createCurriculumSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  depth: z.enum(["brief", "moderate", "comprehensive"]),
});

router.post("/create", auth, async (req, res, next) => {
  try {
    const validated = createCurriculumSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { credits: true, geminiApiKey: true },
    });

    if (!user) {
      return error(res, "User not found", 404);
    }

    if (user.credits < 10) {
      return error(
        res,
        "Insufficient credits. Need 10 credits to generate curriculum.",
        400
      );
    }

    const aiResponse = await generateCurriculum(
      validated.topic,
      validated.difficulty,
      validated.depth,
      user.geminiApiKey
    );

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { credits: { decrement: 10 } },
    });

    const curriculum = await prisma.curriculum.create({
      data: {
        userId: req.user.userId,
        topic: validated.topic,
        difficulty: validated.difficulty,
        depth: validated.depth,
        title: aiResponse.title,
        modules: aiResponse.modules,
      },
    });

    return success(res, curriculum, "Curriculum created successfully", 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title"])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

router.get("/", auth, async (req, res, next) => {
  try {
    const validated = listQuerySchema.parse(req.query);

    const where = {
      userId: req.user.userId,
      ...(validated.search && {
        OR: [
          { title: { contains: validated.search, mode: "insensitive" } },
          { topic: { contains: validated.search, mode: "insensitive" } },
        ],
      }),
      ...(validated.difficulty && { difficulty: validated.difficulty }),
    };

    const curricula = await prisma.curriculum.findMany({
      where,
      orderBy: { [validated.sortBy]: validated.order },
      select: {
        id: true,
        title: true,
        topic: true,
        difficulty: true,
        depth: true,
        modules: true,
        progress: true,
        focusAreas: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(res, curricula);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const curriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        quizzes: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!curriculum) {
      return error(res, "Curriculum not found", 404);
    }

    if (curriculum.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    return success(res, curriculum);
  } catch (err) {
    next(err);
  }
});

const updateCurriculumSchema = z.object({
  title: z.string().min(1).optional(),
  progress: z.any().optional(),
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateCurriculumSchema.parse(req.body);

    const existing = await prisma.curriculum.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return error(res, "Curriculum not found", 404);
    }

    if (existing.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    const curriculum = await prisma.curriculum.update({
      where: { id },
      data: validated,
    });

    return success(res, curriculum, "Curriculum updated successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.curriculum.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return error(res, "Curriculum not found", 404);
    }

    if (existing.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    await prisma.curriculum.delete({ where: { id } });

    return success(res, null, "Curriculum deleted successfully");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
