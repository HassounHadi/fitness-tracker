import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const startWorkoutSchema = z.object({
  scheduledWorkoutId: z.string(),
});

/**
 * POST /api/workout-logs/start
 * Starts a workout from a scheduled workout
 * Creates a WorkoutLog and initializes LoggedExercises with sets
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scheduledWorkoutId } = startWorkoutSchema.parse(body);

    // Fetch the scheduled workout with template and exercises
    const scheduledWorkout = await prisma.scheduledWorkout.findUnique({
      where: { id: scheduledWorkoutId },
      include: {
        template: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!scheduledWorkout) {
      return NextResponse.json(
        { error: "Scheduled workout not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (scheduledWorkout.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if workout already started
    if (scheduledWorkout.workoutLogId) {
      // Return existing workout log with exercises
      const existingLog = await prisma.workoutLog.findUnique({
        where: { id: scheduledWorkout.workoutLogId },
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

      // Return the log with template exercises info for the UI
      return NextResponse.json({
        success: true,
        message: "Workout already started",
        data: {
          ...existingLog,
          templateExercises: scheduledWorkout.template.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exercise: ex.exercise,
            sets: ex.sets,
            reps: ex.reps,
            notes: ex.notes,
          })),
        },
      });
    }

    // Create a new workout log WITHOUT exercises (incremental approach)
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        templateId: scheduledWorkout.templateId,
        name: scheduledWorkout.template.name,
        date: scheduledWorkout.scheduledDate,
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

    // Link the workout log to the scheduled workout
    await prisma.scheduledWorkout.update({
      where: { id: scheduledWorkoutId },
      data: {
        workoutLogId: workoutLog.id,
      },
    });

    // Return the log with template exercises for the UI to know what to log
    return NextResponse.json({
      success: true,
      message: "Workout started successfully",
      data: {
        ...workoutLog,
        templateExercises: scheduledWorkout.template.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          exercise: ex.exercise,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
        })),
      },
    });
  } catch (error) {
    console.error("Error starting workout:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    // Return detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Detailed error:", {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    return NextResponse.json(
      {
        error: "Failed to start workout",
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
