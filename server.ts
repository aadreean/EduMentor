import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generatePedagogicalPlan } from "./src/utils/planGenerator";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// System instruction for Romanian Educational Metodist (v.8.0 - Expert Curricular & Metodist Polivalent - autor prof. Adrian Podar)
const SYSTEM_INSTRUCTION = `Ești un asistent educațional avansat, expert curricular și metodist polivalent de top din România, integrat în aplicația EduMetodist (autor prof. Adrian Podar), destinată cadrelor didactice din învățământul preuniversitar. Rolul tău este să reduci birocrația prin generarea automată și completă a planificărilor calendaristice anuale (pe toate cele 5 module), a planificărilor pe unități de învățare (structură normată de 7 coloane) și a proiectelor de lecție detaliate (structură normată în 6 secțiuni și tabel de 8 coloane).

================================================================================
MANDAT CRITIC OBLIGATORIU: ESTE STRICT INTERZIS SĂ GENEREZI DOAR ANTETUL!
ORICE RĂSPUNS PENTRU „PLANIFICARE ANUALĂ” TREBUIE SĂ CONȚINĂ OBLIGATORIU:
1. ANTETUL TEHNIC OFICIAL PE DOUĂ COLOANE (stânga: date școală/profesor; dreapta: vize/înregistrare)
2. TITLUL DOCUMENTULUI CENTRAT (ex: **PLANIFICARE CALENDARISTICĂ ANUALĂ - ANUL ȘCOLAR 2026-2027**)
3. IMEDIAT SUB TITLU, ÎNTREGUL TABEL CURRICULAR COMPLET CU TOATE CELE 7 COLOANE OFICIALE:
| Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi | Nr. ore alocate | Săptămâna | Observații |
TABELUL TREBUIE SĂ FIE STRUCTURAT FĂRĂ EXCEPȚIE PE TOATE CELE 5 MODULE (Modulul 1, Modulul 2, Modulul 3, Modulul 4, Modulul 5) ȘI TOATE CELE 36 DE SĂPTĂMÂNI (S1 până la S36, respectiv S34 pentru clasa a XII-a), FĂRĂ SĂ TE OPREȘTI DUPĂ ANTET!
DACĂ RĂSPUNSUL TĂU CONȚINE DOAR ANTETUL FĂRĂ TABEL, ESTE CONSIDERAT EȘUAT ȘI INUTILIZABIL. ÎNCEPE TABELUL IMEDIAT DUPĂ ANTET ȘI COMPLETEAZĂ TOATE CELE 5 MODULE!
================================================================================

1. CARACTER UNIVERSAL ȘI FLEXIBILITATE CURRICULARĂ TOTALĂ:
- Aplicația funcționează pentru ORICE DISCIPLINĂ din învățământul preuniversitar (științe exacte, discipline umaniste, tehnice, arte, sport, socio-umane etc.).
- Fără restricții predefinite pe clase sau discipline: Generarea conținuturilor, a detalierilor tematice, a competențelor și a activităților de învățare se va face EXCLUSIV în funcție de documentele încărcate de profesor (Programa școlară, Manualul sau corpusul de documente) și de clasa menționată în parametrii de sesiune. Nivelul de complexitate și terminologia se vor adapta natural la specificul disciplinei și al vârstei elevilor.
- Adaptarea lingvistică: Interfața de dialog, structura administrativă și metodică sunt în limba română. Conținuturile propriu-zise, termenii de specialitate, textele suport sau problemele vor fi redactate în limba în care se predă disciplina respectivă (de ex. limbă modernă, secții bilingve sau limba română pentru celelalte discipline), conform documentelor suport.

2. COORDONATE TEHNICE ȘI ANTET OFICIAL:
Orice document generat va începe obligatoriu cu antetul tehnic oficial completat pe două coloane, preluând variabilele introduse de utilizator:
- Stânga: Unitatea de învățământ, Anul școlar (2026-2027), Disciplina, Manualul/suportul didactic, Clasa, Numărul de ore pe săptămână, Numele profesorului, Săptămâna vacanței din februarie (județeană).
- Dreapta: Viza directorului, Avizul responsabilului de catedră, Numărul de înregistrare.
- Centrat (sub antet): Titlul oficial al documentului cu majuscule.

Exemplu format de redare Markdown:
**Unitatea de învățământ:** [Nume Școală]                  **Avizat director:** [Nume Director]
**Anul școlar:** 2026-2027                                  **Avizat resp. catedră:** [Nume Responsabil]
**Disciplina:** [Nume Disciplină]                          **Nr. înregistrare:** [Nr. înregistrare sau .......................]
**Manual/Suport:** [Nume Manual/Suport]                    **Vacanță februarie (județeană):** [Săptămâna X (ex: 22 - 28 Februarie 2027)]
**Clasa:** [Clasa]
**Nr. de ore pe săptămână:** [Nr. ore]
**Profesor:** [Nume Profesor]

                                **[TITLUL DOCUMENTULUI - MAJUSCULE]**

3. STRUCTURA TABELARĂ OBLIGATORIE CONFORM TIPOLOGIEI SELECTATE:
A) PLANIFICARE CALENDARISTICĂ ANUALĂ (pe toate cele 5 module):
   Tabel Markdown complet cu 7 coloane exacte:
   | Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi | Nr. ore alocate | Săptămâna | Observații |
   - Generarea trebuie să fie INTEGRALĂ, acoperind toate cele 5 module (Modulul 1, Modulul 2, Modulul 3, Modulul 4, Modulul 5).
   - Nu trunchia răspunsul și nu genera doar antetul! Răspunde direct cu antetul și tabelul complet de la S1 până la finalul anului școlar.

B) PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE:
   Tabel Markdown complet cu 7 coloane exacte:
   | Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |

C) PROIECT DIDACTIC DE LECȚIE:
   Format normat în 6 secțiuni pedagogice:
   I. Antet și Date generale
   II. Caracteristici didactice (Subiect, Competențe specifice, Obiective operaționale O1-O4, Strategii, Forme de organizare, Evaluare)
   III. Resurse necesare (Materiale, Echipamente hard, Aplicații soft/digitale, Bibliografie)
   IV. Scenariul didactic al lecției (Tabel de 8 coloane):
   | Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
   V. Tabel 1. Instrumente digitale utilizate
   VI. Tabel 2. Resurse digitale de conținut utilizate

4. STRUCTURA ANULUI ȘCOLAR 2026-2027:
- Modulul 1: Luni, 7 septembrie 2026 - Vineri, 23 octombrie 2026 (7 săptămâni: S1 - S7). S5: Programul național „Mai Mult decât Școala altfel” (05.10 - 09.10.2026, fără predare conținut nou; 5 octombrie - Ziua Educației). Încheiere cu evaluare formativă în S7.
- Vacanță de toamnă: Sâmbătă, 24 octombrie 2026 - Duminică, 1 noiembrie 2026.
- Modulul 2: Luni, 2 noiembrie 2026 - Marți, 22 decembrie 2026 (7 săptămâni și 2 zile: S8 - S15). S12: 30 noiembrie (Sf. Andrei) și 1 decembrie (Ziua Națională) - zile libere legale. Încheiere cu evaluare sumativă în S15.
- Vacanță de iarnă: Miercuri, 23 decembrie 2026 - Duminică, 10 ianuarie 2027.
- Modulul 3: Luni, 11 ianuarie 2027 - Vineri, 19 februarie 2027 (6 săptămâni: S16 - S21). S17/S18: 24 ianuarie (Ziua Unirii). Încheiere cu evaluare în S21.
- Vacanță de schi (februarie): O săptămână (implicit: 22 - 28 Februarie 2027).
- Modulul 4: Luni, 1 martie 2027 - Vineri, 23 aprilie 2027 (8 săptămâni: S22 - S29). S29: Programul național „Săptămâna verde” (19.04 - 23.04.2027, fără predare conținut nou).
- Vacanță de primăvară: Sâmbătă, 24 aprilie 2027 - Marți, 4 mai 2027 (include Paștele Ortodox și 1 Mai).
- Modulul 5: Miercuri, 5 mai 2027 - Vineri, 18 iunie 2027 (sau finalizat la 4 iunie 2027 pentru cls. a XII-a/XIII-a, 11 iunie 2027 pentru cls. a VIII-a). S34: 1 iunie (Ziua Copilului) zi liberă. Încheiere cu recapitulare anuală și evaluare finală.

5. NOTE DE BILANȚ ORAR ȘI SEMNĂTURI:
- Calculează riguros produsul dintre numărul de ore pe săptămână și săptămânile de curs.
- Include la finalul planificării anuale «Notă metodologică de bilanț orar».
- Semnături finale:
  **Întocmit, Profesor:** [Nume Profesor]                          **Avizat Director, Data:** [Nume Director]
- Semnătură curriculară: autor prof. Adrian Podar`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    schoolYear: "2026-2027",
    author: "prof. Adrian Podar",
  });
});

// API endpoint to generate educational plans or chat with metodist
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt = "",
      conversationHistory = [],
      clasa = "Clasa a XII-a",
      oreSaptamana = 2,
      tipDocument = "Planificare anuală",
      disciplina = "Limba modernă",
      headerData = {},
      sablonFile,
      programaFile,
      suportFile,
      sablonFiles = [],
      programaFiles = [],
      suportFiles = [],
      sablonText = "",
      programaText = "",
      suportText = "",
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const hoursPerWeek = Number(oreSaptamana) || 2;
    const isClasa12 = /xii|xiii|12|13/i.test(clasa || headerData.clasa || "");
    const isClasa8 = /viii|8/i.test(clasa || headerData.clasa || "");

    const runFallback = () => {
      const allProgramaSnippets = [
        programaText,
        ...programaFiles.map((f: any) => f.textSnippet || f.name),
        programaFile?.textSnippet,
      ].filter(Boolean);

      const allSuportSnippets = [
        suportText,
        ...suportFiles.map((f: any) => f.textSnippet || f.name),
        suportFile?.textSnippet,
      ].filter(Boolean);

      return generatePedagogicalPlan({
        clasa,
        disciplina: disciplina || headerData.disciplina,
        oreSaptamana: hoursPerWeek,
        tipDocument,
        headerData,
        manualSuport: headerData.manualSuport,
        programaSnippets: allProgramaSnippets,
        suportSnippets: allSuportSnippets,
      });
    };

    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing, using pedagogical generator.");
      const fallbackResult = runFallback();
      return res.json({ success: true, text: fallbackResult });
    }

    const ai = getGeminiClient();

    // Prepare conversation contents
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    const userParts: any[] = [];

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
    const totalWeeksAll = totalTeachingWeeks + 2;

    let contextDescription = `
DIRECTIVĂ CRITICĂ ȘI INSTRUCȚIUNE OBLIGATORIE:
- Clasa vizată: ${clasa}
- Disciplina: ${disciplina || headerData.disciplina || "Limba modernă"}
- Norma săptămânală: ${hoursPerWeek} ${hoursPerWeek === 1 ? "oră/săpt" : "ore/săpt"}
- Tipul de document solicitat: ${tipDocument}
- Anul școlar: 2026-2027
- Vacanța din februarie: ${headerData?.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
- Unitatea școlară: ${headerData?.unitateInvatamant || "Liceul Teoretic"}
- Profesor: ${headerData?.profesor || "Profesor"}
- Director pentru aviz: ${headerData?.director || "Prof. Director"}
- Responsabil catedră: ${headerData?.respCatedra || "Prof. Responsabil Catedră"}
- Manual / suport: ${headerData?.manualSuport || "Manual aprobat"}

${prompt ? `Mesaj / instrucțiune utilizator: ${prompt}\n` : ""}

ESTE OBLIGATORIU SĂ GENEREZI ÎNTREGUL TABEL CURRICULAR COMPLET IMEDIAT SUB ANTET!
NU TE OPRI DOAR LA ANTET! Include fără excepție toate cele 5 module și toate cele 36 de săptămâni!
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
* Semnătura curriculară: autor prof. Adrian Podar
`;
    } else if (tipDocument === "Schiță de lecție") {
      contextDescription += `
GENEREAZĂ PROIECTUL DE LECȚIE COMPLET respectând cele 6 secțiuni metodice și tabelul de scenariu didactic cu EXACT 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
alături de tabelele specifice pentru instrumente și resurse digitale.
`;
    } else if (tipDocument === "Planificare pe unitate") {
      contextDescription += `
GENEREAZĂ PLANIFICAREA PE UNITĂȚI DE ÎNVĂȚARE COMPLETĂ cu tabelul Markdown având EXACT cele 7 coloane normate:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
`;
    }

    userParts.push({ text: contextDescription });

    // Handle all attached files (support multiple files with robust concatenation)
    const allSablonFiles = [...sablonFiles, ...(sablonFile ? [sablonFile] : [])];
    const allProgramaFiles = [...programaFiles, ...(programaFile ? [programaFile] : [])];
    const allSuportFiles = [...suportFiles, ...(suportFile ? [suportFile] : [])];

    // 1. Concatenează conținutul tuturor fișierelor din fiecare categorie
    const concatenatedSablonText = [
      sablonText,
      ...allSablonFiles.map((file: any, index: number) =>
        `--- [FIȘIER ȘABLON ${index + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
      ),
    ].filter(Boolean).join("\n\n");

    const concatenatedProgramaText = [
      programaText,
      ...allProgramaFiles.map((file: any, index: number) =>
        `--- [FIȘIER PROGRAMĂ ȘCOLARĂ ${index + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
      ),
    ].filter(Boolean).join("\n\n");

    const concatenatedSuportText = [
      suportText,
      ...allSuportFiles.map((file: any, index: number) =>
        `--- [FIȘIER SUPORT DE CURS / MANUAL ${index + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
      ),
    ].filter(Boolean).join("\n\n");

    // Adaugă fișierele șablon ca inlineData și bloc text concatenat
    allSablonFiles.forEach((file: any, index: number) => {
      if (file && file.data) {
        userParts.push({
          inlineData: {
            mimeType: file.type || "application/pdf",
            data: file.data,
          },
        });
      }
    });
    if (concatenatedSablonText.trim()) {
      userParts.push({ text: `[CORPUS CONCATENAT ȘABLOANE (${allSablonFiles.length} fișiere încărcate)]:\n${concatenatedSablonText}` });
    }

    // Adaugă fișierele programă ca inlineData și bloc text concatenat
    allProgramaFiles.forEach((file: any, index: number) => {
      if (file && file.data) {
        userParts.push({
          inlineData: {
            mimeType: file.type || "application/pdf",
            data: file.data,
          },
        });
      }
    });
    if (concatenatedProgramaText.trim()) {
      userParts.push({ text: `[CORPUS CONCATENAT PROGRAMĂ ȘCOLARĂ (${allProgramaFiles.length} fișiere încărcate)]:\n${concatenatedProgramaText}` });
    }

    // Adaugă fișierele suport ca inlineData și bloc text concatenat
    allSuportFiles.forEach((file: any, index: number) => {
      if (file && file.data) {
        userParts.push({
          inlineData: {
            mimeType: file.type || "application/pdf",
            data: file.data,
          },
        });
      }
    });
    if (concatenatedSuportText.trim()) {
      userParts.push({ text: `[CORPUS CONCATENAT SUPORT / MANUAL (${allSuportFiles.length} fișiere încărcate)]:\n${concatenatedSuportText}` });
    }

    contents.push({
      role: "user",
      parts: userParts,
    });

    let responseText = "";
    const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const isGemini3 = modelName.startsWith("gemini-3");
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 8192,
        };
        if (modelName.includes("2.5")) {
          config.thinkingConfig = { thinkingBudget: 0 };
        } else if (isGemini3) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });

        if (response && response.text && response.text.includes("|")) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
      }
    }

    if (!responseText) {
      console.warn("Gemini models could not return a table. Using pedagogical plan generator.", lastError?.message);
      responseText = runFallback();
    }

    res.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.error("API error, generating with pedagogical fallback:", error);
    try {
      const fallback = generatePedagogicalPlan({
        clasa: req.body?.clasa || "Clasa a XII-a",
        disciplina: req.body?.disciplina || "Limba modernă",
        oreSaptamana: Number(req.body?.oreSaptamana) || 2,
        tipDocument: req.body?.tipDocument || "Planificare anuală",
        headerData: req.body?.headerData || {},
        manualSuport: req.body?.headerData?.manualSuport,
      });
      return res.json({
        success: true,
        text: fallback,
      });
    } catch (e: any) {
      res.status(500).json({
        success: false,
        error: error.message || "A apărut o eroare la generarea planificării.",
      });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduMetodist server running on http://localhost:${PORT}`);
  });
}

startServer();
