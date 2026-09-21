import React, { useState } from "react";
import { School, UserCheck, Edit3, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { TechnicalHeaderData } from "../types";

interface TechnicalHeaderEditorProps {
  headerData: TechnicalHeaderData;
  onChange: (data: TechnicalHeaderData) => void;
}

export const TechnicalHeaderEditor: React.FC<TechnicalHeaderEditorProps> = ({
  headerData,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field: keyof TechnicalHeaderData, val: string) => {
    const updated = {
      ...headerData,
      [field]: val,
    };
    // Check completeness
    const isComplete = Boolean(
      updated.unitateInvatamant.trim() &&
        updated.director.trim() &&
        updated.respCatedra.trim() &&
        updated.profesor.trim()
    );
    onChange({ ...updated, isComplete });
  };

  const isFormFilled = Boolean(
    headerData.unitateInvatamant.trim() &&
      headerData.director.trim() &&
      headerData.respCatedra.trim() &&
      headerData.profesor.trim()
  );

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 bg-white flex items-center justify-between border-b border-slate-200 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <School className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <span>Coordonate Tehnice & Antet Oficial</span>
              {isFormFilled ? (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                  Complet
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">
                  Necesită date
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Antet permanent inclus la începutul fiecărui document
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
          <span className="text-[11px] font-medium hidden sm:inline">
            {isExpanded ? "Ascunde" : "Editează antetul"}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Editor Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 text-xs">
          {!isFormFilled && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                Completează datele școlii, directorului și catedrei pentru a genera antetul oficial cu aliniere stânga/dreapta. Acestea vor rămâne memorate permanent pe parcursul sesiunii.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Unitatea de învățământ (Școala)
              </label>
              <input
                type="text"
                value={headerData.unitateInvatamant || ""}
                onChange={(e) => handleChange("unitateInvatamant", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: Colegiul Național „Mihai Viteazul”"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Director (pentru Aviz)
              </label>
              <input
                type="text"
                value={headerData.director || ""}
                onChange={(e) => handleChange("director", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: Prof. dr. Popescu Ion"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Profesor
              </label>
              <input
                type="text"
                value={headerData.profesor || ""}
                onChange={(e) => handleChange("profesor", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: Prof. Ionescu Maria"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Responsabil catedră
              </label>
              <input
                type="text"
                value={headerData.respCatedra || ""}
                onChange={(e) => handleChange("respCatedra", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: Prof. Georgescu Elena"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Manual / Suport de curs
              </label>
              <input
                type="text"
                value={headerData.manualSuport || ""}
                onChange={(e) => handleChange("manualSuport", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: Manual Ed. Art Klett / Oxford Univ. Press"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Nr. înregistrare (opțional)
              </label>
              <input
                type="text"
                value={headerData.nrInregistrare || ""}
                onChange={(e) => handleChange("nrInregistrare", e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="ex: 1245 / 15.09.2026 sau ......................."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Visual Preview Box */}
          <div className="mt-2 pt-2.5 border-t border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Previzualizare Antet Oficial:
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-serif text-slate-800 leading-relaxed shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <p><strong>Unitatea de învățământ:</strong> {headerData.unitateInvatamant || "[Nume Școală]"}</p>
                  <p><strong>Anul școlar:</strong> {headerData.anScolar || "2026-2027"}</p>
                  <p><strong>Disciplina:</strong> {headerData.disciplina || "[Nume Disciplină]"}</p>
                  <p><strong>Manual/Suport:</strong> {headerData.manualSuport || "[Nume Manual]"}</p>
                  <p><strong>Clasa:</strong> {headerData.clasa || "[Clasa]"}</p>
                  <p><strong>Nr. de ore pe săptămână:</strong> {headerData.nrOreSaptamana || "[Nr. ore]"}</p>
                  <p><strong>Profesor:</strong> {headerData.profesor || "[Nume Profesor]"}</p>
                </div>
                <div className="text-right">
                  <p><strong>Aviz,</strong></p>
                  <p><strong>director:</strong> {headerData.director || "[Nume Director]"}</p>
                  <div className="h-2"></div>
                  <p><strong>Resp. catedră:</strong> {headerData.respCatedra || "[Nume Responsabil]"}</p>
                  <div className="h-2"></div>
                  <p><strong>Nr. înregistrare:</strong> {headerData.nrInregistrare || "......................."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
