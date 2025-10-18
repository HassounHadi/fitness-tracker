import { NextResponse } from "next/server";
import { generateAIContent } from "@/lib/ai";

interface ExerciseReference {
  id: string;
  name: string;
}

interface WorkoutRequest {
  goal: string;
  duration: number;
  targetMuscles: string[];
  instructions?: string;
  exercises: ExerciseReference[];
}

export async function POST(req: Request) {
  try {
    const body: WorkoutRequest = await req.json();
    const { goal, duration, targetMuscles, instructions, exercises } = body;

    // Create a simplified list with only IDs and names
    const exerciseList = exercises
      .map((ex) => `${ex.id}: ${ex.name}`)
      .join("\n");

    const prompt = `
You are a professional fitness coach. Create a personalized workout plan based on the user's goals.

USER INFORMATION:
- Fitness Goal: ${goal}
- Available Time: ${duration} minutes
- Target Muscle Groups: ${targetMuscles.join(", ")}
${instructions ? `- Additional Instructions: ${instructions}` : ""}

AVAILABLE EXERCISES (ID: Name):
${exerciseList}

TASK:
Select 5-8 exercises from the list above that best match the user's goals and target muscles.
For each exercise, specify the sets, reps, and rest time.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "workoutName": "Creative workout name based on the goal",
  "workoutDescription": "Brief description of the workout",
  "exercises": [
    {
      "exerciseId": "exercise_id_from_the_list",
      "sets": 3,
      "reps": 12,
      "restTime": 60,
      "notes": "Brief note about form or tempo"
    }
  ],
  "totalDuration": estimated_duration_in_minutes
}

Do not include any markdown, explanations, or text outside the JSON object.
`;

    const text = await generateAIContent(prompt);

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    // Parse the JSON response
    const workoutPlan = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      data: workoutPlan,
      message: "Workout generated successfully",
    });
  } catch (error) {
    console.error("Gemini workout generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate workout plan",
      },
      { status: 500 }
    );
  }
}
