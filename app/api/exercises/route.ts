import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const bodyPart = searchParams.get("bodyPart");
    const equipment = searchParams.get("equipment");
    const target = searchParams.get("target");

    // Build where clause based on filters
    const where: Prisma.ExerciseWhereInput = {};

    if (search) {
      // Normalize search: remove extra spaces, handle hyphens and spaces
      const normalizedSearch = search.trim().toLowerCase();

      // Search by replacing spaces/hyphens interchangeably
      where.OR = [
        {
          name: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: normalizedSearch.replace(/\s+/g, "-"),
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: normalizedSearch.replace(/-/g, " "),
            mode: "insensitive",
          },
        },
      ];
    }

    if (bodyPart) {
      where.bodyPart = bodyPart;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (target) {
      where.target = target;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: exercises,
      message: "Exercises fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch exercises",
      },
      { status: 500 }
    );
  }
}
