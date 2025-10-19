import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAIContent } from "@/lib/ai";
import { geminiMinuteLimit, geminiDailyLimit, checkRateLimit } from "@/lib/rate-limit";

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
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Debug logging
    console.log("🔍 Rate limit check for user:", userId);

    // Check minute rate limit (15 requests/minute)
    const minuteCheck = await checkRateLimit(geminiMinuteLimit, userId, "Gemini AI (per minute)");
    console.log("⏱️ Minute limit check:", minuteCheck);

    if (!minuteCheck.allowed) {
      console.log("🚫 MINUTE RATE LIMIT EXCEEDED");
      return minuteCheck.response!;
    }

    // Check daily rate limit (1500 requests/day)
    const dailyCheck = await checkRateLimit(geminiDailyLimit, userId, "Gemini AI (daily)");
    console.log("📅 Daily limit check:", dailyCheck);

    if (!dailyCheck.allowed) {
      console.log("🚫 DAILY RATE LIMIT EXCEEDED");
      return dailyCheck.response!;
    }

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

    return NextResponse.json(
      {
        success: true,
        data: workoutPlan,
        message: "Workout generated successfully",
        rateLimit: {
          minuteRemaining: minuteCheck.headers["X-RateLimit-Remaining"],
          dailyRemaining: dailyCheck.headers["X-RateLimit-Remaining"],
        },
      },
      {
        headers: {
          ...minuteCheck.headers,
          "X-RateLimit-Daily-Remaining": dailyCheck.headers["X-RateLimit-Remaining"],
        },
      }
    );
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
