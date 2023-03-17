/*
  Warnings:

  - You are about to drop the column `workflow_id` on the `intra_pair_file` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `intra_pair_job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "intra_pair_file" DROP COLUMN "workflow_id",
ALTER COLUMN "is_similar" DROP NOT NULL,
ALTER COLUMN "is_similar" DROP DEFAULT;

-- AlterTable
ALTER TABLE "intra_pair_job" DROP COLUMN "event";

-- CreateTable
CREATE TABLE "intra_pair_job_questions" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "intra_pair_job_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "intra_pair_job_questions" ADD CONSTRAINT "intra_pair_job_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
