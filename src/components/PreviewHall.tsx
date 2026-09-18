import React, { useState, useRef } from "react";
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
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  Facebook,
  Youtube,
} from "lucide-react";
import { ChatMessage, DocumentType, TechnicalHeaderData, formatClasaHeader } from "../types";
import { copyTableToClipboard, exportWordDocument } from "../utils/fileHelpers";

interface PreviewHallProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  clasa: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  headerData: TechnicalHeaderData;
  onGenerate: () => void;
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
  onGenerate,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Check for multi-part modular annual plan (M1-M2 and M3-M5)
  const assistantMessagesWithTables = messages.filter(
    (m) => m.role === "assistant" && m.content.includes("|") && m.content.includes("---")
  );

  let combinedDocument = "";
  if (assistantMessagesWithTables.length > 1) {
    const m1m2Msg = assistantMessagesWithTables.find((m) =>
      /modul(ul)?\s*1/i.test(m.content) && /modul(ul)?\s*2/i.test(m.content)
    );
    const m3m5Msg = assistantMessagesWithTables.find((m) =>
      m !== m1m2Msg &&
      (/modul(ul)?\s*3/i.test(m.content) ||
        /modul(ul)?\s*4/i.test(m.content) ||
        /modul(ul)?\s*5/i.test(m.content))
    );

    if (m1m2Msg && m3m5Msg) {
      const cleanM1M2 = m1m2Msg.content
        .replace(/💡\s*Am generat Modulele 1 și 2[\s\S]*?(?:anuală\.?|$)/gi, "")
        .trim();
      combinedDocument = `${cleanM1M2}\n\n${m3m5Msg.content}`;
    }
  }

  // Find latest message with document/table content
  const lastAssistantMessage = [...messages].reverse().find(
    (m) => m.role === "assistant" && m.content.includes("|") && m.content.includes("---")
  );

  // Or latest assistant message
  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  const documentContent =
    combinedDocument ||
    (lastAssistantMessage
      ? lastAssistantMessage.content
      : latestAssistantMessage && latestAssistantMessage.content.includes("|")
      ? latestAssistantMessage.content
      : "");

  // Check if we should prompt the user to continue with M3-M5
  const showContinueM3M5 = Boolean(
    !combinedDocument &&
    lastAssistantMessage &&
    /modul(ul)?\s*1/i.test(lastAssistantMessage.content) &&
    /modul(ul)?\s*2/i.test(lastAssistantMessage.content) &&
    !/modul(ul)?\s*5/i.test(lastAssistantMessage.content) &&
    (/continu[aă]\s+cu\s+m3-m5/i.test(lastAssistantMessage.content) ||
      lastAssistantMessage.content.includes("💡 Am generat Modulele 1 și 2"))
  );

  const handleCopyText = () => {
    const contentToCopy = documentContent || generateInitialDraft();
    const tableEl = document.getElementById("plan-table-content");
    copyTableToClipboard(contentToCopy, tableEl?.innerHTML);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintPdf = () => {
    // Uses the strict print CSS directly, bypassing iframe window.open restrictions
    window.print();
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
  };

  const generateInitialDraft = () => {
    const docTitle =
      tipDocument === "Planificare anuală"
        ? "PLANIFICARE ANUALĂ - ANUL ȘCOLAR 2026-2027"
        : tipDocument === "Planificare pe unitate"
        ? "PLANIFICARE PE UNITĂȚI DE ÎNVĂȚARE - ANUL ȘCOLAR 2026-2027"
        : tipDocument === "Planificare integrată (Primar)"
        ? "PLANIFICARE INTEGRATĂ (CICLUL PRIMAR) - ANUL ȘCOLAR 2026-2027"
        : "PROIECT DE LECȚIE";

    const clasaFormatted = formatClasaHeader(headerData.clasa || clasa, headerData);

    return `
<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 11pt;">
  <div>
    <p><strong>Unitatea de învățământ:</strong> ${headerData.unitateInvatamant || "[Nume Școală]"}</p>
    <p><strong>Anul școlar:</strong> 2026-2027</p>
    <p><strong>Disciplina:</strong> ${headerData.disciplina || "[Nume Disciplină]"}</p>
    <p><strong>Manual/Suport:</strong> ${headerData.manualSuport || "[Nume Manual]"}</p>
    <p><strong>Clasa:</strong> ${clasaFormatted || "[Clasa]"}</p>
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
    <section
      id="section-document-generat"
      className="card-lift bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden"
    >
      {/* 1. BARA SUPERIOARĂ CURĂȚATĂ - DOAR CELE 3 BUTOANE STRICT NECESARE */}
      <div
        id="document-actions-bar"
        className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-md border border-[#CCFBF1]">
                Pasul 4
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Documentul Didactic Generat
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Previzualizare A4 Landscape • Format oficial conform normelor MEC • autor prof. Adrian Podar
            </p>
          </div>
        </div>

        {/* CELE 3 BUTOANE STRICT NECESARE (Copiază Text, Printează PDF, Descarcă DOCX) */}
        <div
          className="self-start sm:self-auto items-center"
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          {/* Buton 1: Copiază Text */}
          <button
            type="button"
            onClick={handleCopyText}
            id="btn-copy-word"
            className="btn-interaction px-3.5 py-2 border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] bg-white text-xs font-semibold text-slate-700 rounded-xl flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            title="Copiază documentul și tabelul pentru lipire directă în Word sau Excel"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiat!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiază Text</span>
              </>
            )}
          </button>

          {/* Buton 2: Printează PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            id="btn-print-pdf"
            className="btn-interaction px-3.5 py-2 border border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488] bg-white text-xs font-semibold text-slate-700 rounded-xl flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            title="Tipărește direct sau salvează ca PDF în format Landscape"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Printează PDF</span>
          </button>

          {/* Buton 3: Descarcă .DOCX */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            id="btn-download-docx"
            className="btn-interaction px-3.5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Descarcă documentul compatibil cu Microsoft Word"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Descarcă .DOCX</span>
          </button>
        </div>
      </div>

      {/* 2. ZONA CENTRALĂ DE PREVIZUALIZARE (A4 LANDSCAPE SIMULATION) */}
      <div id="document-print-zone" className="bg-[#F8FAF9] overflow-x-auto">
        {!documentContent && !isLoading ? (
          /* Empty state discret cu padding minim; ascunde complet zona albă mare când nu există document */
          <div className="py-6 px-4 text-center">
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Aștept configurarea... Apasă pe generare pentru a vizualiza documentul.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-7">
            <div
              ref={previewContainerRef}
              className="w-full max-w-5xl mx-auto bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-10 shadow-[0_1px_4px_rgba(0,0,0,0.03)] min-h-[520px] font-academic text-[#1E293B]"
            >
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center animate-appear-smooth">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488]">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#1E293B]">
                      Metodistul elaborează documentul didactic complet...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Se distribuie conținuturile pe toate cele 5 module conform calendarului oficial 2026-2027, calculând riguros orele și generând capul de tabel normat.
                    </p>
                  </div>
                </div>
              ) : (
                <div id="plan-table-content" className="space-y-4 animate-appear-smooth">
                  <div className="markdown-body font-academic text-xs sm:text-sm leading-relaxed overflow-x-auto">
                    <Markdown remarkPlugins={[remarkGfm]}>{documentContent}</Markdown>
                  </div>

                  {/* Buton acțiune modulară pentru finalizarea planificării cu M3-M5 dacă a fost generată parțial */}
                  {showContinueM3M5 && (
                    <div className="no-print my-6 p-4 bg-[#F0FDFA] border border-[#0D9488]/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Modulele 1 și 2 au fost generate cu succes.
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Apasă pentru a asambla restul modulelor (3, 4 și 5) într-un document unitar.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSendMessage("Continuă cu M3-M5")}
                        disabled={isLoading}
                        className="btn-interaction px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
                      >
                        <span>Continuă cu M3-M5</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Caseta de descărcare la final de document */}
                  <div className="no-print mt-8 pt-6 border-t border-[#E2E8F0] bg-[#F8FAF9] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>Documentul este redactat și pregătit pentru descărcare</span>
                          <span className="text-[10px] text-[#0D9488] font-semibold bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#CCFBF1]">
                            autor prof. Adrian Podar
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Format A4 Landscape cu margini standard conform normelor metodice
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-full sm:w-auto items-center"
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      <button
                        type="button"
                        onClick={handleDownloadDocx}
                        className="btn-interaction flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 border border-[#CBD5E1] hover:border-[#0D9488] text-[#1E293B] text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#0D9488]" />
                        <span>Descarcă .DOCX</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPdf}
                        className="btn-interaction flex-1 sm:flex-none px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Printează PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. BARA INFERIOARĂ PENTRU AJUSTARE METODICĂ DISCRETĂ */}
      <div id="chat-modificari" className="no-print p-3 sm:p-4 bg-white border-t border-[#E2E8F0]">
        <form onSubmit={handleChatSubmit} className="flex items-center space-x-2.5 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ai nevoie de ajustări? (ex: «Adaugă 2 ore de recapitulare în Modulul 2», «Schimbă tema din S14»...)"
            className="flex-1 px-4 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="btn-interaction px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>Trimite</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="max-w-4xl mx-auto mt-2 px-1 text-[11px] text-slate-400 text-center sm:text-left">
          <span>Ajustează promptul sau solicită modificări specifice pentru actualizarea automată a documentului didactic.</span>
        </div>
      </div>
    </section>
  );
};
