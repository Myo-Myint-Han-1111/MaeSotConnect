/*
  Warnings:

  - You are about to alter the column `feeAmount` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `feeAmountMm` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "district" TEXT,
ADD COLUMN     "province" TEXT,
ALTER COLUMN "feeAmount" SET DEFAULT 0,
ALTER COLUMN "feeAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "feeAmountMm" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "address" DROP NOT NULL;
