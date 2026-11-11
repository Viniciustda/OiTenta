-- CreateTable
CREATE TABLE "weekly_availabilities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "windows" JSONB NOT NULL,
    "daily_limit_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "weekly_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_blocks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL,
    "origin" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "scheduled_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weekly_availabilities_user_id_key" ON "weekly_availabilities"("user_id");

-- CreateIndex
CREATE INDEX "scheduled_blocks_user_id_start_idx" ON "scheduled_blocks"("user_id", "start");

-- AddForeignKey
ALTER TABLE "weekly_availabilities" ADD CONSTRAINT "weekly_availabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_blocks" ADD CONSTRAINT "scheduled_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
