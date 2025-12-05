import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateUXScript = async (context: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key not found.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: The user is building a prototype for a web application. 
      Screen Description/Flow: ${context}
      
      Task: Generate a concise User Testing Script (3-5 questions) that a researcher should ask a participant while testing this specific flow. Focus on usability, clarity, and user sentiment.
      Format: Markdown.`,
      config: {
        systemInstruction: "You are an expert UX Researcher assisting in usability testing.",
        temperature: 0.7,
      }
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate script. Please check your API key.";
  }
};

export const analyzeScreen = async (imageData: string, description: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Error: API Key not found.";

    try {
        // Strip header if present
        const base64Data = imageData.split(',')[1] || imageData;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: `Analyze this UI screen. Description provided: ${description}. Give 3 specific heuristic improvements.` }
                ]
            }
        });

        return response.text || "No analysis available.";
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return "Failed to analyze image.";
    }
}
