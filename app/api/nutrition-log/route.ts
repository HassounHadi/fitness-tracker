// File: app/api/nutrition-log/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const appId = process.env.NUTRITIONIX_APP_ID;
    const apiKey = process.env.NUTRITIONIX_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Nutritionix credentials" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        method: "POST",
        headers: {
          "x-app-id": appId,
          "x-app-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    if (!data.foods || !Array.isArray(data.foods)) {
      return NextResponse.json(
        { error: "Invalid response from Nutritionix" },
        { status: 500 }
      );
    }

    // Compute totals
    const totals = data.foods.reduce(
      (acc: any, food: any) => {
        acc.calories += food.nf_calories || 0;
        acc.protein += food.nf_protein || 0;
        acc.carbs += food.nf_total_carbohydrate || 0;
        acc.fat += food.nf_total_fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // -------------------- DATABASE OPERATIONS HERE --------------------
    // At this point, you have all the values you need to store a nutrition log:

    // 1. Input from the user:
    //    - `query` (the text they entered describing the meal)

    // 2. Calculated nutritional values:
    //    - `totals.calories`
    //    - `totals.protein`
    //    - `totals.carbs`
    //    - `totals.fat`

    // Example (pseudo-code, depending on your ORM / DB setup):
    // await prisma.nutritionLog.create({
    //   data: {
    //     userId: "CURRENT_USER_ID",  // replace with actual user ID
    //     description: query,
    //     calories: totals.calories,
    //     protein: totals.protein,
    //     carbs: totals.carbs,
    //     fat: totals.fat,
    //     createdAt: new Date(),
    //   }
    // });

    // -------------------------------------------------------------------

    return NextResponse.json({
      totals,
      foods: data.foods.map((f: any) => ({
        name: f.food_name,
        calories: f.nf_calories,
        protein: f.nf_protein,
        carbs: f.nf_total_carbohydrate,
        fat: f.nf_total_fat,
      })),
    });
  } catch (error) {
    console.error("Nutritionix API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
