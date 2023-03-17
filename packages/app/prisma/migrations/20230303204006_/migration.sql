-- DropForeignKey
ALTER TABLE "intra_pair_job" DROP CONSTRAINT "intra_pair_job_assigned_to_id_fkey";

-- AlterTable
ALTER TABLE "intra_pair_job" ALTER COLUMN "assigned_to_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "intra_pair_job" ADD CONSTRAINT "intra_pair_job_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
