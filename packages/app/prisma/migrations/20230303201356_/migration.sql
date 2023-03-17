/*
  Warnings:

  - You are about to drop the `intra_pair_job_assignment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assigned_to_id` to the `intra_pair_job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "intra_pair_job_assignment" DROP CONSTRAINT "intra_pair_job_assignment_assignee_id_fkey";

-- DropForeignKey
ALTER TABLE "intra_pair_job_assignment" DROP CONSTRAINT "intra_pair_job_assignment_intra_pair_job_id_fkey";

-- AlterTable
ALTER TABLE "intra_pair_job" ADD COLUMN     "assigned_to_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "intra_pair_job_assignment";

-- AddForeignKey
ALTER TABLE "intra_pair_job" ADD CONSTRAINT "intra_pair_job_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
