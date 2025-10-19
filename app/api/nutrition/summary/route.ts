import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

/**
 * GET /api/nutrition/summary
 * Returns today's nutrition summary along with user's goals
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with their nutrition goals
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyCalorieGoal: true,
        proteinGoal: true,
        carbGoal: true,
        fatGoal: true,
      },
    });

    console.log("User nutrition goals from database:", user);
    console.log("Session user ID:", session.user.id);

    // Get today's nutrition logs
    const today = new Date();
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    // Calculate today's summary
    const summary = nutritionLogs.reduce(
      (acc, log) => ({
        totalCalories: acc.totalCalories + log.calories,
        totalProtein: acc.totalProtein + log.protein,
        totalCarbs: acc.totalCarbs + log.carbs,
        totalFat: acc.totalFat + log.fat,
        mealCount: acc.mealCount + 1,
      }),
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        summary,
        goals: {
          dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
          proteinGoal: user?.proteinGoal || 150,
          carbGoal: user?.carbGoal || 200,
          fatGoal: user?.fatGoal || 60,
        },
        logs: nutritionLogs,
      },
    });
  } catch (error) {
    console.error("Error fetching nutrition summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch nutrition summary",
      },
      { status: 500 }
    );
  }
}
