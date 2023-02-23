-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('checkbox', 'radio', 'boolean', 'text');

-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('admin', 'manager', 'associate', 'freelancer');

-- CreateEnum
CREATE TYPE "obj_status" AS ENUM ('active', 'inactive', 'deleted');

-- CreateEnum
CREATE TYPE "file_type" AS ENUM ('image', 'video', 'audio', 'document');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "workflow" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_file" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "file_type" "file_type" NOT NULL DEFAULT 'audio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "workflow_id" INTEGER NOT NULL,
    "file_duration" INTEGER,
    "district" TEXT,
    "state" TEXT,
    "vendor" TEXT,
    "metadata" JSONB,

    CONSTRAINT "workflow_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" SERIAL NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "question_type" "question_type" NOT NULL DEFAULT 'boolean',
    "options" TEXT[],
    "status" "obj_status" NOT NULL DEFAULT 'active',

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "member_role" NOT NULL DEFAULT 'freelancer',
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "district" TEXT,
    "state" TEXT,
    "address" TEXT,
    "pincode" TEXT,
    "payment_details" JSONB,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "workflow_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "min_assignments" INTEGER NOT NULL DEFAULT 3,
    "district" TEXT,
    "state" TEXT,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_question" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "task_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignment" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'pending',
    "task_id" INTEGER NOT NULL,
    "assignee_id" INTEGER NOT NULL,
    "workflow_file_id" INTEGER NOT NULL,
    "review_rating" INTEGER,
    "review_comments" TEXT,
    "reviewer_id" INTEGER,

    CONSTRAINT "task_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_answer" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "task_assignment_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "task_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_uuid_key" ON "workflow"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_file_uuid_key" ON "workflow_file"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "question_uuid_key" ON "question"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "member_uuid_key" ON "member"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_phone_key" ON "member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "task_uuid_key" ON "task"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "task_question_uuid_key" ON "task_question"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "task_assignment_uuid_key" ON "task_assignment"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "task_answer_uuid_key" ON "task_answer"("uuid");

-- AddForeignKey
ALTER TABLE "workflow_file" ADD CONSTRAINT "workflow_file_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_question" ADD CONSTRAINT "task_question_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_question" ADD CONSTRAINT "task_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_workflow_file_id_fkey" FOREIGN KEY ("workflow_file_id") REFERENCES "workflow_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_answer" ADD CONSTRAINT "task_answer_task_assignment_id_fkey" FOREIGN KEY ("task_assignment_id") REFERENCES "task_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_answer" ADD CONSTRAINT "task_answer_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_answer" ADD CONSTRAINT "task_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
