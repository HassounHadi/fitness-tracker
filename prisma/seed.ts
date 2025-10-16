import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log("🌱 Starting database seed...");

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

  console.log("✅ Database cleaned successfully");

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

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
