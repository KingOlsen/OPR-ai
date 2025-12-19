
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

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
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Focal Point Error:", error);
    return { x: 50, y: 50 }; // Default to center on error
  }
};
