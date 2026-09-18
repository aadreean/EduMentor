import React from "react";
import { GraduationCap, Calendar, Sparkles, Facebook, Youtube } from "lucide-react";

interface HeaderProps {
  onOpenCalendar: () => void;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCalendar, onLoadSample }) => {
  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-[#1E293B] tracking-tight">
                EduMetodist România
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
                2026 - 2027
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                autor prof. Adrian Podar
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal flex items-center gap-1.5 flex-wrap">
              <span>Asistent didactic pentru planificări curriculare & proiecte de lecție</span>
              <span className="text-slate-300 md:hidden">•</span>
              <span className="text-[#0D9488] font-medium md:hidden">autor prof. Adrian Podar</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onLoadSample}
            id="btn-load-sample-header"
            type="button"
            className="btn-interaction inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] shadow-xs cursor-pointer"
            title="Încarcă rapid date demo pentru testare imediată"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0D9488]" />
            <span className="hidden sm:inline">Încarcă</span> Exemplu Demo
          </button>

          <button
            onClick={onOpenCalendar}
            id="btn-open-calendar-header"
            type="button"
            className="btn-interaction inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-[#1E293B] bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] shadow-xs cursor-pointer"
            title="Vezi structura celor 5 module și săptămânile speciale"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            <span className="hidden md:inline">Calendar</span> 2026-2027
          </button>

          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200">
            <a
              href="https://www.facebook.com/adrianvepodar/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-interaction inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0D9488] bg-slate-50 hover:bg-[#F0FDFA] rounded-lg border border-[#E2E8F0] hover:border-[#99F6E4] transition-all"
              title="Trimite sugestii autorului pe Facebook"
            >
              <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
              <span className="hidden xl:inline">Trimite</span> sugestii
            </a>
            <a
              href="https://www.youtube.com/@adrian_podar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-interaction inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border border-[#E2E8F0] hover:border-rose-200 transition-all"
              title="Canal oficial YouTube - prof. Adrian Podar"
            >
              <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
              <span className="hidden xl:inline">Canal</span> YouTube
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

