## MUST DO

Run `pnpm install` to add all dependencies

## 🚀 Features Overview

This fitness tracker web app provides a complete end-to-end experience for managing workouts, tracking nutrition, and visualizing fitness progress — all in one intuitive dashboard.

---

## 🧭 Onboarding Flow

The onboarding flow runs automatically for first-time users after signing in with Google.  
It collects basic fitness and nutrition preferences to personalize their dashboard.

### 🔹 Overview

1. User signs up or logs in using **Google OAuth** (handled by NextAuth).
2. The system checks if `onboardingComplete` is `false`.
3. If not completed, the user is redirected to `/onboarding`.
4. The onboarding wizard collects:
   - Profile info (name, height, weight, goals)
   - Fitness level
   - Available equipment
   - Nutrition targets
5. Submitting the onboarding form updates the user record and redirects to `/dashboard`.

### 🔹 Tech Details

- **Auth**: NextAuth (Google provider)
- **State Management**: React Hook Form + Zod validation
- **API Endpoint**: `/api/onboarding`
- **Database**: Prisma model includes `onboardingComplete` flag
- **Mutation Hook**: `useOnboarding()` (React Query)

### 🔹 Example Prisma Schema

```prisma
model User {
  id                 String  @id @default(cuid())
  name               String?
  email              String? @unique
  image              String?
  onboardingComplete Boolean  @default(false)
}

---

### 🏠 Dashboard Overview

The **Dashboard** serves as the central hub of the fitness tracker, giving users an at-a-glance summary of their daily activity, workouts, and nutrition progress.

#### ✨ Features

- **Daily Nutrition Logger:**
  Displays the user’s total protein, carbohydrates, fats, and calories consumed for the current day, visualized through interactive circular progress rings.
  Each macronutrient is compared to the user’s daily goals for easy tracking.

- **Meal Logging:**
  Includes a “Log Meal” button that opens a dialog where users can enter a meal name and a description of what they ate.
  Upon submission, the app integrates with the **Nutritionix API** to automatically analyze and retrieve nutritional values for the entered meal.
  These details are then saved to the user’s nutrition log in the database for tracking progress over time.

- **Today’s Workout Summary:**
  Displays today’s scheduled workout with its name, number of exercises, and estimated duration.
  Users can directly start the workout or view a completion status if it’s already done.
  If no workout is scheduled, a friendly prompt allows the user to navigate to the calendar to schedule one.

- **Dynamic Data Updates:**
  Both workouts and nutrition data are fetched in real-time from the backend using custom hooks (`useScheduledWorkouts` and `useTodaysNutrition`), ensuring the dashboard always reflects the latest user data.

---

### 💪 Exercise Library

The **Exercise Library** page allows users to explore, search, and filter through the full list of exercises stored in the database, making it easy to build custom workouts.

#### ✨ Features

- **Search & Filter System:**
  Users can search for exercises by name or apply filters such as body part, equipment type, or target muscle.
  A debounce mechanism ensures smooth, optimized searching.

- **Exercise Details:**
  Each exercise card includes a “View Details” button that opens a modal with complete information about the selected exercise — including instructions, target muscles, and equipment needed.

- **Workout Builder Integration:**
  From the exercise detail modal, users can add exercises to a **Workout Builder Sidebar** (functioning like an e-commerce cart).
  Inside the sidebar, users can adjust the number of sets and reps for each selected exercise.

- **Save Custom Workouts:**
  Once all exercises are added and configured, the user can press **“Save Workout”** to store the new workout in their profile within the database.

- **Responsive & Interactive UI:**
  The page includes animated loaders, dynamic data fetching through React Query (`useExercises`), and smooth transitions for filter toggles and modal interactions.

---

### 🧠 Workouts & AI Workout Generator

The **Workouts** page gives users access to all their saved workouts while also offering the ability to generate new ones automatically using AI.

#### ✨ Features

- **Workout Library:**
  Displays all existing workouts in a clean, responsive grid of cards.
  Each card shows key details such as workout name, exercise count, and duration.

- **Workout Details Modal:**
  Each card includes a **“View Details”** button that opens a modal showing full details about the workout, including exercises, sets, reps, and any notes.

- **AI Workout Generation:**
  A **“Generate AI Workout”** button allows users to instantly create a new workout using AI.
  When clicked, it opens a dedicated page with three main sections:

  1. **Exercise List:**
     Displays all available exercises from the database that the AI can choose from.

  2. **Workout Builder:**
     Acts like an interactive editor where users can add, remove, or reorder exercises and define sets and reps before saving.

  3. **AI Generator Panel:**
     Allows users to input their **fitness goal**, **desired workout duration**, **target muscle groups**, and **additional instructions**.
     Once submitted, a request is sent to the **Gemini AI API**, which receives both the user’s input and the list of available exercises to generate a complete, tailored workout plan.

- **Editable AI Results:**
  After receiving the AI-generated workout, users can review it directly in the Workout Builder.
  If satisfied, they can save it to their profile immediately.
  Otherwise, they can **drag and drop** exercises to rearrange, edit, or customize the plan before saving.

- **Error Handling & Loading States:**
  Includes loading indicators, error messages, and smooth modal transitions for a polished user experience.

---

### 📅 Workout Calendar

The **Workout Calendar** helps users plan and manage their training week visually, providing an overview of upcoming and completed workouts.

#### ✨ Features

- **Weekly View:**
  Displays a 7-day calendar starting from the current day, showing all scheduled workouts for the week.

- **Workout Details:**
  When selecting a day, if a workout is scheduled, its full details (name, exercises, duration, and status) are displayed in a side panel.

- **Add Workout Dialog:**
  Includes a button that allows users to quickly add a new workout to any day through a modal dialog, making scheduling fast and convenient.

- **Active Workout Integration:**
  If a selected day has a scheduled workout, the user can start it directly by pressing the **“Start Workout”** button.
  This redirects them to the **Active Workout Page**, where they can log their sets and track real-time progress.

- **Real-Time Data Fetching:**
  Scheduled workouts are loaded dynamically from the database using `useScheduledWorkouts`, ensuring an always up-to-date view.

---

### 🏋️ Active Workout Tracker

The **Active Workout Page** guides users through their workout in real time, step-by-step, from warm-up to completion.

#### ✨ Features

- **Sequential Exercise Flow:**
  The page presents one exercise at a time in the correct order.
  Users start an exercise, perform their sets, and log them before automatically progressing to the next.

- **Set Logging Dialog:**
  Each set is logged individually using a dedicated dialog form where users input **reps** and optionally **weight (kg)**.
  Logged sets are displayed instantly under the exercise for progress visibility.

- **Automatic Workout Logging:**
  Each action — starting the workout, beginning an exercise, or logging a set — triggers corresponding API calls
  (`useStartWorkout`, `useStartExercise`, `useCreateSet`, and `useCompleteWorkout`) to persist progress to the database.

- **Completion Flow:**
  When all exercises and sets are completed, a summary screen is shown with the option to **finish and save** the workout.
  Upon saving, the user is redirected back to the **Calendar** or **Dashboard**.

- **Progress Tracking:**
  Each logged set is visually listed for quick reference.
  The page keeps track of which sets and exercises are complete, providing a clear sense of progression.

- **Smooth UI Experience:**
  Includes loaders, dialog animations, and clean visual components for exercises and workout information,
  ensuring a motivating and distraction-free logging experience.

---

---

### 🧭 Progress Tracking

The **Progress Page** provides an overview of the user’s fitness journey, visualized through their logged body metrics and improvement trends.

#### Features

- **Stat Overview Cards**

  - **Current Weight** (with comparison to previous and target weight)
  - **Body Fat Percentage** (trend analysis)
  - **Total Progress Entries** (number of logs and last update date)

- **Measurements Display**

  - Shows the most recent measurements for:
    **Chest**, **Waist**, **Hips**, **Biceps**, and **Thighs** (in cm)

- **Progress Logging**

  - The **“Log Progress”** button opens a dialog form where users can enter:
    - Current **weight (kg)**
    - **Body fat %**
    - Body measurements (**chest, waist, hips, biceps, thighs** in cm)
    - Optional **notes**
  - When submitted, this data is saved to the database and automatically updates the progress overview.

- **Trend Indicators**
  - Weight and body fat trends are calculated by comparing the two most recent progress entries.
  - Decreases in weight or body fat are shown as positive progress.

#### Technical Notes

- Data fetching is handled via:
  - `useLatestProgress()` → retrieves the most recent log.
  - `useProgressLogs()` → retrieves all user progress entries.
- Trend logic is computed using `useMemo` to compare the last two logs.
- The log dialog form (`ProgressLogDialog`) handles data submission and refreshes the state upon success.

---
```
