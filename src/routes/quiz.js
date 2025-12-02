const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const auth = require("../middleware/auth");
const { success, error } = require("../utils/responses");
const { generateQuiz } = require("../utils/gemini");

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.post("/generate", auth, async (req, res, next) => {
  try {
    const { curriculumId } = req.params;

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: {
        id: true,
        userId: true,
        title: true,
        topic: true,
        modules: true,
        quizzes: true,
      },
    });

    if (!curriculum) {
      return error(res, "Curriculum not found", 404);
    }

    if (curriculum.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    if (curriculum.quizzes.length > 0) {
      return error(res, "Quiz already exists for this curriculum", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { credits: true, geminiApiKey: true },
    });

    if (user.credits < 20) {
      return error(res, "Insufficient credits. Need 20 credits to generate quiz.", 400);
    }

    const quizData = await generateQuiz(curriculum, user.geminiApiKey);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { credits: { decrement: 20 } },
    });

    const quiz = await prisma.quiz.create({
      data: {
        curriculumId: curriculum.id,
        questions: quizData.questions,
      },
    });

    return success(res, quiz, "Quiz generated successfully", 201);
  } catch (err) {
    next(err);
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    const { curriculumId } = req.params;

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: { userId: true },
    });

    if (!curriculum) {
      return error(res, "Curriculum not found", 404);
    }

    if (curriculum.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    const quiz = await prisma.quiz.findFirst({
      where: { curriculumId },
      include: {
        results: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!quiz) {
      return error(res, "No quiz found for this curriculum", 404);
    }

    return success(res, quiz);
  } catch (err) {
    next(err);
  }
});

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)),
});

router.post("/submit", auth, async (req, res, next) => {
  try {
    const { curriculumId } = req.params;
    const validated = submitSchema.parse(req.body);

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: { userId: true },
    });

    if (!curriculum) {
      return error(res, "Curriculum not found", 404);
    }

    if (curriculum.userId !== req.user.userId) {
      return error(res, "Access denied", 403);
    }

    const quiz = await prisma.quiz.findFirst({
      where: { curriculumId },
    });

    if (!quiz) {
      return error(res, "No quiz found for this curriculum", 404);
    }

    const questions = quiz.questions;

    if (validated.answers.length !== questions.length) {
      return error(res, "Answer count doesn't match question count", 400);
    }

    let correctCount = 0;
    const weakTopics = {};

    questions.forEach((q, idx) => {
      const isCorrect = validated.answers[idx] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      } else {
        weakTopics[q.topic] = (weakTopics[q.topic] || 0) + 1;
      }
    });

    const score = (correctCount / questions.length) * 100;

    const sortedWeakTopics = Object.entries(weakTopics)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, wrongCount: count }));

    const result = await prisma.quizResult.create({
      data: {
        quizId: quiz.id,
        answers: validated.answers,
        score,
        weakTopics: sortedWeakTopics,
      },
    });

    await prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        progress: { score, totalQuizzes: 1 },
        focusAreas: sortedWeakTopics.slice(0, 3),
      },
    });

    return success(res, {
      result,
      score,
      weakTopics: sortedWeakTopics,
      recommendations: sortedWeakTopics.length > 0
        ? `Focus on: ${sortedWeakTopics.slice(0, 3).map(t => t.topic).join(", ")}`
        : "Great job! You've mastered this curriculum.",
    }, "Quiz submitted successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(res, "Validation failed", 400, err.errors);
    }
    next(err);
  }
});

module.exports = router;
