import { DocumentType, TechnicalHeaderData, formatClasaHeader } from "../types";
import { calculateAcademicHours } from "../data/curriculumData";

export interface PlanGenerationParams {
  clasa: string;
  disciplina: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  headerData: TechnicalHeaderData;
  manualSuport?: string;
  programaSnippets?: string[];
  suportSnippets?: string[];
}

export function generatePedagogicalPlan(params: PlanGenerationParams): string {
  const {
    clasa,
    disciplina,
    oreSaptamana,
    tipDocument,
    headerData,
    manualSuport = headerData.manualSuport || "",
    programaSnippets = [],
    suportSnippets = [],
  } = params;

  const hoursPerWeek = Number(oreSaptamana) || 2;
  const isClasa12 = /xii|xiii|12|13/i.test(clasa || headerData.clasa || "");
  const isClasa8 = /viii|8/i.test(clasa || headerData.clasa || "");
  const isTehno = /tehnologic|profesional/i.test(clasa || headerData.clasa || "");

  const calc = calculateAcademicHours(clasa, hoursPerWeek);

  // Determine discipline archetype
  const discLower = (disciplina || headerData.disciplina || "").toLowerCase();
  const isEnglish = discLower.includes("englez") || discLower.includes("english");
  const isRomanian = discLower.includes("român") || discLower.includes("roman");
  const isHistory = discLower.includes("istor");
  const isMath = discLower.includes("matemat") || discLower.includes("algebr") || discLower.includes("geometr");
  const isScience = discLower.includes("fizic") || discLower.includes("chim") || discLower.includes("biolog");
  const isFrench = discLower.includes("francez") || discLower.includes("français");

  const schoolName = headerData.unitateInvatamant || "Liceul Teoretic";
  const teacherName = headerData.profesor || "Profesor";
  const directorName = headerData.director || "Prof. Director";
  const headOfDeptName = headerData.respCatedra || "Prof. Responsabil Comisie";
  const regNr = headerData.nrInregistrare || ".......................";
  const manual = manualSuport || headerData.manualSuport || (isEnglish ? "Cambridge Open World C1" : isRomanian ? "Manual Ed. Art Klett" : "Manual aprobat MEC");

  // Format the official technical header
  const headerSection = `**Unitatea de învățământ:** ${schoolName}                  **Avizat director:** ${directorName}
**Anul școlar:** 2026-2027                                  **Avizat resp. catedră:** ${headOfDeptName}
**Disciplina:** ${disciplina || "Disciplină de specialitate"}                          **Nr. înregistrare:** ${regNr}
**Manual/Suport:** ${manual}                    **Vacanță februarie (județeană):** ${headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
**Clasa:** ${formatClasaHeader(clasa, headerData)}
**Nr. de ore pe săptămână:** ${hoursPerWeek} ${hoursPerWeek === 1 ? "oră/săpt." : "ore/săpt."}
**Profesor:** ${teacherName}

`;

  if (tipDocument === "Planificare anuală") {
    let tableContent = "";

    if (isEnglish) {
      tableContent = `                                **PLANIFICARE CALENDARISTICĂ ANUALĂ - ANUL ȘCOLAR 2026-2027**
                                          **Limba Modernă (Nivel C1/B2+)**

| Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi (detalieri tematice, gramaticale și lexicale) | Nr. ore alocate | Săptămâna | Observații |
|---|---|---|---|---|---|---|
| **MODULUL 1** | **07.09.2026 - 23.10.2026** | | **(7 săptămâni: 6 săpt. predare + 1 săpt. Școala altfel)** | | | |
| 1 | Initial Assessment & Course Orientation | 1.1, 2.1 | Diagnostic test, communicative needs analysis, CEFR C1 descriptor overview, language learning strategies | ${hoursPerWeek} | S1 | Evaluare inițială |
| 2 | Unit 1: Pushing the Boundaries (Travel & Exploration) | 1.1, 1.2, 2.1, 3.1 | Extreme journeys, cultural frontiers, compound adjectives, present & perfect aspect nuances, descriptive narrative writing | ${hoursPerWeek * 2} | S2 - S3 | [conform manual] |
| 3 | Unit 2: Mind, Brain & Human Nature | 1.2, 2.2, 3.2 | Cognitive psychology, memory, emotional intelligence, passive reporting structures, inversion for emphasis, opinion essay | ${hoursPerWeek} | S4 | [conform suport curs] |
| 4 | Programul Național „Mai Mult decât Școala altfel” | - | Activități extracurriculare, dezbateri în limba engleză, proiecte transdisciplinare | - | S5 | 05.10 - 09.10.2026 (fără predare conținut nou; 05.10 Ziua Educației) |
| 5 | Unit 2: Mind, Brain & Human Nature (Consolidare) | 2.2, 3.2, 4.1 | Critical thinking workshops, academic vocabulary in context, complex register | ${hoursPerWeek} | S6 | [conform manual] |
| 6 | Module 1 Review & Formative Assessment | 1.1, 2.2, 3.1 | Synthesis of lexical sets, portfolio review, formative progress test, remediation | ${hoursPerWeek} | S7 | Recapitulare & Evaluare M1 |
| **MODULUL 2** | **02.11.2026 - 22.12.2026** | | **(7 săptămâni și 2 zile de predare efectivă)** | | | |
| 7 | Unit 3: Technology & Digital Horizons | 1.1, 2.1, 3.2 | Artificial intelligence, digital ethics, future continuous/perfect, lexical chunks for forecasting, argumentative essay | ${hoursPerWeek * 2} | S8 - S9 | [conform manual] |
| 8 | Unit 4: Media, Persuasion & Influence | 1.2, 2.2, 3.1 | Advertising psychology, rhetoric, modal verbs of deduction and obligation, review and proposal writing | ${hoursPerWeek * 2} | S10 - S11 | [conform suport curs] |
| 9 | Unit 4 (Continuare) & National Identity | 1.1, 3.2, 4.1 | Public speaking, rhetorical devices, intercultural dialogue | ${hoursPerWeek} | S12 | 30 Nov & 01 Dec - zile libere legale (conținut adaptat) |
| 10 | Unit 5: Environmental Stewardship & Global Challenges | 1.2, 2.1, 3.2 | Sustainable ecosystems, climate debates, conditionals (0, 1, 2, 3 & mixed conditionals), speculative language | ${hoursPerWeek} | S13 - S14 | [conform manual] |
| 11 | Module 2 Review & Term Summative Evaluation | 1.1 - 4.2 | Comprehensive assessment of Reading, Use of English & Writing, term feedback | ${hoursPerWeek} | S15 | Recapitulare & Evaluare sumativă M2 |
| **MODULUL 3** | **11.01.2027 - 19.02.2027** | | **(6 săptămâni de cursuri)** | | | |
| 12 | Unit 6: Society, Law & Justice | 1.1, 2.2, 3.2 | Legal systems, civil rights, relative clauses, participle clauses, formal report writing | ${hoursPerWeek * 2} | S16 - S17 | 24 Ianuarie - Ziua Unirii |
| 13 | Unit 7: The Creative Impulse (Art & Literature) | 1.2, 2.1, 3.1 | Contemporary arts, literary analysis, idioms, cleft sentences, formal critiques | ${hoursPerWeek * 2} | S18 - S19 | [conform manual] |
| 14 | Unit 8: Health, Well-being & Modern Living | 1.1, 2.2, 3.1 | Work-life balance, medical breakthroughs, subjunctive, concession clauses | ${hoursPerWeek} | S20 | [conform suport curs] |
| 15 | Module 3 Review & Mid-Year Evaluation | 1.1 - 4.1 | Synthesis of C1 grammatical patterns, peer-review writing clinic, oral presentations | ${hoursPerWeek} | S21 | Recapitulare & Evaluare M3 (înainte de vacanța de februarie) |
| **MODULUL 4** | **01.03.2027 - 23.04.2027** | | **(8 săptămâni: 7 săpt. predare + 1 săpt. Săptămâna verde)** | | | |
| 16 | Unit 9: The World of Work & Career Trajectories | 1.2, 2.1, 3.2 | Global employment, professional networking, causative forms, formal applications and CVs | ${hoursPerWeek * 2} | S22 - S23 | [conform manual] |
| 17 | Unit 10: Science, Innovation & Ethics | 1.1, 2.2, 3.2 | Bioethics, space exploration, hedging, discourse markers, discursive essay writing | ${hoursPerWeek * 2} | S24 - S25 | [conform suport curs] |
| 18 | Unit 11: Global Heritage & Interculturality | 1.2, 2.1, 3.1 | Migration, traditions, idiomatic language, multi-word verbs, article writing | ${hoursPerWeek * 2} | S26 - S27 | [conform manual] |
| 19 | Unit 11 Wrap-up & Pre-exam Training | 1.1, 3.2 | Academic synthesis, listening comprehension for complex arguments | ${hoursPerWeek} | S28 | [conform manual] |
| 20 | Programul Național „Săptămâna verde” | - | Proiecte ecologice și sustenabilitate prezentate în limba engleză | - | S29 | 19.04 - 23.04.2027 (fără predare conținut nou) |
| **MODULUL 5** | **05.05.2027 - ${isClasa12 ? "04.06.2027 (Clasa terminală)" : isClasa8 ? "11.06.2027" : "18.06.2027"}** | | **(${isClasa12 ? "4 săptămâni - Finalizare cursuri 4 iunie 2027" : "6 săptămâni"})** | | | |
| 21 | Unit 12: Future Perspectives & Communication Mastery | 1.1, 2.2, 3.2 | Advanced negotiation, irony, nuances of register, collaborative task completion | ${hoursPerWeek} | S30 | [conform manual] |
| 22 | Exam Skills Workshop & Advanced Competence Synthesis | 1.1 - 4.2 | Comprehensive practice for competence examination / Baccalaureate, mock oral exams | ${hoursPerWeek * (isClasa12 ? 2 : 3)} | S31 - ${isClasa12 ? "S32" : "S33"} | Pregătire Bacalaureat / Examen |
| 23 | Final Annual Review & Competence Assessment | Toate C.S. | Portfolio evaluation, final grades communication, individual learning achievements | ${hoursPerWeek} | ${isClasa12 ? "S33 - S34" : "S34 - S36"} | 01 Iunie liber; Încheiere situație școlară |
`;
    } else {
      // Standard Romanian curriculum (generic / romanian / sciences)
      tableContent = `                                **PLANIFICARE CALENDARISTICĂ ANUALĂ - ANUL ȘCOLAR 2026-2027**
                                          **Conform Standardelor Curriculare Oficiale MEC**

| Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi (detalieri tematice și metodice) | Nr. ore alocate | Săptămâna | Observații |
|---|---|---|---|---|---|---|
| **MODULUL 1** | **07.09.2026 - 23.10.2026** | | **(7 săptămâni: 6 săpt. predare + 1 săpt. Școala altfel)** | | | |
| 1 | Recapitulare inițială & Evaluare diagnostică | 1.1, 2.1 | Actualizarea noțiunilor fundamentale, test inițial, analiza rezultatelor și măsuri remediale | ${hoursPerWeek} | S1 | Evaluare inițială |
| 2 | Unitatea 1: Concepte fundamentale și metodologii | 1.1, 1.2, 2.1 | Structura domeniului de studiu, terminologie de specialitate, corelații interdisciplinare | ${hoursPerWeek * 2} | S2 - S3 | [conform manual] |
| 3 | Unitatea 2: Aprofundare teoretică și aplicații | 1.2, 2.2, 3.1 | Analiza mecanismelor specifice, exerciții aplicative, studiu de caz ghidat | ${hoursPerWeek} | S4 | [conform suport curs] |
| 4 | Programul Național „Mai Mult decât Școala altfel” | - | Activități extracurriculare și extrașcolare planificate la nivel de unitate | - | S5 | 05.10 - 09.10.2026 (fără predare conținut nou; 05.10 Ziua Educației) |
| 5 | Unitatea 2: Aplicații practice și investigație | 2.2, 3.1, 4.1 | Lucrări aplicative, fișe de lucru diferențiate, proiecte colaborative | ${hoursPerWeek} | S6 | [conform manual] |
| 6 | Recapitulare și evaluare formativă Modulul 1 | 1.1, 2.1, 3.1 | Sistematizarea achizițiilor din Modulul 1, test formativ, feedback | ${hoursPerWeek} | S7 | Recapitulare & Evaluare M1 |
| **MODULUL 2** | **02.11.2026 - 22.12.2026** | | **(7 săptămâni și 2 zile de predare efectivă)** | | | |
| 7 | Unitatea 3: Structuri complexe și dinamică | 1.2, 2.1, 3.2 | Modele explicative, proceduri de lucru, rezolvare de probleme specifice | ${hoursPerWeek * 2} | S8 - S9 | [conform manual] |
| 8 | Unitatea 4: Relații cauzale și interpretare critică | 2.1, 2.2, 3.1 | Investigarea relațiilor fundamentale, elaborarea de argumente și demonstrații | ${hoursPerWeek * 2} | S10 - S11 | [conform suport curs] |
| 9 | Unitatea 4 (Continuare): Aplicații și sinteză | 2.2, 3.2 | Analiză comparativă, studii de caz, corelarea rezultatelor | ${hoursPerWeek} | S12 | 30 Nov & 01 Dec - zile libere legale (conținut adaptat) |
| 10 | Unitatea 5: Integrare transdisciplinară | 3.1, 4.1, 4.2 | Transfer de cunoștințe în contexte practice cotidiene | ${hoursPerWeek * 2} | S13 - S14 | [conform manual] |
| 11 | Recapitulare și evaluare sumativă Modulul 2 | Toate C.S. | Portofoliu de evaluare, lucrare sumativă, stabilirea progresului individual | ${hoursPerWeek} | S15 | Recapitulare & Evaluare sumativă M2 |
| **MODULUL 3** | **11.01.2027 - 19.02.2027** | | **(6 săptămâni de cursuri)** | | | |
| 12 | Unitatea 6: Perspective contemporane și analiză | 1.1, 2.2, 3.1 | Noțiuni avansate de conținut, abordare critică a surselor de informare | ${hoursPerWeek * 2} | S16 - S17 | 24 Ianuarie - Ziua Unirii |
| 13 | Unitatea 7: Metode de investigație și experiment | 2.1, 3.2, 4.1 | Experiment didactic, analiza datelor, formularea de concluzii argumentate | ${hoursPerWeek * 2} | S18 - S19 | [conform manual] |
| 14 | Unitatea 8: Comunicare și susținere de proiecte | 1.2, 3.1, 4.2 | Redactarea referatelor, susținerea punctelor de vedere în cadrul dezbaterilor | ${hoursPerWeek} | S20 | [conform suport curs] |
| 15 | Recapitulare și evaluare Modulul 3 | 1.1 - 4.1 | Sinteza unităților 6-8, test docimologic de verificare, autoevaluare | ${hoursPerWeek} | S21 | Recapitulare & Evaluare M3 (înainte de vacanța județeană) |
| **MODULUL 4** | **01.03.2027 - 23.04.2027** | | **(8 săptămâni: 7 săpt. predare + 1 săpt. Săptămâna verde)** | | | |
| 16 | Unitatea 9: Sisteme, procese și optimizare | 1.1, 2.1, 3.2 | Aprofundarea conceptelor integrate, rezolvarea de sarcini complexe | ${hoursPerWeek * 2} | S22 - S23 | [conform manual] |
| 17 | Unitatea 10: Dimensiunea etică și aplicabilitatea socială | 2.2, 3.1, 4.1 | Studii de impact, conștientizarea responsabilității civice și profesionale | ${hoursPerWeek * 2} | S24 - S25 | [conform suport curs] |
| 18 | Unitatea 11: Proiectare și creativitate aplicată | 3.1, 3.2, 4.2 | Elaborarea de mini-proiecte individuale sau de grup | ${hoursPerWeek * 2} | S26 - S27 | [conform manual] |
| 19 | Unitatea 11: Finalizare proiecte și feedback | 1.2, 4.1 | Prezentarea produselor activității, evaluare reciprocă | ${hoursPerWeek} | S28 | [conform manual] |
| 20 | Programul Național „Săptămâna verde” | - | Activități dedicate protecției mediului și sustenabilității | - | S29 | 19.04 - 23.04.2027 (fără predare conținut nou) |
| **MODULUL 5** | **05.05.2027 - ${isClasa12 ? "04.06.2027 (Clasa terminală)" : isClasa8 ? "11.06.2027" : "18.06.2027"}** | | **(${isClasa12 ? "4 săptămâni - Finalizare cursuri 4 iunie 2027" : "6 săptămâni"})** | | | |
| 21 | Unitatea 12: Sinteze integratoare | 1.1, 2.1, 3.1 | Corelarea tuturor domeniilor de conținut studiate pe parcursul anului | ${hoursPerWeek} | S30 | [conform manual] |
| 22 | Pregătire intensivă și consolidare competențe | 1.1 - 4.2 | Rezolvarea modelelor de evaluare, simulări de examene, fixare | ${hoursPerWeek * (isClasa12 ? 2 : 3)} | S31 - ${isClasa12 ? "S32" : "S33"} | Pregătire finală / Examen |
| 23 | Bilanț anual & Evaluare finală de progres | Toate C.S. | Analiza portofoliului anual, comunicarea mediilor, recomandări de vacanță | ${hoursPerWeek} | ${isClasa12 ? "S33 - S34" : "S34 - S36"} | 01 Iunie liber; Încheiere situație școlară |
`;
    }

    const noteAndSignatures = `
### Notă metodologică de bilanț orar (Anul Școlar 2026-2027):
* **Normă săptămânală:** ${hoursPerWeek} ore/săptămână
* **Distribuția orelor de predare pe module:**
  - Modulul 1: 6 săpt. predare × ${hoursPerWeek} ore = ${6 * hoursPerWeek} ore (+ 1 săpt. „Școala altfel”)
  - Modulul 2: 7 săpt. predare × ${hoursPerWeek} ore = ${7 * hoursPerWeek} ore
  - Modulul 3: 6 săpt. predare × ${hoursPerWeek} ore = ${6 * hoursPerWeek} ore
  - Modulul 4: 7 săpt. predare × ${hoursPerWeek} ore = ${7 * hoursPerWeek} ore (+ 1 săpt. „Săptămâna verde”)
  - Modulul 5: ${isClasa12 ? "4" : isClasa8 ? "5" : "6"} săpt. predare × ${hoursPerWeek} ore = ${(isClasa12 ? 4 : isClasa8 ? 5 : 6) * hoursPerWeek} ore
* **Total ore predare efectivă:** ${calc.totalTeachingHours} ore (${calc.effectiveTeachingWeeks} săptămâni efective)
* **Total ore activități săptămâni speciale:** ${2 * hoursPerWeek} ore (2 săptămâni: „Școala altfel” și „Săptămâna verde”)
* **Total general normă anuală:** ${calc.totalTeachingHours + 2 * hoursPerWeek} ore (${calc.totalWeeks} săptămâni școlare)
* **Concept metodic & asistență curriculară:** autor prof. Adrian Podar

**Întocmit, Profesor:** ${teacherName}                          **Avizat Director, Data:** ${directorName}
`;

    return `${headerSection}${tableContent}${noteAndSignatures}`;
  }

  if (tipDocument === "Planificare pe unitate") {
    return `${headerSection}
                                **PROIECTAREA UNITĂȚII DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027**
                                        **Unitatea 1: Structuri și Competențe Fundamentale**

| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
|---|---|---|---|---|---|---|
| 1. Introducere în tematică și reactualizarea cunoștințelor anterioare | 1.1, 2.1 | • Discuție introductivă ghidată pe baza stimulilor vizuali/textuali<br>• Identificarea termenilor-cheie și completarea unui ciorchine conceptual | Manualul școlar, tablă interactivă, activitate frontală și individuală | Observare sistematică a comportamentului de învățare | 2 ore<br>Modulul 1<br>Săpt. 1 | Evaluare inițială diagnostică |
| 2. Explorarea conținuturilor noi și analiză ghidată | 1.2, 2.2 | • Lectura critică a textelor/analiza cazurilor practice<br>• Exerciții de identificare a relațiilor cauzale și structurale | Fișe de lucru tipărite, suport multimedia, lucru pe perechi | Chestionare de înțelegere, aprecieri verbale formative | 3 ore<br>Modulul 1<br>Săpt. 2 | [conform manual] |
| 3. Aplicarea practică a conceptelor și exercițiu diferențiat | 2.1, 3.1 | • Rezolvarea sarcinilor colaborative pe grupe eterogene<br>• Elaborarea unui produs intermediar de grup (schemă, text scurt, proiect) | Dispozitive digitale (tablete/laptop), platformă partajată, lucru pe grupe | Grilă de evaluare a activității în echipă | 3 ore<br>Modulul 1<br>Săpt. 3 | Feedforward continuu |
| 4. Consolidare, transfer și comunicare | 3.2, 4.1 | • Prezentarea rezultatelor grupelor și dezbatere moderată<br>• Formulare de argumente și contraargumente structurate | Fișă de autoevaluare, flipchart / ecran digital, activitate frontală | Notare calitativă, bilet de ieșire (Exit Ticket) | 2 ore<br>Modulul 1<br>Săpt. 4 | Dezvoltare gândire critică |
| 5. Recapitulare integratoare și evaluare sumativă a unității | 1.1, 2.2, 3.1, 4.1 | • Sinteza noțiunilor asimilate prin intermediul unui joc didactic / quiz<br>• Aplicarea testului sumativ al unității de învățare | Test de evaluare sumativă, fișă de barem, lucru individual | Test docimologic, evaluare sumativă scrisă | 2 ore<br>Modulul 1<br>Săpt. 4 | Măsuri remediale consemnate |

**Întocmit, Profesor:** ${teacherName}                          **Avizat Director, Data:** ${directorName}
`;
  }

  if (tipDocument === "Planificare integrată (Primar)") {
    return `${headerSection}
                                **PLANIFICARE INTEGRATĂ TEMATICĂ (ÎNVĂȚĂMÂNT PRIMAR) - ANUL ȘCOLAR 2026-2027**
                                            **Abordare Transdisciplinară (CLR • MEM • DP • AVAP • MM)**

| Tema Unității | Discipline integrate | Competențe Specifice | Conținuturi | Nr. Ore | Săptămâna |
|---|---|---|---|---|---|
| **MODULUL 1 (07.09 - 23.10.2026)** | | | | | |
| 1. Din nou la școală - Emoții și prieteni | CLR, DP, MM | CLR: 1.1, 1.2; DP: 1.1, 2.1; MM: 1.1 | Reguli ale clasei, comunicare orală, exprimarea emoțiilor de început, cântece de bun venit | ${hoursPerWeek} ore | S1 - S2 |
| 2. Poveștile Toamnei - Explorare și numere | CLR, MEM, AVAP | CLR: 1.3, 2.1; MEM: 1.1, 3.1; AVAP: 1.1 | Textul narativ scurt, numerele naturale, fenomene ale toamnei, colaj din frunze uscate | ${hoursPerWeek} ore | S3 - S4 |
| 3. Programul Național „Mai mult decât Școala altfel” | Toate disciplinele | Competențe non-formale | Ateliere de creație, vizită la muzeu, jocuri de colaborare (05.10 Ziua Educației) | - | S5 |
| 4. Corpul meu și lumea vie | MEM, DP, AVAP | MEM: 1.2, 4.1; DP: 1.2; AVAP: 2.1 | Igienă personală, alimentație sănătoasă, modelaj, forme geometrice în natură | ${hoursPerWeek} ore | S6 - S7 |
| **MODULUL 2 (02.11 - 22.12.2026)** | | | | | |
| 5. Tradiții și valori naționale | CLR, MEM, AVAP, MM | CLR: 2.2, 3.1; MEM: 1.3; MM: 2.1 | Simboluri românești, 1 Decembrie, colinde, adunarea și scăderea numerelor, felicitări | ${hoursPerWeek * 2} ore | S8 - S11 |
| 6. Iarna albă - Miracolul sărbătorilor | CLR, MEM, AVAP | CLR: 1.4, 2.3; MEM: 1.4, 5.1; AVAP: 2.2 | Povești de iarnă, probleme ilustrate, decorațiuni ecologice, evaluare sumativă M2 | ${hoursPerWeek} ore | S12 - S15 |
| **MODULUL 3 (11.01 - 19.02.2027)** | | | | | |
| 7. Călătorie în Univers și Pământul | MEM, CLR, AVAP | MEM: 3.1, 4.2; CLR: 2.1; AVAP: 1.2 | Sistemul Solar, măsurarea timpului, calendarul, machetă planetară, 24 Ianuarie | ${hoursPerWeek * 2} ore | S16 - S19 |
| 8. Bilanț la mijloc de an școlar | Toate disciplinele | Evaluare formativă | Evaluare integrată transdisciplinară (înainte de vacanța mobilă din februarie) | ${hoursPerWeek} ore | S20 - S21 |
| **MODULUL 4 (01.03 - 23.04.2027)** | | | | | |
| 9. Trezirea naturii - Lumea plantelor și a animalelor | CLR, MEM, DP | CLR: 3.2, 4.1; MEM: 2.1, 4.1; DP: 2.2 | Înmulțirea și dezvoltarea plantelor, texte despre natură, compasiune față de viețuitoare | ${hoursPerWeek * 2} ore | S22 - S25 |
| 10. Prietenii Pământului | MEM, AVAP, MM | MEM: 5.2; AVAP: 2.3; MM: 1.2 | Resurse regenerabile, reciclare, ritmuri muzicale din natură | ${hoursPerWeek} ore | S26 - S28 |
| 11. Programul Național „Săptămâna verde” | Toate disciplinele | Educație ecologică | Proiecte ecologice practice, explorarea parcului/pădurii, colectare selectivă | - | S29 |
| **MODULUL 5 (05.05 - 18.06.2027)** | | | | | |
| 12. Comunitatea mea și meseriile viitorului | CLR, DP, MEM | CLR: 2.4, 4.2; DP: 3.1; MEM: 1.5 | Roluri în comunitate, orientare timpurie, măsurarea valorii (banii), 1 Iunie | ${hoursPerWeek} ore | S30 - S33 |
| 13. Recapitulare anuală și portofoliul meu de școlar | Toate disciplinele | Toate C.S. | Expoziție cu lucrările elevilor, celebrarea progresului școlar, bilanț anual | ${hoursPerWeek} ore | S34 - S36 |

### Notă metodologică pentru învățământul primar:
* **Abordare integrată:** Conținuturile sunt organizate concentric pe teme transdisciplinare, asigurând trecerea firească de la observarea directă la conceptualizare.
* **Evaluare:** Aprecierea se realizează prin calificative (FB, B, S, I) însoțite de descriptori de performanță și aprecieri motivaționale continue.
* **Concept metodic & asistență curriculară:** autor prof. Adrian Podar

**Întocmit, Profesor înv. primar:** ${teacherName}                  **Avizat Director, Data:** ${directorName}
`;
  }

  // Schiță de lecție
  return `${headerSection}
                                      **PROIECT DIDACTIC DE LECȚIE**
                                  **Clasa:** ${clasa} • **Disciplina:** ${disciplina}

**I. Antet și Date generale:**
* **Unitatea de învățământ:** ${schoolName}
* **Profesor:** ${teacherName}
* **Data:** Conform orarului curent (Anul Școlar 2026-2027)
* **Timpul alocat:** 50 minute

**II. Caracteristici didactice:**
* **Subiectul lecției:** ${isEnglish ? "Consolidating Advanced Language Patterns & Discourse Markers" : "Aprofundarea conceptelor fundamentale și aplicații practice"}
* **Competențe specifice vizate:** 1.1, 2.1, 3.2, 4.1
* **Obiective operaționale (La sfârșitul orei, elevii vor fi capabili să):**
  - $O_1$: să definească și să utilizeze corect terminologia specifică în contexte noi;
  - $O_2$: să analizeze critic componentele textului / problemei propuse;
  - $O_3$: să colaboreze eficient în echipă pentru redactarea unui răspuns argumentat;
  - $O_4$: să autoevalueze propriile performanțe utilizând criteriile transmise.
* **Strategii didactice:** Conversația euristică, învățarea prin descoperire, metoda mozaic, exercițiul ghidat.
* **Forme de organizare:** Frontal, individual, pe grupe.

**III. Scenariul didactic al activității:**

| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
|---|---|---|---|---|---|---|---|
| 1. Moment organizatoric | - | 2 min | Salutul, notarea absenților, pregătirea atmosferei de lucru | Elevii răspund la salut și își pregătesc materialele necesare | Conversația | Manual, caiete, frontal | Observare inițială |
| 2. Captarea atenției | $O_1$ | 5 min | Proiectarea unei imagini provocatoare / întrebare declanșatoare deschisă | Formulează ipoteze, participă activ la brainstorming | Brainstorming, dialog | Videoproiector, frontal | Aprecieri verbale |
| 3. Anunțarea temei și a obiectivelor | - | 3 min | Prezintă titlul noii lecții și obiectivele într-un limbaj prietenos | Notează titlul în caiete și rețin competențele urmărite | Expunerea | Tablă / ecran, frontal | Observare continuă |
| 4. Dirijarea învățării | $O_1$, $O_2$ | 22 min | Explică conceptele noi, împarte fișa de lucru pe 4 grupe și monitorizează | Lucrează în echipă, extrag ideile principale, rezolvă sarcinile | Învățarea ghidată, cooperarea | Fișă digitală/tipărită, pe grupe | Evaluare formativă |
| 5. Obținerea performanței | $O_2$, $O_3$ | 10 min | Moderează prezentarea concluziilor fiecărei grupe, oferă feedback punctual | Raportorii grupelor prezintă soluțiile identificate | Dialog euristic, dezbatere | Flipchart / tablă, frontal | Feedforward constructiv |
| 6. Evaluarea & Fixarea retenției | $O_1$, $O_4$ | 5 min | Lansează un mini-quiz rapid de fixare a conținuturilor esențiale | Rezolvă individual testul scurt pe dispozitiv sau fișă | Quiz formativ, exercițiu | Fișă de evaluare, individual | Evaluare sumativă imediată |
| 7. Încheierea activității & Tema | - | 3 min | Formulează aprecieri generale și individuale, explică tema pentru acasă | Notează indicațiile pentru tema diferențiată și cer lămuriri | Conversația | Manual, frontal | Aprecieri și notare |

**Întocmit, Profesor:** ${teacherName}                          **Avizat Director, Data:** ${directorName}
`;
}
