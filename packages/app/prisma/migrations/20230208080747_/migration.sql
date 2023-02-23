/*
  Warnings:

  - You are about to alter the column `email` on the `member` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `memberId` on the `task_answer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "events" AS ENUM ('task_created', 'task_updated', 'task_deleted', 'task_assignment_created', 'task_assignment_updated', 'task_assignment_deleted', 'task_assignment_reviewed', 'workflow_created', 'workflow_updated', 'workflow_deleted', 'workflow_file_created', 'workflow_file_updated', 'workflow_file_deleted', 'question_created', 'question_updated', 'question_deleted', 'member_created', 'member_updated', 'member_deleted');

-- CreateEnum
CREATE TYPE "request_method" AS ENUM ('GET', 'POST', 'PUT');

-- DropForeignKey
ALTER TABLE "task_answer" DROP CONSTRAINT "task_answer_memberId_fkey";

-- AlterTable
ALTER TABLE "member" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "task_answer" DROP COLUMN "memberId";

-- CreateTable
CREATE TABLE "webhook" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "url" TEXT NOT NULL,
    "method" "request_method" NOT NULL DEFAULT 'POST',
    "headers" JSONB,
    "event" "events" NOT NULL,
    "workflow_id" INTEGER,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_uuid_key" ON "webhook"("uuid");

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
