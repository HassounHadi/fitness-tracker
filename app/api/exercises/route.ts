import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const bodyPart = searchParams.get("bodyPart");
    const equipment = searchParams.get("equipment");
    const target = searchParams.get("target");

    // Build where clause based on filters
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch exercises",
      },
      { status: 500 }
    );
  }
}
