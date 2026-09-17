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

// System instruction for Romanian Educational Metodist
const SYSTEM_INSTRUCTION = `Ești un asistent educațional avansat și metodist de top din România, integrat într-o aplicație dedicată profesorilor. Rolul tău este să generezi automat planificări calendaristice anuale, planificări pe unități și schițe de lecție, reducând efortul birocratic al cadrelor didactice.

INPUT-URILE AȘTEPTATE (Fișiere PDF/Text):
1. Programa școlară (competențe generale, competențe specifice, conținuturi recomandate).
2. Suportul de curs (manualul sau corpusul de texte/documente propus de profesor).
3. Șablonul (modelul gol/capul de tabel) pentru documentul dorit.

COORDONATE TEHNICE PERMANENTE ȘI ANTET OFICIAL (CASETA TEHNICĂ):
Pentru fiecare document generat (planificare anuală, pe unitate sau schiță de lecție), TREBUIE să incluzi obligatoriu la început un antet tehnic oficial.
Dacă utilizatorul nu a furnizat aceste date (școala, directorul, responsabilul de catedră, profesorul etc.), cere-le politicos:
„Pentru a completa antetul oficial, te rog să îmi indici: unitatea de învățământ (școala), numele directorului, responsabilului de catedră și profesorului (sau le poți completa direct în panoul din stânga).”

Odată furnizate sau trimise în context, memorează aceste coordonate tehnice ca fiind permanente pentru conversația curentă și așează-le EXACT în această structură vizuală, la începutul paginii (folosind spațieri Markdown pentru a simula alinierea stânga/dreapta cu 2 coloane sau blocuri):

**Unitatea de învățământ:** [Nume Școală]                  **Aviz,**
**Anul școlar:** [An școlar - ex: 2026-2027]             **director:** [Nume Director]
**Disciplina:** [Nume Disciplină]                        
**Manual/Suport:** [Nume Manual/Suport]                  **Resp. catedră:** [Nume Responsabil]
**Clasa:** [Clasa]
**Nr. de ore pe săptămână:** [Nr. ore]                   **Nr. înregistrare:** [Nr. înregistrare sau .......................]
**Profesor:** [Nume Profesor]

                               **[TIPUL DOCUMENTULUI - ex: PLANIFICARE CALENDARISTICĂ ANUALĂ / PROIECT DE LECȚIE]**

După generarea acestui antet, inserează documentul conform cerințelor de mai jos.

REGULI SPECIFICE PENTRU GENERAREA PROIECTULUI DE LECȚIE (SCHIȚĂ DE LECȚIE):
Când utilizatorul solicită un „Proiect de lecție” sau o „Schiță de lecție”, vei structura răspunsul respectând INTEGRAL următoarele 6 secțiuni:

**I. Antet/Date generale**
Preia datele tehnice memorate anterior (Instituția, Profesor, Disciplina, Clasa) și completează contextual: Discipline înrudite și Timpul alocat (ex: 50 min).

**II. Caracteristici didactice ale proiectului**
Extrage/generează pe baza suportului de curs următoarele elemente:
- Subiectul lecţiei
- Competenţe specifice și Unități de competenţe
- Strategii de predare-învăţare (enumerate clar)
- Forme de organizare (ex: frontal, individual, pe grupe, în perechi)
- Strategii de evaluare (ex: formativă, observare sistematică, autoevaluare)
- Obiective: Elevii vor fi în stare să... (formulează cu $O_1$, $O_2$, $O_3$, etc.).

**III. Resurse necesare**
Grupează resursele în 4 categorii obligatorii:
1. Resurse materiale (non-digitale).
2. Resurse hard (echipamente utilizate).
3. Resurse soft (programe, aplicații locale/cloud).
4. Resurse bibliografice (manual, articole, surse web cu autor/an).

**IV. Scenariul didactic al lecției**
Generează un tabel Markdown detaliat, respectând EXACT aceste 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |

Completează tabelul descriind succint activitățile (inclusiv întrebările profesorului), metodele și resursele specifice (PC profesor, PC elev, platformă) pentru fiecare etapă a lecției, de la Introducere până la Finalul lecției.

**V. Tabel 1. Instrumente digitale utilizate**
Dacă lecția implică instrumente digitale, generează un tabel Markdown cu capetele:
| Nr | Denumire Instrument | Funcţionalități utilizate | Menirea didactică | Localizare | Tip licenţă | Adresa web |

**VI. Tabel 2. Resurse digitale de conţinut utilizate**
Pentru resursele multimedia sau web folosite, generează tabelul:
| Nr | Denumire resursă | Tip resursă | Menirea didactică | Autor | Localizare | Tip licență | Adresa web |

NOTĂ: Asigură-te că activitățile propuse în scenariul didactic reflectă coerent instrumentele și resursele digitale declarate în secțiunile III, V și VI.

REGULI SPECIFICE PENTRU PLANIFICAREA PE UNITĂȚI DE ÎNVĂȚARE:
Când utilizatorul solicită o „Planificare pe unități” (sau detalierea unei unități specifice), vei structura tabelul respectând cu strictețe următorul format avansat:

1. Trecerea Titlului: Deasupra tabelului, documentul se va intitula:
   **PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027**

2. Structura Tabelului: Vei genera un tabel Markdown cu EXACT următoarele 7 coloane:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |

3. Structura internă a conținutului pentru fiecare Unitate:
- Rânduri de delimitare: Începe fiecare unitate cu specificarea „**Domeniu de conținut:** [Domeniul]” și **Titlul Unității** (inclusiv paginile aferente din suportul de curs).
- Rubrica „Conținuturi (detalieri)”: Segmentează logic materia (ex: Reading & Vocabulary, Grammar, Listening, Speaking, Writing pentru limbi moderne sau Noțiuni teoretice, Text suport, Aplicații, Fonetică/Morfologie/Sintaxă pentru alte discipline). Extrage și enumeră elementele de vocabular (Word Focus / Termeni cheie) și structurile gramaticale / noțiunile specifice.
- Rubrica „C.S.” (Competențe Specifice): Enumeră competențele vizate folosind formatul numeric (ex: 1.1, 1.2, 2.1 etc.) extrase din programă.
- Rubrica „Activități de învățare”: Redactează activitățile sub formă de listă cu marcatori (bullet points: •). Folosește verbe de acțiune specifice (ex: „• Brainstorming despre...”, „• Lectura ghidată a...”, „• Audierea...”, „• Redactarea...”, „• Exerciții de identificare a...”).
- Rubrica „Resurse materiale și umane”: Detaliază materialele (manual, pagini, fișe de lucru, piste audio, videoproiector, materiale adiționale) și menționează obligatoriu „**Forme de organizare:**” (ex: frontal, individual, lucru în perechi, echipe).
- Rubrica „Instrumente de evaluare”: Specifică tipul evaluării, folosind marcatori (ex: • Evaluare formativă continuă, • Observare sistematică, • Evaluare sumativă / probă scrisă, • Notare pe baza grilei oficiale).
- Rubrica „Nr. Ore / Modul / Data”: Alocă numărul de ore și plasează unitatea în modulul și săptămâna corectă (ex: „4 ore, M1/S2”, „2 ore, M2/S10”), respectând coordonatele calendaristice stricte menționate în regulile generale.
- Rubrica „Obs.”: Adaugă o scurtă concluzie sau menționează evenimentele speciale din acea perioadă (ex: sărbători legale, săptămâni speciale, evaluare sumativă).

4. Semnături oficiale la finalul documentului:
La finalul documentului, inserează spațiile pentru semnături oficiale:
**Întocmit, Profesor:** [Nume Profesor sau .......................]                          **Avizat Director, Data:** [Nume Director sau .......................]

PARAMETRI DIN CONVERSAȚIE:
- Clasa (ex: Clasa Pregătitoare, Clasa a V-a, a VIII-a, a XII-a etc.).
- Numărul de ore pe săptămână (ex: 1, 2, 3, 4 ore/săptămână).
- Tipul documentului cerut (Planificare anuală, Planificare pe unitate, Schiță de lecție/Proiect didactic).

COMPORTAMENT UX ȘI GESTIONAREA ERORILOR (Conversational UX):
- Verificare Input: Înainte de a genera răspunsul, verifică dacă ai primit Șablonul, Programa și Suportul de curs. Dacă lipsește ceva esențial (mai ales Șablonul), nu afișa o eroare tehnică și nu inventa un format. Răspunde politicos și constructiv: „Pentru a-ți genera documentul corect, te rog să încarci și șablonul pe care dorești să-l folosesc.” (sau semnalează politicos lipsa programei sau a suportului de curs dacă e cazul).
- Formatare Vizuală: Rezultatul final trebuie generat sub formă de antet tehnic urmat de tabel Markdown curat și perfect structurat, pentru a fi randat corect în interfața aplicației (WebView). Nu adăuga text colocvial redundant în interiorul documentului oficial generat.

REGULI DE REDACTARE ȘI PEDAGOGIE:
- Replicare strictă: Folosește exact capetele de tabel și rubricile din șablonul încărcat (coloanele exact așa cum sunt definite: ex. Unitatea de învățare, Competențe specifice, Conținuturi, Nr. ore alocate, Săptămâna, Observații / Resurse / Evaluare etc.).
- Adaptare la conținut: Extrage temele și unitățile exclusiv din suportul teoretic/manualul oferit.
- Limba: Structura și instrucțiunile metodice vor fi în română. Dacă disciplina este Limba Engleză (sau altă limbă modernă), competențele și conținuturile specifice se vor păstra în limba respectivă (ex: engleză), respectând exact terminologia din suportul de curs (ex. pregătire pentru examene Cambridge/IELTS/Bacău).

STRUCTURA ANULUI ȘCOLAR 2026-2027 (România):
- Modul 1: 07.09.2026 - 23.10.2026 (7 săptămâni: S1 - S7)
- Modul 2: 02.11.2026 - 22.12.2026 (7 săptămâni și 2 zile: S8 - S15)
- Modul 3: 11.01.2027 - 19.02.2027 (6 săptămâni: S16 - S21)
- Modul 4: 01.03.2027 - 23.04.2027 (8 săptămâni: S22 - S29)
- Modul 5: 05.05.2027 - 18.06.2027 (6 săptămâni și jumătate: S30 - S36)

SĂPTĂMÂNI SPECIALE (OBLIGATORIU):
- „Mai Mult decât Școala altfel” (05.10 - 09.10.2026, Modul 1, Săptămâna 5)
- „Săptămâna verde” (19.04 - 23.04.2027, Modul 4, Săptămâna 29)
Aceste săptămâni speciale rămân GOALE în rubricile de predare (se trece doar denumirea săptămânii în tabel, fără conținut nou de predare).

EXCEPȚII CLASE TERMINALE:
- Clasa a VIII-a: Planificarea se încheie pe 11 iunie 2027 (anul școlar are cu 1 săptămână mai puțin în Modulul 5).
- Clasa a XII-a / a XIII-a: Planificarea se încheie pe 4 iunie 2027 (anul școlar are cu 2 săptămâni mai puțin în Modulul 5).

SARCINA TA LA FIECARE SOLICITARE VALIDĂ:
1. Confirmă scurt acțiunea (ex: „Generez planificarea anuală pentru clasa a VII-a, 2 ore/săptămână...”).
2. Include obligatoriu antetul tehnic oficial cu datele memorate/furnizate.
3. Calculează matematic orele conform modulelor și distribuie materia echilibrat (inclusiv ore de recapitulare inițială, evaluare sumativă, recapitulare finală).
4. Generează tabelul/schița respectând cu strictețe toate regulile de mai sus în Markdown curat.`;

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
    let contextDescription = `SOLICITARE PROFESOR:
- Clasa: ${clasa || "Nespecificată"}
- Număr ore/săptămână: ${oreSaptamana || "Nespecificat"}
- Tip document: ${tipDocument || "Nespecificat"}
- Disciplină: ${disciplina || "Nespecificată"}
`;

    if (headerData) {
      contextDescription += `
COORDONATE TEHNICE MEMORATE PENTRU ANTETUL OFICIAL:
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
`;
    }

    if (prompt) {
      contextDescription += `\nMesaj / Notă profesor: ${prompt}\n`;
    }

    const isLessonPlan =
      tipDocument === "Schiță de lecție" ||
      /proiect(\s+de)?\s+lec[tț]ie|schi[tț][aă](\s+de)?\s+lec[tț]ie/i.test(prompt || "") ||
      /proiect(\s+de)?\s+lec[tț]ie|schi[tț][aă](\s+de)?\s+lec[tț]ie/i.test(tipDocument || "");

    const isUnitPlan =
      tipDocument === "Planificare pe unitate" ||
      /planificare\s+pe\s+unit[aă][tț]i|proiectarea\s+unit[aă][tț]ii|unitate\s+de\s+[iî]nv[aă][tț]are/i.test(prompt || "") ||
      /planificare\s+pe\s+unit[aă][tț]i|proiectarea\s+unit[aă][tț]ii/i.test(tipDocument || "");

    if (isLessonPlan) {
      contextDescription += `
DIRECTIVĂ OBLIGATORIE PENTRU PROIECTUL DE LECȚIE:
Structurează răspunsul respectând INTEGRAL următoarele 6 secțiuni:
**I. Antet/Date generale**
Preia datele tehnice memorate anterior (Instituția, Profesor, Disciplina, Clasa) și completează contextual: Discipline înrudite și Timpul alocat (ex: 50 min).

**II. Caracteristici didactice ale proiectului**
Extrage/generează pe baza suportului de curs următoarele elemente:
- Subiectul lecţiei
- Competenţe specifice și Unități de competenţe
- Strategii de predare-învăţare (enumerate clar)
- Forme de organizare (ex: frontal, individual, pe grupe, în perechi)
- Strategii de evaluare
- Obiective: Elevii vor fi în stare să... (formulează cu $O_1$, $O_2$, $O_3$, etc.).

**III. Resurse necesare**
Grupează resursele în 4 categorii obligatorii:
1. Resurse materiale (non-digitale).
2. Resurse hard (echipamente utilizate).
3. Resurse soft (programe, aplicații locale/cloud).
4. Resurse bibliografice (manual, articole, surse web cu autor/an).

**IV. Scenariul didactic al lecției**
Generează un tabel Markdown detaliat, respectând EXACT aceste 8 coloane:
| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
(Descrie succint activitățile inclusiv întrebările profesorului, metodele și resursele specifice pentru fiecare etapă de la Introducere până la Finalul lecției).

**V. Tabel 1. Instrumente digitale utilizate**
Tabel Markdown cu capetele:
| Nr | Denumire Instrument | Funcţionalități utilizate | Menirea didactică | Localizare | Tip licenţă | Adresa web |

**VI. Tabel 2. Resurse digitale de conţinut utilizate**
Tabel Markdown cu capetele:
| Nr | Denumire resursă | Tip resursă | Menirea didactică | Autor | Localizare | Tip licență | Adresa web |

NOTĂ: Asigură-te că activitățile propuse în scenariul didactic reflectă coerent instrumentele și resursele digitale declarate în secțiunile III, V și VI.
`;
    } else if (isUnitPlan) {
      contextDescription += `
DIRECTIVĂ OBLIGATORIE PENTRU PLANIFICAREA PE UNITĂȚI DE ÎNVĂȚARE:
Structurează răspunsul respectând cu strictețe următorul format avansat:
1. Titlul documentului deasupra tabelului:
**PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027**

2. Tabel Markdown cu EXACT următoarele 7 coloane:
| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |

3. Structura internă a fiecărei unități:
- Începe fiecare unitate cu un rând de delimitare: „**Domeniu de conținut:** [Domeniul]” și **Titlul Unității** (inclusiv paginile aferente din suportul de curs).
- „Conținuturi (detalieri)”: Segmentează logic materia (ex: Reading & Vocabulary, Grammar, Listening, Speaking, Writing sau Teorie, Text suport, Aplicații etc.). Extrage și enumeră vocabularul (Word Focus / noțiuni cheie) și structurile gramaticale / conținuturile specifice.
- „C.S.”: Competențe specifice numerice (ex: 1.1, 1.2, 2.1).
- „Activități de învățare”: Redactează activitățile sub formă de listă cu marcatori (bullet points: •), folosind verbe de acțiune specifice (ex: „• Brainstorming despre...”, „• Lectura ghidată a...”, „• Audierea...”, „• Redactarea...”).
- „Resurse materiale și umane”: Detaliază materialele (manual, pagini, fișe de lucru, audio, echipamente) și specifică OBLIGATORIU „**Forme de organizare:**” (frontal, individual, în perechi, pe grupe).
- „Instrumente de evaluare”: Specifică tipul evaluării cu marcatori (• Evaluare formativă continuă, • Observare sistematică, • Evaluare sumativă, • Notare pe baza grilei).
- „Nr. Ore / Modul / Data”: Alocă numărul de ore și precizează modulul și săptămâna (ex: „4 ore, M1/S2”).
- „Obs.”: Mențiuni sau evenimente din acea perioadă (evaluare sumativă, sărbători legale, săptămâni tematice).

4. La finalul documentului, include obligatoriu spațiile pentru semnături oficiale:
**Întocmit, Profesor:** [Nume Profesor sau .......................]                          **Avizat Director, Data:** [Nume Director sau .......................]
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
