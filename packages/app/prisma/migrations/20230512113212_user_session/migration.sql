-- CreateEnum
CREATE TYPE "check_type" AS ENUM ('pair_audio', 'single_audio', 'district_wise_audio', 'district_wise_transcript');

-- CreateTable
CREATE TABLE "user_session" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "current_question_uuid" VARCHAR(255),
    "task_assignment_id" INTEGER NOT NULL,
    "responses" JSONB,
    "has_accepted_policy" BOOLEAN NOT NULL DEFAULT false,
    "check_type" "check_type",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_current_question_uuid_fkey" FOREIGN KEY ("current_question_uuid") REFERENCES "question"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_task_assignment_id_fkey" FOREIGN KEY ("task_assignment_id") REFERENCES "task_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
