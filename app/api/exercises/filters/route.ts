import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all exercises to extract unique filter values
    const exercises = await prisma.exercise.findMany({
      select: {
        bodyPart: true,
        equipment: true,
        target: true,
      },
    });

    // Extract unique values for each filter category
    const bodyParts = [
      ...new Set(exercises.map((ex) => ex.bodyPart)),
    ].sort();

    const equipments = [
      ...new Set(exercises.map((ex) => ex.equipment)),
    ].sort();

    const targets = [...new Set(exercises.map((ex) => ex.target))].sort();

    return NextResponse.json({
      success: true,
      data: {
        bodyParts,
        equipments,
        targets,
      },
      message: "Filters fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch filters",
      },
      { status: 500 }
    );
  }
}
