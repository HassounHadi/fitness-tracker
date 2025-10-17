/*
  Warnings:

  - A unique constraint covering the columns `[workoutLogId]` on the table `ScheduledWorkout` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScheduledWorkout" ADD COLUMN     "workoutLogId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledWorkout_workoutLogId_key" ON "ScheduledWorkout"("workoutLogId");

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
