import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMockWorkouts() {
  console.log("🏋️ Seeding mock workouts...");

  // Get a user from the database (assuming you have at least one)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("❌ No users found. Please create a user first.");
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Get some exercises from the database
  const exercises = await prisma.exercise.findMany({
    take: 20,
  });

  if (exercises.length === 0) {
    console.error("❌ No exercises found. Please seed exercises first.");
    return;
  }

  console.log(`✅ Found ${exercises.length} exercises`);

  // Create mock workouts
  const mockWorkouts = [
    {
      name: "Full Body Strength",
      description: "A comprehensive full-body workout focusing on compound movements",
      isAiGenerated: false,
      exercises: [
        { exerciseId: exercises[0]?.id, order: 1, sets: 3, reps: 12, restTime: 90 },
        { exerciseId: exercises[1]?.id, order: 2, sets: 3, reps: 10, restTime: 90 },
        { exerciseId: exercises[2]?.id, order: 3, sets: 4, reps: 8, restTime: 120 },
        { exerciseId: exercises[3]?.id, order: 4, sets: 3, reps: 15, restTime: 60 },
        { exerciseId: exercises[4]?.id, order: 5, sets: 3, reps: 12, restTime: 90 },
      ],
    },
    {
      name: "Upper Body Power",
      description: "Intense upper body workout for building strength and size",
      isAiGenerated: true,
      exercises: [
        { exerciseId: exercises[5]?.id, order: 1, sets: 4, reps: 6, restTime: 120 },
        { exerciseId: exercises[6]?.id, order: 2, sets: 3, reps: 8, restTime: 90 },
        { exerciseId: exercises[7]?.id, order: 3, sets: 3, reps: 10, restTime: 90 },
        { exerciseId: exercises[8]?.id, order: 4, sets: 3, reps: 12, restTime: 60 },
      ],
    },
    {
      name: "Core & Conditioning",
      description: "High-intensity core workout with cardio elements",
      isAiGenerated: true,
      exercises: [
        { exerciseId: exercises[9]?.id, order: 1, sets: 3, reps: 20, restTime: 45 },
        { exerciseId: exercises[10]?.id, order: 2, sets: 3, reps: 15, restTime: 45 },
        { exerciseId: exercises[11]?.id, order: 3, sets: 4, reps: 30, restTime: 30 },
      ],
    },
    {
      name: "Leg Day Destroyer",
      description: "Complete lower body workout targeting all major leg muscles",
      isAiGenerated: false,
      exercises: [
        { exerciseId: exercises[12]?.id, order: 1, sets: 4, reps: 8, restTime: 180 },
        { exerciseId: exercises[13]?.id, order: 2, sets: 3, reps: 10, restTime: 120 },
        { exerciseId: exercises[14]?.id, order: 3, sets: 3, reps: 12, restTime: 90 },
        { exerciseId: exercises[15]?.id, order: 4, sets: 3, reps: 15, restTime: 60 },
        { exerciseId: exercises[16]?.id, order: 5, sets: 3, reps: 20, restTime: 60 },
      ],
    },
    {
      name: "Quick Morning Workout",
      description: "Perfect 20-minute routine to start your day energized",
      isAiGenerated: true,
      exercises: [
        { exerciseId: exercises[17]?.id, order: 1, sets: 2, reps: 15, restTime: 30 },
        { exerciseId: exercises[18]?.id, order: 2, sets: 2, reps: 12, restTime: 30 },
        { exerciseId: exercises[19]?.id, order: 3, sets: 2, reps: 20, restTime: 30 },
      ],
    },
  ];

  // Create workouts
  for (const workout of mockWorkouts) {
    const { exercises: workoutExercises, ...workoutData } = workout;

    const createdWorkout = await prisma.workoutTemplate.create({
      data: {
        ...workoutData,
        userId: user.id,
        exercises: {
          create: workoutExercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            restTime: ex.restTime,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    console.log(
      `✅ Created workout: ${createdWorkout.name} with ${createdWorkout.exercises.length} exercises`
    );
  }

  console.log("🎉 Mock workouts seeded successfully!");
}

seedMockWorkouts()
  .catch((error) => {
    console.error("❌ Error seeding mock workouts:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
