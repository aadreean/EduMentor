import React from "react";
import { Calendar, FileSpreadsheet, BookOpen, Sparkles, Loader2, ArrowDown } from "lucide-react";
import { DocumentType } from "../types";

interface TypologyAndGenerateSectionProps {
  tipDocument: DocumentType;
  setTipDocument: (t: DocumentType) => void;
  clasa: string;
  oreSaptamana: number;
  isLoading: boolean;
  onGenerate: () => void;
  onLoadSampleData: () => void;
}

export const TypologyAndGenerateSection: React.FC<TypologyAndGenerateSectionProps> = ({
  tipDocument,
  setTipDocument,
  clasa,
  oreSaptamana,
  isLoading,
  onGenerate,
  onLoadSampleData,
}) => {
  return (
    <section
      id="section-tipologie"
      className="card-lift bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6"
    >
      {/* Header-ul Secțiunii 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-md border border-[#CCFBF1]">
                Pasul 3
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Tipologie Didactică & Generare Document
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Selectează tipul documentului și apasă pe butonul mare de mai jos pentru a produce documentul complet
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLoadSampleData}
          className="btn-interaction text-xs font-semibold text-slate-600 hover:text-[#0D9488] bg-[#F8FAF9] hover:bg-[#F0FDFA] px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#CCFBF1] transition-all self-start sm:self-auto cursor-pointer"
        >
          Încarcă Exemplu Demo Complet
        </button>
      </div>

      {/* Selector Tipologie Didactică - 3 Carduri Mari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Opțiunea 1: Planificare Anuală */}
        <button
          type="button"
          onClick={() => setTipDocument("Planificare anuală")}
          className={`btn-interaction p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            tipDocument === "Planificare anuală"
              ? "bg-[#0D9488] text-white border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/20"
              : "bg-[#F8FAF9] text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div
              className={`p-2 rounded-lg ${
                tipDocument === "Planificare anuală"
                  ? "bg-white/20 text-white"
                  : "bg-white text-[#0D9488] shadow-2xs"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                tipDocument === "Planificare anuală"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              Toate cele 5 Module
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">Planificare Anuală</h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                tipDocument === "Planificare anuală" ? "text-teal-50" : "text-slate-500"
              }`}
            >
              Generare completă S1–S36 pe 5 module, Școala altfel, Săptămâna verde și calcul orar.
            </p>
          </div>
        </button>

        {/* Opțiunea 2: Planificare pe Unități */}
        <button
          type="button"
          onClick={() => setTipDocument("Planificare pe unitate")}
          className={`btn-interaction p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            tipDocument === "Planificare pe unitate"
              ? "bg-[#0D9488] text-white border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/20"
              : "bg-[#F8FAF9] text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div
              className={`p-2 rounded-lg ${
                tipDocument === "Planificare pe unitate"
                  ? "bg-white/20 text-white"
                  : "bg-white text-[#0D9488] shadow-2xs"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                tipDocument === "Planificare pe unitate"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              7 Coloane Normate
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">Planificare pe Unități</h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                tipDocument === "Planificare pe unitate" ? "text-teal-50" : "text-slate-500"
              }`}
            >
              Competențe, activități de învățare, resurse, instrumente de evaluare și semnături.
            </p>
          </div>
        </button>

        {/* Opțiunea 3: Proiect de Lecție */}
        <button
          type="button"
          onClick={() => setTipDocument("Schiță de lecție")}
          className={`btn-interaction p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            tipDocument === "Schiță de lecție"
              ? "bg-[#0D9488] text-white border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/20"
              : "bg-[#F8FAF9] text-[#1E293B] border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div
              className={`p-2 rounded-lg ${
                tipDocument === "Schiță de lecție"
                  ? "bg-white/20 text-white"
                  : "bg-white text-[#0D9488] shadow-2xs"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                tipDocument === "Schiță de lecție"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              6 Secțiuni & 8 Coloane
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">Proiect de Lecție</h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                tipDocument === "Schiță de lecție" ? "text-teal-50" : "text-slate-500"
              }`}
            >
              Scenariu didactic pe etape, activitatea profesorului/elevilor, strategii și evaluare.
            </p>
          </div>
        </button>
      </div>

      {/* MARELE BUTON CENTRAL DE GENERARE - Cu contrast puternic și vizibilitate maximă */}
      <div className="pt-2 flex flex-col items-center justify-center space-y-3">
        <button
          type="button"
          id="btn-main-generate"
          onClick={onGenerate}
          disabled={isLoading}
          className={`btn-interaction w-full max-w-2xl py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white shadow-lg flex items-center justify-center space-x-3 cursor-pointer transition-all duration-200 ${
            isLoading
              ? "bg-[#0F766E]/80 cursor-wait"
              : "bg-[#0D9488] hover:bg-[#0F766E] shadow-[#0D9488]/25 hover:shadow-xl hover:shadow-[#0D9488]/30"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-teal-100" />
              <div className="text-left">
                <div className="text-sm font-bold">Se generează documentul didactic complet...</div>
                <div className="text-xs text-teal-100 font-normal">
                  Redactare antet oficial și tabel detaliat pentru {clasa}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                  GENEREAZĂ {tipDocument.toUpperCase()} ACUM
                </div>
                <div className="text-[11px] sm:text-xs text-teal-100 font-medium">
                  {clasa} • {oreSaptamana} {oreSaptamana === 1 ? "oră/săpt" : "ore/săpt"} • Antet complet & Tabel integral
                </div>
              </div>
            </>
          )}
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <ArrowDown className="w-3.5 h-3.5 text-[#0D9488] animate-bounce" />
          <span>Documentul generat se va afișa mai jos în Secțiunea 4 cu tabele A4 Landscape</span>
        </div>
      </div>
    </section>
  );
};
