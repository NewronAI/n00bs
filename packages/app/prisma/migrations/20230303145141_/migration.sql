/*
  Warnings:

  - Added the required column `created_by_id` to the `intra_pair_job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "intra_pair_file" DROP CONSTRAINT "intra_pair_file_intra_pair_job_id_fkey";

-- AlterTable
ALTER TABLE "intra_pair_job" ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "intra_pair_job" ADD CONSTRAINT "intra_pair_job_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intra_pair_file" ADD CONSTRAINT "intra_pair_file_intra_pair_job_id_fkey" FOREIGN KEY ("intra_pair_job_id") REFERENCES "intra_pair_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
