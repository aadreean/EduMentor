import React, { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Clock, Info, Sparkles } from "lucide-react";
import { calculateAcademicHours } from "../data/curriculumData";

interface HoursCalculatorWidgetProps {
  clasa: string;
  oreSaptamana: number;
}

export const HoursCalculatorWidget: React.FC<HoursCalculatorWidgetProps> = ({
  clasa,
  oreSaptamana,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const calculation = calculateAcademicHours(clasa, oreSaptamana);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-[#F8FAF9] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors duration-150"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#0D9488] text-white shadow-2xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                Calcul Matematic Normă Anuală (2026-2027)
              </span>
              <span className="text-[11px] font-semibold text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-1.5 py-0.2 rounded-md">
                {calculation.totalTeachingHours} ore de predare
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {clasa || "Clasă standard"} • {oreSaptamana} {oreSaptamana === 1 ? "oră" : "ore"}/săpt • {calculation.note}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#0D9488] font-medium hidden sm:inline">
            {isExpanded ? "Ascunde detalii" : "Vezi repartiția pe module"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-[#E2E8F0] bg-white text-xs space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-[#F8FAF9] rounded-lg border border-[#E2E8F0]">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Total Săptămâni</div>
              <div className="text-base font-bold text-[#1E293B]">{calculation.totalWeeks}</div>
              <div className="text-[10px] text-slate-500">inclusiv speciale</div>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-emerald-700 text-[10px] uppercase font-bold">Săpt. Predare</div>
              <div className="text-base font-bold text-emerald-800">{calculation.effectiveTeachingWeeks}</div>
              <div className="text-[10px] text-emerald-600">fără predare în S.S.</div>
            </div>

            <div className="p-2.5 bg-[#F0FDFA] rounded-lg border border-[#CCFBF1]">
              <div className="text-[#0D9488] text-[10px] uppercase font-bold">Ore Predare</div>
              <div className="text-base font-bold text-[#0F766E]">{calculation.totalTeachingHours}</div>
              <div className="text-[10px] text-teal-600">materie distribuită</div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-[#D97706] text-[10px] uppercase font-bold">Săptămâni Speciale</div>
              <div className="text-base font-bold text-amber-800">2 săpt.</div>
              <div className="text-[10px] text-amber-600">{calculation.specialWeeksHours} ore activități</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-[#E2E8F0] rounded-lg">
              <thead>
                <tr className="bg-[#F8FAF9] text-[11px] text-[#1E293B]">
                  <th className="p-2 border border-[#E2E8F0]">Modul</th>
                  <th className="p-2 border border-[#E2E8F0]">Perioadă</th>
                  <th className="p-2 border border-[#E2E8F0]">Săptămâni</th>
                  <th className="p-2 border border-[#E2E8F0]">Ore Predare</th>
                  <th className="p-2 border border-[#E2E8F0]">Săptămâni Speciale (fără conținut nou)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-slate-600">
                {calculation.modules.map((m) => (
                  <tr key={m.moduleNumber} className="hover:bg-slate-50/60">
                    <td className="p-2 border border-[#E2E8F0] font-semibold text-[#1E293B]">
                      {m.name}
                    </td>
                    <td className="p-2 border border-[#E2E8F0] font-mono text-[11px]">
                      {m.period}
                    </td>
                    <td className="p-2 border border-[#E2E8F0] text-center font-medium">
                      {m.totalWeeks} ({m.effectiveWeeks} efective)
                    </td>
                    <td className="p-2 border border-[#E2E8F0] text-center font-bold text-[#0D9488]">
                      {m.teachingHours} ore
                    </td>
                    <td className="p-2 border border-[#E2E8F0] text-[11px]">
                      {m.specialEvents.length > 0 ? (
                        <span className="inline-flex items-center text-[#D97706] font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                          {m.specialEvents.join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

