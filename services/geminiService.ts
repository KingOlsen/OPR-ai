import { GoogleGenAI, Type } from "@google/genai";

export const enhanceReportContent = async (
  rawTitle: string,
  rawInfo: string
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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