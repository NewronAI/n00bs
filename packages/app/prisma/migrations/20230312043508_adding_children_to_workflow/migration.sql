/*
  Warnings:

  - A unique constraint covering the columns `[child_id]` on the table `workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "child_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "workflow_child_id_key" ON "workflow"("child_id");

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
