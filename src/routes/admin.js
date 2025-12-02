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

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

const listUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  sortBy: z.enum(["createdAt", "credits", "email"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const listCurriculaSchema = z.object({
  search: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

router.get("/users", auth, admin, async (req, res, next) => {
  try {
    const validated = listUsersSchema.parse(req.query);
    const page = parseInt(validated.page) || 1;
    const limit = parseInt(validated.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = validated.sortBy || "createdAt";
    const order = validated.order || "desc";

    const where = {};
    if (validated.search) {
      where.OR = [
        { email: { contains: validated.search, mode: "insensitive" } },
        { name: { contains: validated.search, mode: "insensitive" } },
      ];
    }
    if (validated.role) {
      where.role = validated.role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              curricula: true,
              quizResults: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

router.get("/users/:id", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true,
        geminiApiKey: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            curricula: true,
            quizResults: true,
            conversations: true,
          },
        },
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

router.put("/users/:id/role", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateRoleSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { role: validated.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return success(res, user, "Role updated successfully");
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

router.delete("/users/:id", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return error(res, "Cannot delete your own account", 400);
    }

    await prisma.user.delete({
      where: { id },
    });

    return success(res, null, "User deleted successfully");
  } catch (err) {
    if (err.code === "P2025") {
      return error(res, "User not found", 404);
    }
    next(err);
  }
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

router.get("/curriculum", auth, admin, async (req, res, next) => {
  try {
    const validated = listCurriculaSchema.parse(req.query);
    const page = parseInt(validated.page) || 1;
    const limit = parseInt(validated.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = validated.sortBy || "createdAt";
    const order = validated.order || "desc";

    const where = {};
    if (validated.search) {
      where.OR = [
        { title: { contains: validated.search, mode: "insensitive" } },
        { topic: { contains: validated.search, mode: "insensitive" } },
      ];
    }
    if (validated.userId) {
      where.userId = validated.userId;
    }

    const [curricula, total] = await Promise.all([
      prisma.curriculum.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              quizzes: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.curriculum.count({ where }),
    ]);

    return success(res, {
      curricula,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

router.get("/curriculum/:id", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const curriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        quizzes: {
          include: {
            results: true,
          },
        },
      },
    });

    if (!curriculum) {
      return error(res, "Curriculum not found", 404);
    }

    return success(res, curriculum);
  } catch (err) {
    next(err);
  }
});

router.delete("/curriculum/:id", auth, admin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.curriculum.delete({
      where: { id },
    });

    return success(res, null, "Curriculum deleted successfully");
  } catch (err) {
    if (err.code === "P2025") {
      return error(res, "Curriculum not found", 404);
    }
    next(err);
  }
});

router.get("/stats", auth, admin, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCurricula,
      totalQuizzes,
      totalCreditsDistributed,
      recentUsers,
      recentCurricula,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.curriculum.count(),
      prisma.quiz.count(),
      prisma.user.aggregate({
        _sum: {
          credits: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.curriculum.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return success(res, {
      totalUsers,
      totalCurricula,
      totalQuizzes,
      totalCreditsDistributed: totalCreditsDistributed._sum.credits || 0,
      recentUsers,
      recentCurricula,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
