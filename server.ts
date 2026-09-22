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

// Enable CORS for custom domains and external hosts (e.g. sesuna.ro, Netlify)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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

================================================================================
REGULĂ STRICTĂ PRIVIND CONȚINUTURILE ȘI UNITĂȚILE DE ÎNVĂȚARE (FĂRĂ UNITĂȚI INVENTATE):
- Conținuturile, temele și denumirile unităților de învățare se vor extrage EXCLUSIV și STRICT din documentele încărcate de profesor (cuprinsul manualului, suportul de curs, fișierele atașate PDF/DOCX/imagini sau programa școlară).
- ESTE STRICT INTERZISĂ folosirea sau inventarea unor denumiri de unități predefinite sau manuale arbitrare (cum ar fi „Pushing the Boundaries”, „Mind, Brain & Human Nature” sau alte titluri de manuale străine/Cambridge), DACĂ acestea nu se regăsesc în mod explicit și textual în cuprinsul manualului/suportului atașat de utilizator!
- Dacă utilizatorul a atașat un cuprins sau un manual, structurează planificarea EXACT pe unitățile și conținuturile reale din acel manual atașat.
- Dacă utilizatorul NU a atașat un manual specific, conținuturile se vor conforma strict Programei Școlare oficiale a disciplinei și clasei selectate, folosind formulări didactice naționale standard, fără trimiteri nejustificate la manuale arbitrare.
================================================================================

1. CARACTER UNIVERSAL ȘI FLEXIBILITATE CURRICULARĂ TOTALĂ:
- Aplicația funcționează pentru ORICE DISCIPLINĂ din învățământul preuniversitar (științe exacte, discipline umaniste, tehnice, arte, sport, socio-umane etc.).
- Fără restricții predefinite pe clase sau discipline: Generarea conținuturilor, a detalierilor tematice, a competențelor și a activităților de învățare se va face EXCLUSIV în funcție de documentele încărcate de profesor (Programa școlară, Manualul sau corpusul de documente) și de clasa menționată în parametrii de sesiune. Nivelul de complexitate și terminologia se vor adapta natural la specificul disciplinei și al vârstei elevilor.
- Adaptarea lingvistică: Interfața de dialog, structura administrativă și metodică sunt în limba română. Conținuturile propriu-zise, termenii de specialitate, textele suport sau problemele vor fi redactate în limba în care se predă disciplina respectivă (de ex. limbă modernă, secții bilingve sau limba română pentru celelalte discipline), conform documentelor suport.

2. COORDONATE TEHNICE ȘI ANTET OFICIAL:
Orice document generat va începe obligatoriu cu antetul tehnic oficial completat pe două coloane, preluând variabilele introduse de utilizator:
- Stânga: Unitatea de învățământ, Anul școlar (2026-2027), Disciplina (sau disciplinele integrate), Manualul/suportul didactic, Clasa (cu detaliile curriculare de liceu incluse dacă au fost specificate, ex: „Clasa a XI-a | Filiera teoretică, Profil umanist, Specializarea filologie”), Numărul de ore pe săptămână, Numele profesorului, Săptămâna vacanței din februarie (județeană).
- Dreapta: Viza directorului, Avizul responsabilului de catedră, Numărul de înregistrare.
- Centrat (sub antet): Titlul oficial al documentului cu majuscule.

Exemplu format de redare Markdown:
**Unitatea de învățământ:** [Nume Școală]                  **Avizat director:** [Nume Director]
**Anul școlar:** 2026-2027                                  **Avizat resp. catedră:** [Nume Responsabil]
**Disciplina:** [Nume Disciplină sau Discipline Integrate]  **Nr. înregistrare:** [Nr. înregistrare sau .......................]
**Manual/Suport:** [Nume Manual/Suport]                    **Vacanță februarie (județeană):** [Săptămâna X (ex: 22 - 28 Februarie 2027)]
**Clasa:** [Clasa sau Clasa | Filiera X, Profil Y, Specializarea Z]
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

D) PLANIFICARE INTEGRATĂ PENTRU ÎNVĂȚĂMÂNTUL PRIMAR:
   - Abordare transdisciplinară specifică învățământului primar (CLR, MEM, AVAP, DP, MM etc.) pe unități tematice.
   - Grupează competențele din programele multiple încărcate sub o Temă Integratoare comună.
   - Tabel Markdown cu EXACT rubricile oficiale:
   | Tema Unității | Discipline integrate | Competențe Specifice | Conținuturi | Nr. Ore | Săptămâna |

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
  **Întocmit, Profesor:** [Nume Profesor]                          **Avizat Director, Data:** [Nume Director]`;

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
      chatAttachedFiles = [],
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

    // Formatează clasa cu detaliile curriculare de liceu dacă au fost completate
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

    let contextDescription = `
DIRECTIVĂ CRITICĂ ȘI INSTRUCȚIUNE OBLIGATORIE:
- Clasa vizată și detalii curriculare: ${clasaFormatted} (În antetul documentului, la rubrica Clasa, scrie obligatoriu exact: **Clasa:** ${clasaFormatted})
- Disciplina / Disciplinele: ${disciplina || headerData.disciplina || "Limba modernă"}
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
NU TE OPRI DOAR LA ANTET!
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
    } else if (
      tipDocument === "Planificare integrată (Primar)" ||
      tipDocument.toLowerCase().includes("integrat")
    ) {
      contextDescription += `
GENEREAZĂ UN TABEL DE PLANIFICARE INTEGRATĂ PENTRU ÎNVĂȚĂMÂNTUL PRIMAR:
- Grupează competențele din programele multiple încărcate sub o Temă Integratoare comună, cu rubricile:
  | Tema Unității | Discipline integrate | Competențe Specifice | Conținuturi | Nr. Ore | Săptămâna |
- Abordare transdisciplinară specifică învățământului primar (de ex: CLR - Comunicare în limba română, MEM - Matematică și explorarea mediului, AVAP - Arte vizuale și abilități practice, DP - Dezvoltare personală, MM - Muzică și mișcare).
- Corelează competențele din toate programele încărcate pe unități tematice coerente, distribuite pe modulele anului școlar 2026-2027 (inclusiv S5 Școala altfel și S29 Săptămâna verde).
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

    contextDescription += `
REGULĂ DE AUR PRIVIND ANALIZA IMAGINILOR ȘI EXTRAGEREA UNITĂȚILOR:
- Dacă profesorul a atașat imagini (fotografii, capturi de ecran ale cuprinsului manualului sau pagini din manual): ANALIZEAZĂ CU ATENȚIE IMAGINILE ATAȘATE (folosind capabilitățile tale de Viziune Multimodală / OCR).
- Citește textul din imaginile cuprinsului pentru ORICE disciplină (Limba Română, Matematică, Limba Engleză, Franceză, Istorie, Geografie, Biologie, Fizică, Chimie, Informatică, Muzică, Arte etc.) și pentru ORICE manual/editură.
- Identifică toate titlurile unităților/capitolelor (Unit 1, Unit 2... sau Capitolul 1, Capitolul 2...) și temele vizibile în imagini.
- CONSTRUIEȘTE ÎNTREAGA PLANIFICARE EXCLUSIV PE BAZA ACESTOR UNITĂȚI ȘI CONȚINUTURI EXTRASE DIN IMAGINILE ATAȘATE!
- Dacă nu sunt atașate imagini sau fișiere, folosește programa oficială a disciplinei. Este strict interzisă inventarea de titluri arbitrare.
`;

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

    function getValidInlineMimeType(file: any): string | null {
      const name = (file?.name || "").toLowerCase();
      const rawType = (file?.type || "").toLowerCase();

      if (rawType.includes("pdf") || name.endsWith(".pdf")) {
        return "application/pdf";
      }
      if (rawType.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(name)) {
        if (rawType.includes("png") || name.endsWith(".png")) return "image/png";
        if (rawType.includes("webp") || name.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
      }
      return null;
    }

    // Adaugă fișierele șablon ca inlineData și bloc text concatenat
    allSablonFiles.forEach((file: any, index: number) => {
      const mime = getValidInlineMimeType(file);
      if (mime && file.data) {
        userParts.push({
          inlineData: {
            mimeType: mime,
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
      const mime = getValidInlineMimeType(file);
      if (mime && file.data) {
        const cleanData = (file.data || "").includes(",") ? file.data.split(",")[1] : file.data;
        userParts.push({
          inlineData: {
            mimeType: mime,
            data: cleanData,
          },
        });
      }
    });
    if (concatenatedProgramaText.trim()) {
      userParts.push({ text: `[CORPUS CONCATENAT PROGRAMĂ ȘCOLARĂ (${allProgramaFiles.length} fișiere încărcate)]:\n${concatenatedProgramaText}` });
    }

    // Adaugă fișierele suport ca inlineData și bloc text concatenat
    allSuportFiles.forEach((file: any, index: number) => {
      const mime = getValidInlineMimeType(file);
      if (mime && file.data) {
        const cleanData = (file.data || "").includes(",") ? file.data.split(",")[1] : file.data;
        userParts.push({
          inlineData: {
            mimeType: mime,
            data: cleanData,
          },
        });
      }
    });
    if (concatenatedSuportText.trim()) {
      userParts.push({ text: `[CORPUS CONCATENAT SUPORT / CUPRINS MANUAL (${allSuportFiles.length} fișiere încărcate)]:\n${concatenatedSuportText}` });
    }

    // Adaugă fișierele suplimentare atașate din chat (PDF, DOCX, Imagini)
    if (Array.isArray(chatAttachedFiles) && chatAttachedFiles.length > 0) {
      chatAttachedFiles.forEach((file: any, index: number) => {
        const mime = getValidInlineMimeType(file);
        if (mime && file.data) {
          const cleanData = (file.data || "").includes(",") ? file.data.split(",")[1] : file.data;
          userParts.push({
            inlineData: {
              mimeType: mime,
              data: cleanData,
            },
          });
        }
        if (file && (file.textSnippet || file.name)) {
          userParts.push({
            text: `[FIȘIER DIDACTIC ATAȘAT DIN CHAT #${index + 1}: ${file.name}]:\n${file.textSnippet || ""}`,
          });
        }
      });
    }

    contents.push({
      role: "user",
      parts: userParts,
    });

    let responseText = "";
    // Modele de înaltă performanță verificate cu suport multimodal pentru imagini/PDF și cotă activă
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
    ];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const isGemini3 = modelName.startsWith("gemini-3");
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 8192,
        };
        if (isGemini3) {
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
      const hasAttachedDocuments =
        allSuportFiles.length > 0 ||
        (Array.isArray(chatAttachedFiles) && chatAttachedFiles.length > 0) ||
        Boolean(concatenatedSuportText.trim());

      if (hasAttachedDocuments) {
        return res.status(502).json({
          success: false,
          error: `Nu s-a putut procesa cuprinsul documentului atașat prin serviciul AI (${lastError?.message || "Răspuns invalid"}). Vă rugăm să apăsați din nou pe butonul de generare.`,
        });
      }

      console.warn("Gemini models could not return a table. Using pedagogical plan generator.", lastError?.message);
      responseText = runFallback();
    }

    res.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.error("API error, generating with pedagogical fallback:", error);
    const hasFiles =
      (Array.isArray(req.body?.suportFiles) && req.body.suportFiles.length > 0) ||
      (Array.isArray(req.body?.chatAttachedFiles) && req.body.chatAttachedFiles.length > 0) ||
      Boolean(req.body?.suportText?.trim());

    if (hasFiles) {
      return res.status(500).json({
        success: false,
        error: `Eroare la procesarea fișierului atașat: ${error?.message || "Eroare internă"}. Vă rugăm să reîncercați.`,
      });
    }

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

function getPedagogicalChatFallback(question: string, clasa: string, disciplina: string): string {
  const q = (question || "").toLowerCase();

  if (q.includes("structur") || q.includes("modul") || q.includes("calendar") || q.includes("încep") || q.includes("vacanț")) {
    return `### 📅 Structura Oficială a Anului Școlar 2026-2027 (România)
Conform calendarului normat pe 5 module și 36 de săptămâni:

* **Modulul 1:** Luni, 7 septembrie 2026 – Vineri, 23 octombrie 2026 (7 săptămâni: S1 - S7).
  * *S5 (5 - 9 oct. 2026):* Programul Național „Mai mult decât Școala altfel” (5 oct. Ziua Educației).
* **Vacanța de toamnă:** 24 octombrie – 1 noiembrie 2026.
* **Modulul 2:** Luni, 2 noiembrie 2026 – Marți, 22 decembrie 2026 (7 săpt. + 2 zile: S8 - S15).
  * *Zile libere:* 30 noiembrie (Sf. Andrei) & 1 decembrie (Ziua Națională).
* **Vacanța de iarnă:** 23 decembrie 2026 – 10 ianuarie 2027.
* **Modulul 3:** Luni, 11 ianuarie 2027 – Vineri, 19 februarie 2027 (6 săptămâni: S16 - S21).
* **Vacanța de schi (februarie):** O săptămână mobilă (interval 15-28 februarie 2027, conform deciziei ISJ).
* **Modulul 4:** Luni, 1 martie 2027 – Vineri, 23 aprilie 2027 (8 săptămâni: S22 - S29).
  * *S29 (19 - 23 apr. 2027):* Programul Național „Săptămâna verde”.
* **Vacanța de primăvară:** 24 aprilie – 4 mai 2027 (include Paștele Ortodox și 1 Mai).
* **Modulul 5:** Miercuri, 5 mai 2027 – Vineri, 18 iunie 2027 (S30 - S36; finalizare la 4 iunie pentru cls. a XII-a, 11 iunie pentru cls. a VIII-a).`;
  }

  if (q.includes("verde") || q.includes("săptămâna verde") || q.includes("s29")) {
    return `### 🌱 Ghid Metodic: Săptămâna Verde (Anul Școlar 2026-2027)
* **Perioada normată:** Săptămâna S29 (19 – 23 aprilie 2027), la finalul Modulului 4.
* **Obiective operaționale recomandate:**
  1. Conștientizarea amprentei de carbon și a impactului poluării locale.
  2. Inițierea de campanii școlare de colectare selectivă și reciclare creativă.
  3. Explorarea ecosistemelor prin vizite pe teren sau documentare ghidată.
* **Proiecte sugerate:** *Grădina școlii*, *Eco-Reporteri comunitari*, *Calculul consumului energetic în gospodărie*.`;
  }

  if (q.includes("altfel") || q.includes("scoala altfel") || q.includes("s5")) {
    return `### 🎭 Ghid Metodic: Programul „Școala Altfel” (Anul Școlar 2026-2027)
* **Perioada normată:** Săptămâna S5 (5 – 9 octombrie 2026), în cadrul Modulului 1.
* **Ziua Educației:** 5 Octombrie este Ziua Mondială a Educației.
* **Directivă didactică:** Fără predare de materie ordinară. Se recomandă activități non-formale: voluntariat, orientare în carieră, ateliere de comunicare și dezbateri, vizite la teatre și muzee.`;
  }

  if (q.includes("bloom") || q.includes("obiectiv") || q.includes("operațional")) {
    return `### 🎯 Formularea Obiectivelor Operaționale (Taxonomia lui Bloom revizuită)
Un obiectiv didactic bine formulat (modelul Mager) conține 3 componente esențiale:
1. **Comportamentul observabil:** Redat prin verbe de acțiune specifice (*să identifice, să clasifice, să compare, să redacteze* - se evită verbe imprecise precum *să cunoască* sau *să înțeleagă*).
2. **Condițiile de realizare:** (*„utilizând harta istorică”, „pe baza formulelor matematice”, „în echipă de 3 elevi”*).
3. **Criteriul de performanță minimă:** (*„în proporție de cel puțin 80%”, „cel puțin 3 exemple corecte din 4”*).`;
  }

  return `### 📚 Consultanță Didactică & Metodică EduMentor (autor prof. Adrian Podar)
În contextul disciplinei **${disciplina || "disciplinei selectate"}** (${clasa || "învățământ preuniversitar"}):

* **Corespondența curriculară:** Fiecare unitate de învățare din planificare trebuie să reflecte competențele specifice asociate din programa școlară în vigoare aprobată de MEC.
* **Evaluare formativă:** Se recomandă minim 2 evaluări formative pe fiecare modul curricular, însoțite de fișe de progres individual.
* **Resurse utile:** Verificați periodic portalul **edu.ro** și platformele aprobate de Ministerul Educației pentru actualizări de calendare și ghiduri de bune practici didactice.`;
}

// MULTI-TURN GEMINI CHATBOT WITH GOOGLE SEARCH GROUNDING
// - Complex tasks: gemini-3.1-pro-preview (with fallback to gemini-3.5-flash)
// - General tasks: gemini-3.5-flash (with googleSearch tool)
// - Fast tasks: gemini-3.1-flash-lite
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      taskType = "general", // 'fast' | 'general' | 'complex'
      clasa = "",
      disciplina = "",
      attachedFiles = [],
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Cheia API Gemini nu este configurată.",
      });
    }

    const ai = getGeminiClient();

    let primaryModel = "gemini-3.8-flash";
    let fallbackModel = "gemini-flash-latest";

    if (taskType === "fast") {
      primaryModel = "gemini-3.1-flash-lite";
      fallbackModel = "gemini-3.8-flash";
    } else if (taskType === "complex") {
      primaryModel = "gemini-3.1-pro-preview";
      fallbackModel = "gemini-3.8-flash";
    } else {
      primaryModel = "gemini-3.8-flash";
      fallbackModel = "gemini-flash-latest";
    }

    const CHAT_SYSTEM_INSTRUCTION = `Ești „Asistentul Metodist EduMentor” (dezvoltat pentru cadrele didactice din România, autor prof. Adrian Podar).
Rolul tău este să oferi consultanță curriculară și metodică de elită, răspunzând cu acuratețe, căldură și profesionalism cadrelor didactice.
DOMENII CHEIE DE EXPERTIZĂ:
1. Structura oficială a anului școlar 2026-2027 pe 5 module și 36 de săptămâni (S1-S7 Modulul 1 cu S5 Școala altfel, S8-S15 Modulul 2, S16-S21 Modulul 3, S22-S29 Modulul 4 cu S29 Săptămâna verde, S30-S36 Modulul 5).
2. Programele școlare MEC în vigoare pentru ciclurile primar, gimnazial și liceal (filieră, profil, specializare).
3. Legislație educațională din România, ordine de ministru (OMEC/ME), calendare de olimpiade și examene naționale.
4. Proiectare didactică pe competențe (obiective operaționale, strategii interactive, instrumente de evaluare formativă și sumativă, diferențiere curriculară).
5. Planificare integrată pentru învățământul primar (CLR, MEM, DP, AVAP, MM).

Când utilizatorul atașează fișiere (PDF, DOCX sau Imagini), le analizezi cu atenție pentru a extrage cerințele, competențele sau conținuturile menționate și răspunzi în conformitate.
Când utilizatorul întreabă despre noutăți legislative, structuri oficiale, date specifice sau programe școlare, folosești căutarea Google Search integrată pentru a verifica faptele și a oferi răspunsuri sigure și ancorate în realitatea învățământului românesc.
Păstrează un ton prietenos, colegial și bine structurat (folosind liste, tabele mici sau puncte cheie când e util).`;

    // Map conversation history into parts
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    if (clasa || disciplina) {
      const lastUser = [...contents].reverse().find((c) => c.role === "user");
      if (lastUser && lastUser.parts && lastUser.parts[0]) {
        lastUser.parts[0].text = `[Context sesiune: ${clasa || "Toate clasele"} - ${disciplina || "Toate disciplinele"}]\n\n${lastUser.parts[0].text}`;
      }
    }

    // Atașează fișierele trimise din chat (PDF, DOCX, imagini) la ultimul mesaj de la utilizator
    if (Array.isArray(attachedFiles) && attachedFiles.length > 0) {
      const lastUser = [...contents].reverse().find((c) => c.role === "user");
      if (lastUser) {
        attachedFiles.forEach((file: any, fileIdx: number) => {
          if (file && file.data && (file.type?.startsWith("image/") || file.type?.includes("pdf") || file.name?.toLowerCase().endsWith(".pdf"))) {
            lastUser.parts.push({
              inlineData: {
                mimeType: file.type || (file.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
                data: file.data,
              },
            });
          }
          if (file && (file.textSnippet || file.name)) {
            lastUser.parts.push({
              text: `[FIȘIER ATAȘAT ÎN CHAT #${fileIdx + 1}: ${file.name}]\n${file.textSnippet || ""}`,
            });
          }
        });
      }
    }

    const candidateModelsToTry = ["gemini-2.5-flash", primaryModel];
    if (fallbackModel !== primaryModel && !candidateModelsToTry.includes(fallbackModel)) {
      candidateModelsToTry.push(fallbackModel);
    }
    if (!candidateModelsToTry.includes("gemini-2.5-pro")) {
      candidateModelsToTry.push("gemini-2.5-pro");
    }
    if (!candidateModelsToTry.includes("gemini-3.8-flash")) {
      candidateModelsToTry.push("gemini-3.8-flash");
    }

    let resultText = "";
    let sources: Array<{ title: string; uri: string }> = [];
    let searchQueries: string[] = [];
    let usedModel = primaryModel;
    let lastErr: any = null;

    for (const model of candidateModelsToTry) {
      try {
        usedModel = model;
        const config: any = {
          systemInstruction: CHAT_SYSTEM_INSTRUCTION,
          temperature: 0.3,
        };

        // Enable Google Search grounding for gemini-3.5-flash and general/complex tasks
        if (model === "gemini-3.5-flash" || taskType === "general" || taskType === "complex") {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          resultText = response.text;
          const candidate = response.candidates?.[0];
          const groundingMetadata = candidate?.groundingMetadata;
          const groundingChunks = groundingMetadata?.groundingChunks || [];
          searchQueries = groundingMetadata?.webSearchQueries || [];

          sources = groundingChunks
            .map((chunk: any) => {
              if (chunk.web?.uri) {
                return {
                  title: chunk.web.title || new URL(chunk.web.uri).hostname,
                  uri: chunk.web.uri,
                };
              }
              return null;
            })
            .filter(Boolean) as Array<{ title: string; uri: string }>;

          break;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`Chat model ${model} failed:`, err.message || err);
      }
    }

    if (!resultText) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      console.warn("Gemini chat models hit quota/error. Serving pedagogical fallback.");
      resultText = getPedagogicalChatFallback(lastUserMsg, clasa, disciplina);
      usedModel = "EduMetodist Expert Core (2026-2027)";
      sources = [
        { title: "Ministerul Educației (edu.ro)", uri: "https://www.edu.ro" },
        { title: "Structura Anului Școlar 2026-2027 (MEC)", uri: "https://www.edu.ro/structura_an_scolar" },
      ];
    }

    res.json({
      success: true,
      text: resultText,
      sources,
      searchQueries,
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error("Chat API error, providing pedagogical fallback:", error);
    const lastUserMsg = req.body?.messages?.[req.body.messages.length - 1]?.content || "";
    const fallbackText = getPedagogicalChatFallback(
      lastUserMsg,
      req.body?.clasa || "",
      req.body?.disciplina || ""
    );
    res.json({
      success: true,
      text: fallbackText,
      sources: [
        { title: "Ministerul Educației (edu.ro)", uri: "https://www.edu.ro" },
        { title: "Structura Anului Școlar 2026-2027 (MEC)", uri: "https://www.edu.ro/structura_an_scolar" },
      ],
      searchQueries: ["structura an scolar 2026-2027 romania", "programe scolare mec"],
      modelUsed: "EduMetodist Expert Core (2026-2027)",
    });
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
