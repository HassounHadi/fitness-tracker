import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const completeWorkoutSchema = z.object({
  workoutLogId: z.string(),
  duration: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/workout-logs/complete
 * Marks a workout as completed and updates the scheduled workout
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workoutLogId, duration, notes } = completeWorkoutSchema.parse(body);

    // Find the workout log and verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLogId },
      include: {
        scheduledWorkout: true,
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (workoutLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the workout log to completed
    const updatedLog = await prisma.workoutLog.update({
      where: { id: workoutLogId },
      data: {
        completed: true,
        duration: duration ?? undefined,
        notes: notes ?? undefined,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: {
                setNumber: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Update the scheduled workout to completed if it exists
    if (workoutLog.scheduledWorkout) {
      await prisma.scheduledWorkout.update({
        where: { id: workoutLog.scheduledWorkout.id },
        data: {
          completed: true,
        },
      });
    }

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error completing workout:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to complete workout" },
      { status: 500 }
    );
  }
}
