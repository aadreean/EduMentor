import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with generous limits for file uploads (PDFs, text)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// System instruction for Romanian Educational Metodist (v.5.0 - Expert Curricular & Metodist Polivalent)
const SYSTEM_INSTRUCTION = `Ești un asistent educațional avansat, expert curricular și metodist polivalent de top din România, integrat într-o aplicație destinată cadrelor didactice din învățământul preuniversitar. Rolul tău este să reduci birocrația prin generarea automată a planificărilor calendaristice anuale (pe 5 module), a planificărilor pe unități de învățare (structură normată de 7 coloane) și a proiectelor de lecție detaliate (structură normată în 6 secțiuni și tabel de 8 coloane).

1. CARACTER UNIVERSAL ȘI FLEXIBILITATE CURRICULARĂ TOTALĂ:
- Aplicația funcționează pentru ORICE DISCIPLINĂ din învățământul preuniversitar (științe exacte, discipline umaniste, tehnice, arte, sport, socio-umane etc.).
- Fără restricții predefinite pe clase sau discipline: Generarea conținuturilor, a detaliersilor tematice, a competențelor și a activităților de învățare se va face EXCLUSIV în funcție de documentele încărcate de profesor (Programa școlară, Manualul sau corpusul de documente) și de clasa menționată în parametrii de sesiune. Nivelul de complexitate și terminologia se vor adapta natural la specificul disciplinei și al vârstei elevilor.
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

3. REGULI DE REDACTARE ȘI FORMAT TABELAR:
- Replicarea strictă a șabloanelor încărcate de profesor pentru capetele de tabel.
- Pentru Planificarea pe Unități: Se utilizează structura normată de 7 coloane:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
- Pentru Proiectul de Lecție: Se respectă cele 6 secțiuni metodice și tabelul scenariului didactic în 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
alături de tabelele specifice pentru instrumente și resurse digitale.
- Regula Paginației Lipsă: Dacă documentul suport nu are pagini numerotate clar, este STRICT INTERZISĂ inventarea numerelor de pagină; se va folosi exclusiv mențiunea [conform suport curs] sau [conform manual].

4. CONSTRÂNGERI CALENDARISTICE (ANUL ȘCOLAR 2026-2027):
- Anul școlar este împărțit în 5 module:
  * Modul 1: 07.09.2026 - 23.10.2026 (7 săptămâni: S1 - S7)
  * Modul 2: 02.11.2026 - 22.12.2026 (7 săptămâni și 2 zile: S8 - S15)
  * Modul 3: 11.01.2027 - 19.02.2027 (durată flexibilizată în funcție de vacanța județeană din februarie)
  * Modul 4: 01.03.2027 - 23.04.2027 (durată flexibilizată în funcție de vacanța județeană din februarie)
  * Modul 5: 05.05.2027 - 18.06.2027
- Săptămânile speciale „Mai Mult decât Școala altfel” (ex: Modulul 1, Săptămâna 5) și „Săptămâna verde” (ex: Modulul 4, Săptămâna 29) vor rămâne GOALE în ceea ce privește predarea de conținuturi noi (se notează doar denumirea activității).
- Aplicarea excepțiilor pentru clasele terminale:
  * Clasa a VIII-a: Cursurile se încheie la 11 iunie 2027 (35 săptămâni de cursuri).
  * Clasa a XII-a / a XIII-a: Cursurile se încheie la 4 iunie 2027 (34 săptămâni de cursuri).
  * Filiera tehnologică / profesională: Cursurile se încheie la 25 iunie 2027 (37 săptămâni de cursuri).
- Integrarea dinamică a duratei Modulului 3 și Modulului 4 în funcție de săptămâna vacanței din februarie setată de profesor.

5. PROTECȚIE ÎMPOTRIVA TRUNCHIERII (GENERARE MODULARĂ) ȘI SUPORT EXPORT:
- La solicitarea unei planificări anuale complete, generează inițial un tabel continuu exclusiv pentru Modulele 1 și 2, oprindu-te și afișând mesajul:
  "💡 Am generat Modulele 1 și 2 pentru a păstra formatarea intactă. Scrie «Continuă cu M3-M5» pentru a finaliza planificarea anuală."
- La comanda de continuare («Continuă cu M3-M5»), asamblează restul modulelor într-un document unitar.
- La finalizarea oricărui document, afișează caseta tehnică de export:
  📥 **Fișierul este pregătit pentru descărcare:**
  [Descarcă format .DOCX] | [Descarcă format .PDF]
  optimizând tabelele pentru vizualizare A4 Landscape.

6. OPTIMIZĂRI FINALE DE METODOLOGIE ȘI CALCUL (v.7.0):
1. VALIDARE MATEMATICĂ ORARĂ:
   - Calculează automat produsul dintre numărul de ore pe săptămână și săptămânile efective de curs din fiecare modul.
   - Dacă există discrepanțe în solicitarea profesorului, recalculează corect și inserează o scurtă «Notă metodologică de bilanț orar» la subsolul planificării anuale (înainte de semnături), detaliind orele de predare per modul, orele săptămânilor speciale și totalul general al normei anuale.
2. CONDIȚIONARE DE SĂRBĂTORI LEGALE:
   - Marchează obligatoriu la rubrica "Obs." zilele libere legale care intersectează săptămânile de curs conform calendarului 2026-2027:
     * Modulul 1 (S5): 05.10.2026 (Ziua Educației - zi liberă) & Săptămâna „Mai Mult decât Școala altfel” (fără predare conținut nou).
     * Modulul 2 (S12): 30 Noiembrie (Sfântul Andrei) și 01 Decembrie (Ziua Națională a României) - zile libere legale nelucrătoare; se adaptează numărul de ore/conținutul.
     * Modulul 3 (S17/S18): 24 Ianuarie (Ziua Unirii Principatelor Române).
     * Modulul 4 (S29): Săptămâna „Săptămâna verde” (fără predare conținut nou); vacanța de primăvară include Paștele Ortodox și 1 Mai (Ziua Muncii).
     * Modulul 5 (S34): 01 Iunie (Ziua Copilului - marți, zi liberă legală nelucrătoare); 21 Iunie (A doua zi de Rusalii - pt. filiera tehnologică).
3. ECHILIBRU MODULAR (RECAPITULARE):
   - Asigură-te că FIECARE MODUL (M1, M2, M3, M4, M5) se încheie în mod OBLIGATORIU cu activități de recapitulare, sistematizare, fixare sau evaluare sumativă/formativă, conform bunelor practici pedagogice.`;

// Shared Gemini client
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
  });
});

// API endpoint to generate educational plans or chat with metodist
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      conversationHistory = [],
      clasa,
      oreSaptamana,
      tipDocument,
      disciplina,
      headerData,
      programaFile,
      suportFile,
      sablonFile,
      sablonText,
      programaText,
      suportText,
    } = req.body;

    const ai = getGeminiClient();

    // Prepare contents parts for Gemini 3.8 Flash
    const contents: any[] = [];

    // If conversation history is provided, add prior messages
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Build the user prompt parts with attached files/documents
    const userParts: any[] = [];

    // Context description
    let contextDescription = `SOLICITARE PROFESOR (v.5.0):
- Clasa: ${clasa || "Nespecificată"}
- Număr ore/săptămână: ${oreSaptamana || "Nespecificat"}
- Tip document: ${tipDocument || "Nespecificat"}
- Disciplină: ${disciplina || "Nespecificată"}
`;

    if (headerData) {
      contextDescription += `
COORDONATE TEHNICE COMPLETE PENTRU ANTETUL OFICIAL OBLIGATORIU:
- Unitatea de învățământ: ${headerData.unitateInvatamant || "[Nume Școală]"}
- Anul școlar: ${headerData.anScolar || "2026-2027"}
- Disciplina: ${headerData.disciplina || disciplina || "[Nume Disciplină]"}
- Manual/Suport: ${headerData.manualSuport || "[Nume Manual/Suport]"}
- Clasa: ${headerData.clasa || clasa || "[Clasa]"}
- Nr. de ore pe săptămână: ${headerData.nrOreSaptamana || oreSaptamana || "[Nr. ore]"}
- Profesor: ${headerData.profesor || "[Nume Profesor]"}
- Director: ${headerData.director || "[Nume Director]"}
- Responsabil catedră: ${headerData.respCatedra || "[Nume Responsabil]"}
- Nr. înregistrare: ${headerData.nrInregistrare || "......................."}
- Vacanță februarie (județeană): ${headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
`;
    }

    if (prompt) {
      contextDescription += `\nMesaj / Notă profesor: ${prompt}\n`;
    }

    // Check if continuation request
    const isContinuation =
      /continu[aă]\s+cu\s+m3|m3\s*-\s*m5|modulele\s+3/i.test(prompt || "");

    const isLessonPlan =
      tipDocument === "Schiță de lecție" ||
      /proiect(\s+de)?\s+lec[tț]ie|schi[tț][aă](\s+de)?\s+lec[tț]ie/i.test(prompt || "") ||
      /proiect(\s+de)?\s+lec[tț]ie|schi[tț][aă](\s+de)?\s+lec[tț]ie/i.test(tipDocument || "");

    const isUnitPlan =
      tipDocument === "Planificare pe unitate" ||
      /planificare\s+pe\s+unit[aă][tț]i|proiectarea\s+unit[aă][tț]ii|unitate\s+de\s+[iî]nv[aă][tț]are/i.test(prompt || "") ||
      /planificare\s+pe\s+unit[aă][tț]i|proiectarea\s+unit[aă][tț]ii/i.test(tipDocument || "");

    const isAnnualPlan =
      tipDocument === "Planificare anuală" ||
      /planificare(\s+calendaristic[aă])?\s+anual[aă]/i.test(prompt || "") ||
      /planificare(\s+calendaristic[aă])?\s+anual[aă]/i.test(tipDocument || "");

    const hoursPerWeek = Number(oreSaptamana) || 2;
    const isClasa8 = /viii|8/i.test(clasa || headerData?.clasa || "");
    const isClasa12 = /xii|xiii|12|13/i.test(clasa || headerData?.clasa || "");
    const isTehno = /tehnologic|profesional/i.test(clasa || headerData?.clasa || "");

    // Calcul matematic orar conform v.7.0
    const m1Weeks = 7;
    const m1TeachingWeeks = 6; // S5 este Școala Altfel
    const m1Hours = m1TeachingWeeks * hoursPerWeek;

    const m2Weeks = 7;
    const m2TeachingWeeks = 7;
    const m2Hours = m2TeachingWeeks * hoursPerWeek;

    const m3Weeks = 6;
    const m3TeachingWeeks = 6;
    const m3Hours = m3TeachingWeeks * hoursPerWeek;

    const m4Weeks = 8;
    const m4TeachingWeeks = 7; // S29 este Săptămâna Verde
    const m4Hours = m4TeachingWeeks * hoursPerWeek;

    const m5Weeks = isClasa12 ? 4 : isClasa8 ? 5 : isTehno ? 7 : 6;
    const m5TeachingWeeks = m5Weeks;
    const m5Hours = m5TeachingWeeks * hoursPerWeek;

    const totalWeeksAll = m1Weeks + m2Weeks + m3Weeks + m4Weeks + m5Weeks;
    const totalTeachingWeeks = m1TeachingWeeks + m2TeachingWeeks + m3TeachingWeeks + m4TeachingWeeks + m5TeachingWeeks;
    const totalTeachingHours = m1Hours + m2Hours + m3Hours + m4Hours + m5Hours;
    const totalSpecialHours = 2 * hoursPerWeek;
    const totalAnnualHours = totalTeachingHours + totalSpecialHours;

    contextDescription += `
REGULI STRICTE APLICATE (v.7.0 - Optimizări Metodologie & Calcul):
1. ANTET TEHNIC: Începe documentul cu antetul tehnic oficial complet, afișând toate datele de mai sus.
2. REGULA PAGINAȚIEI LIPSĂ: Dacă nu există numere de pagină explicite în suportul încărcat, folosește EXCLUSIV mențiunea [conform suport curs] sau [conform manual]. Nu inventa numere de pagină!
3. ADAPTARE TERMINOLOGICĂ: Adaptează rubricile specifice pentru ${disciplina || "disciplina menționată"}.
4. VALIDARE MATEMATICĂ ORARĂ (OBLIGATORIE):
   - Norma săptămânală: ${hoursPerWeek} ore/săptămână.
   - Modulul 1: ${m1Hours} ore (${m1TeachingWeeks} săpt. predare + 1 săpt. Școala Altfel)
   - Modulul 2: ${m2Hours} ore (${m2TeachingWeeks} săpt. predare)
   - Modulul 3: ${m3Hours} ore (${m3TeachingWeeks} săpt. predare)
   - Modulul 4: ${m4Hours} ore (${m4TeachingWeeks} săpt. predare + 1 săpt. Săptămâna Verde)
   - Modulul 5: ${m5Hours} ore (${m5TeachingWeeks} săpt. predare)
   - TOTAL PREDARĂ EFECTIVĂ: ${totalTeachingHours} ore (${totalTeachingWeeks} săptămâni efective).
   - TOTAL GENERAL NORMĂ: ${totalAnnualHours} ore (${totalWeeksAll} săptămâni).
5. CONDIȚIONARE DE SĂRBĂTORI LEGALE (Rubrica "Obs."):
   - Marchează explicit zilele libere legale: 30 Nov - 1 Dec (M2/S12), 24 Ian (M3), 1 Iunie (M5/S34) și săptămânile speciale.
6. ECHILIBRU MODULAR (RECAPITULARE):
   - Fiecare modul se încheie obligatoriu cu activități de recapitulare, sinteză sau evaluare!
`;

    if (isContinuation) {
      let m5Spec = `Modulul 5 (S30 - S36, 05.05.2027 - 18.06.2027, ${m5Hours} ore predare, cu ore de recapitulare finală și bilanț anual)`;
      if (isClasa8) {
        m5Spec = `Modulul 5 (S30 - S35, 05.05.2027 - 11.06.2027 - EXCEPȚIE CLASA A VIII-A: ${m5Hours} ore predare, finalizare la 11 iunie 2027, cu recapitulare intensivă și pregătire Evaluare Națională)`;
      } else if (isClasa12) {
        m5Spec = `Modulul 5 (S30 - S34, 05.05.2027 - 04.06.2027 - EXCEPȚIE CLASA A XII-A / A XIII-A: ${m5Hours} ore predare, finalizare la 4 iunie 2027, cu pregătire Bacalaureat)`;
      } else if (isTehno) {
        m5Spec = `Modulul 5 (S30 - S37, 05.05.2027 - 25.06.2027 - ÎNVĂȚĂMÂNT TEHNOLOGIC/PROFESIONAL: ${m5Hours} ore predare, finalizare la 25 iunie 2027)`;
      }

      contextDescription += `
PROTECȚIE ÎMPOTRIVA TRUNCHIERII (Partea a II-a: Modulele 3 - 5 conform v.7.0):
Generează continuarea planificării anuale pentru:
- Modulul 3 (S16 - S21, 11.01.2027 - 19.02.2027, ${m3Hours} ore predare; se menționează 24 Ianuarie la Obs.; se încheie cu recapitulare și evaluare M3)
- Modulul 4 (S22 - S29, 01.03.2027 - 23.04.2027, ${m4Hours} ore predare; cu Săptămâna Verde marcată în S29 fără predare nouă; se încheie cu recapitulare M4)
- ${m5Spec}
Fiecare modul se încheie OBLIGATORIU cu un rând dedicat de Recapitulare și Evaluare!

După încheierea tabelului, adaugă OBLIGATORIU:
### Notă metodologică de bilanț orar (2026-2027):
* **Normă săptămânală:** ${hoursPerWeek} ore/săptămână
* **Distribuția orelor de predare pe module:**
  - Modulul 1: ${m1TeachingWeeks} săpt. predare × ${hoursPerWeek} ore/săpt = ${m1Hours} ore (+ 1 săpt. „Școala altfel”)
  - Modulul 2: ${m2TeachingWeeks} săpt. predare × ${hoursPerWeek} ore/săpt = ${m2Hours} ore
  - Modulul 3: ${m3TeachingWeeks} săpt. predare × ${hoursPerWeek} ore/săpt = ${m3Hours} ore
  - Modulul 4: ${m4TeachingWeeks} săpt. predare × ${hoursPerWeek} ore/săpt = ${m4Hours} ore (+ 1 săpt. „Săptămâna verde”)
  - Modulul 5: ${m5TeachingWeeks} săpt. predare × ${hoursPerWeek} ore/săpt = ${m5Hours} ore
* **Total ore predare efectivă:** ${totalTeachingHours} ore (${totalTeachingWeeks} săptămâni)
* **Total ore activități săptămâni speciale:** ${totalSpecialHours} ore (2 săptămâni: „Școala altfel” și „Săptămâna verde”)
* **Total general normă anuală:** ${totalAnnualHours} ore (${totalWeeksAll} săptămâni de structură școlară)

Apoi semnăturile oficiale:
**Întocmit, Profesor:** ${headerData?.profesor || "[Nume Profesor]"}                          **Avizat Director, Data:** ${headerData?.director || "[Nume Director]"}

Și secțiunea de export obligatorie:
📥 **Fișierul este pregătit pentru descărcare:**
[Descarcă format .DOCX] | [Descarcă format .PDF]
`;
    } else if (isAnnualPlan) {
      contextDescription += `
PROTECȚIE ÎMPOTRIVA TRUNCHIERII (Generare Modulară - Partea I conform v.7.0):
Generează tabelul exclusiv pentru Modulele 1 și 2:
- Modulul 1 (07.09.2026 - 23.10.2026, 7 săptămâni: S1 - S7, din care S5 este „Mai mult decât Școala altfel” fără predare nouă; exact ${m1Hours} ore predare). Se încheie OBLIGATORIU cu recapitulare și evaluare inițială/formativă în S7.
- Modulul 2 (02.11.2026 - 22.12.2026, 7 săptămâni și 2 zile: S8 - S15, exact ${m2Hours} ore predare; se marchează la Obs. în S12: „30 Nov (Sf. Andrei) & 1 Dec (Ziua Națională) - zile libere legale nelucrătoare; conținut adaptat”). Se încheie OBLIGATORIU cu recapitulare și evaluare sumativă în S15.
La sfârșitul Modulului 2, OPREȘTE GENERAREA și afișează EXACT acest mesaj de continuare:
💡 Am generat Modulele 1 și 2 pentru a păstra formatarea intactă. Scrie «Continuă cu M3-M5» pentru a finaliza planificarea anuală.
`;
    } else if (isLessonPlan) {
      contextDescription += `
DIRECTIVĂ OBLIGATORIE PENTRU PROIECTUL DE LECȚIE:
Structurează răspunsul respectând INTEGRAL cele 6 secțiuni metodice și tabelul de scenariu didactic cu EXACT 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
alături de tabelele specifice pentru instrumente și resurse digitale.
La final adaugă obligatoriu semnăturile și:
📥 **Fișierul este pregătit pentru descărcare:**
[Descarcă format .DOCX] | [Descarcă format .PDF]
`;
    } else if (isUnitPlan) {
      contextDescription += `
DIRECTIVĂ OBLIGATORIE PENTRU PLANIFICAREA PE UNITĂȚI DE ÎNVĂȚARE:
Structurează răspunsul cu tabelul Markdown având EXACT cele 7 coloane normate:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
La final adaugă semnăturile oficiale:
**Întocmit, Profesor:** ${headerData?.profesor || "[Nume Profesor]"}                          **Avizat Director, Data:** ${headerData?.director || "[Nume Director]"}
și secțiunea de export:
📥 **Fișierul este pregătit pentru descărcare:**
[Descarcă format .DOCX] | [Descarcă format .PDF]
`;
    }

    userParts.push({ text: contextDescription });

    // Attach Sablon if present
    if (sablonFile && sablonFile.data) {
      userParts.push({
        inlineData: {
          mimeType: sablonFile.mimeType || "application/pdf",
          data: sablonFile.data,
        },
      });
      userParts.push({ text: `[FIȘIER ATAȘAT: ȘABLONUL / MODELUL DE DOCUMENT]` });
    } else if (sablonText && sablonText.trim()) {
      userParts.push({ text: `[ȘABLON / MODEL DE DOCUMENT]:\n${sablonText}` });
    }

    // Attach Programa if present
    if (programaFile && programaFile.data) {
      userParts.push({
        inlineData: {
          mimeType: programaFile.mimeType || "application/pdf",
          data: programaFile.data,
        },
      });
      userParts.push({ text: `[FIȘIER ATAȘAT: PROGRAMA ȘCOLARĂ]` });
    } else if (programaText && programaText.trim()) {
      userParts.push({ text: `[PROGRAMA ȘCOLARĂ]:\n${programaText}` });
    }

    // Attach Suport de curs if present
    if (suportFile && suportFile.data) {
      userParts.push({
        inlineData: {
          mimeType: suportFile.mimeType || "application/pdf",
          data: suportFile.data,
        },
      });
      userParts.push({ text: `[FIȘIER ATAȘAT: SUPORT DE CURS / MANUAL / CORPUS DE TEXTE]` });
    } else if (suportText && suportText.trim()) {
      userParts.push({ text: `[SUPORT DE CURS / MANUAL / CORPUS DE TEXTE]:\n${suportText}` });
    }

    contents.push({
      role: "user",
      parts: userParts,
    });

    let responseText = "";
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const isGemini3 = modelName.startsWith("gemini-3");
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        };
        if (isGemini3) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!responseText) {
      throw lastError || new Error("Nu s-a putut genera răspunsul de la model.");
    }

    res.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "A apărut o eroare la generarea planificării.",
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
