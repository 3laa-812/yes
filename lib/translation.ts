import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

export async function translateText(
  text: string,
  targetLang: "ar" | "en" = "ar"
): Promise<string> {
  if (!text) return "";
  
  if (!model) {
    console.warn("Gemini API Key not found. Returning original text with prefix.");
    return `[${targetLang.toUpperCase()}] ${text}`;
  }

  try {
    const prompt = `You are a professional translator. Translate the following text to ${
      targetLang === "ar" ? "Arabic" : "English"
    }. Return ONLY the translated text, no keys, no markdown, no explanations, no quotes. Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Fallback to original text on error
  }
}
