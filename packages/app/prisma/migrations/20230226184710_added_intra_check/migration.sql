-- CreateTable
CREATE TABLE "intra_pair_job" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "url" TEXT NOT NULL,
    "method" "request_method" NOT NULL DEFAULT 'POST',
    "secret" VARCHAR(255),
    "headers" JSONB,
    "event" "events" NOT NULL,
    "group_size" INTEGER NOT NULL DEFAULT 6,

    CONSTRAINT "intra_pair_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intra_pair_file" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "file_type" "file_type" NOT NULL DEFAULT 'audio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "obj_status" NOT NULL DEFAULT 'active',
    "workflow_id" INTEGER NOT NULL,
    "file_duration" DOUBLE PRECISION,
    "district" TEXT,
    "state" TEXT,
    "vendor" TEXT,
    "metadata" JSONB,
    "cosine_score" DOUBLE PRECISION,
    "is_reference" BOOLEAN NOT NULL DEFAULT false,
    "is_similar" BOOLEAN NOT NULL DEFAULT false,
    "intra_pair_job_id" INTEGER NOT NULL,

    CONSTRAINT "intra_pair_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intra_pair_job_assignment" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'pending',
    "intra_pair_job_id" INTEGER NOT NULL,
    "assignee_id" INTEGER NOT NULL,
    "workflow_file_id" INTEGER NOT NULL,
    "review_rating" INTEGER,
    "review_comments" TEXT,

    CONSTRAINT "intra_pair_job_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intra_pair_job_uuid_key" ON "intra_pair_job"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "intra_pair_file_uuid_key" ON "intra_pair_file"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "intra_pair_job_assignment_uuid_key" ON "intra_pair_job_assignment"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "intra_pair_job_assignment_assignee_id_workflow_file_id_intr_key" ON "intra_pair_job_assignment"("assignee_id", "workflow_file_id", "intra_pair_job_id");

-- AddForeignKey
ALTER TABLE "intra_pair_file" ADD CONSTRAINT "intra_pair_file_intra_pair_job_id_fkey" FOREIGN KEY ("intra_pair_job_id") REFERENCES "intra_pair_job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intra_pair_job_assignment" ADD CONSTRAINT "intra_pair_job_assignment_intra_pair_job_id_fkey" FOREIGN KEY ("intra_pair_job_id") REFERENCES "intra_pair_job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intra_pair_job_assignment" ADD CONSTRAINT "intra_pair_job_assignment_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
