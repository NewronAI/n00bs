/*
  Warnings:

  - You are about to alter the column `answer` on the `task_answer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "task_answer" ALTER COLUMN "answer" SET DATA TYPE VARCHAR(255);
