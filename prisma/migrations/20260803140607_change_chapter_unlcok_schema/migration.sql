/*
  Warnings:

  - You are about to drop the column `comicId` on the `ChapterUnlock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,chapterId]` on the table `ChapterUnlock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ChapterUnlock" DROP CONSTRAINT "ChapterUnlock_comicId_fkey";

-- DropIndex
DROP INDEX "ChapterUnlock_userId_comicId_chapterId_key";

-- AlterTable
ALTER TABLE "ChapterUnlock" DROP COLUMN "comicId";

-- CreateIndex
CREATE UNIQUE INDEX "ChapterUnlock_userId_chapterId_key" ON "ChapterUnlock"("userId", "chapterId");
