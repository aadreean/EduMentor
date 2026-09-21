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

/**
 * Extrage unitățile reale sau capitolele din textele/fișierele încărcate (suport, manual, programă).
 * Dacă nu găsește unități explicite în text, întoarce o structură neutră adaptată disciplinei,
 * fără a inventa denumiri din manuale externe.
 */
function extractOrGenerateUnits(
  snippets: string[],
  disciplina: string,
  isEnglish: boolean
): Array<{ title: string; contents: string; cs: string }> {
  const allText = snippets.join("\n");
  const extracted: Array<{ title: string; contents: string; cs: string }> = [];

  // Încearcă să găsească linii ce seamănă cu unități/capitole în textul atașat
  // ex: "Unit 1: ...", "Unitatea 1: ...", "Capitolul 1: ...", "Theme 1: ...", "Modulul 1: ..."
  const lines = allText.split("\n").map((l) => l.trim()).filter(Boolean);
  const unitRegex = /^(?:unit(?:atea)?|capitol(?:ul)?|theme|modul(?:ul)?|lec(?:ț|t)ia)\s*([0-9IVXLCDM]+)?[:.\-–—\s]+(.+)$/i;

  for (const line of lines) {
    const match = line.match(unitRegex);
    if (match && match[2]) {
      const unitName = line.replace(/^[#*\-•\s]+/, "").slice(0, 100).trim();
      if (unitName.length > 5 && !extracted.some((u) => u.title.toLowerCase() === unitName.toLowerCase())) {
        extracted.push({
          title: unitName,
          contents: `Conținuturi tematice și activități conform cuprinsului manualului (${unitName})`,
          cs: "1.1, 1.2, 2.1, 3.1",
        });
      }
    }
    if (extracted.length >= 12) break;
  }

  // Dacă s-au extras unități reale din fișierele atașate, le folosim pe acelea
  if (extracted.length >= 2) {
    return extracted;
  }

  // Altfel, generăm unități didactice strict metodice și neutre raportate exclusiv la programa națională a disciplinei,
  // FĂRĂ manuale inventate, FĂRĂ unități externe (fără "Communication and Personal Identity" sau alte titluri arbitrare)
  const discTitle = disciplina || "Disciplina";
  const unitPrefix = isEnglish ? "Unit" : "Unitatea";

  return [
    { title: `${unitPrefix} 1: Concepte introductive și competențe fundamentale (${discTitle})`, contents: "Noțiuni fundamentale, terminologie de specialitate, reactualizare și analiză ghidată", cs: "1.1, 2.1" },
    { title: `${unitPrefix} 2: Structuri tematice și aprofundare (${discTitle})`, contents: "Aprofundare teoretică, relații funcționale, exerciții aplicative și consolidare", cs: "1.2, 2.2, 3.1" },
    { title: `${unitPrefix} 3: Aplicații practice, comunicare și transfer`, contents: "Sarcini de lucru diferențiate, analiză critică, activitate pe grupe și studii de caz", cs: "2.1, 3.1, 3.2" },
    { title: `${unitPrefix} 4: Modele avansate, sinteză și creație`, contents: "Proiecte individuale/de echipă, corelații interdisciplinare, argumentare și dezbatere", cs: "2.2, 3.2, 4.1" },
    { title: `${unitPrefix} 5: Integrare tematică și perspective extinse`, contents: "Transfer de cunoștințe în contexte reale, prezentarea rezultatelor, reflecție critică", cs: "3.1, 4.1, 4.2" },
    { title: `${unitPrefix} 6: Evaluare integratoare și portofoliu educațional`, contents: "Sistematizarea competențelor dobândite, autoevaluare și bilanț tematic", cs: "1.2, 3.2, 4.2" },
  ];
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

  const calc = calculateAcademicHours(clasa, hoursPerWeek);

  // Determină arhetipul disciplinei
  const discLower = (disciplina || headerData.disciplina || "").toLowerCase();
  const isEnglish = discLower.includes("englez") || discLower.includes("english");

  const schoolName = headerData.unitateInvatamant || "Liceul Teoretic";
  const teacherName = headerData.profesor || "Profesor";
  const directorName = headerData.director || "Prof. Director";
  const headOfDeptName = headerData.respCatedra || "Prof. Responsabil Comisie";
  const regNr = headerData.nrInregistrare || ".......................";
  // Manualul este preluat strict din ce a introdus profesorul sau rămâne indicativ general MEC (fără Cambridge inventat)
  const manual =
    manualSuport ||
    headerData.manualSuport ||
    "Manual aprobat MEC / conform resurselor atașate";

  // Extragerea unităților didactice (din fișierele atașate sau neutre)
  const allSnippets = [...suportSnippets, ...programaSnippets];
  const unitList = extractOrGenerateUnits(allSnippets, disciplina, isEnglish);

  const getUnit = (index: number) => {
    return unitList[index % unitList.length];
  };

  // Formatarea antetului tehnic oficial
  const headerSection = `**Unitatea de învățământ:** ${schoolName}                  **Avizat director:** ${directorName}
**Anul școlar:** 2026-2027                                  **Avizat resp. catedră:** ${headOfDeptName}
**Disciplina:** ${disciplina || "Disciplină de specialitate"}                          **Nr. înregistrare:** ${regNr}
**Manual/Suport:** ${manual}                    **Vacanță februarie (județeană):** ${headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
**Clasa:** ${formatClasaHeader(clasa, headerData)}
**Nr. de ore pe săptămână:** ${hoursPerWeek} ${hoursPerWeek === 1 ? "oră/săpt." : "ore/săpt."}
**Profesor:** ${teacherName}

`;

  if (tipDocument === "Planificare anuală") {
    const tableContent = `                                **PLANIFICARE CALENDARISTICĂ ANUALĂ - ANUL ȘCOLAR 2026-2027**
                                          **Conform Standardelor Curriculare Oficiale MEC**

| Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi (detalieri tematice și metodice conform resurselor atașate) | Nr. ore alocate | Săptămâna | Observații |
|---|---|---|---|---|---|---|
| **MODULUL 1** | **07.09.2026 - 23.10.2026** | | **(7 săptămâni: 6 săpt. predare + 1 săpt. Școala altfel)** | | | |
| 1 | Recapitulare inițială & Evaluare diagnostică | 1.1, 2.1 | Actualizarea noțiunilor fundamentale, test inițial, analiza rezultatelor și măsuri remediale | ${hoursPerWeek} | S1 | Evaluare inițială |
| 2 | ${getUnit(0).title} | ${getUnit(0).cs} | ${getUnit(0).contents} | ${hoursPerWeek * 2} | S2 - S3 | [conform resurselor atașate] |
| 3 | ${getUnit(1).title} | ${getUnit(1).cs} | ${getUnit(1).contents} | ${hoursPerWeek} | S4 | [conform resurselor atașate] |
| 4 | Programul Național „Mai Mult decât Școala altfel” | - | Activități extracurriculare și extrașcolare planificate la nivel de unitate | - | S5 | 05.10 - 09.10.2026 (fără predare conținut nou; 05.10 Ziua Educației) |
| 5 | ${getUnit(1).title} (Aprofundare & Aplicații) | 2.2, 3.1 | Exerciții diferențiate, fișe de consolidare, activitate pe grupe | ${hoursPerWeek} | S6 | [conform resurselor atașate] |
| 6 | Recapitulare și evaluare formativă Modulul 1 | 1.1, 2.1, 3.1 | Sistematizarea achizițiilor din Modulul 1, test formativ, feedback | ${hoursPerWeek} | S7 | Recapitulare & Evaluare M1 |
| **MODULUL 2** | **02.11.2026 - 22.12.2026** | | **(7 săptămâni și 2 zile de predare efectivă)** | | | |
| 7 | ${getUnit(2).title} | ${getUnit(2).cs} | ${getUnit(2).contents} | ${hoursPerWeek * 2} | S8 - S9 | [conform resurselor atașate] |
| 8 | ${getUnit(3).title} | ${getUnit(3).cs} | ${getUnit(3).contents} | ${hoursPerWeek * 2} | S10 - S11 | [conform resurselor atașate] |
| 9 | ${getUnit(3).title} (Continuare & Sinteză) | 2.2, 3.2 | Analiză comparativă, studii de caz, corelarea rezultatelor | ${hoursPerWeek} | S12 | 30 Nov & 01 Dec - zile libere legale (conținut adaptat) |
| 10 | ${getUnit(4).title} | ${getUnit(4).cs} | ${getUnit(4).contents} | ${hoursPerWeek * 2} | S13 - S14 | [conform resurselor atașate] |
| 11 | Recapitulare și evaluare sumativă Modulul 2 | Toate C.S. | Portofoliu de evaluare, lucrare sumativă, stabilirea progresului individual | ${hoursPerWeek} | S15 | Recapitulare & Evaluare sumativă M2 |
| **MODULUL 3** | **11.01.2027 - 19.02.2027** | | **(6 săptămâni de cursuri)** | | | |
| 12 | ${getUnit(5).title} | ${getUnit(5).cs} | ${getUnit(5).contents} | ${hoursPerWeek * 2} | S16 - S17 | 24 Ianuarie - Ziua Unirii |
| 13 | ${getUnit(6).title} | ${getUnit(6).cs} | ${getUnit(6).contents} | ${hoursPerWeek * 2} | S18 - S19 | [conform resurselor atașate] |
| 14 | ${getUnit(7).title} | ${getUnit(7).cs} | ${getUnit(7).contents} | ${hoursPerWeek} | S20 | [conform resurselor atașate] |
| 15 | Recapitulare și evaluare Modulul 3 | 1.1 - 4.1 | Sinteză și autoevaluare a competențelor dobândite în M3 | ${hoursPerWeek} | S21 | Recapitulare & Evaluare M3 (înainte de vacanța județeană) |
| **MODULUL 4** | **01.03.2027 - 23.04.2027** | | **(8 săptămâni: 7 săpt. predare + 1 săpt. Săptămâna verde)** | | | |
| 16 | ${getUnit(0).title} (Perspective avansate) | 1.2, 2.1, 3.2 | Corelații conceptuale avansate și proiecte practice | ${hoursPerWeek * 2} | S22 - S23 | [conform resurselor atașate] |
| 17 | ${getUnit(1).title} (Dimensiune aplicativă) | 2.2, 3.1, 4.1 | Rezolvarea sarcinilor complexe, transfer în situații de viață | ${hoursPerWeek * 2} | S24 - S25 | [conform resurselor atașate] |
| 18 | ${getUnit(2).title} (Creativitate și proiecte) | 3.1, 3.2, 4.2 | Elaborarea de mini-proiecte individuale sau de grup | ${hoursPerWeek * 2} | S26 - S27 | [conform resurselor atașate] |
| 19 | ${getUnit(2).title} (Finalizare și prezentare) | 1.2, 4.1 | Prezentarea produselor activității, evaluare reciprocă | ${hoursPerWeek} | S28 | [conform resurselor atașate] |
| 20 | Programul Național „Săptămâna verde” | - | Activități dedicate protecției mediului și sustenabilității | - | S29 | 19.04 - 23.04.2027 (fără predare conținut nou) |
| **MODULUL 5** | **05.05.2027 - ${isClasa12 ? "04.06.2027 (Clasa terminală)" : isClasa8 ? "11.06.2027" : "18.06.2027"}** | | **(${isClasa12 ? "4 săptămâni - Finalizare cursuri 4 iunie 2027" : "6 săptămâni"})** | | | |
| 21 | ${getUnit(3).title} (Sinteză integratoare) | 1.1, 2.1, 3.1 | Corelarea domeniilor de conținut studiate pe parcursul anului | ${hoursPerWeek} | S30 | [conform resurselor atașate] |
| 22 | Pregătire intensivă și consolidare competențe | 1.1 - 4.2 | Rezolvarea modelelor de evaluare, simulări de examene, fixare | ${hoursPerWeek * (isClasa12 ? 2 : 3)} | S31 - ${isClasa12 ? "S32" : "S33"} | Pregătire finală / Examen |
| 23 | Bilanț anual & Evaluare finală de progres | Toate C.S. | Analiza portofoliului anual, comunicarea mediilor, recomandări de vacanță | ${hoursPerWeek} | ${isClasa12 ? "S33 - S34" : "S34 - S36"} | 01 Iunie liber; Încheiere situație școlară |
`;

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

**Întocmit, Profesor:** ${teacherName}                          **Avizat Director, Data:** ${directorName}
`;

    return `${headerSection}${tableContent}${noteAndSignatures}`;
  }

  if (tipDocument === "Planificare pe unitate") {
    const mainUnit = getUnit(0);
    return `${headerSection}
                                **PROIECTAREA UNITĂȚII DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027**
                                        **${mainUnit.title}**

| Conținuturi (detalieri conform resurselor atașate) | C.S. | Activități de învățare | Resurse materiale și umane & Forme de organizare | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
|---|---|---|---|---|---|---|
| 1. Introducere în tematică și reactualizarea cunoștințelor anterioare | 1.1, 2.1 | • Discuție introductivă ghidată pe baza stimulilor vizuali/textuali din manual<br>• Identificarea termenilor-cheie și completarea unui ciorchine conceptual | Manualul școlar atașat, tablă interactivă, activitate frontală și individuală | Observare sistematică a comportamentului de învățare | 2 ore<br>Modulul 1<br>Săpt. 1 | Evaluare inițială diagnostică |
| 2. Explorarea conținuturilor noi și analiză ghidată | 1.2, 2.2 | • Lectura critică a textelor/analiza cazurilor practice din manual<br>• Exerciții de identificare a relațiilor cauzale și structurale | Fișe de lucru tipărite, suport multimedia, lucru pe perechi | Chestionare de înțelegere, aprecieri verbale formative | 3 ore<br>Modulul 1<br>Săpt. 2 | [conform manualului atașat] |
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
* **Subiectul lecției:** ${isEnglish ? "Consolidating Language Skills & Contextual Applications" : "Aprofundarea conceptelor fundamentale și aplicații practice"}
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
| 1. Moment organizatoric | - | 2 min | Salutul, notarea absenților, pregătirea atmosferei de lucru | Elevii răspund la salut și își pregătesc materialele necesare | Conversația | Manual atașat, caiete, frontal | Observare inițială |
| 2. Captarea atenției | $O_1$ | 5 min | Proiectarea unei imagini provocatoare / întrebare declanșatoare deschisă | Formulează ipoteze, participă activ la brainstorming | Brainstorming, dialog | Videoproiector, frontal | Aprecieri verbale |
| 3. Anunțarea temei și a obiectivelor | - | 3 min | Prezintă titlul noii lecții și obiectivele într-un limbaj prietenos | Notează titlul în caiete și rețin competențele urmărite | Expunerea | Tablă / ecran, frontal | Observare continuă |
| 4. Dirijarea învățării | $O_1$, $O_2$ | 22 min | Explică conceptele noi, împarte fișa de lucru pe 4 grupe și monitorizează | Lucrează în echipă, extrag ideile principale, rezolvă sarcinile | Învățarea ghidată, cooperarea | Fișă digitală/tipărită, pe grupe | Evaluare formativă |
| 5. Obținerea performanței | $O_2$, $O_3$ | 10 min | Moderează prezentarea concluziilor fiecărei grupe, oferă feedback punctual | Raportorii grupelor prezintă soluțiile identificate | Dialog euristic, dezbatere | Flipchart / tablă, frontal | Feedforward constructiv |
| 6. Evaluarea & Fixarea retenției | $O_1$, $O_4$ | 5 min | Lansează un mini-quiz rapid de fixare a conținuturilor esențiale | Rezolvă individual testul scurt pe dispozitiv sau fișă | Quiz formativ, exercițiu | Fișă de evaluare, individual | Evaluare sumativă imediată |
| 7. Încheierea activității & Tema | - | 3 min | Formulează aprecieri generale și individuale, explică tema pentru acasă | Notează indicațiile pentru tema diferențiată și cer lămuriri | Conversația | Manual atașat, frontal | Aprecieri și notare |

**Întocmit, Profesor:** ${teacherName}                          **Avizat Director, Data:** ${directorName}
`;
}

