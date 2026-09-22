import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Cheia GEMINI_API_KEY nu este configurată în Netlify. Adăugați variabila de mediu GEMINI_API_KEY în panoul Netlify (Site configuration -> Environment variables)."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const handler = async (event: any) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  try {
    const ai = getAi();
    const payload = JSON.parse(event.body || "{}");
    const {
      prompt,
      conversationHistory = [],
      clasa = "Clasa a VII-a",
      oreSaptamana = 2,
      disciplina = "Limba și literatura română",
      headerData = {},
      attachedFiles = [],
    } = payload;

    const userParts: any[] = [];
    userParts.push({
      text: `Context didactic: Disciplina ${disciplina}, Clasa ${clasa}, ${oreSaptamana} ore/săpt., An școlar 2026-2027.\nÎntrebare / Solicitare: ${prompt}`,
    });

    if (Array.isArray(attachedFiles)) {
      for (const file of attachedFiles) {
        if (file.data) {
          const rawType = (file.type || "").toLowerCase();
          const name = (file.name || "").toLowerCase();
          let mime = null;
          if (rawType.includes("pdf") || name.endsWith(".pdf")) mime = "application/pdf";
          else if (rawType.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(name)) {
            mime = rawType.includes("png") ? "image/png" : "image/jpeg";
          }
          if (mime) {
            const cleanData = file.data.includes(",") ? file.data.split(",")[1] : file.data;
            userParts.push({ inlineData: { mimeType: mime, data: cleanData } });
          }
        }
      }
    }

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({ role: "user", parts: userParts });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: `Ești Asistentul Metodist EduMetodist România pentru cadre didactice. Oferi răspunsuri clare, metodice și concrete conform normelor MEC 2026-2027.`,
        temperature: 0.3,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: response.text || "",
        model: "gemini-3.8-flash",
      }),
    };
  } catch (error: any) {
    console.error("Netlify function chat error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || "Eroare la asistentul metodist în Netlify Functions.",
      }),
    };
  }
};
