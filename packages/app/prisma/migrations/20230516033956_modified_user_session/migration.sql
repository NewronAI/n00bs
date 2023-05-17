-- DropForeignKey
ALTER TABLE "user_session" DROP CONSTRAINT "user_session_member_id_fkey";

-- DropForeignKey
ALTER TABLE "user_session" DROP CONSTRAINT "user_session_task_assignment_id_fkey";

-- AlterTable
ALTER TABLE "user_session" ALTER COLUMN "member_id" DROP NOT NULL,
ALTER COLUMN "task_assignment_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_task_assignment_id_fkey" FOREIGN KEY ("task_assignment_id") REFERENCES "task_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
