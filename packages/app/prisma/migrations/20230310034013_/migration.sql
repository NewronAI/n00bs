-- AlterTable
ALTER TABLE "member" ADD COLUMN     "added_by" INTEGER;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
