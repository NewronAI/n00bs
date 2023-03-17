/*
  Warnings:

  - You are about to drop the column `headers` on the `intra_pair_job` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `intra_pair_job` table. All the data in the column will be lost.
  - The `status` column on the `intra_pair_job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "intra_pair_job" DROP COLUMN "headers",
DROP COLUMN "method",
DROP COLUMN "status",
ADD COLUMN     "status" "task_status" NOT NULL DEFAULT 'pending';
