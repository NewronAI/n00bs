/*
  Warnings:

  - The `check_type` column on the `user_session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_session" DROP COLUMN "check_type",
ADD COLUMN     "check_type" INTEGER;
