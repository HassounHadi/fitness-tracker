import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSetSchema = z.object({
  loggedExerciseId: z.string(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0),
  weight: z.number().optional().nullable(),
});

const updateSetSchema = z.object({
  setId: z.string(),
  reps: z.number().int().min(0),
  weight: z.number().optional().nullable(),
  completed: z.boolean().optional(),
});

/**
 * POST /api/workout-logs/sets
 * Creates a new logged set
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { loggedExerciseId, setNumber, reps, weight } = createSetSchema.parse(body);

    // Verify the logged exercise belongs to the user
    const loggedExercise = await prisma.loggedExercise.findUnique({
      where: { id: loggedExerciseId },
      include: {
        workoutLog: true,
      },
    });

    if (!loggedExercise) {
      return NextResponse.json(
        { error: "Logged exercise not found" },
        { status: 404 }
      );
    }

    if (loggedExercise.workoutLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if set already exists (idempotent)
    const existingSet = await prisma.loggedSet.findFirst({
      where: {
        loggedExerciseId,
        setNumber,
      },
    });

    if (existingSet) {
      // Update existing set
      const updatedSet = await prisma.loggedSet.update({
        where: { id: existingSet.id },
        data: {
          reps,
          weight,
          completed: true,
        },
      });
      return NextResponse.json(updatedSet);
    }

    // Create new set
    const newSet = await prisma.loggedSet.create({
      data: {
        loggedExerciseId,
        setNumber,
        reps,
        weight,
        completed: true,
      },
    });

    return NextResponse.json(newSet);
  } catch (error) {
    console.error("Error creating set:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create set",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workout-logs/sets
 * Updates a logged set with reps and weight
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { setId, reps, weight, completed } = updateSetSchema.parse(body);

    // Find the set and verify ownership
    const set = await prisma.loggedSet.findUnique({
      where: { id: setId },
      include: {
        loggedExercise: {
          include: {
            workoutLog: true,
          },
        },
      },
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    if (set.loggedExercise.workoutLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the set
    const updatedSet = await prisma.loggedSet.update({
      where: { id: setId },
      data: {
        reps,
        weight: weight ?? undefined,
        completed: completed ?? true, // Default to true when updating
      },
    });

    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error("Error updating set:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update set" },
      { status: 500 }
    );
  }
}
