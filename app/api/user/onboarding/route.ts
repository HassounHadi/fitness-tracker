import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        height: data.height,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        fitnessGoal: data.fitnessGoal,
        fitnessLevel: data.fitnessLevel,
        availableEquipment: data.availableEquipment,
        dailyCalorieGoal: data.dailyCalorieGoal,
        proteinGoal: data.proteinGoal,
        carbGoal: data.carbGoal,
        fatGoal: data.fatGoal,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
