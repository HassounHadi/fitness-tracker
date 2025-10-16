import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        {
          success: false,
          message: "Exercise not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exercise,
      message: "Exercise fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch exercise",
      },
      { status: 500 }
    );
  }
}
