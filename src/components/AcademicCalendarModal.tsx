import React from "react";
import { X, Calendar, AlertCircle, CheckCircle2, Award, Clock } from "lucide-react";
import { SCHOOL_YEAR_CONFIG } from "../data/curriculumData";

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Structura Oficială a Anului Școlar 2026-2027
              </h3>
              <p className="text-xs text-slate-500">
                Norme metodice și repartizare matematică a săptămânilor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Închide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-sm">
          {/* Module Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Module de Învățare (5 Module)
            </h4>
            <div className="grid gap-2 sm:grid-cols-1">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Modulul 1 (7 săptămâni: S1 - S7)
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">
                    07.09.2026 - 23.10.2026
                  </span>
                </div>
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Săptămână Specială Obligatorie (S5):</strong> „Mai Mult decât Școala altfel” (05.10 - 09.10.2026).
                    <p className="text-slate-600 mt-0.5">
                      Rubricile de predare rămân <em>GOALE</em> în tabel (se menționează doar denumirea programului).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Modulul 2 (7.5 săptămâni: S8 - S15)
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">
                    02.11.2026 - 22.12.2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Predare continuă & Evaluare sumativă de etapă.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Modulul 3 (6 săptămâni: S16 - S21)
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">
                    11.01.2027 - 19.02.2027
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Vacanța de schi/mobilă la decizia ISJ (februarie).</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Modulul 4 (8 săptămâni: S22 - S29)
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">
                    01.03.2027 - 23.04.2027
                  </span>
                </div>
                <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong>Săptămână Specială Obligatorie (S29):</strong> „Săptămâna verde” (19.04 - 23.04.2027).
                    <p className="text-slate-600 mt-0.5">
                      Rubricile de predare rămân <em>GOALE</em> în tabel (fără conținut nou de predare).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Modulul 5 (6.5 săptămâni standard: S30 - S36)
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">
                    05.05.2027 - 18.06.2027
                  </span>
                </div>
                <div className="mt-2 text-xs text-violet-800 bg-violet-50 p-2 rounded-lg border border-violet-200 space-y-1">
                  <div className="font-semibold flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" /> Excepții Clase Terminale:
                  </div>
                  <div>• <strong>Clasa a VIII-a:</strong> Anul se încheie la <strong>11 iunie 2027</strong> (5.5 săpt în Modulul 5).</div>
                  <div>• <strong>Clasa a XII-a / a XIII-a:</strong> Anul se încheie la <strong>4 iunie 2027</strong> (4.5 săpt în Modulul 5).</div>
                </div>
              </div>
            </div>
          </div>

          {/* Norme Metodice Obligatorii */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-indigo-600" />
              Reguli de Pedagogie & Redactare Aplicată
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Replicare strictă:</strong> Se păstrează identic capetele de tabel din șablonul furnizat.</li>
              <li><strong>Extragere exclusivă:</strong> Conținuturile și temele se preiau strict din manualul / suportul teoretic oferit.</li>
              <li><strong>Limba:</strong> Dacă disciplina este Limba Engleză, competențele și conținuturile specifice se redactează în engleză conform suportului de curs (ex. Cambridge, IELTS).</li>
              <li><strong>Formatare curată:</strong> Rezultatul se generează exclusiv sub formă de tabel Markdown impecabil, fără divagații.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Am înțeles structura
          </button>
        </div>
      </div>
    </div>
  );
};
