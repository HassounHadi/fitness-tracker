import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nutritionixDailyLimit, checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const parseNutritionSchema = z.object({
  query: z.string().min(1, "Query is required"),
});

/**
 * POST /api/nutrition/parse
 * Parses natural language food description using Nutritionix API
 * Returns nutritional information for the foods described
 * Rate limited to 500 requests/day
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check daily rate limit (500 requests/day)
    const rateLimitCheck = await checkRateLimit(nutritionixDailyLimit, userId, "Nutritionix API");
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const body = await req.json();
    const { query } = parseNutritionSchema.parse(body);

    // Call Nutritionix API
    const nutritionixResponse = await fetch(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.NUTRITIONIX_APP_ID!,
          "x-app-key": process.env.NUTRITIONIX_API_KEY!,
        },
        body: JSON.stringify({
          query: query,
        }),
      }
    );

    if (!nutritionixResponse.ok) {
      const error = await nutritionixResponse.json();
      console.error("Nutritionix API error:", error);
      return NextResponse.json(
        { error: "Failed to parse nutrition data" },
        { status: nutritionixResponse.status }
      );
    }

    const data = await nutritionixResponse.json();

    interface NutritionixFood {
      food_name: string;
      serving_qty: number;
      serving_unit: string;
      nf_calories: number;
      nf_protein: number;
      nf_total_carbohydrate: number;
      nf_total_fat: number;
      photo?: { thumb?: string };
    }

    interface ParsedFood {
      name: string;
      servingQty: number;
      servingUnit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      photo: string | null;
    }

    // Extract foods and calculate totals
    const foods: ParsedFood[] = data.foods.map((food: NutritionixFood) => ({
      name: food.food_name,
      servingQty: food.serving_qty,
      servingUnit: food.serving_unit,
      calories: Math.round(food.nf_calories),
      protein: Math.round(food.nf_protein),
      carbs: Math.round(food.nf_total_carbohydrate),
      fat: Math.round(food.nf_total_fat),
      photo: food.photo?.thumb || null,
    }));

    // Calculate totals
    const totals = foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return NextResponse.json(
      {
        foods,
        totals,
        originalQuery: query,
        rateLimit: {
          dailyRemaining: rateLimitCheck.headers["X-RateLimit-Remaining"],
        },
      },
      {
        headers: rateLimitCheck.headers,
      }
    );
  } catch (error) {
    console.error("Error parsing nutrition:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to parse nutrition data" },
      { status: 500 }
    );
  }
}
