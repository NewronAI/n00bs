-- CreateEnum
CREATE TYPE "workflow_type" AS ENUM ('QA', 'FIELD_TASK', 'RECORD_AUDIO', 'CAPTURE_PHOTOS');

-- CreateEnum
CREATE TYPE "content_type" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('UNASSIGNED', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "storage_type" AS ENUM ('S3', 'GCS', 'LOCAL', 'AZURE', 'CUSTOM', 'NONE');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'TIME', 'DATETIME', 'BOOLEAN', 'SELECT', 'RADIO', 'CHECKBOX', 'FILE', 'IMAGE', 'VIDEO', 'AUDIO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "worker_role" AS ENUM ('WORKER', 'REVIEWER', 'MANAGER');

-- CreateEnum
CREATE TYPE "trust_level" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "worker_status" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('UNASSIGNED', 'PENDING', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('TASK', 'REVIEW');

-- CreateEnum
CREATE TYPE "task_definiton_constraints" AS ENUM ('CITY_BOUND', 'STATE_BOUND', 'COUNTRY_BOUND', 'NONE');

-- CreateTable
CREATE TABLE "workflow" (
    "workflow_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "workflow_type" NOT NULL DEFAULT 'QA',
    "secret_join_code" TEXT,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("workflow_id")
);

-- CreateTable
CREATE TABLE "geo" (
    "geo_id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "zip" TEXT,
    "street" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_pkey" PRIMARY KEY ("geo_id")
);

-- CreateTable
CREATE TABLE "content" (
    "content_id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "geo_id" INTEGER,
    "data" TEXT,
    "metadata" JSONB,
    "content_type" "content_type" NOT NULL DEFAULT 'TEXT',
    "storage_type" "storage_type" NOT NULL DEFAULT 'GCS',
    "status" "content_status" NOT NULL DEFAULT 'UNASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "question" (
    "question_id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "type" "question_type" NOT NULL DEFAULT 'BOOLEAN',
    "options" TEXT[],
    "metadata" JSONB,
    "correct_answer" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "worker" (
    "worker_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "worker_role" NOT NULL DEFAULT 'WORKER',
    "address" TEXT,
    "metadata" JSONB,
    "trust_level" "trust_level" NOT NULL DEFAULT 'LOW',
    "geo_id" INTEGER,
    "payment_details" JSONB,
    "status" "worker_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_pkey" PRIMARY KEY ("worker_id")
);

-- CreateTable
CREATE TABLE "task_question" (
    "tast_questions_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "task_definition_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_question_pkey" PRIMARY KEY ("tast_questions_id")
);

-- CreateTable
CREATE TABLE "task_definition" (
    "task_definition_id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "task_type" NOT NULL DEFAULT 'TASK',
    "metadata" JSONB,
    "constraints" "task_definiton_constraints" NOT NULL DEFAULT 'NONE',
    "min_workers" INTEGER NOT NULL DEFAULT 3,
    "max_workers" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_definition_pkey" PRIMARY KEY ("task_definition_id")
);

-- CreateTable
CREATE TABLE "task" (
    "task_id" SERIAL NOT NULL,
    "task_definition_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'UNASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "review_id" INTEGER,

    CONSTRAINT "task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "response" (
    "response_id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer" JSONB NOT NULL,
    "answer_type" "question_type" NOT NULL DEFAULT 'BOOLEAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storage_type" "storage_type" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "response_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "review" (
    "review_id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "comments" TEXT,
    "successor_review_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "rule" (
    "rule_id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_pkey" PRIMARY KEY ("rule_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "worker_email_key" ON "worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "worker_phone_key" ON "worker"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "review_successor_review_id_key" ON "review"("successor_review_id");

-- AddForeignKey
ALTER TABLE "geo" ADD CONSTRAINT "geo_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("workflow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("workflow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_geo_id_fkey" FOREIGN KEY ("geo_id") REFERENCES "geo"("geo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("workflow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_geo_id_fkey" FOREIGN KEY ("geo_id") REFERENCES "geo"("geo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_question" ADD CONSTRAINT "task_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_question" ADD CONSTRAINT "task_question_task_definition_id_fkey" FOREIGN KEY ("task_definition_id") REFERENCES "task_definition"("task_definition_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_definition" ADD CONSTRAINT "task_definition_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("workflow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_task_definition_id_fkey" FOREIGN KEY ("task_definition_id") REFERENCES "task_definition"("task_definition_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "worker"("worker_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("content_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "worker"("worker_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_successor_review_id_fkey" FOREIGN KEY ("successor_review_id") REFERENCES "review"("review_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "worker"("worker_id") ON DELETE RESTRICT ON UPDATE CASCADE;
