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
      // Return existing workout log
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

      return NextResponse.json(existingLog);
    }

    // Create a new workout log with exercises and sets
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        templateId: scheduledWorkout.templateId,
        name: scheduledWorkout.template.name,
        date: scheduledWorkout.scheduledDate,
        exercises: {
          create: scheduledWorkout.template.exercises.map((templateEx, index) => ({
            exerciseId: templateEx.exerciseId,
            order: index,
            notes: templateEx.notes,
            sets: {
              create: Array.from({ length: templateEx.sets }, (_, setIndex) => ({
                setNumber: setIndex + 1,
                reps: 0, // Will be filled in as user logs
                weight: null,
                completed: false,
              })),
            },
          })),
        },
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

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error("Error starting workout:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start workout" },
      { status: 500 }
    );
  }
}
