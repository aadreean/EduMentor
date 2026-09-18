/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Facebook, Youtube } from "lucide-react";
import { Header } from "./components/Header";
import { AcademicCalendarModal } from "./components/AcademicCalendarModal";
import { HoursCalculatorWidget } from "./components/HoursCalculatorWidget";
import { TechnicalHeaderSection } from "./components/TechnicalHeaderSection";
import { FileUploadSection } from "./components/FileUploadSection";
import { TypologyAndGenerateSection } from "./components/TypologyAndGenerateSection";
import { PreviewHall } from "./components/PreviewHall";
import { ChatMessage, DocumentType, FilePayload, TechnicalHeaderData } from "./types";
import { SAMPLE_PACKS, STANDARD_TEMPLATES } from "./data/curriculumData";

export default function App() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parametrii didactici primari
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

  // Multiple File Payloads
  const [sablonFiles, setSablonFiles] = useState<FilePayload[]>([]);
  const [sablonText, setSablonText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [programaFiles, setProgramaFiles] = useState<FilePayload[]>([]);
  const [programaText, setProgramaText] = useState("");

  const [suportFiles, setSuportFiles] = useState<FilePayload[]>([]);
  const [suportText, setSuportText] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Istoric mesaje / documente (inițial gol pentru un empty state curat)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSelectStandardTemplate = (templateId: string) => {
    const tmpl = STANDARD_TEMPLATES.find((t) => t.id === templateId) || STANDARD_TEMPLATES[0];
    setSelectedTemplateId(tmpl.id);
    setSablonText(tmpl.content);
    setTipDocument(tmpl.category);

    const confirmationMsg: ChatMessage = {
      id: `tmpl-${Date.now()}`,
      role: "assistant",
      content: `Am atașat șablonul standard oficial MEC: **${tmpl.title}**. Capul de tabel va fi respectat cu strictețe în format Markdown A4.`,
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

    setHeaderData({
      unitateInvatamant:
        sample.id === "engleza-9"
          ? "Liceul Teoretic „Grigore Moisil”"
          : sample.id === "istorie-8"
          ? "Școala Gimnazială Nr. 192"
          : sample.id === "primar-integrat-2"
          ? "Școala Gimnazială „Ion Creangă”"
          : "Colegiul Național „Mihai Viteazul”",
      anScolar: "2026-2027",
      disciplina: sample.disciplina,
      manualSuport:
        sample.id === "engleza-9"
          ? "Cambridge B1+/B2 Advance"
          : sample.id === "istorie-8"
          ? "Manual Istorie Ed. Litera"
          : sample.id === "primar-integrat-2"
          ? "Ghid integrat și manuale EDP"
          : "Manual Ed. Art Klett",
      clasa: sample.clasa,
      filiera: sample.id === "engleza-9" ? "Teoretică" : "",
      profil: sample.id === "engleza-9" ? "Umanist" : "",
      specializare: sample.id === "engleza-9" ? "Filologie" : "",
      nrOreSaptamana: `${sample.oreSaptamana} ore/săpt.`,
      profesor:
        sample.id === "engleza-9"
          ? "Prof. Andrei Radu"
          : sample.id === "istorie-8"
          ? "Prof. Popa Cristian"
          : "Prof. Adrian Podar",
      director: "Prof. dr. Popescu Ion",
      respCatedra:
        sample.id === "engleza-9"
          ? "Prof. Brown Sarah"
          : sample.id === "primar-integrat-2"
          ? "Prof. Munteanu Carmen"
          : "Prof. Georgescu Elena",
      nrInregistrare: ".......................",
      vacantaFebruarie: "Săptămâna 2 (22 - 28 Februarie 2027)",
      isComplete: true,
    });

    setProgramaFiles([]);
    setProgramaText(sample.programaSnippet);

    setSuportFiles([]);
    setSuportText(sample.suportSnippet);

    setSablonFiles([]);
    setSablonText(sample.sablonSnippet);
    setSelectedTemplateId(
      sample.tipDocument === "Schiță de lecție"
        ? "sablon-schita-lectie"
        : sample.tipDocument === "Planificare pe unitate"
        ? "sablon-unitate"
        : sample.tipDocument === "Planificare integrată (Primar)"
        ? "sablon-planificare-integrata"
        : "sablon-anual-oficial"
    );

    const sampleMsg: ChatMessage = {
      id: `sample-${Date.now()}`,
      role: "assistant",
      content: `Am încărcat datele demonstrative complete pentru **${sample.name}** (${sample.clasa}, ${sample.oreSaptamana} ore/săptămână). Toate câmpurile și fișierele sunt configurate. Apasă pe butonul **„GENEREAZĂ PLANIFICAREA ACUM”** de mai jos!`,
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
    setIsLoading(true);

    try {
      // Concatenează conținutul tuturor fișierelor din fiecare categorie înainte de trimitere
      const combinedProgramaText = [
        programaText,
        ...programaFiles.map(
          (file, idx) =>
            `--- [FIȘIER PROGRAMĂ ȘCOLARĂ ${idx + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
        ),
      ]
        .filter(Boolean)
        .join("\n\n");

      const combinedSuportText = [
        suportText,
        ...suportFiles.map(
          (file, idx) =>
            `--- [FIȘIER SUPORT / MANUAL ${idx + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
        ),
      ]
        .filter(Boolean)
        .join("\n\n");

      const defaultTemplateContent = selectedTemplateId
        ? STANDARD_TEMPLATES.find((t) => t.id === selectedTemplateId)?.content
        : "";
      const combinedSablonText = [
        sablonText || defaultTemplateContent,
        ...sablonFiles.map(
          (file, idx) =>
            `--- [FIȘIER ȘABLON ${idx + 1}: ${file.name}] ---\n${file.textSnippet || ""}`
        ),
      ]
        .filter(Boolean)
        .join("\n\n");

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
          disciplina: disciplina || headerData.disciplina,
          headerData,
          sablonFiles,
          programaFiles,
          suportFiles,
          sablonText: combinedSablonText,
          programaText: combinedProgramaText,
          suportText: combinedSuportText,
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
            "A intervenit o eroare la generare. Te rugăm să reîncerci.",
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
          "A apărut o problemă de conexiune cu serverul. Te rugăm să verifici și să reîncerci.",
        timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    // Scroll smoothly to Section 4
    setTimeout(() => {
      const el = document.getElementById("section-document-generat");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    const promptText = `Te rog să generezi ${tipDocument.toUpperCase()} INTEGRALĂ pentru ${clasa}, disciplina ${disciplina || headerData.disciplina}, cu norma de ${oreSaptamana} ${oreSaptamana === 1 ? "oră" : "ore"} pe săptămână, conform structurii oficiale pe 5 module a anului școlar 2026-2027.
MANDAT STRICT: Este obligatoriu să generezi atât antetul tehnic oficial complet pe două coloane, cât și ÎNTREGUL TABEL CURRICULAR COMPLET CU TOATE CELE 7 COLOANE OFICIALE PENTRU TOATE CELE 5 MODULE (S1-S36), fără a te opri doar la antet!`;
    handleSendMessage(promptText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-sans text-[#1E293B]">
      <Header
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onLoadSample={() => handleLoadSampleData(0)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Widget Calcul Orar Live (Informativ) */}
        <HoursCalculatorWidget clasa={clasa} oreSaptamana={oreSaptamana} />

        {/* SECȚIUNEA 1: DATE TEHNICE & ANTET OFICIAL */}
        <TechnicalHeaderSection
          clasa={clasa}
          setClasa={setClasa}
          oreSaptamana={oreSaptamana}
          setOreSaptamana={setOreSaptamana}
          disciplina={disciplina}
          setDisciplina={setDisciplina}
          headerData={headerData}
          setHeaderData={setHeaderData}
        />

        {/* SECȚIUNEA 2: ÎNCĂRCARE FIȘIERE DIDACTICE (MULTIPLE FIȘIERE) */}
        <FileUploadSection
          sablonFiles={sablonFiles}
          setSablonFiles={setSablonFiles}
          sablonText={sablonText}
          setSablonText={setSablonText}
          programaFiles={programaFiles}
          setProgramaFiles={setProgramaFiles}
          programaText={programaText}
          setProgramaText={setProgramaText}
          suportFiles={suportFiles}
          setSuportFiles={setSuportFiles}
          suportText={suportText}
          setSuportText={setSuportText}
          selectedTemplateId={selectedTemplateId}
          onSelectStandardTemplate={handleSelectStandardTemplate}
        />

        {/* SECȚIUNEA 3: TIPOLOGIE DIDACTICĂ & MARELE BUTON DE GENERARE */}
        <TypologyAndGenerateSection
          tipDocument={tipDocument}
          setTipDocument={setTipDocument}
          clasa={clasa}
          oreSaptamana={oreSaptamana}
          isLoading={isLoading}
          onGenerate={handleGenerateClick}
          onLoadSampleData={() => handleLoadSampleData(0)}
        />

        {/* SECȚIUNEA 4: DOCUMENTUL DIDACTIC GENERAT & EXPORT */}
        <PreviewHall
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          clasa={clasa}
          oreSaptamana={oreSaptamana}
          tipDocument={tipDocument}
          headerData={headerData}
          onGenerate={handleGenerateClick}
          onLoadSampleData={() => handleLoadSampleData(0)}
        />
      </main>

      {/* Footer Oficial EduMetodist / EduMentor */}
      <footer className="no-print mt-10 border-t border-[#E2E8F0] bg-white py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#1E293B]">EduMetodist România</span>
            <span className="text-slate-300">•</span>
            <span>Anul Școlar 2026-2027</span>
          </div>

          <div className="text-slate-600 font-medium">
            Concept metodic & dezvoltare: <span className="text-[#0D9488] font-bold">autor prof. Adrian Podar</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Toate drepturile metodice rezervate
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Conform standardelor oficiale MEC & Structura pe 5 Module</span>
          <span>Aplicație didactică dedicată cadrelor didactice din învățământul preuniversitar</span>
        </div>
      </footer>

      <AcademicCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}
