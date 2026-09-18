import React, { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  BookOpen,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileCode,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { FilePayload } from "../types";
import { readFileAsBase64, extractTextSnippet } from "../utils/fileHelpers";
import { STANDARD_TEMPLATES } from "../data/curriculumData";

interface FileUploadSectionProps {
  sablonFiles: FilePayload[];
  setSablonFiles: React.Dispatch<React.SetStateAction<FilePayload[]>>;
  sablonText: string;
  setSablonText: (t: string) => void;

  programaFiles: FilePayload[];
  setProgramaFiles: React.Dispatch<React.SetStateAction<FilePayload[]>>;
  programaText: string;
  setProgramaText: (t: string) => void;

  suportFiles: FilePayload[];
  setSuportFiles: React.Dispatch<React.SetStateAction<FilePayload[]>>;
  suportText: string;
  setSuportText: (t: string) => void;

  selectedTemplateId: string | null;
  onSelectStandardTemplate: (id: string) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  sablonFiles,
  setSablonFiles,
  sablonText,
  setSablonText,
  programaFiles,
  setProgramaFiles,
  programaText,
  setProgramaText,
  suportFiles,
  setSuportFiles,
  suportText,
  setSuportText,
  selectedTemplateId,
  onSelectStandardTemplate,
}) => {
  const sablonInputRef = useRef<HTMLInputElement>(null);
  const programaInputRef = useRef<HTMLInputElement>(null);
  const suportInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingSablon, setIsDraggingSablon] = useState(false);
  const [isDraggingPrograma, setIsDraggingPrograma] = useState(false);
  const [isDraggingSuport, setIsDraggingSuport] = useState(false);

  const [showProgramaSnippet, setShowProgramaSnippet] = useState(false);
  const [showSuportSnippet, setShowSuportSnippet] = useState(false);

  const handleFilesUpload = async (
    filesList: FileList | null,
    category: "sablon" | "programa" | "suport"
  ) => {
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
        console.error("Eroare la citirea fișierului:", file.name, err);
      }
    }

    if (newPayloads.length === 0) return;

    if (category === "sablon") {
      setSablonFiles((prev) => [...prev, ...newPayloads]);
    } else if (category === "programa") {
      setProgramaFiles((prev) => [...prev, ...newPayloads]);
    } else if (category === "suport") {
      setSuportFiles((prev) => [...prev, ...newPayloads]);
    }
  };

  const removeFile = (category: "sablon" | "programa" | "suport", index: number) => {
    if (category === "sablon") {
      setSablonFiles((prev) => prev.filter((_, idx) => idx !== index));
    } else if (category === "programa") {
      setProgramaFiles((prev) => prev.filter((_, idx) => idx !== index));
    } else if (category === "suport") {
      setSuportFiles((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf") || mimeType.includes("pdf")) {
      return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (lower.endsWith(".doc") || lower.endsWith(".docx") || mimeType.includes("word")) {
      return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.includes("image")) {
      return <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />;
  };

  return (
    <section
      id="section-fisiere"
      className="card-lift bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6"
    >
      {/* Header-ul Secțiunii 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-md border border-[#CCFBF1]">
                Pasul 2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Încărcare Fișiere Didactice (Multiple Fișiere)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Poți încărca oricâte documente simultan (PDF, Word DOCX/DOC, imagini). Nu este nevoie de îmbinare (merge) manuală!
            </p>
          </div>
        </div>
      </div>

      {/* Grid 3 Coloane pentru cele 3 categorii de fișiere */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CATEGORIA 1: ȘABLON DE PLANIFICARE */}
        <div className="bg-[#F8FAF9] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                  1. Șablon de Lucru
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                {sablonFiles.length > 0 || sablonText ? "Atașat" : "Opțional"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Capul de tabel dorit. Poți alege direct modelul oficial sau încărca fișiere proprii.
            </p>

            {/* Buton Rapid Șablon Standard Oficial */}
            <button
              type="button"
              onClick={() => onSelectStandardTemplate("sablon-anual-oficial")}
              className="btn-interaction mt-2.5 w-full py-2 px-3 bg-white hover:bg-teal-50/50 border border-[#0D9488]/40 hover:border-[#0D9488] rounded-lg text-xs font-semibold text-[#0D9488] flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atașează Șablon Standard MEC (1 click)</span>
            </button>

            {/* Zonă Dropzone Șablon */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSablon(true);
              }}
              onDragLeave={() => setIsDraggingSablon(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSablon(false);
                handleFilesUpload(e.dataTransfer.files, "sablon");
              }}
              onClick={() => sablonInputRef.current?.click()}
              className={`mt-3 p-3.5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-150 ${
                isDraggingSablon
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : "border-[#CBD5E1] hover:border-[#0D9488] hover:bg-white bg-white/70"
              }`}
            >
              <input
                ref={sablonInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                onChange={(e) => handleFilesUpload(e.target.files, "sablon")}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-700">
                Apasă sau trage fișiere aici
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                PDF, Word DOCX, Imagini (multiple)
              </div>
            </div>

            {/* Listă fișiere atașate */}
            {sablonFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Fișiere atașate ({sablonFiles.length}):</span>
                </div>
                {sablonFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {getFileIcon(file.name, file.type)}
                      <span className="truncate font-medium text-slate-700" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile("sablon", idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CATEGORIA 2: PROGRAMA ȘCOLARĂ */}
        <div className="bg-[#F8FAF9] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                  2. Programa Școlară
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                {programaFiles.length > 0 || programaText ? "Atașat" : "Recomandat"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Pentru preluarea exactă a competențelor generale și specifice corespunzătoare clasei.
            </p>

            {/* Zonă Dropzone Programa */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPrograma(true);
              }}
              onDragLeave={() => setIsDraggingPrograma(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPrograma(false);
                handleFilesUpload(e.dataTransfer.files, "programa");
              }}
              onClick={() => programaInputRef.current?.click()}
              className={`mt-3 p-3.5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-150 ${
                isDraggingPrograma
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : "border-[#CBD5E1] hover:border-[#0D9488] hover:bg-white bg-white/70"
              }`}
            >
              <input
                ref={programaInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                onChange={(e) => handleFilesUpload(e.target.files, "programa")}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-700">
                Apasă sau trage fișiere aici
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                PDF, Word DOCX, Imagini (multiple)
              </div>
            </div>

            {/* Listă fișiere atașate */}
            {programaFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Fișiere atașate ({programaFiles.length}):</span>
                </div>
                {programaFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {getFileIcon(file.name, file.type)}
                      <span className="truncate font-medium text-slate-700" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile("programa", idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Opțiune text snippet */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowProgramaSnippet(!showProgramaSnippet)}
                className="text-[11px] text-[#0D9488] hover:text-[#0F766E] font-medium flex items-center gap-1"
              >
                <span>{showProgramaSnippet ? "Ascunde text manual" : "+ Introdu sau lipește text din programă"}</span>
              </button>
              {showProgramaSnippet && (
                <textarea
                  value={programaText}
                  onChange={(e) => setProgramaText(e.target.value)}
                  placeholder="Lipește textul competențelor sau note suplimentare..."
                  rows={3}
                  className="mt-2 w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B]"
                />
              )}
            </div>
          </div>
        </div>

        {/* CATEGORIA 3: MANUAL / SUPORT DE CURS */}
        <div className="bg-[#F8FAF9] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                  3. Suport / Manual
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                {suportFiles.length > 0 || suportText ? "Atașat" : "Recomandat"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Pentru preluarea conținuturilor tematice, capitolelor și a detaliilor reale de curs.
            </p>

            {/* Zonă Dropzone Suport */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSuport(true);
              }}
              onDragLeave={() => setIsDraggingSuport(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSuport(false);
                handleFilesUpload(e.dataTransfer.files, "suport");
              }}
              onClick={() => suportInputRef.current?.click()}
              className={`mt-3 p-3.5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-150 ${
                isDraggingSuport
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : "border-[#CBD5E1] hover:border-[#0D9488] hover:bg-white bg-white/70"
              }`}
            >
              <input
                ref={suportInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                onChange={(e) => handleFilesUpload(e.target.files, "suport")}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-700">
                Apasă sau trage fișiere aici
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                PDF, Word DOCX, Imagini (multiple)
              </div>
            </div>

            {/* Listă fișiere atașate */}
            {suportFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Fișiere atașate ({suportFiles.length}):</span>
                </div>
                {suportFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {getFileIcon(file.name, file.type)}
                      <span className="truncate font-medium text-slate-700" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile("suport", idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Opțiune text snippet */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowSuportSnippet(!showSuportSnippet)}
                className="text-[11px] text-[#0D9488] hover:text-[#0F766E] font-medium flex items-center gap-1"
              >
                <span>{showSuportSnippet ? "Ascunde text manual" : "+ Introdu sau lipește cuprins / capitole"}</span>
              </button>
              {showSuportSnippet && (
                <textarea
                  value={suportText}
                  onChange={(e) => setSuportText(e.target.value)}
                  placeholder="Lipește titlurile unităților sau cuprinsul manualului..."
                  rows={3}
                  className="mt-2 w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
