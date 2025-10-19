import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

/**
 * GET /api/workout-stats
 * Fetches workout statistics for charts
 * Query params: days (default: 30)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = startOfDay(subDays(new Date(), days));

    // Fetch completed workout logs with their exercises and sets
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        date: {
          gte: startDate,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate volume for each workout (total reps * weight)
    const volumeData = workoutLogs.map((log) => {
      const totalVolume = log.exercises.reduce((exerciseAcc, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setAcc, set) => {
          return setAcc + (set.reps * (set.weight || 0));
        }, 0);
        return exerciseAcc + exerciseVolume;
      }, 0);

      const totalSets = log.exercises.reduce((acc, exercise) => {
        return acc + exercise.sets.length;
      }, 0);

      const totalReps = log.exercises.reduce((exerciseAcc, exercise) => {
        return exerciseAcc + exercise.sets.reduce((setAcc, set) => {
          return setAcc + set.reps;
        }, 0);
      }, 0);

      return {
        date: log.date.toISOString(),
        volume: totalVolume,
        sets: totalSets,
        reps: totalReps,
        duration: log.duration || 0,
        exerciseCount: log.exercises.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: volumeData,
    });
  } catch (error) {
    console.error("Error fetching workout stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch workout stats",
      },
      { status: 500 }
    );
  }
}
