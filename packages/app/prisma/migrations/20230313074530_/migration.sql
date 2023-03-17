/*
  Warnings:

  - A unique constraint covering the columns `[parent_id]` on the table `workflow_file` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workflow_file" ADD COLUMN     "parent_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "workflow_file_parent_id_key" ON "workflow_file"("parent_id");

-- AddForeignKey
ALTER TABLE "workflow_file" ADD CONSTRAINT "workflow_file_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "workflow_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
