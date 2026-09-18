import React from "react";
import { School, UserCheck, Clock, BookOpen, User, ShieldCheck, GraduationCap } from "lucide-react";
import { TechnicalHeaderData } from "../types";

interface TechnicalHeaderSectionProps {
  clasa: string;
  setClasa: (c: string) => void;
  oreSaptamana: number;
  setOreSaptamana: (h: number) => void;
  disciplina: string;
  setDisciplina: (d: string) => void;
  headerData: TechnicalHeaderData;
  setHeaderData: React.Dispatch<React.SetStateAction<TechnicalHeaderData>>;
}

export const TechnicalHeaderSection: React.FC<TechnicalHeaderSectionProps> = ({
  clasa,
  setClasa,
  oreSaptamana,
  setOreSaptamana,
  disciplina,
  setDisciplina,
  headerData,
  setHeaderData,
}) => {
  const handleFieldChange = (field: keyof TechnicalHeaderData, value: string) => {
    setHeaderData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "disciplina") setDisciplina(value);
      if (field === "clasa") setClasa(value);
      return updated;
    });
  };

  return (
    <section
      id="section-date-tehnice"
      className="card-lift bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5"
    >
      {/* Header-ul Secțiunii 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-md border border-[#CCFBF1]">
                Pasul 1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Date Tehnice & Antet Oficial
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordonatele administrative oficiale pentru anul școlar 2026-2027 (replicate pe două coloane în document)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Antet Permanent Vizibil</span>
          </span>
        </div>
      </div>

      {/* Formular Date Tehnice - Câmpuri ordonate și vizibile */}
      <div className="space-y-4">
        {/* Rândul 1: Școala, Disciplina, Clasa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Unitatea de învățământ (Școala) *
            </label>
            <input
              type="text"
              value={headerData.unitateInvatamant}
              onChange={(e) => handleFieldChange("unitateInvatamant", e.target.value)}
              placeholder="ex: Colegiul Național „Mihai Viteazul”"
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1E293B]">
                Disciplina de studiu *
              </label>
            </div>
            <input
              type="text"
              value={headerData.disciplina || disciplina}
              onChange={(e) => handleFieldChange("disciplina", e.target.value)}
              placeholder="ex: Limba și literatura română / CLR, MEM, DP"
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
            />
            <p className="text-[11px] text-[#0D9488] font-medium mt-1 leading-snug">
              💡 Pentru ciclul primar, introduceți disciplinele integrate (ex: CLR, MEM, DP)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Clasa *
            </label>
            <input
              type="text"
              value={headerData.clasa || clasa}
              onChange={(e) => handleFieldChange("clasa", e.target.value)}
              placeholder="ex: Clasa a VII-a / Clasa a XI-a A / Clasa I"
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        {/* Detalii curriculare (Liceu) dispuse ergonomic sub câmpul Clasa */}
        <div className="bg-[#F8FAF9] rounded-xl p-3.5 sm:p-4 border border-[#E2E8F0] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-[#0D9488]" />
              <span className="text-xs font-bold text-[#1E293B]">
                Detalii curriculare liceu (Filieră • Profil • Specializare)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                (opțional - se integrează automat în antet sub clasă)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 italic">
              Ex: {headerData.clasa || clasa || "Clasa a XI-a"} | Filiera teoretică, Profil umanist, Specializarea filologie
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Filiera */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Filiera
              </label>
              <input
                type="text"
                list="filiere-optiuni"
                value={headerData.filiera || ""}
                onChange={(e) => handleFieldChange("filiera", e.target.value)}
                placeholder="ex: Teoretică / Vocațională"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all"
              />
              <datalist id="filiere-optiuni">
                <option value="Teoretică" />
                <option value="Tehnologică" />
                <option value="Vocațională" />
              </datalist>
            </div>

            {/* Profilul */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Profilul
              </label>
              <input
                type="text"
                list="profiluri-optiuni"
                value={headerData.profil || ""}
                onChange={(e) => handleFieldChange("profil", e.target.value)}
                placeholder="ex: Umanist / Real / Tehnic"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all"
              />
              <datalist id="profiluri-optiuni">
                <option value="Umanist" />
                <option value="Real" />
                <option value="Tehnic" />
                <option value="Servicii" />
                <option value="Resurse naturale și protecția mediului" />
                <option value="Artistic" />
                <option value="Sportiv" />
                <option value="Pedagogic" />
                <option value="Teologic" />
                <option value="Militar" />
              </datalist>
            </div>

            {/* Specializarea */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Specializarea
              </label>
              <input
                type="text"
                list="specializari-optiuni"
                value={headerData.specializare || ""}
                onChange={(e) => handleFieldChange("specializare", e.target.value)}
                placeholder="ex: Filologie / Științe ale naturii"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all"
              />
              <datalist id="specializari-optiuni">
                <option value="Filologie" />
                <option value="Științe sociale" />
                <option value="Matematică-informatică" />
                <option value="Științe ale naturii" />
                <option value="Economic" />
                <option value="Comerț" />
                <option value="Turism și alimentație" />
                <option value="Informatică" />
                <option value="Muzică" />
                <option value="Arte plastice și decorative" />
                <option value="Învățător-educatoare" />
                <option value="Teologie ortodoxă" />
              </datalist>
            </div>
          </div>
        </div>

        {/* Rândul 2: Manual / Suport, Nume Profesor, Număr de ore pe săptămână */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Manual / Suport de curs didactic
            </label>
            <div className="relative">
              <input
                type="text"
                value={headerData.manualSuport}
                onChange={(e) => handleFieldChange("manualSuport", e.target.value)}
                placeholder="ex: Manual Ed. Art Klett / Cambridge C1"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Profesor titular / întocmit de *
            </label>
            <div className="relative">
              <input
                type="text"
                value={headerData.profesor}
                onChange={(e) => handleFieldChange("profesor", e.target.value)}
                placeholder="ex: Prof. Adrian Podar"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Nr. ore pe săptămână (Normă)
            </label>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setOreSaptamana(num);
                    handleFieldChange("nrOreSaptamana", `${num} ore/săpt.`);
                  }}
                  className={`btn-interaction flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-150 cursor-pointer ${
                    oreSaptamana === num
                      ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                      : "bg-[#F8FAF9] text-slate-700 border-[#E2E8F0] hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {num} {num === 1 ? "oră" : "ore"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rândul 3: Săptămâna vacanței din februarie & Avize Conducere PERMANENT VIZIBILE */}
        <div className="pt-2 border-t border-[#F1F5F9]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Vacanța din februarie (județeană)</span>
              </label>
              <select
                value={headerData.vacantaFebruarie || "Săptămâna 2 (22 - 28 Februarie 2027)"}
                onChange={(e) => handleFieldChange("vacantaFebruarie", e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150 cursor-pointer"
              >
                <option value="Săptămâna 1 (15 - 21 Februarie 2027)">
                  Săpt. 1 (15 - 21 Feb 2027 - ex: Cluj, Ilfov)
                </option>
                <option value="Săptămâna 2 (22 - 28 Februarie 2027)">
                  Săpt. 2 (22 - 28 Feb 2027 - București, Iași, Timiș)
                </option>
                <option value="Săptămâna 3 (1 - 7 Martie 2027)">
                  Săpt. 3 (1 - 7 Mar 2027 - ex: Brașov, Constanța)
                </option>
              </select>
            </div>

            {/* Director (pentru aviz) - PERMANENT VIZIBIL */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Director (pentru Aviz) *</span>
              </label>
              <input
                type="text"
                value={headerData.director}
                onChange={(e) => handleFieldChange("director", e.target.value)}
                placeholder="Prof. dr. Popescu Ion"
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>

            {/* Responsabil catedră - PERMANENT VIZIBIL */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Responsabil de catedră / comisie *</span>
              </label>
              <input
                type="text"
                value={headerData.respCatedra}
                onChange={(e) => handleFieldChange("respCatedra", e.target.value)}
                placeholder="Prof. Georgescu Elena"
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>

            {/* Nr. înregistrare - PERMANENT VIZIBIL */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Număr de înregistrare secretariat
              </label>
              <input
                type="text"
                value={headerData.nrInregistrare}
                onChange={(e) => handleFieldChange("nrInregistrare", e.target.value)}
                placeholder="ex: Nr. 1420 / 08.09.2026"
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] focus:bg-white transition-all duration-150"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
