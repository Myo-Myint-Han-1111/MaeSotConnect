-- CreateTable
CREATE TABLE "OrganizationAdminAllowList" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "notes" TEXT,
    "addedBy" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationAdminAllowList_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "applyButtonText" TEXT,
ADD COLUMN     "applyButtonTextMm" TEXT,
ADD COLUMN     "applyLink" TEXT,
ADD COLUMN     "estimatedDate" TEXT,
ADD COLUMN     "estimatedDateMm" TEXT,
ADD COLUMN     "howToApply" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "howToApplyMm" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "startByDate" TIMESTAMP(3),
ADD COLUMN     "startByDateMm" TIMESTAMP(3),
ALTER COLUMN "ageMin" DROP NOT NULL,
ALTER COLUMN "ageMax" DROP NOT NULL,
ALTER COLUMN "document" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAdminAllowList_email_key" ON "OrganizationAdminAllowList"("email");

-- CreateIndex
CREATE INDEX "OrganizationAdminAllowList_organizationId_idx" ON "OrganizationAdminAllowList"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_startByDate_idx" ON "Course"("startByDate");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AddForeignKey
ALTER TABLE "OrganizationAdminAllowList" ADD CONSTRAINT "OrganizationAdminAllowList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;