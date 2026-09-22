import { GoogleGenAI } from "@google/genai";
import {
  getCorsHeaders,
  getClientIp,
  checkRateLimit,
  verifyAccessToken,
  extractBearerToken,
  validatePayloadSize,
} from "./_security.js";

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

async function processChat(payload: any) {
  const ai = getAi();
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

  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: `Ești Asistentul Metodist EduMetodist România pentru cadre didactice. Oferi răspunsuri clare, metodice și concrete conform normelor MEC 2026-2027.`,
          temperature: 0.3,
        },
      });

      if (response && response.text) {
        return {
          success: true,
          text: response.text,
          model: modelName,
        };
      }
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      console.warn(`Model chat ${modelName} indisponibil:`, errStr);
    }
  }

  throw lastError || new Error("Serviciul AI este temporar supraîncărcat. Vă rugăm să reîncercați.");
}

export default async function (req: Request | any, context?: any) {
  if (req instanceof Request || (req && typeof req.headers?.get === "function")) {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Metodă HTTP nepermisă. Folosiți POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ success: false, error: "Content-Type invalid. Este permis doar application/json." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validare dimensiune payload (max 10 MB)
    let rawBody = "";
    try {
      rawBody = await req.text();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Corpul cererii nu a putut fi citit." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sizeCheck = validatePayloadSize(rawBody, 10 * 1024 * 1024);
    if (!sizeCheck.valid) {
      return new Response(
        JSON.stringify({ success: false, error: sizeCheck.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Format JSON invalid în corpul cererii." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verificare Token HMAC (12 ore)
    const token = extractBearerToken(req, payload);
    const tokenVerification = verifyAccessToken(token);
    if (!tokenVerification.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: tokenVerification.error || "Token de acces lipsă sau invalid. Vă rugăm să reîncărcați pagina.",
          code: "UNAUTHORIZED",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verificare Rate Limiting per IP (Netlify Blobs) - max 20 / oră
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(clientIp, "chat");
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.retryAfterSeconds / 60);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Ai atins limita de mesaje pe oră (${rateLimit.limit} mesaje / oră). Te rugăm să încerci din nou peste ${waitMin} minute.`,
          retryAfter: rateLimit.retryAfterSeconds,
          code: "RATE_LIMITED",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    // 4. Validare conținut mesaj
    if (!payload.prompt || typeof payload.prompt !== "string" || !payload.prompt.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Mesajul trimis este gol." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const result = await processChat(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message || "Eroare la procesare" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  return handler(req, context);
}

export const handler = async (event: any, context?: any) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  const rawBody = event.body || "";
  const sizeCheck = validatePayloadSize(rawBody, 10 * 1024 * 1024);
  if (!sizeCheck.valid) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: sizeCheck.error }),
    };
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "JSON invalid" }),
    };
  }

  const token = extractBearerToken(event, payload);
  const tokenVerification = verifyAccessToken(token);
  if (!tokenVerification.valid) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: tokenVerification.error, code: "UNAUTHORIZED" }),
    };
  }

  const clientIp = getClientIp(event);
  const rateLimit = await checkRateLimit(clientIp, "chat");
  if (!rateLimit.allowed) {
    const waitMin = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
      body: JSON.stringify({
        success: false,
        error: `Ai atins limita de mesaje pe oră (${rateLimit.limit} mesaje / oră). Te rugăm să încerci din nou peste ${waitMin} minute.`,
        retryAfter: rateLimit.retryAfterSeconds,
        code: "RATE_LIMITED",
      }),
    };
  }

  try {
    const result = await processChat(payload);
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Netlify function chat error:", error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Eroare la asistentul metodist în Netlify Functions.",
      }),
    };
  }
};

export const config = {
  path: "/api/chat",
};
