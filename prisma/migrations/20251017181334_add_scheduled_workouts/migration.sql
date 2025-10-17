-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_idx" ON "ScheduledWorkout"("userId");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_scheduledDate_idx" ON "ScheduledWorkout"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledWorkout_userId_scheduledDate_key" ON "ScheduledWorkout"("userId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
