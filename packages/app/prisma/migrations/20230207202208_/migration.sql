/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `task_answer` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `task_answer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `task_answer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_answer" DROP CONSTRAINT "task_answer_member_id_fkey";

-- AlterTable
ALTER TABLE "task_answer" DROP COLUMN "deletedAt",
DROP COLUMN "member_id",
DROP COLUMN "name",
ADD COLUMN     "memberId" INTEGER;

-- AddForeignKey
ALTER TABLE "task_answer" ADD CONSTRAINT "task_answer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
