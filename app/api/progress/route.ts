import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

const createProgressSchema = z.object({
  date: z.string().optional(),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  biceps: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/progress
 * Fetches progress logs for a user within a date range
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

    const progressLogs = await prisma.progressLog.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error("Error fetching progress logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Creates a new progress log entry
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createProgressSchema.parse(body);

    // Use provided date or today
    const logDate = validatedData.date
      ? startOfDay(new Date(validatedData.date))
      : startOfDay(new Date());

    // Check if a progress log already exists for this date
    const existingLog = await prisma.progressLog.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(logDate),
          lte: endOfDay(logDate),
        },
      },
    });

    if (existingLog) {
      // Update existing log
      const updatedLog = await prisma.progressLog.update({
        where: { id: existingLog.id },
        data: {
          weight: validatedData.weight ?? existingLog.weight,
          bodyFat: validatedData.bodyFat ?? existingLog.bodyFat,
          chest: validatedData.chest ?? existingLog.chest,
          waist: validatedData.waist ?? existingLog.waist,
          hips: validatedData.hips ?? existingLog.hips,
          biceps: validatedData.biceps ?? existingLog.biceps,
          thighs: validatedData.thighs ?? existingLog.thighs,
          photoUrl: validatedData.photoUrl ?? existingLog.photoUrl,
          notes: validatedData.notes ?? existingLog.notes,
        },
      });

      return NextResponse.json(updatedLog);
    }

    // Create new progress log
    const progressLog = await prisma.progressLog.create({
      data: {
        userId: session.user.id,
        date: logDate,
        weight: validatedData.weight,
        bodyFat: validatedData.bodyFat,
        chest: validatedData.chest,
        waist: validatedData.waist,
        hips: validatedData.hips,
        biceps: validatedData.biceps,
        thighs: validatedData.thighs,
        photoUrl: validatedData.photoUrl,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(progressLog, { status: 201 });
  } catch (error) {
    console.error("Error creating progress log:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create progress log" },
      { status: 500 }
    );
  }
}
