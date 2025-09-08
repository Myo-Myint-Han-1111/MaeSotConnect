-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdvocateProfile" DROP CONSTRAINT "AdvocateProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ContentDraft" DROP CONSTRAINT "ContentDraft_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ContentDraft" DROP CONSTRAINT "ContentDraft_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_lastModifiedBy_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_courseId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_organizationId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "AdminAllowList";

-- DropTable
DROP TABLE "AdvocateProfile";

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "ContentDraft";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "FAQ";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserInvitation";

-- DropEnum
DROP TYPE "CourseStatus";

-- DropEnum
DROP TYPE "DraftStatus";

-- DropEnum
DROP TYPE "DraftType";

-- DropEnum
DROP TYPE "DurationUnit";

-- DropEnum
DROP TYPE "InvitationStatus";

-- DropEnum
DROP TYPE "ProfileStatus";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "UserStatus";

