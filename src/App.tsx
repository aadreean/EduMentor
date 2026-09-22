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
import { EduChatAssistant } from "./components/EduChatAssistant";
import { ChatMessage, DocumentType, FilePayload, TechnicalHeaderData } from "./types";
import { STANDARD_TEMPLATES } from "./data/curriculumData";
import { generatePedagogicalPlan } from "./utils/planGenerator";

export default function App() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Parametrii didactici primari (câmpurile încep goale, cu text gri de îndrumare/placeholder)
  const [clasa, setClasa] = useState("");
  const [oreSaptamana, setOreSaptamana] = useState(2);
  const [tipDocument, setTipDocument] = useState<DocumentType>("Planificare anuală");
  const [disciplina, setDisciplina] = useState("");

  // Coordonate Tehnice Permanente (Antet Oficial)
  const [headerData, setHeaderData] = useState<TechnicalHeaderData>({
    unitateInvatamant: "",
    anScolar: "2026-2027",
    disciplina: "",
    manualSuport: "",
    clasa: "",
    filiera: "",
    profil: "",
    specializare: "",
    nrOreSaptamana: "2 ore/săpt.",
    profesor: "prof. ",
    director: "prof. ",
    respCatedra: "prof. ",
    nrInregistrare: "",
    vacantaFebruarie: "Săptămâna 2 (22 - 28 Februarie 2027)",
    isComplete: false,
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
    const recommendedOrient = tmpl.category === "Schiță de lecție" ? "portrait" : "landscape";
    setHeaderData((prev) => ({ ...prev, orientare: recommendedOrient }));

    const confirmationMsg: ChatMessage = {
      id: `tmpl-${Date.now()}`,
      role: "assistant",
      content: `Am atașat șablonul standard oficial MEC: **${tmpl.title}**. Formatul paginii A4 este presetat pe **${recommendedOrient === "portrait" ? "Portret (Vertical)" : "Landscape (Vedere)"}** conform tipului de document.`,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const handleSendMessage = async (userInput: string, chatAttachedFiles?: FilePayload[]) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userInput,
      attachedFiles: chatAttachedFiles && chatAttachedFiles.length > 0 ? chatAttachedFiles : undefined,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const activeDisciplina = disciplina || headerData.disciplina || "Limba și literatura română";
    const activeClasa = clasa || headerData.clasa || "Clasa a VII-a";
    const activeNorma = Number(oreSaptamana) || 2;

    let combinedSuportText = "";

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

      combinedSuportText = [
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

      // Sanitizează payload-urile fișierelor fără a pierde conținutul binar al imaginilor
      const sanitizeFile = (f: FilePayload) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        textSnippet: f.textSnippet,
        data: f.data,
      });

      const payload = {
        prompt: userInput,
        conversationHistory: messages.slice(-4).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        clasa: activeClasa,
        oreSaptamana: activeNorma,
        tipDocument,
        disciplina: activeDisciplina,
        headerData,
        sablonFiles: sablonFiles.map(sanitizeFile),
        programaFiles: programaFiles.map(sanitizeFile),
        suportFiles: suportFiles.map(sanitizeFile),
        chatAttachedFiles: (chatAttachedFiles || []).map(sanitizeFile),
        sablonText: combinedSablonText,
        programaText: combinedProgramaText,
        suportText: combinedSuportText,
      };

      let response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let contentType = response.headers.get("content-type") || "";

      // Dacă /api/generate a returnat HTML (ex: index.html din cauza rescrierii SPA pe Netlify), încercăm direct ruta nativă Netlify Functions
      if (!contentType.includes("application/json")) {
        try {
          const directNetlifyResp = await fetch("/.netlify/functions/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const directType = directNetlifyResp.headers.get("content-type") || "";
          if (directType.includes("application/json")) {
            response = directNetlifyResp;
            contentType = directType;
          }
        } catch (retryErr) {
          console.warn("Reîncercare directă pe /.netlify/functions/generate:", retryErr);
        }
      }

      let data: any;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResp = await response.text();
        const isHtml = textResp.trim().startsWith("<");
        throw new Error(
          isHtml
            ? "Serverul a returnat pagina web (index.html) în loc de răspunsul funcției serverless AI. Pe Netlify (sesuna.ro), funcția `generate` necesită un nou deploy sau verificare în secțiunea Functions."
            : `Răspuns invalid primit de la server (Status: ${response.status}).`
        );
      }

      if (data.success && data.text) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const hasAttachedFiles =
          suportFiles.length > 0 ||
          programaFiles.length > 0 ||
          (chatAttachedFiles && chatAttachedFiles.length > 0) ||
          Boolean(combinedSuportText.trim());

        if (hasAttachedFiles) {
          const isNetlifyKeyMissing = data.error && data.error.includes("GEMINI_API_KEY");
          const errorMsg: ChatMessage = {
            id: `ast-err-${Date.now()}`,
            role: "assistant",
            content: `### ⚠️ Eroare la recunoașterea fișierelor încărcate\n\n${data.error || "Serviciul de recunoaștere nu a putut extrage automat conținuturile din fișierele atașate."}\n\n${
              isNetlifyKeyMissing
                ? "**Pentru utilizatorii de pe domeniul sesuna.ro (Netlify):**\nAsigurați-vă că ați adăugat variabila `GEMINI_API_KEY` în panoul Netlify la **Site configuration → Environment variables**, apoi efectuați un nou deploy."
                : "**Soluție:** Vă rugăm să apăsați din nou pe **„Regenerează Document”** sau verificați conexiunea."
            }`,
            timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } else {
          console.warn("API did not return text, employing curricular plan fallback.");
          const fallbackText = generatePedagogicalPlan({
            clasa: activeClasa,
            disciplina: activeDisciplina,
            oreSaptamana: activeNorma,
            tipDocument,
            headerData,
            manualSuport: headerData.manualSuport,
            programaSnippets: [combinedProgramaText].filter(Boolean),
            suportSnippets: [combinedSuportText].filter(Boolean),
          });

          const assistantMsg: ChatMessage = {
            id: `ast-fallback-${Date.now()}`,
            role: "assistant",
            content: fallbackText,
            timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      }
    } catch (err: any) {
      console.warn("Fetch backend warning:", err);

      const hasAttachedFiles =
        suportFiles.length > 0 ||
        programaFiles.length > 0 ||
        (chatAttachedFiles && chatAttachedFiles.length > 0) ||
        Boolean(combinedSuportText.trim());

      if (hasAttachedFiles) {
        const errorMsg: ChatMessage = {
          id: `ast-err-${Date.now()}`,
          role: "assistant",
          content: `### ⚠️ Nu s-a putut apela motorul AI pentru citirea cuprinsului\n\n**Detalii eroare:** ${err.message || "Eroare de conexiune la server"}\n\n**De ce este necesară conexiunea AI:**\nAți atașat fotografii / capturi de ecran ale manualului. Pentru ca titlurile reale din manual să fie transcrise optic și să NU se genereze denumiri generice, este obligatoriu ca motorul de Viziune Multimodală să citească imaginea.\n\n**Dacă accesați aplicația pe sesuna.ro (Netlify):**\n1. Au fost configurate funcțiile serverless native în directorul \`netlify/functions/\`.\n2. Vă rugăm să verificați că în panoul Netlify (**Site configuration → Environment variables**) aveți setată variabila **\`GEMINI_API_KEY\`**.\n3. Reîncărcați pagina și apăsați pe **GENEREAZĂ PLANIFICAREA ANUALĂ**.\n\n*Aplicația refuză să afișeze capitole fictive sau șabloane generice atunci când aveți atașate fișiere.*`,
          timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        try {
          const fallbackText = generatePedagogicalPlan({
            clasa: activeClasa,
            disciplina: activeDisciplina,
            oreSaptamana: activeNorma,
            tipDocument,
            headerData,
            manualSuport: headerData.manualSuport,
            programaSnippets: [
              programaText,
              ...programaFiles.map((f) => f.textSnippet || f.name),
            ].filter(Boolean),
            suportSnippets: [
              suportText,
              ...suportFiles.map((f) => f.textSnippet || f.name),
            ].filter(Boolean),
          });

          const assistantMsg: ChatMessage = {
            id: `ast-plan-${Date.now()}`,
            role: "assistant",
            content: fallbackText,
            timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } catch (fallbackErr: any) {
          const errorMsg: ChatMessage = {
            id: `ast-err-${Date.now()}`,
            role: "assistant",
            content: `### ⚠️ Eroare la generarea documentului\n\nNu s-a putut redacta documentul didactic. Vă rugăm să apăsați din nou pe butonul **GENEREAZĂ**.\n\n*Detalii tehnice: ${fallbackErr?.message || err?.message || "Eroare necunoscută"}*`,
            timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDocument = () => {
    setMessages([]);
    setTimeout(() => {
      const target = document.getElementById("section-tipologie") || document.getElementById("section-antet");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleRegenerateDocument = (customPrompt?: string, chatAttachedFiles?: FilePayload[]) => {
    if (isLoading) return;
    const activeDisciplina = disciplina || headerData.disciplina || "Limba și literatura română";
    const activeClasa = clasa || headerData.clasa || "Clasa a VII-a";
    const activeNorma = Number(oreSaptamana) || 2;

    const promptText =
      customPrompt ||
      `Te rog să regenerezi integral documentul didactic (${tipDocument}) pentru ${activeClasa}, disciplina ${activeDisciplina}, norma ${activeNorma} ore/săptămână, respectând cu strictețe cerințele specificate și corecțiile din chat. Este obligatoriu să generezi atât antetul oficial complet, cât și întregul tabel complet pe toate cele 5 module (S1-S36).`;

    handleSendMessage(promptText, chatAttachedFiles);
  };

  const handleGenerateClick = () => {
    if (isLoading) return;

    // Setează imediat starea de încărcare pentru feedback vizual instant
    setIsLoading(true);

    // Scroll instant și fluid către Secțiunea 4 (Document Generat)
    const scrollToSection4 = () => {
      const el = document.getElementById("section-document-generat");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    scrollToSection4();
    setTimeout(scrollToSection4, 100);

    const activeDisciplina = disciplina || headerData.disciplina || "Limba și literatura română";
    const activeClasa = clasa || headerData.clasa || "Clasa a VII-a";
    const activeNorma = Number(oreSaptamana) || 2;

    const promptText = `Te rog să generezi ${tipDocument.toUpperCase()} INTEGRALĂ pentru ${activeClasa}, disciplina ${activeDisciplina}, cu norma de ${activeNorma} ${activeNorma === 1 ? "oră" : "ore"} pe săptămână, conform structurii oficiale pe 5 module a anului școlar 2026-2027.
MANDAT STRICT: Este obligatoriu să generezi atât antetul tehnic oficial complet pe două coloane, cât și ÎNTREGUL TABEL CURRICULAR COMPLET CU TOATE CELE 7 COLOANE OFICIALE PENTRU TOATE CELE 5 MODULE (S1-S36), fără a te opri doar la antet!`;
    handleSendMessage(promptText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-sans text-[#1E293B]">
      <Header
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
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
        />

        {/* SECȚIUNEA 4: DOCUMENTUL DIDACTIC GENERAT & EXPORT */}
        <PreviewHall
          messages={messages}
          onSendMessage={handleSendMessage}
          onClearDocument={handleClearDocument}
          onRegenerate={handleRegenerateDocument}
          isLoading={isLoading}
          clasa={clasa}
          oreSaptamana={oreSaptamana}
          tipDocument={tipDocument}
          headerData={headerData}
          onOrientationChange={(newOrient) =>
            setHeaderData((prev) => ({ ...prev, orientare: newOrient }))
          }
          onGenerate={handleGenerateClick}
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

      {/* Asistent Metodist Multi-turn Chatbot & Căutare Google Search */}
      <EduChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        clasa={clasa}
        disciplina={disciplina || headerData.disciplina}
      />
    </div>
  );
}
