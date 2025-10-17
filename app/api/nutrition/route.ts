import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

const createNutritionSchema = z.object({
  mealName: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  calories: z.number().int().min(0),
  protein: z.number().int().min(0),
  carbs: z.number().int().min(0),
  fat: z.number().int().min(0),
  date: z.string().optional(),
});

/**
 * GET /api/nutrition
 * Fetches nutrition logs for a user within a date range
 * Query params: startDate, endDate (optional, defaults to all logs)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {
      userId: session.user.id,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(nutritionLogs);
  } catch (error) {
    console.error("Error fetching nutrition logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nutrition
 * Creates a new nutrition log entry
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createNutritionSchema.parse(body);

    // Use provided date or today
    const logDate = validatedData.date
      ? new Date(validatedData.date)
      : new Date();

    // Create nutrition log
    const nutritionLog = await prisma.nutritionLog.create({
      data: {
        userId: session.user.id,
        date: logDate,
        mealName: validatedData.mealName,
        description: validatedData.description,
        calories: validatedData.calories,
        protein: validatedData.protein,
        carbs: validatedData.carbs,
        fat: validatedData.fat,
      },
    });

    return NextResponse.json(nutritionLog, { status: 201 });
  } catch (error) {
    console.error("Error creating nutrition log:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create nutrition log" },
      { status: 500 }
    );
  }
}
