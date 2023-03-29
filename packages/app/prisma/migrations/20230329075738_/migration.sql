/*
  Warnings:

  - A unique constraint covering the columns `[task_assignment_id,question_id]` on the table `task_answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "task_answer_task_assignment_id_question_id_key" ON "task_answer"("task_assignment_id", "question_id");
