import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const startExerciseSchema = z.object({
  workoutLogId: z.string(),
  exerciseId: z.string(),
  order: z.number(),
  notes: z.string().optional(),
});

/**
 * POST /api/workout-logs/exercise
 * Starts a new exercise in the workout log
 * Creates a LoggedExercise entry
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workoutLogId, exerciseId, order, notes } = startExerciseSchema.parse(body);

    // Verify workout log belongs to user
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLogId },
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

    // Check if exercise already exists (idempotent)
    const existingExercise = await prisma.loggedExercise.findFirst({
      where: {
        workoutLogId,
        exerciseId,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: {
            setNumber: "asc",
          },
        },
      },
    });

    if (existingExercise) {
      return NextResponse.json({
        success: true,
        message: "Exercise already started",
        data: existingExercise,
      });
    }

    // Create the logged exercise (no sets yet)
    const loggedExercise = await prisma.loggedExercise.create({
      data: {
        workoutLogId,
        exerciseId,
        order,
        notes,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: {
            setNumber: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Exercise started successfully",
      data: loggedExercise,
    });
  } catch (error) {
    console.error("Error starting exercise:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Detailed error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to start exercise",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
