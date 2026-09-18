import { DocumentType, ModuleCalculation, StandardTemplate, SamplePack } from "../types";

export const SCHOOL_YEAR_CONFIG = {
  year: "2026-2027",
  modules: [
    {
      moduleNumber: 1,
      name: "Modulul 1",
      period: "07.09.2026 - 23.10.2026",
      weeksCount: 7,
      specialWeeks: [
        {
          name: "Mai Mult decât Școala altfel",
          period: "05.10.2026 - 09.10.2026",
          weekIndex: 5,
        },
      ],
    },
    {
      moduleNumber: 2,
      name: "Modulul 2",
      period: "02.11.2026 - 22.12.2026",
      weeksCount: 7.5,
      specialWeeks: [],
    },
    {
      moduleNumber: 3,
      name: "Modulul 3",
      period: "11.01.2027 - 19.02.2027",
      weeksCount: 6,
      specialWeeks: [],
    },
    {
      moduleNumber: 4,
      name: "Modulul 4",
      period: "01.03.2027 - 23.04.2027",
      weeksCount: 8,
      specialWeeks: [
        {
          name: "Săptămâna verde",
          period: "19.04.2027 - 23.04.2027",
          weekIndex: 29, // In total sequence
        },
      ],
    },
    {
      moduleNumber: 5,
      name: "Modulul 5",
      period: "05.05.2027 - 18.06.2027",
      weeksCountStandard: 6.5,
      weeksCountClasa8: 5.5, // ends June 11, 2027
      weeksCountClasa12: 4.5, // ends June 4, 2027
      specialWeeks: [],
    },
  ],
};

export function calculateAcademicHours(clasa: string, hoursPerWeek: number): {
  modules: ModuleCalculation[];
  totalWeeks: number;
  effectiveTeachingWeeks: number;
  totalTeachingHours: number;
  specialWeeksHours: number;
  note: string;
} {
  const isClasa8 = clasa.toLowerCase().includes("viii") || clasa.includes("8");
  const isClasa12 =
    clasa.toLowerCase().includes("xii") ||
    clasa.toLowerCase().includes("xiii") ||
    clasa.includes("12") ||
    clasa.includes("13");

  const modulesCalc: ModuleCalculation[] = [];
  let totalWeeksSum = 0;
  let effectiveWeeksSum = 0;

  SCHOOL_YEAR_CONFIG.modules.forEach((mod) => {
    let weeks = mod.weeksCount || 0;
    if (mod.moduleNumber === 5) {
      if (isClasa12) {
        weeks = mod.weeksCountClasa12 || 4.5;
      } else if (isClasa8) {
        weeks = mod.weeksCountClasa8 || 5.5;
      } else {
        weeks = mod.weeksCountStandard || 6.5;
      }
    }

    const specialEventsNames = mod.specialWeeks.map(
      (sw) => `${sw.name} (${sw.period})`
    );
    const specialWeeksCount = mod.specialWeeks.length;
    const effectiveWeeks = Math.max(0, weeks - specialWeeksCount);

    totalWeeksSum += weeks;
    effectiveWeeksSum += effectiveWeeks;

    modulesCalc.push({
      moduleNumber: mod.moduleNumber,
      name: mod.name,
      period:
        mod.moduleNumber === 5 && isClasa12
          ? "05.05.2027 - 04.06.2027 (Clasa a XII-a/XIII-a)"
          : mod.moduleNumber === 5 && isClasa8
          ? "05.05.2027 - 11.06.2027 (Clasa a VIII-a)"
          : mod.period,
      totalWeeks: weeks,
      effectiveWeeks: effectiveWeeks,
      hoursPerWeek: hoursPerWeek,
      teachingHours: Math.round(effectiveWeeks * hoursPerWeek),
      specialEvents: specialEventsNames,
    });
  });

  const totalTeachingHours = modulesCalc.reduce(
    (acc, m) => acc + m.teachingHours,
    0
  );
  const specialWeeksHours = 2 * hoursPerWeek; // 2 special weeks: Scoala altfel + Saptamana verde

  let note = "An școlar standard (35 săptămâni de cursuri).";
  if (isClasa8) {
    note = "Clasa a VIII-a: Cursurile se încheie pe 11 iunie 2027 (34 săptămâni).";
  } else if (isClasa12) {
    note = "Clasa terminală (XII/XIII): Cursurile se încheie pe 4 iunie 2027 (33 săptămâni).";
  }

  return {
    modules: modulesCalc,
    totalWeeks: totalWeeksSum,
    effectiveTeachingWeeks: effectiveWeeksSum,
    totalTeachingHours: totalTeachingHours,
    specialWeeksHours: specialWeeksHours,
    note,
  };
}

export const STANDARD_TEMPLATES: StandardTemplate[] = [
  {
    id: "sablon-anual-oficial",
    title: "Planificare Calendaristică Anuală (Model Oficial MEC / ISJ)",
    category: "Planificare anuală",
    description:
      "Șablonul standard aprobat prin metodologiile MEC, structurat pe modulele anului școlar 2026-2027.",
    columns: [
      "Nr. crt.",
      "Unitatea de învățare",
      "Competențe specifice",
      "Conținuturi",
      "Nr. ore alocate",
      "Săptămâna",
      "Observații",
    ],
    content: `| Nr. crt. | Unitatea de învățare | Competențe specifice | Conținuturi | Nr. ore alocate | Săptămâna | Observații |
|---|---|---|---|---|---|---|
| 1 | Recapitulare inițială & Evaluare inițială | 1.1, 2.1 | Test inițial, diagnoză, fixarea noțiunilor fundamentale | 2 | S1 | Modulul 1 |
| 2 | Unitatea 1: Identitate și comunicare | 1.1, 1.2, 2.2, 3.1 | Textul narativ literar, indici spațio-temporali | 6 | S2 - S4 | Modulul 1 |
| 3 | Mai Mult decât Școala altfel | - | Activități extrașcolare conform programului unității | - | S5 | 05.10 - 09.10.2026 (fără predare) |
| ... | [Următoarele unități] | ... | ... | ... | ... | ... |`,
  },
  {
    id: "sablon-unitate",
    title: "Planificare pe Unități de Învățare (Model Oficial Avansat)",
    category: "Planificare pe unitate",
    description:
      "Tabel oficial cu 7 coloane: Conținuturi (detalieri), C.S., Activități de învățare (bullet points), Resurse materiale și umane (forme de organizare), Instrumente de evaluare, Nr. Ore / Modul / Data, Obs. și semnături finale.",
    columns: [
      "Conținuturi (detalieri)",
      "C.S.",
      "Activități de învățare",
      "Resurse materiale și umane",
      "Instrumente de evaluare",
      "Nr. Ore / Modul / Data",
      "Obs.",
    ],
    content: `**PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027**

| Conținuturi (detalieri) | C.S. | Activități de învățare | Resurse materiale și umane | Instrumente de evaluare | Nr. Ore / Modul / Data | Obs. |
|---|---|---|---|---|---|---|
| **Domeniu de conținut:** Textul narativ literar<br>**Unitatea 1: Identitate și aventură** (Manual pp. 12-28) | | | | | | |
| • **Reading & Text suport:** Fragment din „Toate pânzele sus!” de Radu Tudoran<br>• **Word Focus / Noțiuni cheie:** navigație, goeletă, coordonate spațio-temporale | 1.1<br>2.1 | • Brainstorming despre spiritul de aventură și călătorii<br>• Lectura ghidată a fragmentului narativ<br>• Exerciții de identificare a indicilor temporali și spațiali | Manualul școlar, caiete, text suport tipărit<br>**Forme de organizare:** Frontal, individual | • Observare sistematică<br>• Evaluare formativă orală | 2 ore, M1/S2 | Evaluare inițială încheiată |
| • **Grammar / Structuri:** Verbul (moduri personale și nepersonale, timpurile indicativului)<br>• **Aplicații practice:** Recunoașterea și conjugarea formelor verbale specifice | 2.2<br>3.1 | • Exerciții aplicative de completare a timpurilor verbale<br>• Lucru pe fișe diferențiate de analiză morfologică<br>• Redactarea unor enunțuri proprii cu forme de trecut | Fișe de lucru, videoproiector, tablă<br>**Forme de organizare:** Lucru în perechi, frontal | • Evaluare formativă continuă<br>• Interevaluare în perechi | 2 ore, M1/S3 | |
| • **Speaking & Writing:** Relatarea unei întâmplări trăite; redactarea unei narațiuni la persoana I | 1.2<br>3.1 | • Discuții ghidate despre o călătorie personală<br>• Redactarea unei scurte narațiuni de 150 de cuvinte<br>• Tehnica ciorchinelui pentru conturarea intrigii | Portofoliul elevului, organizatori grafici<br>**Forme de organizare:** Individual, pe grupe | • Notare pe baza grilei oficiale de redactare | 2 ore, M1/S4 | |
| • **Recapitulare și Evaluare Sumativă** | 1.1<br>2.1<br>3.1 | • Rezolvarea testului scris sumativ pe baza unității<br>• Discuții metareflexive și autoevaluare ghidată | Test de evaluare scrisă, barem oficial<br>**Forme de organizare:** Individual | • Probă scrisă sumativă<br>• Fișă de autoevaluare | 1 oră, M1/S4 | Înainte de S5 „Mai Mult decât Școala altfel” |

**Întocmit, Profesor:** [Nume Profesor sau .......................]                          **Avizat Director, Data:** [Nume Director sau .......................]`,
  },
  {
    id: "sablon-schita-lectie",
    title: "Proiect Didactic / Schiță de Lecție (Structură Oficială 6 Secțiuni)",
    category: "Schiță de lecție",
    description:
      "Format complet în 6 secțiuni: Antet, Caracteristici didactice, Resurse (4 categorii), Scenariu didactic (8 coloane), Tabel 1 Instrumente digitale, Tabel 2 Resurse digitale.",
    columns: [
      "Etape ale lecţiei",
      "Obiective",
      "Timp (min)",
      "Activitatea profesorului",
      "Activitatea elevilor",
      "Strategii & Metode",
      "Resurse și Forme de organizare",
      "Evaluare",
    ],
    content: `**I. Antet/Date generale**
- **Instituția:** [Unitatea de învățământ memorată]
- **Profesor:** [Nume Profesor]
- **Disciplina:** [Disciplina]
- **Clasa:** [Clasa]
- **Discipline înrudite:** Educație civică, Tehnologia informației și a comunicațiilor, Istorie
- **Timpul alocat:** 50 minute

**II. Caracteristici didactice ale proiectului**
- **Subiectul lecţiei:** [Titlul și tema lecției conform suportului de curs]
- **Competenţe specifice și Unități de competenţe:** [Competențele extrase din programa școlară]
- **Strategii de predare-învăţare:** Conversația euristică, învățarea prin descoperire, metoda ciorchinelui, jocul didactic, exercițiul ghidat
- **Forme de organizare:** Frontal, individual, pe grupe, în perechi
- **Strategii de evaluare:** Evaluare formativă continuă, observare sistematică, fișă de autoevaluare
- **Obiective operaționale (Elevii vor fi în stare să...):**
  - $O_1$: să identifice noțiunile-cheie din textul/problema propusă;
  - $O_2$: să explice relațiile cauzale și structura elementelor studiate;
  - $O_3$: să aplice cunoștințele în rezolvarea unei sarcini colaborative pe dispozitivul digital;
  - $O_4$: să formuleze aprecieri argumentate asupra rezultatelor colegilor.

**III. Resurse necesare**
1. **Resurse materiale (non-digitale):** Manualul școlar, caietele elevilor, fișe de lucru tipărite, instrumente de scris.
2. **Resurse hard (echipamente utilizate):** Laptop / PC profesor, tablă interactivă / videoproiector, tablete / calculatoare elevi, rețea Wi-Fi.
3. **Resurse soft (programe, aplicații locale/cloud):** Platformă e-learning (Google Classroom/Teams), browser web, aplicație interactivă colaborativă (Padlet/Mentimeter).
4. **Resurse bibliografice:** Programa școlară în vigoare; Manualul disciplinei aprobat MEC; ghiduri metodologice didactice.

**IV. Scenariul didactic al lecției**

| Etape ale lecţiei | Obiective | Timp (min) | Activitatea profesorului | Activitatea elevilor | Strategii & Metode | Resurse și Forme de organizare | Evaluare |
|---|---|---|---|---|---|---|---|
| 1. Moment organizatoric | - | 2 min | Salutul, consemnarea absenților, asigurarea cadrului tehnic și pregătirea platformei digitale | Elevii răspund la salut, se pregătesc cu manualele și dispozitivele conectate | Conversația | Laptop profesor, tablete elevi, frontal | Observare inițială |
| 2. Captarea atenției | $O_1$ | 5 min | Proiectează o secvență stimul sau un sondaj digital scurt. Adresează întrebarea declanșatoare: „Ce legătură observați între imagine și viața cotidiană?” | Elevii votează în aplicație și formulează primele ipoteze | Brainstorming, dialog euristic | Videoproiector, aplicație sondaj, frontal | Aprecieri verbale |
| 3. Anunțarea temei și a obiectivelor | - | 3 min | Notează titlul noii teme pe tablă/ecran și prezintă pe scurt competențele urmărite într-un limbaj adaptat vârstei | Elevii notează titlul în caiete și rețin obiectivele lecției | Expunerea clară, conversația | Tablă/ecran digital, frontal | Observare sistematică |
| 4. Dirijarea învățării | $O_1$, $O_2$ | 22 min | Prezintă noul conținut, organizează clasa pe 4 grupe și alocă sarcinile de lucru pe platforma partajată. Monitorizează și oferă suport grupelor | Elevii lucrează în echipă pe fișa colaborativă digitală, extrag ideile esențiale și elaborează răspunsurile | Învățarea prin descoperire, exercițiul ghidat, cooperarea | Fișă digitală partajată, PC elev, pe grupe | Evaluare formativă continuă |
| 5. Obținerea performanței | $O_2$, $O_3$ | 10 min | Moderează prezentarea rezultatelor fiecărei grupe. Lansează o aplicație de fixare cu feedback imediat (quiz interactiv) | Raportorii fiecărei grupe sintetizează ideile. Fiecare elev rezolvă individual mini-testul pe tabletă | Joc didactic, exercițiul aplicativ | Quiz digital, tablete, individual și frontal | Evaluare formativă imediată / feedforward |
| 6. Evaluarea & Asigurarea retenției | $O_1$, $O_4$ | 5 min | Concluzionează aspectele principale, oferă aprecieri globale și individuale argumentate și formulează tema pentru acasă | Elevii notează indicațiile pentru temă și adresează întrebări lămuritoare | Conversația euristică, reflecția | Manual, caiet, frontal | Aprecieri calitative și notare |
| 7. Încheierea activității | - | 3 min | Solicită completarea unui bilet de ieșire (Exit Ticket) de 1 minut pentru metareflecție | Elevii bifează nivelul de înțelegere pe formularul digital | Reflecția individuală | Formular digital scurt, individual | Autoevaluare |

**V. Tabel 1. Instrumente digitale utilizate**

| Nr | Denumire Instrument | Funcţionalități utilizate | Menirea didactică | Localizare | Tip licenţă | Adresa web |
|---|---|---|---|---|---|---|
| 1 | Padlet / Google Docs | Tablă digitală partajată, editare simultană | Colectarea și sintetizarea răspunsurilor grupelor de elevi | Cloud | Freemium / Educațională | https://padlet.com |
| 2 | Mentimeter / Kahoot | Chestionare și sondaje interactive în timp real | Captarea atenției și evaluarea rapidă a retenției | Cloud | Gratuită educațională | https://kahoot.com |
| 3 | Google Classroom | Distribuire resurse, linkuri și primire sarcini | Gestiunea fluxului didactic și a biletului de ieșire | Cloud | Gratuită Workspace | https://classroom.google.com |

**VI. Tabel 2. Resurse digitale de conţinut utilizate**

| Nr | Denumire resursă | Tip resursă | Menirea didactică | Autor | Localizare | Tip licență | Adresa web |
|---|---|---|---|---|---|---|---|
| 1 | Secvență video introductivă | Video MP4 / YouTube | Declanșator motivațional pentru captarea atenției | Resursă educativă deschisă (RED) | Web / YouTube | Domeniu public / Uz educativ | https://youtube.com |
| 2 | Fișă de lucru interactivă | Document PDF / Formular digital | Ghidarea investigației și exersarea competențelor | Profesorul de la clasă | Google Drive / Platformă | CC BY-NC-SA 4.0 | https://drive.google.com |
| 3 | Prezentare multimedia suport | Prezentare Canva / Google Slides | Suport vizual pentru explicarea conceptelor cheie | Profesorul | Canva Educațional | Gratuită educațională | https://canva.com |`,
  },
  {
    id: "sablon-planificare-integrata",
    title: "Planificare Integrată - Ciclul Primar (Abordare Transdisciplinară)",
    category: "Planificare integrată (Primar)",
    description:
      "Tabel normat pentru învățământul primar pe unități tematice integratoare: CLR, MEM, AVAP, DP, MM.",
    columns: [
      "Tema Unității",
      "Discipline integrate",
      "Competențe Specifice",
      "Conținuturi",
      "Nr. Ore",
      "Săptămâna",
    ],
    content: `| Tema Unității | Discipline integrate | Competențe Specifice | Conținuturi | Nr. Ore | Săptămâna |
|---|---|---|---|---|---|
| **Unitatea tematică 1: Din nou la școală! Universul meu** | • CLR (Comunicare în limba română)<br>• MEM (Matematică și explorarea mediului)<br>• DP (Dezvoltare personală)<br>• AVAP (Arte vizuale și abilități practice) | **CLR:** 1.1, 1.2, 2.1<br>**MEM:** 1.1, 3.1, 5.1<br>**DP:** 1.1, 2.2<br>**AVAP:** 1.1, 2.2 | • **CLR:** Cartea, textul, enunțul; formule de salut și dialog de prezentare<br>• **MEM:** Numerele naturale 0-100 (recunoaștere, comparare, ordonare); mediul școlar și orientarea spațială<br>• **DP:** Reguli de conviețuire în clasă, emoții de început de an<br>• **AVAP:** Realizarea ecusonului personal și a colajului „Clasa noastră prietenoasă” | CLR: 7h<br>MEM: 4h<br>DP: 2h<br>AVAP: 2h<br>**Total: 15h** | S1 - S3 (Modulul 1) |
| **Unitatea tematică 2: Culorile toamnei și secretele naturii** | • CLR<br>• MEM<br>• AVAP<br>• MM (Muzică și mișcare) | **CLR:** 1.3, 2.2, 3.1<br>**MEM:** 1.2, 3.1, 4.1<br>**AVAP:** 1.2, 2.3<br>**MM:** 2.1, 3.1 | • **CLR:** Textul narativ scurt despre toamnă, sunete și litere, propoziția<br>• **MEM:** Operații de adunare și scădere fără trecere peste ordin; transformări în natură, frunze, semințe, fenomene meteo<br>• **AVAP:** Colaj cu frunze presate, pictură în acuarelă pe texturi vegetale<br>• **MM:** Cântece de toamnă, acompaniament ritmic | CLR: 6h<br>MEM: 5h<br>AVAP: 2h<br>MM: 2h<br>**Total: 15h** | S4 - S6 (Modulul 1) |
| **Programul Național „Mai Mult decât Școala altfel”** | Toate disciplinele integrate transdisciplinar | Competențe civice, socio-emoționale și practice | Activități tematice extracurriculare, vizite educative, ateliere de creație | 20h | S5 (Modulul 1) |`,
  },
];

export const SAMPLE_PACKS: SamplePack[] = [
  {
    id: "romana-7",
    name: "Limba și Literatura Română - Clasa a VII-a",
    disciplina: "Limba și literatura română",
    clasa: "Clasa a VII-a",
    oreSaptamana: 4,
    tipDocument: "Planificare anuală",
    programaSnippet: `PROGRAMA ȘCOLARĂ PENTRU DISCIPLINA LIMBA ȘI LITERATURA ROMÂNĂ (CLASELE V-VIII):
Competențe generale:
1. Participarea la interacțiuni verbale în diverse situații de comunicare.
2. Receptarea textului scris de diverse tipuri.
3. Redactarea textului scris de diverse tipuri.
4. Utilizarea corectă, adecvată și eficientă a limbii în procesul comunicării.
Competențe specifice Clasa a VII-a:
1.1. Corelarea informațiilor explicite și implicite din texte orale sau multimodale.
1.2. Prezentarea unor informații, idei, sentimente și puncte de vedere în discursuri orale.
2.1. Recunoașterea modurilor de organizare a textelor (narativ, descriptiv, dialogat, explicativ).
2.2. Compararea acțiunilor, atitudinilor și motivelor personajelor din texte diferite.
3.1. Redactarea unui text narativ/descriptiv/argumentativ complex.
4.1. Folosirea structurilor morfosintactice conform normelor limbii literare actuale (DOOM3).`,
    suportSnippet: `MANUAL DE LIMBA ȘI LITERATURA ROMÂNĂ CLASA A VII-A (CUPRINS TEMATIC):
Unitatea 1: Călătorii reale și imaginare. Text suport: „Toate pânzele sus!” de Radu Tudoran. Noțiuni: textul narativ literar, naratorul obiectiv/subiectiv, verbul și timpurile verbale.
Unitatea 2: Portrete și destine. Text suport: „Amintiri din copilărie” de Ion Creangă & „Bunicul” de B.Șt. Delavrancea. Noțiuni: caracterizarea personajului, adjectivul și gradele de comparație.
Unitatea 3: Universul cunoașterii și al științei. Texte nonliterare, articolul de popularizare a științei, textul explicativ. Substantivul, declinarea.
Unitatea 4: Emoție și sensibilitate. Lirismul și figurile de stil (metafora, personificarea, epitetul). Pronumele și adjectivele pronominale.
Unitatea 5: Confruntări și alegeri etice. Textul dramatic, dialogul, didascaliile. Sintaxa propoziției și a frazei.
Unitatea 6: Sinteze și evaluări finale. Proiecte transdisciplinare și pregătirea portofoliului.`,
    sablonSnippet: STANDARD_TEMPLATES[0].content,
  },
  {
    id: "engleza-9",
    name: "Limba Engleză (L1) - Clasa a IX-a",
    disciplina: "Limba modernă 1 - Engleză",
    clasa: "Clasa a IX-a",
    oreSaptamana: 2,
    tipDocument: "Planificare anuală",
    programaSnippet: `CURRICULUM FOR ENGLISH AS A FIRST FOREIGN LANGUAGE - GRADE IX (CEFR B1-B2):
General Competences:
1. Receptive skills: Understanding spoken and written discourse in personal and academic contexts.
2. Productive skills: Producing clear, detailed written texts and oral presentations.
3. Interactive skills: Engaging actively in conversations and discussions on contemporary topics.
Specific Competences Grade IX:
1.1. Identifying main ideas and specific details in extended standard speech.
2.1. Writing coherent essays, reviews, and formal/informal emails following register conventions.
3.2. Formulating and defending arguments with relevant examples and connectors.
Language awareness: Lexical range (phrasal verbs, collocations, idioms) and complex grammar structures.`,
    suportSnippet: `COURSEBOOK: CAMBRIDGE / OXFORD B1+ ADVANCE TO B2 (TABLE OF CONTENTS):
Unit 1: Identity & Modern Lifestyles. Vocabulary: Personality adjectives, hobbies, life transitions. Grammar: Present Simple vs. Continuous, State verbs. Reading: Culture Shock.
Unit 2: Technology & Future Horizons. Vocabulary: AI, digital ethics, cyberspace. Grammar: Future forms (will, going to, future continuous). Writing: Opinion essay.
Unit 3: Planet Earth & Sustainability. Vocabulary: Ecology, climate change, conservation. Grammar: Past simple, past continuous, past perfect. Speaking: Eco-debates.
Unit 4: Fame, Media & Entertainment. Vocabulary: Performing arts, film critique, social influencers. Grammar: Modal verbs for deduction and obligation. Writing: Film/Book review.
Unit 5: Challenges & Achievements. Vocabulary: Sports, resilience, extreme careers. Grammar: Conditionals 0, 1, 2, 3 and mixed conditionals.
Unit 6: Global Citizens & Cultural Heritage. Vocabulary: Travel, intercultural communication, traditions. Grammar: Passive voice, causative have/get. Final Revision & Exam Practice.`,
    sablonSnippet: STANDARD_TEMPLATES[0].content,
  },
  {
    id: "istorie-8",
    name: "Istorie - Clasa a VIII-a (Clasă Terminală)",
    disciplina: "Istorie",
    clasa: "Clasa a VIII-a",
    oreSaptamana: 2,
    tipDocument: "Planificare anuală",
    programaSnippet: `PROGRAMA ȘCOLARĂ DE ISTORIE CLASA A VIII-A (ISTORIA ROMÂNILOR):
Competențe specifice:
1.1. Utilizarea coordonatelor spațio-temporale în analiza evenimentelor istorice.
2.1. Analiza critică a surselor istorice (documente scrise, mărturii, imagini).
3.1. Identificarea cauzelor și a consecințelor marilor evenimente din istoria națională și europeană.
4.1. Argumentarea unui punct de vedere pe baza faptelor istorice demonstrate.
Notă clasă terminală: Cursurile se încheie la 11 iunie 2027 (durată totală redusă conform structurii oficiale).`,
    suportSnippet: `MANUAL ISTORIA ROMÂNILOR CLASA A VIII-A (UNITĂȚI DE ÎNVĂȚARE):
Unitatea 1: Originile și evoluția spațiului românesc în Antichitate și Evul Mediu (Recapitulare integratoare).
Unitatea 2: Spre România modernă: Revoluția de la 1848 și Unirea Principatelor (1859).
Unitatea 3: Războiul de Independență (1877-1878) și Proclamarea Regatului.
Unitatea 4: Primul Război Mondial și Marea Unire de la 1918.
Unitatea 5: România interbelică: Democrație, viață culturală și autoritarism.
Unitatea 6: Al Doilea Război Mondial și instaurarea regimului comunist în România.
Unitatea 7: Căderea comunismului în 1989 și integrarea euro-atlantică. Sinteză finală pentru Evaluarea Națională.`,
    sablonSnippet: STANDARD_TEMPLATES[0].content,
  },
  {
    id: "proiect-lectie-romana-7",
    name: "Proiect Didactic de Lecție - Textul Narativ (Română clasa a VII-a)",
    disciplina: "Limba și literatura română",
    clasa: "Clasa a VII-a",
    oreSaptamana: 4,
    tipDocument: "Schiță de lecție",
    programaSnippet: `PROGRAMA ȘCOLARĂ LIMBA ȘI LITERATURA ROMÂNĂ CLASELE V-VIII:
Competențe specifice urmărite:
1.1. Corelarea informațiilor explicite și implicite din texte orale sau multimodale.
2.1. Recunoașterea modurilor de organizare a textelor (narativ, descriptiv, dialogat).
2.2. Compararea acțiunilor, atitudinilor și motivelor personajelor din texte diferite.
3.1. Redactarea unui text narativ/descriptiv/argumentativ complex.`,
    suportSnippet: `LECȚIA: „Toate pânzele sus!” de Radu Tudoran (Episodul plecării goeletei Speranța).
Conținuturi: Coordonatele spațio-temporale ale acțiunii narative; trăsăturile personajelor Anton Lupan și Ieremia; structura narativă (expozițiune, intrigă, desfășurarea acțiunii).
Mijloace didactice integrate: Fragment ecranizare video, padlet colaborativ pentru citate-cheie, mentimeter pentru captarea atenției și quiz formativ.`,
    sablonSnippet: STANDARD_TEMPLATES[2].content,
  },
  {
    id: "unitate-engleza-9",
    name: "Planificare pe Unități - Unit 1 Identity (Engleză clasa a IX-a)",
    disciplina: "Limba engleză",
    clasa: "Clasa a IX-a",
    oreSaptamana: 3,
    tipDocument: "Planificare pe unitate",
    programaSnippet: `PROGRAMA ȘCOLARĂ LIMBA MODERNĂ 1 (LICEU CLASA A IX-A):
1.1. Identifying main ideas and specific details in extended standard speech.
1.2. Following complex arguments provided the topic is reasonably familiar.
2.1. Writing coherent essays and descriptions on contemporary topics.
2.2. Expressing points of view with arguments and examples.
3.1. Engaging actively in conversations and discussions with lexical accuracy.`,
    suportSnippet: `COURSEBOOK: CAMBRIDGE B1+/B2 ADVANCE - UNIT 1: IDENTITY & MODERN LIFESTYLES (pp. 8-24):
- Reading & Vocabulary: Personality adjectives, hobbies, life transitions. Reading: Culture Shock.
- Grammar: Present Simple vs. Continuous, State verbs vs. Dynamic verbs.
- Listening & Speaking: Interviews on teenage lifestyles; expressing personal preferences.
- Writing: Informal email / profile presentation.
- Word Focus: resilient, open-minded, peer pressure, identity crisis.`,
    sablonSnippet: STANDARD_TEMPLATES[1].content,
  },
  {
    id: "primar-integrat-2",
    name: "Planificare Integrată - Clasa a II-a (CLR, MEM, DP, AVAP)",
    disciplina: "Discipline integrate (CLR, MEM, DP, AVAP)",
    clasa: "Clasa a II-a",
    oreSaptamana: 15,
    tipDocument: "Planificare integrată (Primar)",
    programaSnippet: `PROGRAME ȘCOLARE CICLUL PRIMAR (CLASA A II-A):
• CLR (Comunicare în limba română):
1.1. Identificarea semnificaţiei unui mesaj oral pe teme familiare.
1.2. Identificarea unor informaţii variate dintr-un mesaj scurt.
2.1. Formularea unor enunţuri proprii în situaţii concrete de comunicare.
3.1. Citirea unor mesaje scrise, întâlnite în mediul cunoscut.
• MEM (Matematică și explorarea mediului):
1.1. Scrierea, citirea şi formarea numerelor naturale până la 1000.
1.2. Compararea şi ordonarea numerelor naturale.
3.1. Rezolvarea de probleme cu operaţii matematice simple.
4.1. Observarea şi descrierea unor corpuri, fenomene şi relaţii din mediul înconjurător.
• DP (Dezvoltare personală):
1.1. Prezentarea unor trăsături personale elementare.
2.1. Exprimarea emoţiilor de bază în raport cu situaţii cunoscute.
• AVAP (Arte vizuale și abilități practice):
1.1. Sesizarea semnificaţiei unui mesaj vizual simplu.
2.2. Realizarea de creaţii funcţionale şi/sau estetice folosind materiale diverse.`,
    suportSnippet: `GHID DIDACTIC ȘI MANUALE APROBATE PENTRU CLASA A II-A:
Unitatea Tematică 1: „Universul prieteniei și al școlii”
- Teme integrate: Reguli de clasă (DP), textul narativ scurt despre colegialitate (CLR), numerele naturale și operații cu obiecte din clasă (MEM), desen și colaj (AVAP).
Unitatea Tematică 2: „Secretele toamnei aurii”
- Teme integrate: Povești și legende despre toamnă (CLR), schimbările din natură, culesul roadelor și măsurători (MEM), confecționarea unui ierbar și tablouri vegetale (AVAP).`,
    sablonSnippet: STANDARD_TEMPLATES[3].content,
  },
];
