import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

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
    console.warn(
      "⚠️  EXERCISEDB_API_KEY not found. Skipping exercise seeding."
    );
    return null;
  }

  console.log("📥 Fetching exercises from ExerciseDB API...");

  try {
    // Fetch all exercises (1324 as per ExerciseDB)
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

    const exercisesList: any[] = await response.json();
    console.log(`✓ Fetched ${exercisesList.length} exercises from API`);

    // Check if we got all exercises or if there's a limit
    if (exercisesList.length < 1324) {
      console.warn(`⚠️  Only received ${exercisesList.length} exercises. Your API plan might have a limit.`);
      console.warn("⚠️  Consider upgrading your RapidAPI subscription for full access.");
    }

    // Generate GIF URLs based on exercise ID pattern
    // ExerciseDB GIFs follow pattern: https://v2.exercisedb.io/image/{id}
    console.log("🖼️  Generating GIF URLs for exercises...");
    const exercises: ExerciseDBResponse[] = exercisesList.map((ex) => ({
      ...ex,
      gifUrl: `https://v2.exercisedb.io/image/${ex.id}`,
    }));

    console.log(`✓ Processed ${exercises.length} exercises with GIF URLs`);

    return exercises;
  } catch (error) {
    console.error("❌ Error fetching exercises:", error);
    return null;
  }
}

async function seedExercises() {
  const exercises = await fetchExercises();

  if (!exercises || exercises.length === 0) {
    console.log("⏭️  Skipping exercise seeding");
    return;
  }

  console.log("💪 Seeding exercises to database...");

  let successCount = 0;
  let errorCount = 0;

  // Seed exercises in batches
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

    const progress = Math.min(i + batchSize, exercises.length);
    console.log(`   Progress: ${progress}/${exercises.length} exercises`);
  }

  console.log(`✅ Successfully seeded ${successCount} exercises`);
  if (errorCount > 0) {
    console.log(`⚠️  Failed to seed ${errorCount} exercises`);
  }

  // Display stats
  const stats = await prisma.exercise.groupBy({
    by: ["bodyPart"],
    _count: true,
  });

  console.log("\n📊 Exercise breakdown by body part:");
  stats.forEach((stat) => {
    console.log(`   ${stat.bodyPart}: ${stat._count} exercises`);
  });
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clean up existing data in correct order (respecting foreign key constraints)
  console.log("🧹 Cleaning up existing data...");

  await prisma.$transaction([
    prisma.loggedSet.deleteMany(),
    prisma.loggedExercise.deleteMany(),
    prisma.workoutLog.deleteMany(),
    prisma.templateExercise.deleteMany(),
    prisma.workoutTemplate.deleteMany(),
    prisma.savedExercise.deleteMany(),
    prisma.nutritionLog.deleteMany(),
    prisma.progressLog.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("✅ Database cleaned successfully\n");

  // Seed exercises from ExerciseDB API
  await seedExercises();

  // Optional: Create demo user (uncomment if needed)
  /*
  console.log('👤 Creating demo user...')

  const hashedPassword = await bcrypt.hash('demo123456', 10)

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@fitness.com',
      password: hashedPassword,
      name: 'Demo User',
      fitnessGoal: 'build_muscle',
      fitnessLevel: 'intermediate',
      availableEquipment: ['barbell', 'dumbbell', 'bodyweight'],
      height: 175,
      currentWeight: 75,
      targetWeight: 80,
      dailyCalorieGoal: 2500,
      proteinGoal: 150,
      carbGoal: 250,
      fatGoal: 80,
    },
  })

  console.log('✅ Demo user created:', demoUser.email)
  */

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
