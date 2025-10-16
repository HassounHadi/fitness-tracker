import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExerciseDBResponse {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

async function fetchExercises() {
  const apiKey = process.env.EXERCISEDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "EXERCISEDB_API_KEY is not set in environment variables. Please add it to your .env file."
    );
  }

  console.log("Fetching exercises from ExerciseDB API...");

  try {
    const response = await fetch(
      "https://exercisedb.p.rapidapi.com/exercises?limit=1324",
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch exercises: ${response.status} ${response.statusText}`
      );
    }

    const exercises: ExerciseDBResponse[] = await response.json();
    console.log(`✓ Fetched ${exercises.length} exercises from API`);

    return exercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
}

async function seedExercises() {
  try {
    console.log("🚀 Starting ExerciseDB seeding process...\n");

    // Fetch exercises from API
    const exercises = await fetchExercises();

    console.log("\n🗄️  Seeding exercises to database...");

    let successCount = 0;
    let errorCount = 0;

    // Seed exercises in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);

      const promises = batch.map(async (exercise) => {
        try {
          await prisma.exercise.upsert({
            where: { apiId: exercise.id },
            update: {
              name: exercise.name,
              bodyPart: exercise.bodyPart,
              equipment: exercise.equipment,
              target: exercise.target,
              secondaryMuscles: exercise.secondaryMuscles,
              instructions: exercise.instructions,
              gifUrl: exercise.gifUrl,
            },
            create: {
              apiId: exercise.id,
              name: exercise.name,
              bodyPart: exercise.bodyPart,
              equipment: exercise.equipment,
              target: exercise.target,
              secondaryMuscles: exercise.secondaryMuscles,
              instructions: exercise.instructions,
              gifUrl: exercise.gifUrl,
            },
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `Error seeding exercise ${exercise.name}:`,
            error instanceof Error ? error.message : error
          );
        }
      });

      await Promise.all(promises);

      // Progress indicator
      const progress = Math.min(i + batchSize, exercises.length);
      console.log(`Progress: ${progress}/${exercises.length} exercises`);
    }

    console.log("\n✅ Seeding completed!");
    console.log(`   Successfully seeded: ${successCount} exercises`);
    if (errorCount > 0) {
      console.log(`   Failed: ${errorCount} exercises`);
    }

    // Display some stats
    const stats = await prisma.exercise.groupBy({
      by: ["bodyPart"],
      _count: true,
    });

    console.log("\n📊 Exercise breakdown by body part:");
    stats.forEach((stat) => {
      console.log(`   ${stat.bodyPart}: ${stat._count} exercises`);
    });
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises();
