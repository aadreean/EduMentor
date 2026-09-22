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
      "Cheia GEMINI_API_KEY nu este configurată în Netlify. Adăugați variabila de mediu GEMINI_API_KEY în panoul Netlify (Site configuration -> Environment variables) pentru a permite analiza documentelor și imaginilor."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function processGenerate(payload: any) {
  const ai = getAi();
  const {
    prompt,
    conversationHistory = [],
    clasa,
    oreSaptamana = 2,
    tipDocument = "Planificare anuală",
    disciplina = "Limba engleză",
    headerData = {},
    sablonFiles = [],
    programaFiles = [],
    suportFiles = [],
    chatAttachedFiles = [],
    sablonText = "",
    programaText = "",
    suportText = "",
  } = payload;

  const hoursPerWeek = Number(oreSaptamana) || 2;
  const isClasa12 = /xii|xiii|12|13/i.test(clasa || headerData.clasa || "");
  const isClasa8 = /viii|8/i.test(clasa || headerData.clasa || "");

  const m1Hours = 6 * hoursPerWeek;
  const m2Hours = 7 * hoursPerWeek;
  const m3Hours = 6 * hoursPerWeek;
  const m4Hours = 7 * hoursPerWeek;
  const m5TeachingWeeks = isClasa12 ? 4 : isClasa8 ? 5 : 6;
  const m5Hours = m5TeachingWeeks * hoursPerWeek;
  const totalTeachingWeeks = 6 + 7 + 6 + 7 + m5TeachingWeeks;
  const totalTeachingHours = m1Hours + m2Hours + m3Hours + m4Hours + m5Hours;
  const totalSpecialHours = 2 * hoursPerWeek;
  const totalAnnualHours = totalTeachingHours + totalSpecialHours;

  const curricularDetails: string[] = [];
  if (headerData?.filiera?.trim()) {
    curricularDetails.push(`Filiera ${headerData.filiera.trim().toLowerCase()}`);
  }
  if (headerData?.profil?.trim()) {
    curricularDetails.push(`Profil ${headerData.profil.trim().toLowerCase()}`);
  }
  if (headerData?.specializare?.trim()) {
    curricularDetails.push(`Specializarea ${headerData.specializare.trim().toLowerCase()}`);
  }
  const baseClasa = clasa || headerData?.clasa || "";
  const clasaFormatted =
    curricularDetails.length > 0 ? `${baseClasa} | ${curricularDetails.join(", ")}` : baseClasa;

  const userParts: any[] = [];

  let contextDescription = `
DIRECTIVĂ CRITICĂ ȘI INSTRUCȚIUNE OBLIGATORIE:
- Clasa vizată: ${clasaFormatted} (În antetul documentului, scrie exact: **Clasa:** ${clasaFormatted})
- Disciplina: ${disciplina || headerData.disciplina || "Limba modernă"}
- Norma săptămânală: ${hoursPerWeek} ore/săpt
- Tipul de document: ${tipDocument}
- Anul școlar: 2026-2027
- Vacanța din februarie: ${headerData?.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
- Unitatea: ${headerData?.unitateInvatamant || "Liceul Teoretic"}
- Profesor: ${headerData?.profesor || "Profesor"}
- Director pentru aviz: ${headerData?.director || "Prof. Director"}
- Responsabil catedră: ${headerData?.respCatedra || "Prof. Responsabil Catedră"}
- Manual / suport: ${headerData?.manualSuport || "Manual aprobat"}

${prompt ? `Mesaj utilizator: ${prompt}\n` : ""}

ESTE OBLIGATORIU SĂ GENEREZI ÎNTREGUL TABEL CURRICULAR COMPLET IMEDIAT SUB ANTET!
NU TE OPRI DOAR LA ANTET!

REGULĂ DE AUR PRIVIND ANALIZA IMAGINILOR ȘI EXTRAGEREA UNITĂȚILOR:
- Dacă profesorul a atașat imagini (fotografii, capturi de ecran ale cuprinsului manualului): ANALIZEAZĂ CU ATENȚIE IMAGINILE ATAȘATE (folosind Viziune Multimodală / OCR).
- Citește textul din imaginile cuprinsului pentru ORICE disciplină și pentru ORICE manual/editură.
- Identifică toate titlurile unităților/capitolelor (Unit 1, Unit 2... sau Capitolul 1, Capitolul 2...) și temele vizibile în imagini.
- CONSTRUIEȘTE ÎNTREAGA PLANIFICARE EXCLUSIV PE BAZA ACESTOR UNITĂȚI ȘI CONȚINUTURI EXTRASE DIN IMAGINILE ATAȘATE!
- Este strict interzisă inventarea de titluri arbitrare sau folosirea unor șabloane predefinite când există imagini atașate.
`;

  if (tipDocument === "Planificare anuală") {
    contextDescription += `
GENEREAZĂ PLANIFICAREA ANUALĂ INTEGRALĂ PENTRU TOATE CELE 5 MODULE (M1, M2, M3, M4, M5):
- Tabelul oficial complet cu 7 coloane:
  | Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi | Nr. ore alocate | Săptămâna | Observații |
- Modulul 1 (07.09.2026 - 23.10.2026): ${m1Hours} ore predare efectivă + S5 „Mai mult decât Școala altfel”. Încheiere cu recapitulare și evaluare formativă în S7.
- Modulul 2 (02.11.2026 - 22.12.2026): ${m2Hours} ore predare. S12 mențiune: 30 Nov & 1 Dec libere legale. Încheiere cu evaluare sumativă în S15.
- Modulul 3 (11.01.2027 - 19.02.2027): ${m3Hours} ore predare. 24 Ianuarie liberă legală. Încheiere cu evaluare în S21.
- Modulul 4 (01.03.2027 - 23.04.2027): ${m4Hours} ore predare + S29 „Săptămâna verde”.
- Modulul 5 (05.05.2027 - ${isClasa12 ? "04.06.2027" : isClasa8 ? "11.06.2027" : "18.06.2027"}): ${m5Hours} ore predare (${m5TeachingWeeks} săptămâni). Clasă ${isClasa12 ? "terminală a XII-a/XIII-a" : isClasa8 ? "a VIII-a" : "standard"}. S34: 1 Iunie liber. Încheiere cu recapitulare anuală și evaluare finală.

După tabel, adaugă Notă metodologică de bilanț orar:
* Total ore predare: ${totalTeachingHours} ore
* Total ore săptămâni speciale: ${totalSpecialHours} ore
* Total general normă: ${totalAnnualHours} ore
`;
  } else if (tipDocument === "Planificare pe unitate") {
    contextDescription += `
GENEREAZĂ PLANIFICAREA PE UNITĂȚI DE ÎNVĂȚARE COMPLETĂ cu tabelul Markdown având EXACT cele 7 coloane normate:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
`;
  } else if (tipDocument === "Schiță de lecție") {
    contextDescription += `
GENEREAZĂ PROIECTUL DE LECȚIE COMPLET cu tabelul de scenariu didactic având EXACT 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
`;
  }

  userParts.push({ text: contextDescription });

  function getValidInlineMimeType(file: any): string | null {
    if (!file) return null;
    const rawType = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    if (rawType.includes("pdf") || name.endsWith(".pdf")) return "application/pdf";
    if (rawType.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(name)) {
      if (rawType.includes("png") || name.endsWith(".png")) return "image/png";
      if (rawType.includes("webp") || name.endsWith(".webp")) return "image/webp";
      return "image/jpeg";
    }
    return null;
  }

  const allFiles = [...sablonFiles, ...programaFiles, ...suportFiles, ...chatAttachedFiles];
  for (const file of allFiles) {
    const mime = getValidInlineMimeType(file);
    if (mime && file.data) {
      const cleanData = file.data.includes(",") ? file.data.split(",")[1] : file.data;
      userParts.push({
        inlineData: {
          mimeType: mime,
          data: cleanData,
        },
      });
    }
  }

  if (sablonText) userParts.push({ text: `[TEXT ȘABLON]:\n${sablonText}` });
  if (programaText) userParts.push({ text: `[TEXT PROGRAMĂ]:\n${programaText}` });
  if (suportText) userParts.push({ text: `[TEXT CUPRINS / MANUAL]:\n${suportText}` });

  const contents: any[] = [];
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
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
          systemInstruction: `Ești EduMetodist România, asistentul metodist de elită pentru cadrele didactice din România în anul școlar 2026-2027.
Respectă cu strictețe normele Ministerului Educației (MEC): structura pe 5 module, 36 săptămâni de cursuri (34 săptămâni pentru clasa a XII-a/a XIII-a, 35 săptămâni pentru clasa a VIII-a), programul „Mai mult decât Școala altfel” și „Săptămâna verde”.
CÂND PROFESORUL ÎNCARCĂ IMAGINI CU CUPRINSUL MANUALULUI: extrage toate unitățile și conținuturile din imagini și structurează planificarea exclusiv pe baza acestora! Nu folosi niciodată titluri generice inventate!`,
          temperature: 0.2,
        },
      });

      if (response && response.text && response.text.trim().length > 0) {
        return { success: true, text: response.text, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      console.warn(`Model ${modelName} indisponibil:`, errStr);
      // Trecem imediat la următorul model candidat
    }
  }

  throw lastError || new Error("Serviciul AI este temporar supraîncărcat. Vă rugăm să apăsați din nou pe GENEREAZĂ.");
}

// Netlify Functions v2 default export
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

    // 1. Validare dimensiune payload (max 12 MB pentru a permite poze cu cuprinsul manualului)
    let rawBody = "";
    try {
      rawBody = await req.text();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Corpul cererii nu a putut fi citit." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sizeCheck = validatePayloadSize(rawBody, 12 * 1024 * 1024);
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

    // 2. Verificare Token HMAC (valabilitate 12 ore)
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

    // 3. Verificare Rate Limiting per IP (Netlify Blobs)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(clientIp, "generate");
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.retryAfterSeconds / 60);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Ai atins limita de generări pe oră (${rateLimit.limit} cereri / oră). Te rugăm să încerci din nou peste ${waitMin} minute.`,
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

    // 4. Validare structurală câmpuri
    if (!payload || typeof payload !== "object") {
      return new Response(
        JSON.stringify({ success: false, error: "Datele transmise sunt invalide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasContent =
      Boolean(payload.prompt && String(payload.prompt).trim()) ||
      Boolean(payload.disciplina && String(payload.disciplina).trim()) ||
      Boolean(payload.suportFiles && payload.suportFiles.length > 0) ||
      Boolean(payload.programaFiles && payload.programaFiles.length > 0) ||
      Boolean(payload.sablonFiles && payload.sablonFiles.length > 0);

    if (!hasContent) {
      return new Response(
        JSON.stringify({ success: false, error: "Câmpuri obligatorii lipsă. Selectați disciplina/clasa sau introduceți instrucțiuni." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const result = await processGenerate(payload);
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
      console.error("Netlify function generate v2 error:", error);
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

  // Netlify Functions v1 fallback
  return handler(req, context);
}

// Netlify Functions v1 handler
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
  const sizeCheck = validatePayloadSize(rawBody, 12 * 1024 * 1024);
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
  const rateLimit = await checkRateLimit(clientIp, "generate");
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
        error: `Ai atins limita de generări pe oră (${rateLimit.limit} cereri / oră). Te rugăm să încerci din nou peste ${waitMin} minute.`,
        retryAfter: rateLimit.retryAfterSeconds,
        code: "RATE_LIMITED",
      }),
    };
  }

  try {
    const result = await processGenerate(payload);
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Netlify function generate v1 error:", error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Eroare la generarea planificării în Netlify Functions.",
      }),
    };
  }
};

export const config = {
  path: "/api/generate",
};
