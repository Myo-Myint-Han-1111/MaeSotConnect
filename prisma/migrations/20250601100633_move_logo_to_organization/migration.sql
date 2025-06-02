/*
  Warnings:

  - You are about to drop the column `logoImage` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "logoImage";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoImage" TEXT;
