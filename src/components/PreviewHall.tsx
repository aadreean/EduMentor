import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Printer,
  Download,
  Send,
  Sparkles,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ChatMessage, DocumentType, TechnicalHeaderData } from "../types";
import { copyTableToClipboard, exportWordDocument } from "../utils/fileHelpers";

interface PreviewHallProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  clasa: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  headerData: TechnicalHeaderData;
  hasSablon: boolean;
  hasPrograma: boolean;
  hasSuport: boolean;
  onSelectStandardTemplate: (id: string) => void;
  onLoadSampleData: () => void;
}

export const PreviewHall: React.FC<PreviewHallProps> = ({
  messages,
  onSendMessage,
  isLoading,
  clasa,
  oreSaptamana,
  tipDocument,
  headerData,
  hasSablon,
  hasPrograma,
  hasSuport,
  onSelectStandardTemplate,
  onLoadSampleData,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "chat">("document");
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Find latest message with document/table content
  const lastAssistantMessage = [...messages].reverse().find(
    (m) => m.role === "assistant" && m.content.includes("|") && m.content.includes("---")
  );

  // Or latest assistant message
  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  const documentContent = lastAssistantMessage
    ? lastAssistantMessage.content
    : latestAssistantMessage && latestAssistantMessage.content.length > 200
    ? latestAssistantMessage.content
    : "";

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab, isLoading]);

  const handleCopyText = () => {
    const contentToCopy = documentContent || generateInitialDraft();
    const tableEl = document.getElementById("plan-table-content");
    copyTableToClipboard(contentToCopy, tableEl?.innerHTML);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintPdf = () => {
    const contentHtml = document.getElementById("plan-table-content")?.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${tipDocument} - ${headerData.disciplina || "EduMetodist"} ${headerData.clasa}</title>
          <style>
            body { font-family: 'Times New Roman', Cambria, Georgia, serif; font-size: 11pt; margin: 15mm; color: #1E293B; line-height: 1.4; }
            h1, h2, h3 { margin: 12px 0 6px 0; color: #000; text-align: center; }
            p { margin: 4px 0; }
            ul, ol { margin: 4px 0 10px 20px; }
            li { margin-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 14px; font-size: 9.5pt; }
            th, td { border: 1px solid #1E293B; padding: 6px 8px; vertical-align: top; }
            th { background-color: #f1f5f9; font-weight: bold; text-align: left; }
            @page { size: landscape; margin: 12mm; }
          </style>
        </head>
        <body>
          <div>${contentHtml || ""}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadDocx = () => {
    const filename = `${tipDocument.replace(/\s+/g, "_")}_${(headerData.disciplina || "disciplina").replace(/\s+/g, "_")}_${(headerData.clasa || "clasa").replace(/\s+/g, "_")}.doc`;
    const contentHtml = document.getElementById("plan-table-content")?.innerHTML;
    exportWordDocument(
      filename,
      contentHtml || documentContent || generateInitialDraft(),
      `${tipDocument} - 2026-2027`
    );
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
    setActiveTab("document");
  };

  const handleQuickGenerate = () => {
    const prompt = `Te rog să generezi ${tipDocument.toLowerCase()} pentru ${clasa}, având alocate ${oreSaptamana} ${
      oreSaptamana === 1 ? "oră" : "ore"
    } pe săptămână, conform structurii anului școlar 2026-2027 și cu antetul tehnic configurat.`;
    onSendMessage(prompt);
  };

  const generateInitialDraft = () => {
    const docTitle =
      tipDocument === "Planificare anuală"
        ? "PLANIFICARE ANUALĂ - ANUL ȘCOLAR 2026-2027"
        : tipDocument === "Planificare pe unitate"
        ? "PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027"
        : "PROIECT DE LECȚIE";

    return `
<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 11pt;">
  <div>
    <p><strong>Unitatea de învățământ:</strong> ${headerData.unitateInvatamant || "[Nume Școală]"}</p>
    <p><strong>Anul școlar:</strong> 2026-2027</p>
    <p><strong>Disciplina:</strong> ${headerData.disciplina || "[Nume Disciplină]"}</p>
    <p><strong>Manual/Suport:</strong> ${headerData.manualSuport || "[Nume Manual]"}</p>
    <p><strong>Clasa:</strong> ${headerData.clasa || "[Clasa]"}</p>
    <p><strong>Nr. de ore pe săptămână:</strong> ${headerData.nrOreSaptamana || `${oreSaptamana} ore/săpt.`}</p>
    <p><strong>Profesor:</strong> ${headerData.profesor || "[Nume Profesor]"}</p>
  </div>
  <div style="text-align: right;">
    <p><strong>Avizat director:</strong> ${headerData.director || "Prof. dr. Popescu Ion"}</p>
    <p><strong>Avizat responsabil catedră:</strong> ${headerData.respCatedra || "Prof. Georgescu Elena"}</p>
    <p><strong>Nr. înregistrare:</strong> ${headerData.nrInregistrare || "......................."}</p>
    <p><strong>Vacanță februarie:</strong> ${headerData.vacantaFebruarie || "Săptămâna 2 (22-28 Februarie)"}</p>
  </div>
</div>

<h2 style="text-align: center; margin: 24px 0 16px 0; font-weight: bold; font-size: 13pt;">${docTitle}</h2>
`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full overflow-hidden transition-all duration-200">
      {/* 1. BARA SUPERIOARĂ (TOP BAR) */}
      <div className="p-3 sm:p-4 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1 bg-[#F8FAF9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveTab("document")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 cursor-pointer ${
                activeTab === "document"
                  ? "bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]"
                  : "text-slate-600 hover:text-[#1E293B]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Document A4</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-[#0D9488] shadow-2xs border border-[#E2E8F0]"
                  : "text-slate-600 hover:text-[#1E293B]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Istoric Modificări ({messages.length})</span>
            </button>
          </div>

          <span className="hidden xl:inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-[#E2E8F0]">
            Format A4 Landscape
          </span>
        </div>

        {/* 3 Butoane secundare (outline) aliniate la dreapta */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Buton 1: Copiază Text */}
          <button
            type="button"
            onClick={handleCopyText}
            id="btn-copy-word"
            className="px-2.5 sm:px-3 py-1.5 border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] bg-white text-xs font-medium text-slate-700 rounded-lg flex items-center space-x-1.5 transition-all duration-200 cursor-pointer"
            title="Copiază documentul și tabelul pentru lipire directă în Word sau Excel"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copiat!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiază Text</span>
              </>
            )}
          </button>

          {/* Buton 2: Printează PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-2.5 sm:px-3 py-1.5 border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] bg-white text-xs font-medium text-slate-700 rounded-lg flex items-center space-x-1.5 transition-all duration-200 cursor-pointer"
            title="Tipărește sau salvează ca PDF în format Landscape"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Printează PDF</span>
          </button>

          {/* Buton 3: Descarcă .DOCX */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="px-2.5 sm:px-3 py-1.5 border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] bg-white text-xs font-medium text-slate-700 rounded-lg flex items-center space-x-1.5 transition-all duration-200 cursor-pointer"
            title="Descarcă documentul compatibil cu Microsoft Word"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Descarcă .DOCX</span>
          </button>
        </div>
      </div>

      {/* 2. ZONA CENTRALĂ DE PREVIZUALIZARE (A4 LANDSCAPE SIMULATION) */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-[#F8FAF9]">
        {activeTab === "document" ? (
          <div
            ref={previewContainerRef}
            className="w-full max-w-5xl mx-auto bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)] min-h-[560px] font-academic text-[#1E293B]"
          >
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    Metodistul elaborează documentul didactic...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Se distribuie conținuturile pe cele 5 module conform calendarului oficial 2026-2027, respectând capul de tabel și antetul permanent.
                  </p>
                </div>
              </div>
            ) : documentContent ? (
              <div id="plan-table-content" className="space-y-4">
                <div className="markdown-body font-academic text-xs sm:text-sm leading-relaxed">
                  <Markdown remarkPlugins={[remarkGfm]}>{documentContent}</Markdown>
                </div>
              </div>
            ) : (
              /* Draft de primire când nu s-a generat încă documentul */
              <div className="space-y-6">
                {/* Antet Oficial pre-completat */}
                <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row justify-between text-xs sm:text-[13px] leading-relaxed">
                  <div className="space-y-1">
                    <p><strong>Unitatea de învățământ:</strong> {headerData.unitateInvatamant || "Colegiul Național „Mihai Viteazul”"}</p>
                    <p><strong>Anul școlar:</strong> 2026-2027</p>
                    <p><strong>Disciplina:</strong> {headerData.disciplina || "Limba și literatura română"}</p>
                    <p><strong>Manual/Suport:</strong> {headerData.manualSuport || "Manual Ed. Art Klett"}</p>
                    <p><strong>Clasa:</strong> {headerData.clasa || "Clasa a VII-a"}</p>
                    <p><strong>Nr. ore pe săptămână:</strong> {headerData.nrOreSaptamana || `${oreSaptamana} ore/săpt.`}</p>
                    <p><strong>Profesor:</strong> {headerData.profesor || "Prof. Ionescu Maria"}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-left sm:text-right space-y-1">
                    <p><strong>Avizat director:</strong> {headerData.director || "Prof. dr. Popescu Ion"}</p>
                    <p><strong>Avizat resp. catedră:</strong> {headerData.respCatedra || "Prof. Georgescu Elena"}</p>
                    <p><strong>Nr. înregistrare:</strong> {headerData.nrInregistrare || "......................."}</p>
                    <p><strong>Vacanță februarie:</strong> {headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Feb)"}</p>
                  </div>
                </div>

                {/* Titlu document */}
                <div className="text-center py-2">
                  <h2 className="text-sm sm:text-base font-bold text-[#1E293B] uppercase tracking-wide">
                    {tipDocument === "Planificare anuală"
                      ? "PLANIFICARE ANUALĂ - ANUL ȘCOLAR 2026-2027"
                      : tipDocument === "Planificare pe unitate"
                      ? "PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027"
                      : "PROIECT DE LECȚIE"}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    Simulare A4 Landscape • Standard Curricular Oficial
                  </p>
                </div>

                {/* Zona de ghidare / acțiune */}
                <div className="p-6 bg-[#F8FAF9] rounded-xl border border-dashed border-[#CBD5E1] text-center font-sans space-y-4">
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] mx-auto flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#1E293B]">
                      Documentul este gata pentru redactare
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Datele tale administrative sunt configurate. Apasă pe butonul de mai jos sau folosește caseta de dialog pentru a genera tabelul didactic complet.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleQuickGenerate}
                      className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-xs font-bold transition-all duration-150 shadow-xs flex items-center space-x-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generează {tipDocument} ({clasa})</span>
                    </button>

                    <button
                      type="button"
                      onClick={onLoadSampleData}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-[#E2E8F0] text-slate-700 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                    >
                      Încarcă Exemplu Demo Complet
                    </button>
                  </div>

                  {(!hasSablon || !hasPrograma || !hasSuport) && (
                    <div className="text-[11px] text-[#D97706] bg-amber-50 p-2.5 rounded-lg border border-amber-200 inline-flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Sfat: Asigură-te că ai atașat Șablonul, Programa și Suportul de curs în panoul din stânga pentru precizie maximă.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tab: Istoric Conversație */
          <div className="w-full max-w-4xl mx-auto space-y-4 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all duration-150 ${
                  m.role === "assistant"
                    ? "bg-white border-[#E2E8F0] text-[#1E293B]"
                    : "bg-[#0D9488] text-white border-[#0D9488] ml-auto max-w-lg"
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-inherit opacity-80 text-[11px]">
                  <span className="font-semibold">
                    {m.role === "assistant" ? "Asistent Metodist" : "Profesor"}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* 3. BARA INFERIOARĂ (CHAT CONTEXTUAL FIXAT) */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E2E8F0] space-y-2">
        <form onSubmit={handleChatSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Cere ajustări rapide (ex: „Adaugă 2 ore de recapitulare în Modulul 2”, „Modifică cerința O2”)...`}
            className="flex-1 px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="Trimite solicitarea metodică"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Trimite</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-slate-400 hidden sm:inline">Sugestii rapide:</span>
            <button
              type="button"
              onClick={() => onSendMessage("Adaugă 2 ore de recapitulare și evaluare sumativă la finalul Modulului 2.")}
              className="text-[#0D9488] hover:underline cursor-pointer truncate"
            >
              + Recapitulare M2
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onSendMessage("Evidențiază săptămâna „Școala altfel” și „Săptămâna verde” cu ore fără predare standard.")}
              className="text-[#0D9488] hover:underline cursor-pointer truncate"
            >
              Săptămâni Speciale
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleQuickGenerate}
              className="text-[#0D9488] hover:underline cursor-pointer font-semibold truncate"
            >
              Regenerează {tipDocument}
            </button>
          </div>

          <span className="text-[10px] text-slate-400 shrink-0">
            {headerData.disciplina || "EduMetodist"} • {headerData.clasa}
          </span>
        </div>
      </div>
    </div>
  );
};
