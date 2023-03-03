/*
  Warnings:

  - The values [task_created,task_updated,task_deleted,workflow_created,workflow_updated,workflow_deleted,question_created,question_updated,member_created,member_updated,member_deleted] on the enum `events` will be removed. If these variants are still used in the database, this will fail.
  - The values [GET] on the enum `request_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "events_new" AS ENUM ('task_assignment_created', 'task_assignment_updated', 'task_assignment_deleted', 'task_assignment_reviewed', 'workflow_file_created', 'workflow_file_updated', 'workflow_file_deleted', 'question_added', 'question_deleted');
ALTER TABLE "webhook" ALTER COLUMN "event" TYPE "events_new" USING ("event"::text::"events_new");
ALTER TYPE "events" RENAME TO "events_old";
ALTER TYPE "events_new" RENAME TO "events";
DROP TYPE "events_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "request_method_new" AS ENUM ('POST', 'PUT');
ALTER TABLE "webhook" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "webhook" ALTER COLUMN "method" TYPE "request_method_new" USING ("method"::text::"request_method_new");
ALTER TYPE "request_method" RENAME TO "request_method_old";
ALTER TYPE "request_method_new" RENAME TO "request_method";
DROP TYPE "request_method_old";
ALTER TABLE "webhook" ALTER COLUMN "method" SET DEFAULT 'POST';
COMMIT;
