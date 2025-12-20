
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize the Google GenAI client using a factory function to ensure the latest API key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhances the report content using Gemini 3 Flash.
 */
export const enhanceReportContent = async (
  rawTitle: string,
  rawInfo: string
): Promise<any> => {
  const ai = getAI();
  
  const prompt = `
    Permurnikan butiran program sekolah berikut untuk SK ALL SAINTS menjadi laporan gaya infografik yang ringkas dan profesional dalam BAHASA MALAYSIA.
    - Tajuk: ${rawTitle}
    - Maklumat: ${rawInfo}
    
    Pastikan ia padat, menggunakan perkataan yang minima tetapi berimpak. Sediakan tajuk yang dimurnikan, huraian pendek (maksimum 2 ayat), 
    satu objektif utama, dan satu kenyataan impak ringkas. SEMUA OUTPUT MESTI DALAM BAHASA MALAYSIA.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Recommended: Use responseSchema for structured JSON output
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            objective: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "description", "objective", "impact"]
        }
      }
    });

    // Directly access the .text property of GenerateContentResponse
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

/**
 * Detects the focal point (most prominent faces/people) in an image using Gemini 3 Flash.
 */
export const detectFocalPoint = async (base64Data: string, mimeType: string): Promise<{x: number, y: number} | null> => {
  const ai = getAI();
  
  const imagePart = {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: "Identify the bounding box of the most prominent face or group of people in this image. Return the center coordinates as percentages (0-100) for x (horizontal) and y (vertical). Output strictly as JSON: { \"x\": number, \"y\": number }."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        // Recommended: Use responseSchema to ensure the output matches the expected JSON structure
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER }
          },
          required: ["x", "y"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Focal Point Error:", error);
    return { x: 50, y: 50 }; // Default to center on error
  }
};
