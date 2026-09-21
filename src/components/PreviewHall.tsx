import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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
  Trash2,
  RefreshCw,
  Paperclip,
  X,
  Image as ImageIcon,
  FileCode,
  RectangleVertical,
  RectangleHorizontal,
} from "lucide-react";
import { ChatMessage, DocumentType, TechnicalHeaderData, FilePayload, PageOrientation, formatClasaHeader } from "../types";
import { copyTableToClipboard, exportWordDocument, readFileAsBase64, extractTextSnippet } from "../utils/fileHelpers";
import { sanitizeHtmlTags } from "../utils/sanitizeText";

interface PreviewHallProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachedFiles?: FilePayload[]) => void;
  onClearDocument?: () => void;
  onRegenerate?: (customPrompt?: string, attachedFiles?: FilePayload[]) => void;
  isLoading: boolean;
  clasa: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  headerData: TechnicalHeaderData;
  onOrientationChange?: (orientation: PageOrientation) => void;
  onGenerate: () => void;
}

export const PreviewHall: React.FC<PreviewHallProps> = ({
  messages,
  onSendMessage,
  onClearDocument,
  onRegenerate,
  isLoading,
  clasa,
  oreSaptamana,
  tipDocument,
  headerData,
  onOrientationChange,
  onGenerate,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [attachedChatFiles, setAttachedChatFiles] = useState<FilePayload[]>([]);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Orientare pagină: implicit "portrait" pentru Proiect de lecție / Schiță de lecție, "landscape" pentru planificări
  const isLessonPlan =
    tipDocument === "Schiță de lecție" ||
    tipDocument.toLowerCase().includes("lecție") ||
    tipDocument.toLowerCase().includes("proiect");

  const defaultOrientation: PageOrientation = isLessonPlan ? "portrait" : "landscape";

  const [orientation, setOrientation] = useState<PageOrientation>(
    headerData.orientare || defaultOrientation
  );

  const handleOrientationChange = (newOrientation: PageOrientation) => {
    setOrientation(newOrientation);
    onOrientationChange?.(newOrientation);
  };

  // Sincronizare automată dacă utilizatorul selectează un tip de document diferit
  useEffect(() => {
    if (headerData.orientare) {
      setOrientation(headerData.orientare);
    } else {
      setOrientation(isLessonPlan ? "portrait" : "landscape");
    }
  }, [tipDocument, headerData.orientare, isLessonPlan]);

  // Aplicare regulă CSS la nivel de pagină pentru print/PDF în funcție de orientare
  useEffect(() => {
    let styleEl = document.getElementById("dynamic-print-orientation");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-print-orientation";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@media print { @page { size: A4 ${orientation} !important; margin: ${
      orientation === "portrait" ? "12mm 15mm 12mm 15mm" : "10mm 12mm 10mm 12mm"
    } !important; } }`;
  }, [orientation]);

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
      : latestAssistantMessage
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
    const docEl = document.getElementById("plan-table-content");
    let cleanHtml = "";
    if (docEl) {
      const clone = docEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print, button, input").forEach((el) => el.remove());
      cleanHtml = clone.innerHTML;
    }
    copyTableToClipboard(contentToCopy, cleanHtml);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintPdf = () => {
    let styleEl = document.getElementById("dynamic-print-orientation");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-print-orientation";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@media print { @page { size: A4 ${orientation} !important; margin: ${
      orientation === "portrait" ? "12mm 15mm 12mm 15mm" : "10mm 12mm 10mm 12mm"
    } !important; } }`;
    window.print();
  };

  const handleDownloadDocx = () => {
    const orientSuf = orientation === "landscape" ? "Landscape" : "Portret";
    const filename = `${tipDocument.replace(/\s+/g, "_")}_${(headerData.disciplina || "disciplina").replace(/\s+/g, "_")}_${(headerData.clasa || "clasa").replace(/\s+/g, "_")}_${orientSuf}.doc`;
    const docEl = document.getElementById("plan-table-content");
    let contentHtml = "";
    if (docEl) {
      const clone = docEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print, button, input").forEach((el) => el.remove());
      contentHtml = clone.innerHTML;
    }
    exportWordDocument(
      filename,
      contentHtml || documentContent || generateInitialDraft(),
      `${tipDocument} - 2026-2027`,
      orientation
    );
  };

  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const newPayloads: FilePayload[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      try {
        const base64 = await readFileAsBase64(file);
        const textSnippet = await extractTextSnippet(file);
        newPayloads.push({
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          data: base64,
          textSnippet,
        });
      } catch (err) {
        console.error("Eroare la citirea fișierului din chat:", file.name, err);
      }
    }

    if (newPayloads.length > 0) {
      setAttachedChatFiles((prev) => [...prev, ...newPayloads]);
    }
    // Resetează inputul pentru a permite reîncărcarea aceluiași fișier dacă e nevoie
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = "";
    }
  };

  const removeAttachedChatFile = (index: number) => {
    setAttachedChatFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf") || mimeType.includes("pdf")) {
      return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    if (lower.endsWith(".doc") || lower.endsWith(".docx") || mimeType.includes("word")) {
      return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.includes("image")) {
      return <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    const activeClasa = clasa || headerData.clasa || "clasa specificată";
    const activeDisciplina = headerData.disciplina || "disciplina specificată";

    let promptText = "";
    if (inputText.trim()) {
      promptText = `Te rog să regenerezi complet documentul didactic (${tipDocument}) pentru ${activeClasa}, ${activeDisciplina}, aplicând următoarele cerințe metodice și ajustări din chat: "${inputText.trim()}". Asigură-te că tabelul conține toate cele 5 module și 7 coloane oficiale.`;
    } else {
      promptText = `Te rog să regenerezi integral documentul didactic (${tipDocument}) pentru ${activeClasa}, ${activeDisciplina}, conform tuturor cerințelor și specificațiilor din conversație. Este obligatoriu să generezi atât antetul tehnic oficial complet, cât și întregul tabel curricular pentru toate cele 5 module (S1-S36).`;
    }

    if (onRegenerate) {
      onRegenerate(promptText, attachedChatFiles);
    } else {
      onSendMessage(promptText, attachedChatFiles);
    }

    setInputText("");
    setAttachedChatFiles([]);
  };

  const handleClearGenerated = () => {
    if (onClearDocument) {
      onClearDocument();
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachedChatFiles.length === 0) || isLoading) return;

    const messageToSend =
      inputText.trim() ||
      (attachedChatFiles.length > 0
        ? `Atașez ${attachedChatFiles.length} ${attachedChatFiles.length === 1 ? "fișier" : "fișiere"} didactic(e). Te rog să le analizezi și să actualizezi/regenerezi documentul corespunzător.`
        : "");

    onSendMessage(messageToSend, attachedChatFiles);
    setInputText("");
    setAttachedChatFiles([]);
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
      {/* 1. BARA SUPERIOARĂ - BUTOANE ACȚIUNE + SELECTOR ORIENTARE (PORTRET / LANDSCAPE) */}
      <div
        id="document-actions-bar"
        className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5"
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
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Format A4 {orientation === "landscape" ? "Landscape (Vedere)" : "Portret (Vertical)"}</span>
              <span>•</span>
              <span>Norme metodice 2026-2027</span>
              {isLessonPlan && (
                <span className="text-[10px] text-[#0D9488] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#CCFBF1] font-medium">
                  Recomandat Portret pentru proiecte de lecție
                </span>
              )}
              {!isLessonPlan && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                  Recomandat Landscape pentru planificări
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CONTROALE ACȚIUNE: COMUTATOR ORIENTARE + BUTOANELE STRICT NECESARE */}
        <div className="self-start lg:self-auto flex items-center flex-wrap gap-2.5">
          {/* Buton comutator Orientare A4 (Portret / Landscape) */}
          <div
            id="orientation-toggle-group"
            className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200"
            title="Setează orientarea paginii A4: Landscape (tabele late) sau Portret (proiecte didactice)"
          >
            <button
              type="button"
              onClick={() => handleOrientationChange("portrait")}
              id="btn-orientare-portrait"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                orientation === "portrait"
                  ? "bg-white text-[#0D9488] shadow-2xs font-bold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RectangleVertical className="w-3.5 h-3.5" />
              <span>Portret</span>
            </button>
            <button
              type="button"
              onClick={() => handleOrientationChange("landscape")}
              id="btn-orientare-landscape"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                orientation === "landscape"
                  ? "bg-white text-[#0D9488] shadow-2xs font-bold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              <span>Landscape</span>
            </button>
          </div>

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
            title={`Tipărește direct sau salvează ca PDF în format ${orientation === "landscape" ? "Landscape" : "Portret"}`}
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
            title={`Descarcă documentul compatibil cu Microsoft Word în format ${orientation === "landscape" ? "Landscape" : "Portret"}`}
          >
            <Download className="w-4 h-4 text-white" />
            <span>Descarcă .DOCX</span>
          </button>
        </div>
      </div>

      {/* 2. ZONA CENTRALĂ DE PREVIZUALIZARE (SIMULARE A4 PORTRET / LANDSCAPE) */}
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
              className={`w-full mx-auto bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-10 shadow-[0_1px_4px_rgba(0,0,0,0.03)] min-h-[520px] font-academic text-[#1E293B] ${
                orientation === "portrait" ? "max-w-4xl" : "max-w-6xl"
              }`}
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
                <div className="space-y-4 animate-appear-smooth">
                  {/* Containerul tabelului/documentului delimitat strict cu id="plan-table-content" */}
                  <div
                    id="plan-table-content"
                    className={`markdown-body font-academic text-xs sm:text-sm leading-relaxed overflow-x-auto ${
                      orientation === "portrait"
                        ? "max-w-[780px] mx-auto p-4 sm:p-6 bg-white border border-slate-200/70 rounded-xl"
                        : "w-full"
                    }`}
                  >
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {sanitizeHtmlTags(documentContent)}
                    </Markdown>
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

                  {/* Caseta de descărcare la final de document - STRICT EXTERIORĂ față de #plan-table-content */}
                  <div className="no-print mt-8 pt-6 border-t border-[#E2E8F0] bg-[#F8FAF9] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 rounded-b-xl flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            Documentul este redactat și pregătit pentru descărcare
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Format A4 {orientation === "landscape" ? "Landscape (Vedere)" : "Portret (Vertical)"} cu margini standard conform normelor metodice
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

                    {/* ZONA DE SUB DESCARCĂ ȘI PRINTEAZĂ: BUTON CURĂȚARE ȘI BUTON REGENERARE */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span>Documentul nu este cel dorit sau vrei să generezi unul nou?</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
                        {/* Buton Regenerare conținut */}
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          disabled={isLoading}
                          id="btn-regenerate-doc"
                          title="Regenerează conținutul documentului didactic"
                          className="btn-interaction flex-1 sm:flex-none px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isLoading ? "animate-spin" : ""}`} />
                          <span>Regenerează conținutul</span>
                        </button>

                        {/* Buton Curățare document generat */}
                        <button
                          type="button"
                          onClick={handleClearGenerated}
                          id="btn-clear-generated-document"
                          title="Curăță ceea ce a fost generat pentru a putea începe un document nou"
                          className="btn-interaction flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Curăță documentul generat</span>
                        </button>
                      </div>
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
        {/* Previzualizare fișiere atașate în chat */}
        {attachedChatFiles.length > 0 && (
          <div className="max-w-4xl mx-auto mb-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-[#0D9488]" />
              Fișiere atașate pentru chat / regenerare ({attachedChatFiles.length}):
            </span>
            {attachedChatFiles.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-xs font-medium rounded-lg shadow-2xs"
              >
                {getFileIcon(f.name, f.type)}
                <span className="max-w-[140px] sm:max-w-[220px] truncate" title={f.name}>
                  {f.name}
                </span>
                <span className="text-[10px] text-slate-400">({formatFileSize(f.size)})</span>
                <button
                  type="button"
                  onClick={() => removeAttachedChatFile(idx)}
                  className="hover:text-rose-600 p-0.5 rounded-full cursor-pointer ml-0.5"
                  title="Elimină fișierul"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={handleChatSubmit} className="flex items-center space-x-2 max-w-4xl mx-auto">
          {/* Buton Atașare Fișiere în Chat (PDF, DOCX, Imagini) */}
          <button
            type="button"
            onClick={() => chatFileInputRef.current?.click()}
            disabled={isLoading}
            id="btn-attach-chat-files"
            title="Atașează fișiere didactice (PDF, DOCX/Word, Imagini) pentru instrucțiuni sau ajustări"
            className="btn-interaction p-2.5 bg-[#F8FAF9] hover:bg-[#F0FDFA] text-slate-600 hover:text-[#0D9488] border border-[#E2E8F0] hover:border-[#0D9488] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Paperclip className="w-4 h-4 text-[#0D9488]" />
          </button>
          <input
            ref={chatFileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
            onChange={handleChatFileChange}
            className="hidden"
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ai cerințe de modificare sau regenerare? (ex: «Adaugă 2 ore de recapitulare în Modulul 2», «Actualizează conform fișierului atașat»...)"
            className="flex-1 px-4 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && attachedChatFiles.length === 0) || isLoading}
            className="btn-interaction px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>Trimite</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="max-w-4xl mx-auto mt-2 px-1 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1">
          <span>Include cerințele sau atașează documente PDF/Word/imagini, apoi apasă «Trimite» sau «Regenerează conținutul».</span>
          <span className="text-teal-600 font-medium">EduMetodist România</span>
        </div>
      </div>
    </section>
  );
};
