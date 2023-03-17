-- AlterTable
ALTER TABLE "workflow_file" ADD COLUMN     "calculated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "delivered" BOOLEAN NOT NULL DEFAULT false;
