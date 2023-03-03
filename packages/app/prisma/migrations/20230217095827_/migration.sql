/*
  Warnings:

  - A unique constraint covering the columns `[assignee_id,workflow_file_id,task_id]` on the table `task_assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "task_assignment_assignee_id_workflow_file_id_task_id_key" ON "task_assignment"("assignee_id", "workflow_file_id", "task_id");
