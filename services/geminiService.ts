import { GoogleGenAI } from "@google/genai";
import { JournalEntry } from '../types';

export const generateInsights = async (entries: JournalEntry[]) => {
  if (!entries || entries.length === 0) return null;

  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Filter last 30 days
  const recentEntries = entries.slice(0, 30);
  
  // Optimize token usage by sending only necessary fields
  const simplifiedEntries = recentEntries.map(e => ({
    dt: e.date.split('T')[0], // Just the date
    w: e.workedWell,
    h: e.madeHappy,
    g: e.gratefulFor,
    m: e.mood,
    n: e.moodNote 
  }));

  const promptText = `
    Analyze these gratitude journal entries. Return JSON with two summaries (max 2 sentences each).
    
    Entries:
    ${JSON.stringify(simplifiedEntries)}

    Output Format (JSON):
    {
      "workedWellSummary": "Summary of positives...",
      "challengesSummary": "Summary of challenges/moods..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Gemini AI generation failed:", error);
    return null;
  }
};