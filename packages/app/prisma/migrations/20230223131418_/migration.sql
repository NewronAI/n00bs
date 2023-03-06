-- DropForeignKey
ALTER TABLE "task_answer" DROP CONSTRAINT "task_answer_task_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_assignee_id_fkey";

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_answer" ADD CONSTRAINT "task_answer_task_assignment_id_fkey" FOREIGN KEY ("task_assignment_id") REFERENCES "task_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
