/*
  Warnings:

  - You are about to drop the column `learningStyle` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `curriculumId` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `QuizResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_userId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "curriculumId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizResult" DROP COLUMN "learningStyle",
DROP COLUMN "userId",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weakTopics" JSONB;

-- DropTable
DROP TABLE "Course";

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "depth" TEXT NOT NULL,
    "modules" JSONB NOT NULL,
    "progress" JSONB,
    "focusAreas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
