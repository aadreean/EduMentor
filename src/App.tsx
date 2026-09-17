/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Header } from "./components/Header";
import { AcademicCalendarModal } from "./components/AcademicCalendarModal";
import { HoursCalculatorWidget } from "./components/HoursCalculatorWidget";
import { ConfigurationWorkshop } from "./components/ConfigurationWorkshop";
import { PreviewHall } from "./components/PreviewHall";
import { ChatMessage, DocumentType, FilePayload, TechnicalHeaderData } from "./types";
import { SAMPLE_PACKS, STANDARD_TEMPLATES } from "./data/curriculumData";

export default function App() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parameters
  const [clasa, setClasa] = useState("Clasa a VII-a");
  const [oreSaptamana, setOreSaptamana] = useState(4);
  const [tipDocument, setTipDocument] = useState<DocumentType>("Planificare anuală");
  const [disciplina, setDisciplina] = useState("Limba și literatura română");

  // Coordonate Tehnice Permanente (Antet Oficial)
  const [headerData, setHeaderData] = useState<TechnicalHeaderData>({
    unitateInvatamant: "Colegiul Național „Mihai Viteazul”",
    anScolar: "2026-2027",
    disciplina: "Limba și literatura română",
    manualSuport: "Manual Ed. Art Klett",
    clasa: "Clasa a VII-a",
    nrOreSaptamana: "4 ore/săpt.",
    profesor: "Prof. Adrian Podar",
    director: "Prof. dr. Popescu Ion",
    respCatedra: "Prof. Georgescu Elena",
    nrInregistrare: ".......................",
    vacantaFebruarie: "Săptămâna 2 (22 - 28 Februarie 2027)",
    isComplete: true,
  });

  // 3 Essential Inputs
  const [programaFile, setProgramaFile] = useState<FilePayload | null>(null);
  const [programaText, setProgramaText] = useState("");

  const [suportFile, setSuportFile] = useState<FilePayload | null>(null);
  const [suportText, setSuportText] = useState("");

  const [sablonFile, setSablonFile] = useState<FilePayload | null>(null);
  const [sablonText, setSablonText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Bună ziua, stimate cadru didactic! Sunt asistentul tău educațional și metodist de specialitate pentru anul școlar 2026-2027 (dezvoltat **by profesor Adrian Podar**).

Rolul meu este să reduc birocrația didactică prin generarea automată a planificărilor anuale pe cele 5 module, a planificărilor pe unități de învățare (7 coloane) și a proiectelor de lecție.

Pentru a asigura o redactare pedagogică de top:
1. Încarcă **Șablonul** (capul de tabel dorit) sau selectează modelul oficial MEC.
2. Încarcă **Programa școlară** (pentru competențele specifice).
3. Încarcă **Suportul de curs / Manualul** (pentru conținuturi reale).

Apasă pe **„Încarcă Exemplu Demo”** din colțul de sus pentru a testa instant fluxul cu un curriculum complet de Limba Română sau Limba Engleză!`,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const hasSablon = Boolean(sablonFile || (sablonText && sablonText.trim().length > 0));
  const hasPrograma = Boolean(programaFile || (programaText && programaText.trim().length > 0));
  const hasSuport = Boolean(suportFile || (suportText && suportText.trim().length > 0));

  const handleSelectStandardTemplate = (templateId: string) => {
    const tmpl = STANDARD_TEMPLATES.find((t) => t.id === templateId) || STANDARD_TEMPLATES[0];
    setSelectedTemplateId(tmpl.id);
    setSablonFile(null);
    setSablonText(tmpl.content);
    setTipDocument(tmpl.category);

    const confirmationMsg: ChatMessage = {
      id: `tmpl-${Date.now()}`,
      role: "assistant",
      content: `Am atașat șablonul oficial: **${tmpl.title}**. Capul de tabel va fi replicat cu strictețe în format Markdown.`,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const handleLoadSampleData = (sampleIndex: number = 0) => {
    const sample = SAMPLE_PACKS[sampleIndex] || SAMPLE_PACKS[0];
    setClasa(sample.clasa);
    setOreSaptamana(sample.oreSaptamana);
    setTipDocument(sample.tipDocument);
    setDisciplina(sample.disciplina);

    // Update headerData for the chosen sample
    setHeaderData({
      unitateInvatamant:
        sample.id === "engleza-9"
          ? "Liceul Teoretic „Grigore Moisil”"
          : sample.id === "istorie-8"
          ? "Școala Gimnazială Nr. 192"
          : "Colegiul Național „Mihai Viteazul”",
      anScolar: "2026-2027",
      disciplina: sample.disciplina,
      manualSuport:
        sample.id === "engleza-9"
          ? "Cambridge B1+/B2 Advance"
          : sample.id === "istorie-8"
          ? "Manual Istorie Ed. Litera"
          : "Manual Ed. Art Klett",
      clasa: sample.clasa,
      nrOreSaptamana: `${sample.oreSaptamana} ore/săpt.`,
      profesor:
        sample.id === "engleza-9"
          ? "Prof. Andrei Radu"
          : sample.id === "istorie-8"
          ? "Prof. Popa Cristian"
          : "Prof. Adrian Podar",
      director: "Prof. dr. Popescu Ion",
      respCatedra:
        sample.id === "engleza-9" ? "Prof. Brown Sarah" : "Prof. Georgescu Elena",
      nrInregistrare: ".......................",
      vacantaFebruarie: "Săptămâna 2 (22 - 28 Februarie 2027)",
      isComplete: true,
    });

    setProgramaFile(null);
    setProgramaText(sample.programaSnippet);

    setSuportFile(null);
    setSuportText(sample.suportSnippet);

    setSablonFile(null);
    setSablonText(sample.sablonSnippet);
    setSelectedTemplateId(
      sample.tipDocument === "Schiță de lecție"
        ? "sablon-schita-lectie"
        : sample.tipDocument === "Planificare pe unitate"
        ? "sablon-unitate"
        : "sablon-anual-oficial"
    );

    const sampleMsg: ChatMessage = {
      id: `sample-${Date.now()}`,
      role: "assistant",
      content: `Am încărcat pachetul didactic complet pentru **${sample.name}** (${sample.clasa}, ${sample.oreSaptamana} ore/săptămână).

Toate cele 3 surse obligatorii sunt configurate:
- **Șablon**: ${
        sample.tipDocument === "Schiță de lecție"
          ? "Model Oficial Proiect de Lecție (6 Secțiuni & 8 Coloane)"
          : sample.tipDocument === "Planificare pe unitate"
          ? "Model Oficial Planificare pe Unități (7 Coloane & Semnături)"
          : "Model Oficial MEC / ISJ (Planificare Anuală 2026-2027)"
      }
- **Programă**: Competențe generale și specifice
- **Suport de curs**: Cuprins manual tematic
- **Antet Oficial**: Coordonate tehnice complete

Apasă pe butonul de generare din previzualizare pentru a redacta documentul!`,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, sampleMsg]);
  };

  const handleSendMessage = async (userInput: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Polite check if essential inputs are missing
    if (!hasSablon) {
      setTimeout(() => {
        const politeAssistantMsg: ChatMessage = {
          id: `ast-missing-sablon-${Date.now()}`,
          role: "assistant",
          content: `Pentru a-ți genera documentul corect, te rog să încarci și șablonul pe care dorești să-l folosesc.\n\nPoți alege cu 1 click „Atașează Șablon Standard MEC” din Cardul 3 (Fișiere) sau poți încărca propriul fișier.`,
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, politeAssistantMsg]);
      }, 300);
      return;
    }

    if (!hasPrograma && !hasSuport) {
      setTimeout(() => {
        const politeAssistantMsg: ChatMessage = {
          id: `ast-missing-both-${Date.now()}`,
          role: "assistant",
          content: `Pentru a realiza o planificare fidelă conținutului tău, am nevoie și de Programa școlară și de Suportul de curs (manualul). Te rog să le încarci în Cardul 3 din stânga, sau apasă pe **„Încarcă Exemplu Demo”** din colțul de sus.`,
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, politeAssistantMsg]);
      }, 300);
      return;
    }

    // Call server endpoint
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userInput,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
        }),
      });

      const data = await response.json();

      if (data.success && data.text) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ast-err-${Date.now()}`,
          role: "assistant",
          content:
            data.error ||
            "A intervenit o dificultate temporară la redactarea documentului. Te rog să reîncerci.",
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMsg: ChatMessage = {
        id: `ast-err-${Date.now()}`,
        role: "assistant",
        content:
          "A apărut o problemă de conexiune la serverul metodic. Te rog să verifici conexiunea și să încerci din nou.",
        timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-sans text-[#1E293B]">
      <Header
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onLoadSample={() => handleLoadSampleData(0)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col space-y-4">
        {/* Hours Calculator Live Banner */}
        <HoursCalculatorWidget clasa={clasa} oreSaptamana={oreSaptamana} />

        {/* Core Asymmetric Layout: 40% Left ("Atelierul de Configurare") / 60% Right ("Sala de Previzualizare") */}
        <div className="flex flex-col lg:flex-row gap-5 items-start flex-1 w-full">
          {/* 1. COLOANA STÂNGĂ (40% din lățime) - "Atelierul de Configurare" */}
          <div className="w-full lg:w-[40%] shrink-0">
            <ConfigurationWorkshop
              clasa={clasa}
              setClasa={setClasa}
              oreSaptamana={oreSaptamana}
              setOreSaptamana={setOreSaptamana}
              tipDocument={tipDocument}
              setTipDocument={setTipDocument}
              disciplina={disciplina}
              setDisciplina={setDisciplina}
              headerData={headerData}
              setHeaderData={setHeaderData}
              programaFile={programaFile}
              setProgramaFile={setProgramaFile}
              programaText={programaText}
              setProgramaText={setProgramaText}
              suportFile={suportFile}
              setSuportFile={setSuportFile}
              suportText={suportText}
              setSuportText={setSuportText}
              sablonFile={sablonFile}
              setSablonFile={setSablonFile}
              sablonText={sablonText}
              setSablonText={setSablonText}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
            />
          </div>

          {/* 2. COLOANA DREAPTĂ (60% din lățime) - "Sala de Previzualizare" */}
          <div className="w-full lg:w-[60%] flex flex-col flex-1 h-full min-h-[640px]">
            <PreviewHall
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              clasa={clasa}
              oreSaptamana={oreSaptamana}
              tipDocument={tipDocument}
              headerData={headerData}
              hasSablon={hasSablon}
              hasPrograma={hasPrograma}
              hasSuport={hasSuport}
              onSelectStandardTemplate={handleSelectStandardTemplate}
              onLoadSampleData={() => handleLoadSampleData(0)}
            />
          </div>
        </div>
      </main>

      {/* Footer Oficial EduMetodist */}
      <footer className="mt-8 border-t border-[#E2E8F0] bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#1E293B]">EduMetodist România</span>
            <span className="text-slate-300">•</span>
            <span>Anul Școlar 2026-2027</span>
          </div>
          <div className="text-slate-600 font-medium">
            Concept metodic & dezvoltare: <span className="text-[#0D9488] font-bold">by profesor Adrian Podar</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Conform standardelor MEC & Structura pe 5 Module
          </div>
        </div>
      </footer>

      <AcademicCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}
