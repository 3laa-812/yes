import { OpenAI } from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function translateText(
  text: string,
  targetLang: "ar" | "en" = "ar"
): Promise<string> {
  if (!text) return "";
  
  if (!openai) {
    console.warn("OpenAI API Key not found. Returning original text with prefix.");
    return `[${targetLang.toUpperCase()}] ${text}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${
            targetLang === "ar" ? "Arabic" : "English"
          }. Return ONLY the translated text, no keys, no markdown, no explanations.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Fallback to original text on error
  }
}
