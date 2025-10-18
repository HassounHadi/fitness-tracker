import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSetSchema = z.object({
  setId: z.string(),
  reps: z.number().int().min(0),
  weight: z.number().optional().nullable(),
  completed: z.boolean().optional(),
});

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
