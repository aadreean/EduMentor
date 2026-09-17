import React, { useRef, useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Layers,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCode,
  FileCheck,
} from "lucide-react";
import { DocumentType, FilePayload, StandardTemplate, TechnicalHeaderData } from "../types";
import { STANDARD_TEMPLATES } from "../data/curriculumData";
import { processUploadedFile } from "../utils/fileHelpers";
import { TechnicalHeaderEditor } from "./TechnicalHeaderEditor";

interface DocumentsInputPanelProps {
  clasa: string;
  setClasa: (c: string) => void;
  oreSaptamana: number;
  setOreSaptamana: (n: number) => void;
  tipDocument: DocumentType;
  setTipDocument: (t: DocumentType) => void;
  disciplina: string;
  setDisciplina: (d: string) => void;

  headerData: TechnicalHeaderData;
  setHeaderData: (data: TechnicalHeaderData) => void;

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

const CLASE_OPTIONS = [
  "Clasa Pregătitoare",
  "Clasa I",
  "Clasa a II-a",
  "Clasa a III-a",
  "Clasa a IV-a",
  "Clasa a V-a",
  "Clasa a VI-a",
  "Clasa a VII-a",
  "Clasa a VIII-a (Terminală)",
  "Clasa a IX-a",
  "Clasa a X-a",
  "Clasa a XI-a",
  "Clasa a XII-a (Terminală)",
  "Clasa a XIII-a (Terminală)",
];

export const DocumentsInputPanel: React.FC<DocumentsInputPanelProps> = ({
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
  const [activeTab, setActiveTab] = useState<"params" | "files" | "templates">("params");
  const [showTextModal, setShowTextModal] = useState<"programa" | "suport" | "sablon" | null>(null);

  const fileInputPrograma = useRef<HTMLInputElement>(null);
  const fileInputSuport = useRef<HTMLInputElement>(null);
  const fileInputSablon = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "programa" | "suport" | "sablon"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const payload = await processUploadedFile(file);
      if (target === "programa") {
        setProgramaFile(payload);
      } else if (target === "suport") {
        setSuportFile(payload);
      } else {
        setSablonFile(payload);
        setSelectedTemplateId(null);
      }
    } catch (err) {
      console.error("Eroare la încărcarea fișierului:", err);
    }
  };

  const handleSelectTemplate = (template: StandardTemplate) => {
    setSelectedTemplateId(template.id);
    setSablonFile(null);
    setSablonText(template.content);
    setTipDocument(template.category);
  };

  const hasSablon = Boolean(sablonFile || (sablonText && sablonText.trim().length > 0));
  const hasPrograma = Boolean(programaFile || (programaText && programaText.trim().length > 0));
  const hasSuport = Boolean(suportFile || (suportText && suportText.trim().length > 0));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Panel Navigation */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("params")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "params"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Parametri Chat
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === "files"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>2. Cele 3 Input-uri</span>
            {hasSablon && hasPrograma && hasSuport ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "templates"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Modele Șabloane
          </button>
        </div>

        <div className="text-[11px] font-medium text-slate-500">
          {[hasSablon, hasPrograma, hasSuport].filter(Boolean).length} / 3 atașamente
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* TAB 1: PARAMETRI */}
        {activeTab === "params" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipul Documentului Cerut
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["Planificare anuală", "Planificare pe unitate", "Schiță de lecție"] as DocumentType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTipDocument(type)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        tipDocument === type
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="font-semibold">
                        {type === "Schiță de lecție" ? "Proiect / Schiță de lecție" : type}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {type === "Planificare anuală"
                          ? "5 Module, Săptămâni & Ore 2026-2027"
                          : type === "Planificare pe unitate"
                          ? "Format oficial 7 coloane & semnături"
                          : "Format oficial 6 secțiuni & 8 coloane"}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clasa / Nivelul de învățământ
                </label>
                <select
                  value={clasa}
                  onChange={(e) => setClasa(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  {CLASE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {(clasa.includes("VIII") || clasa.includes("XII") || clasa.includes("XIII")) && (
                  <p className="text-[10px] text-violet-700 mt-1 font-medium">
                    ⚠️ Clasă terminală: se aplică automat încheierea anticipată a cursurilor!
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Număr de ore pe săptămână
                </label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setOreSaptamana(num)}
                      className={`flex-1 py-2 text-center rounded-xl font-bold border transition-colors ${
                        oreSaptamana === num
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {num} {num === 1 ? "oră" : "ore"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Disciplina de învățământ
              </label>
              <input
                type="text"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                placeholder="ex: Limba și literatura română / Limba Engleză / Matematică..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Pentru Limba Engleză, competențele și conținuturile se vor genera în limba engleză, conform normelor pedagogice din prompt.
              </p>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-indigo-900 leading-relaxed">
                Asistentul verifică automat prezența celor <strong>3 Input-uri esențiale</strong> (Șablon, Programă, Suport de curs).
                Treci la tabul următor pentru a încărca fișierele tale sau a folosi modelele oficiale preconfigurate.
              </div>
            </div>

            {/* Technical Header Caseta Oficială */}
            <TechnicalHeaderEditor
              headerData={headerData}
              onChange={setHeaderData}
            />
          </div>
        )}

        {/* TAB 2: CELE 3 INPUT-URI ESENȚIALE */}
        {activeTab === "files" && (
          <div className="space-y-3.5 text-xs">
            {/* Input 1: Șablonul */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                hasSablon ? "border-emerald-300 bg-emerald-50/30" : "border-amber-300 bg-amber-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      hasSablon ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Șablonul dorit (Model gol / Cap tabel)</span>
                    <span className="text-[10px] text-rose-600 font-bold ml-1.5">*CRITIC</span>
                  </div>
                </div>

                {hasSablon ? (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Încărcat
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1" /> Necesar
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Metodistul va replica <strong>strict</strong> capetele de tabel și rubricile acestui șablon.
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputSablon.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {sablonFile ? sablonFile.name : "Încarcă fișier șablon (PDF/Doc/Text)"}
                </button>
                <input
                  type="file"
                  ref={fileInputSablon}
                  onChange={(e) => handleFileUpload(e, "sablon")}
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => setShowTextModal("sablon")}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  Lipește text / Vezi șablon
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("templates")}
                  className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-indigo-700 font-semibold flex items-center space-x-1"
                >
                  Alege din modele oficiale
                </button>
              </div>

              {hasSablon && (
                <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="truncate">
                    {sablonFile ? `Fișier: ${sablonFile.name}` : `Șablon text activ (${sablonText.length} caractere)`}
                  </span>
                  <button
                    onClick={() => {
                      setSablonFile(null);
                      setSablonText("");
                      setSelectedTemplateId(null);
                    }}
                    className="text-rose-600 hover:text-rose-700 p-1"
                    title="Șterge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Input 2: Programa Școlară */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                hasPrograma ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      hasPrograma ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Programa Școlară</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">(Competențe generale & specifice)</span>
                  </div>
                </div>

                {hasPrograma && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Încărcat
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputPrograma.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {programaFile ? programaFile.name : "Încarcă fișier programă (PDF/Text)"}
                </button>
                <input
                  type="file"
                  ref={fileInputPrograma}
                  onChange={(e) => handleFileUpload(e, "programa")}
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => setShowTextModal("programa")}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  Lipește text programă
                </button>
              </div>

              {hasPrograma && (
                <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="truncate">
                    {programaFile ? `Fișier: ${programaFile.name}` : `Text programă (${programaText.length} caractere)`}
                  </span>
                  <button
                    onClick={() => {
                      setProgramaFile(null);
                      setProgramaText("");
                    }}
                    className="text-rose-600 hover:text-rose-700 p-1"
                    title="Șterge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Input 3: Suportul de Curs */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                hasSuport ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      hasSuport ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Suportul de Curs / Manualul</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">(Corpusul de texte/teme propus)</span>
                  </div>
                </div>

                {hasSuport && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Încărcat
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputSuport.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {suportFile ? suportFile.name : "Încarcă manual / cuprins (PDF/Text)"}
                </button>
                <input
                  type="file"
                  ref={fileInputSuport}
                  onChange={(e) => handleFileUpload(e, "suport")}
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => setShowTextModal("suport")}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 font-medium flex items-center space-x-1 shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  Lipește text suport
                </button>
              </div>

              {hasSuport && (
                <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="truncate">
                    {suportFile ? `Fișier: ${suportFile.name}` : `Text suport de curs (${suportText.length} caractere)`}
                  </span>
                  <button
                    onClick={() => {
                      setSuportFile(null);
                      setSuportText("");
                    }}
                    className="text-rose-600 hover:text-rose-700 p-1"
                    title="Șterge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MODELE ȘABLOANE OFICIALE */}
        {activeTab === "templates" && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 text-[11px]">
              Selectează un model de șablon omologat conform cerințelor ISJ / MEC. Asistentul va respecta exact aceste coloane:
            </p>

            <div className="space-y-2.5">
              {STANDARD_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{tmpl.title}</div>
                      {isSelected ? (
                        <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Selectat
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Apasă pentru a alege</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{tmpl.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tmpl.columns.map((col, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal for pasting text */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              {showTextModal === "programa"
                ? "Conținut Programa Școlară"
                : showTextModal === "suport"
                ? "Conținut Suport de Curs / Cuprins Manual"
                : "Șablon dorit (Format tabel Markdown sau text)"}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Lipește textul sau editează conținutul extras.
            </p>

            <textarea
              rows={10}
              value={
                showTextModal === "programa"
                  ? programaText
                  : showTextModal === "suport"
                  ? suportText
                  : sablonText
              }
              onChange={(e) => {
                if (showTextModal === "programa") setProgramaText(e.target.value);
                else if (showTextModal === "suport") setSuportText(e.target.value);
                else {
                  setSablonText(e.target.value);
                  setSelectedTemplateId(null);
                }
              }}
              placeholder="Lipește textul aici..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowTextModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Salvează și Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
