/*
  Warnings:

  - The `status` column on the `Comic` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ComicStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED');

-- AlterTable
ALTER TABLE "Comic" DROP COLUMN "status",
ADD COLUMN     "status" "ComicStatus" NOT NULL DEFAULT 'ONGOING';
