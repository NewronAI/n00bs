/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `intra_pair_job` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "intra_pair_job_name_key" ON "intra_pair_job"("name");
