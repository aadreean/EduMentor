import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { ChatMessage, DocumentType, FilePayload } from "../types";
import { MarkdownTableRenderer } from "./MarkdownTableRenderer";
import { STANDARD_TEMPLATES } from "../data/curriculumData";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  clasa: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  hasSablon: boolean;
  hasPrograma: boolean;
  hasSuport: boolean;
  onSelectStandardTemplate: (templateId: string) => void;
  onLoadSampleData: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  clasa,
  oreSaptamana,
  tipDocument,
  hasSablon,
  hasPrograma,
  hasSuport,
  onSelectStandardTemplate,
  onLoadSampleData,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickGenerate = () => {
    const prompt = `Te rog să generezi ${tipDocument.toLowerCase()} pentru ${clasa}, având alocate ${oreSaptamana} ${
      oreSaptamana === 1 ? "oră" : "ore"
    } pe săptămână, conform structurii anului școlar 2026-2027.`;
    onSendMessage(prompt);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Chat Header Status */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <span>Asistent Metodist Român</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500">
              Generare matematică & pedagogică conform structurii 2026-2027
            </p>
          </div>
        </div>

        {/* Quick parameters pill */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
          <span className="font-semibold text-slate-700">{clasa}</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-indigo-700">{oreSaptamana} ore/săpt</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">{tipDocument}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          const containsTable = msg.content.includes("|") && msg.content.includes("---");

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs ${
                  isAssistant
                    ? "bg-white text-slate-800 border border-slate-200 shadow-xs"
                    : "bg-indigo-600 text-white shadow-xs"
                }`}
              >
                {/* Assistant message with possible table */}
                {isAssistant ? (
                  <div>
                    {containsTable ? (
                      <div className="space-y-3">
                        <MarkdownTableRenderer content={msg.content} />
                      </div>
                    ) : (
                      <div className="space-y-2 whitespace-pre-wrap leading-relaxed text-slate-700">
                        {msg.content}

                        {/* If the message requests a template, offer 1-click template selection buttons */}
                        {msg.content.includes("șablonul") && !hasSablon && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                            <div className="font-bold text-amber-900 text-[11px] flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-700" />
                              Alege rapid un șablon oficial omologat:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {STANDARD_TEMPLATES.map((tmpl) => (
                                <button
                                  key={tmpl.id}
                                  type="button"
                                  onClick={() => onSelectStandardTemplate(tmpl.id)}
                                  className="px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-semibold transition-colors"
                                >
                                  {tmpl.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                <div
                  className={`mt-1.5 text-[10px] ${
                    isAssistant ? "text-slate-400 text-right" : "text-indigo-200 text-right"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-sm text-xs text-slate-600 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span className="font-semibold text-slate-800">
                  Metodistul calculează orele și redactează tabelul...
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Se distribuie conținuturile pe cele 5 module 2026-2027 cu respectarea săptămânilor speciale.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Bar */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {/* Quick Action Suggestion Buttons */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={handleQuickGenerate}
            disabled={isLoading}
            className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generează {tipDocument} ({clasa})</span>
          </button>

          {!hasSablon && (
            <button
              type="button"
              onClick={() => onSelectStandardTemplate("sablon-anual-oficial")}
              className="shrink-0 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-medium transition-colors"
            >
              + Atașează Șablon Oficial MEC
            </button>
          )}

          {(!hasPrograma || !hasSuport) && (
            <button
              type="button"
              onClick={onLoadSampleData}
              className="shrink-0 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-medium transition-colors"
            >
              Încarcă pachet exemplu (Română 7)
            </button>
          )}
        </div>

        {/* Text Form */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Scrie o instrucțiune metodică (ex: "Generează planificarea anuală", "Adaugă ore de evaluare sumativă în Modulul 2")...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trimite</span>
          </button>
        </form>
      </div>
    </div>
  );
};
