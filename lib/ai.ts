import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Export the model instance (singleton)
export const aiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// Helper function for generating content
export async function generateAIContent(prompt: string) {
  const result = await aiModel.generateContent(prompt);
  return result.response.text();
}
