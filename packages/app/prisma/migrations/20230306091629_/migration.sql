-- CreateEnum
CREATE TYPE "confidence_level" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "intra_pair_file" ADD COLUMN     "confidence" "confidence_level" NOT NULL DEFAULT 'low';
