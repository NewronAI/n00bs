-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_assignee_id_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_task_id_fkey";

-- AlterTable
ALTER TABLE "task_answer" ADD COLUMN     "is_expected" BOOLEAN;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
