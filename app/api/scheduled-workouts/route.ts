import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

// Validation schema for scheduling a workout
const scheduleWorkoutSchema = z.object({
  templateId: z.string(),
  scheduledDate: z.string().or(z.date()),
});

// GET: Fetch scheduled workouts for a date range
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const scheduledWorkouts = await prisma.scheduledWorkout.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
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
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: scheduledWorkouts,
    });
  } catch (error: any) {
    console.error("Error fetching scheduled workouts:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch scheduled workouts",
      },
      { status: 500 }
    );
  }
}

// POST: Schedule a workout for a specific date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = scheduleWorkoutSchema.safeParse(body);

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

    const { templateId, scheduledDate } = validation.data;
    const date = new Date(scheduledDate);

    // Normalize to start of day to ensure consistent date comparison
    const normalizedDate = startOfDay(date);

    // Check if template exists and belongs to user
    const template = await prisma.workoutTemplate.findFirst({
      where: {
        id: templateId,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Workout template not found" },
        { status: 404 }
      );
    }

    // Check if there's already a scheduled workout for this date
    const existing = await prisma.scheduledWorkout.findUnique({
      where: {
        userId_scheduledDate: {
          userId: session.user.id,
          scheduledDate: normalizedDate,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A workout is already scheduled for this date" },
        { status: 409 }
      );
    }

    // Create scheduled workout
    const scheduledWorkout = await prisma.scheduledWorkout.create({
      data: {
        userId: session.user.id,
        templateId,
        scheduledDate: normalizedDate,
      },
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

    return NextResponse.json({
      success: true,
      data: scheduledWorkout,
      message: "Workout scheduled successfully",
    });
  } catch (error: any) {
    console.error("Error scheduling workout:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to schedule workout",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a scheduled workout
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Scheduled workout ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const scheduledWorkout = await prisma.scheduledWorkout.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!scheduledWorkout) {
      return NextResponse.json(
        { success: false, message: "Scheduled workout not found" },
        { status: 404 }
      );
    }

    await prisma.scheduledWorkout.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled workout removed successfully",
    });
  } catch (error: any) {
    console.error("Error deleting scheduled workout:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete scheduled workout",
      },
      { status: 500 }
    );
  }
}
