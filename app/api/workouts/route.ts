import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating a workout
const createWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  description: z.string().optional(),
  isAiGenerated: z.boolean().optional().default(false),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number().int().positive(),
      reps: z.number().int().positive(),
      restTime: z.number().int().min(0),
      notes: z.string().optional(),
    })
  ).min(1, "At least one exercise is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createWorkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, description, isAiGenerated, exercises } = validation.data;

    // Create workout template with exercises in a transaction
    const workout = await prisma.workoutTemplate.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        isAiGenerated: isAiGenerated ?? false,
        exercises: {
          create: exercises.map((exercise, index) => ({
            exerciseId: exercise.exerciseId,
            order: index,
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime,
            notes: exercise.notes || null,
          })),
        },
      },
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
    });

    return NextResponse.json({
      success: true,
      data: workout,
      message: "Workout created successfully",
    });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create workout",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const workouts = await prisma.workoutTemplate.findMany({
      where: {
        userId: session.user.id,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: workouts,
      message: "Workouts fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch workouts",
      },
      { status: 500 }
    );
  }
}
