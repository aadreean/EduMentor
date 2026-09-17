import React, { useState, useRef } from "react";
import {
  School,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { DocumentType, FilePayload, TechnicalHeaderData } from "../types";
import { STANDARD_TEMPLATES } from "../data/curriculumData";
import { readFileAsBase64, extractTextSnippet } from "../utils/fileHelpers";

interface ConfigurationWorkshopProps {
  clasa: string;
  setClasa: (c: string) => void;
  oreSaptamana: number;
  setOreSaptamana: (h: number) => void;
  tipDocument: DocumentType;
  setTipDocument: (t: DocumentType) => void;
  disciplina: string;
  setDisciplina: (d: string) => void;

  headerData: TechnicalHeaderData;
  setHeaderData: React.Dispatch<React.SetStateAction<TechnicalHeaderData>>;

  programaFile: FilePayload | null;
  setProgramaFile: (f: FilePayload | null) => void;
  programaText: string;
  setProgramaText: (t: string) => void;

  suportFile: FilePayload | null;
  setSuportFile: (f: FilePayload | null) => void;
  suportText: string;
  setSuportText: (t: string) => void;

  sablonFile: FilePayload | null;
  setSablonFile: (f: FilePayload | null) => void;
  sablonText: string;
  setSablonText: (t: string) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

export const ConfigurationWorkshop: React.FC<ConfigurationWorkshopProps> = ({
  clasa,
  setClasa,
  oreSaptamana,
  setOreSaptamana,
  tipDocument,
  setTipDocument,
  disciplina,
  setDisciplina,

  headerData,
  setHeaderData,

  programaFile,
  setProgramaFile,
  programaText,
  setProgramaText,

  suportFile,
  setSuportFile,
  suportText,
  setSuportText,

  sablonFile,
  setSablonFile,
  sablonText,
  setSablonText,
  selectedTemplateId,
  setSelectedTemplateId,
}) => {
  const [showAdvancedHeader, setShowAdvancedHeader] = useState(false);

  // File Inputs references
  const sablonInputRef = useRef<HTMLInputElement>(null);
  const programaInputRef = useRef<HTMLInputElement>(null);
  const suportInputRef = useRef<HTMLInputElement>(null);

  // Drag states
  const [isDraggingSablon, setIsDraggingSablon] = useState(false);
  const [isDraggingPrograma, setIsDraggingPrograma] = useState(false);
  const [isDraggingSuport, setIsDraggingSuport] = useState(false);

  // Verification states
  const hasSablon = Boolean(sablonFile || (sablonText && sablonText.trim().length > 0));
  const hasPrograma = Boolean(programaFile || (programaText && programaText.trim().length > 0));
  const hasSuport = Boolean(suportFile || (suportText && suportText.trim().length > 0));

  const handleHeaderFieldChange = (field: keyof TechnicalHeaderData, value: string) => {
    setHeaderData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "disciplina") {
        setDisciplina(value);
      }
      if (field === "clasa") {
        setClasa(value);
      }
      return updated;
    });
  };

  const handleFileUpload = async (
    file: File,
    type: "sablon" | "programa" | "suport"
  ) => {
    try {
      const base64 = await readFileAsBase64(file);
      const textSnippet = await extractTextSnippet(file);

      const payload: FilePayload = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
        textSnippet,
      };

      if (type === "sablon") {
        setSablonFile(payload);
        if (textSnippet) setSablonText(textSnippet);
        setSelectedTemplateId(null);
      } else if (type === "programa") {
        setProgramaFile(payload);
        if (textSnippet) setProgramaText(textSnippet);
      } else if (type === "suport") {
        setSuportFile(payload);
        if (textSnippet) setSuportText(textSnippet);
      }
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const handleSelectPredefinedTemplate = (templateId: string) => {
    const tmpl = STANDARD_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplateId(tmpl.id);
    setSablonFile(null);
    setSablonText(tmpl.content);
    setTipDocument(tmpl.category);
  };

  return (
    <div className="space-y-4">
      {/* CARD 1: Coordonate Tehnice */}
      <div className="card-lift bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488]">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                Cardul 1: Coordonate Tehnice
              </h2>
              <p className="text-[11px] text-slate-500">
                Antet oficial permanent memorat pe parcursul sesiunii
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
            Validat
          </span>
        </div>

        <div className="space-y-3">
          {/* Unitatea de învățământ */}
          <div>
            <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
              Unitatea de învățământ (Școala)
            </label>
            <input
              type="text"
              value={headerData.unitateInvatamant}
              onChange={(e) => handleHeaderFieldChange("unitateInvatamant", e.target.value)}
              placeholder="ex: Colegiul Național „Mihai Viteazul”"
              className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
            />
          </div>

          {/* Grid 2 coloane: Disciplina & Manual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Disciplina
              </label>
              <input
                type="text"
                value={headerData.disciplina}
                onChange={(e) => handleHeaderFieldChange("disciplina", e.target.value)}
                placeholder="ex: Limba și literatura română"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Manual / Suport de curs
              </label>
              <input
                type="text"
                value={headerData.manualSuport}
                onChange={(e) => handleHeaderFieldChange("manualSuport", e.target.value)}
                placeholder="ex: Manual Ed. Art Klett"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>
          </div>

          {/* Grid 2 coloane: Clasa & Profesor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Clasa
              </label>
              <input
                type="text"
                value={headerData.clasa}
                onChange={(e) => handleHeaderFieldChange("clasa", e.target.value)}
                placeholder="ex: Clasa a VII-a"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Profesor
              </label>
              <input
                type="text"
                value={headerData.profesor}
                onChange={(e) => handleHeaderFieldChange("profesor", e.target.value)}
                placeholder="ex: Prof. Ionescu Maria"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>
          </div>

          {/* Grid: Săptămâna vacanței din februarie & Nr. ore/săptămână */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Săptămâna vacanței din februarie
              </label>
              <select
                value={headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
                onChange={(e) => handleHeaderFieldChange("vacantaFebruarie", e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150 cursor-pointer"
              >
                <option value="Săptămâna 1 (15 - 21 Februarie 2027)">
                  Săpt. 1: 15 - 21 Feb 2027 (ex: Cluj, Ilfov)
                </option>
                <option value="Săptămâna 2 (22 - 28 Februarie 2027)">
                  Săpt. 2: 22 - 28 Feb 2027 (ex: București, Iași, Timiș)
                </option>
                <option value="Săptămâna 3 (1 - 7 Martie 2027)">
                  Săpt. 3: 1 - 7 Mar 2027 (ex: Brașov, Constanța)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                Ore pe săptămână
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setOreSaptamana(num);
                      handleHeaderFieldChange("nrOreSaptamana", `${num} ore/săpt.`);
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                      oreSaptamana === num
                        ? "bg-[#0D9488] text-white border-[#0D9488] shadow-2xs"
                        : "bg-[#F8FAF9] text-slate-700 border-[#E2E8F0] hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle pentru avize avansate (Director, Catedră) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedHeader(!showAdvancedHeader)}
              className="text-[11px] text-[#0D9488] hover:text-[#0F766E] font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>{showAdvancedHeader ? "Ascunde avize conducere" : "+ Configurează Director & Catedră"}</span>
              {showAdvancedHeader ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedHeader && (
              <div className="mt-2.5 p-3 bg-[#F8FAF9] rounded-lg border border-[#E2E8F0] space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Director (pentru Aviz)
                  </label>
                  <input
                    type="text"
                    value={headerData.director}
                    onChange={(e) => handleHeaderFieldChange("director", e.target.value)}
                    placeholder="Prof. dr. Popescu Ion"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Responsabil catedră / comisie metodică
                  </label>
                  <input
                    type="text"
                    value={headerData.respCatedra}
                    onChange={(e) => handleHeaderFieldChange("respCatedra", e.target.value)}
                    placeholder="Prof. Georgescu Elena"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#1E293B]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: Tipologie Didactică */}
      <div className="card-lift bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="pb-3 mb-3 border-b border-[#E2E8F0]">
          <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
            Cardul 2: Tipologie Didactică
          </h2>
          <p className="text-[11px] text-slate-500">
            Alege formatul oficial al documentului generat
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Buton 1: Planificare Anuală */}
          <button
            type="button"
            onClick={() => setTipDocument("Planificare anuală")}
            className={`btn-interaction w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 cursor-pointer ${
              tipDocument === "Planificare anuală"
                ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                : "bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                tipDocument === "Planificare anuală"
                  ? "bg-white/20 text-white"
                  : "bg-[#F0FDFA] text-[#0D9488]"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs sm:text-sm">Planificare Anuală</div>
              <div
                className={`text-[11px] mt-0.5 leading-snug ${
                  tipDocument === "Planificare anuală" ? "text-teal-50" : "text-slate-500"
                }`}
              >
                5 Module, 36 săptămâni & calcul matematic ore 2026-2027
              </div>
            </div>
          </button>

          {/* Buton 2: Planificare pe Unități */}
          <button
            type="button"
            onClick={() => setTipDocument("Planificare pe unitate")}
            className={`btn-interaction w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 cursor-pointer ${
              tipDocument === "Planificare pe unitate"
                ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                : "bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                tipDocument === "Planificare pe unitate"
                  ? "bg-white/20 text-white"
                  : "bg-[#F0FDFA] text-[#0D9488]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs sm:text-sm">Planificare pe Unități</div>
              <div
                className={`text-[11px] mt-0.5 leading-snug ${
                  tipDocument === "Planificare pe unitate" ? "text-teal-50" : "text-slate-500"
                }`}
              >
                Format avansat 7 coloane, activități detaliate & semnături oficiale
              </div>
            </div>
          </button>

          {/* Buton 3: Proiect de Lecție */}
          <button
            type="button"
            onClick={() => setTipDocument("Schiță de lecție")}
            className={`btn-interaction w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 cursor-pointer ${
              tipDocument === "Schiță de lecție"
                ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                : "bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                tipDocument === "Schiță de lecție"
                  ? "bg-white/20 text-white"
                  : "bg-[#F0FDFA] text-[#0D9488]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs sm:text-sm">Proiect de Lecție</div>
              <div
                className={`text-[11px] mt-0.5 leading-snug ${
                  tipDocument === "Schiță de lecție" ? "text-teal-50" : "text-slate-500"
                }`}
              >
                Format oficial 6 secțiuni, scenariu didactic 8 coloane & tabele digitale
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* CARD 3: Fișiere */}
      <div className="card-lift bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
              Cardul 3: Fișiere
            </h2>
            <p className="text-[11px] text-slate-500">
              Cele 3 surse obligatorii (drag & drop sau selecție fișier)
            </p>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            {[hasSablon, hasPrograma, hasSuport].filter(Boolean).length}/3 gata
          </div>
        </div>

        <div className="space-y-3">
          {/* Dropzone 1: Șablon Oficial */}
          <div>
            <input
              type="file"
              ref={sablonInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "sablon");
              }}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSablon(true);
              }}
              onDragLeave={() => setIsDraggingSablon(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSablon(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], "sablon");
              }}
              className={`p-3 rounded-xl border border-dashed transition-all duration-200 ${
                isDraggingSablon
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : hasSablon
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-[#CBD5E1] bg-[#F8FAF9] hover:border-[#0D9488]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-xs text-[#1E293B]">
                    1. Șablon Oficial
                  </div>
                  {hasSablon ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Încărcat
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Necesar</span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => sablonInputRef.current?.click()}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-[#E2E8F0] rounded text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Încarcă
                  </button>
                  {hasSablon && (
                    <button
                      type="button"
                      onClick={() => {
                        setSablonFile(null);
                        setSablonText("");
                        setSelectedTemplateId(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-1.5 text-[11px] text-slate-500">
                {sablonFile ? (
                  <span className="font-medium text-[#1E293B]">{sablonFile.name}</span>
                ) : sablonText ? (
                  <span className="text-[#0D9488] font-medium">Model Oficial MEC aplicat</span>
                ) : (
                  <span>Trage aici documentul de tip șablon sau apasă „Încarcă”</span>
                )}
              </div>

              {/* Opțiune rapidă atașare șablon oficial */}
              {!hasSablon && (
                <div className="mt-2 pt-2 border-t border-[#E2E8F0]/70 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Nu ai un fișier?</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPredefinedTemplate(
                        tipDocument === "Schiță de lecție"
                          ? "sablon-schita-lectie"
                          : tipDocument === "Planificare pe unitate"
                          ? "sablon-unitate"
                          : "sablon-anual-oficial"
                      )
                    }
                    className="text-[10px] font-semibold text-[#0D9488] hover:text-[#0F766E] flex items-center cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Atașează Șablon Standard MEC
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dropzone 2: Programă */}
          <div>
            <input
              type="file"
              ref={programaInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "programa");
              }}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPrograma(true);
              }}
              onDragLeave={() => setIsDraggingPrograma(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPrograma(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], "programa");
              }}
              className={`p-3 rounded-xl border border-dashed transition-all duration-200 ${
                isDraggingPrograma
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : hasPrograma
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-[#CBD5E1] bg-[#F8FAF9] hover:border-[#0D9488]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-xs text-[#1E293B]">
                    2. Programă școlară
                  </div>
                  {hasPrograma ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Încărcat
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Necesar</span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => programaInputRef.current?.click()}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-[#E2E8F0] rounded text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Încarcă
                  </button>
                  {hasPrograma && (
                    <button
                      type="button"
                      onClick={() => {
                        setProgramaFile(null);
                        setProgramaText("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-1.5 text-[11px] text-slate-500">
                {programaFile ? (
                  <span className="font-medium text-[#1E293B]">{programaFile.name}</span>
                ) : programaText ? (
                  <span className="text-slate-700">Text programă atașat ({programaText.length} caractere)</span>
                ) : (
                  <span>Trage aici programa MEC (competențe generale & specifice)</span>
                )}
              </div>
            </div>
          </div>

          {/* Dropzone 3: Suport curs */}
          <div>
            <input
              type="file"
              ref={suportInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "suport");
              }}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSuport(true);
              }}
              onDragLeave={() => setIsDraggingSuport(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSuport(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], "suport");
              }}
              className={`p-3 rounded-xl border border-dashed transition-all duration-200 ${
                isDraggingSuport
                  ? "border-[#0D9488] bg-[#F0FDFA]"
                  : hasSuport
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-[#CBD5E1] bg-[#F8FAF9] hover:border-[#0D9488]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-xs text-[#1E293B]">
                    3. Suport curs / Manual
                  </div>
                  {hasSuport ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Încărcat
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Necesar</span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => suportInputRef.current?.click()}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-[#E2E8F0] rounded text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Încarcă
                  </button>
                  {hasSuport && (
                    <button
                      type="button"
                      onClick={() => {
                        setSuportFile(null);
                        setSuportText("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Șterge fișierul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-1.5 text-[11px] text-slate-500">
                {suportFile ? (
                  <span className="font-medium text-[#1E293B]">{suportFile.name}</span>
                ) : suportText ? (
                  <span className="text-slate-700">Cuprins manual atașat ({suportText.length} caractere)</span>
                ) : (
                  <span>Trage aici cuprinsul manualului tematic pentru unitățile de învățare</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
