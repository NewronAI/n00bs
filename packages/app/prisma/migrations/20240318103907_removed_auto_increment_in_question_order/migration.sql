-- AlterTable
ALTER TABLE "question" ALTER COLUMN "order" DROP NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "question_order_seq";
