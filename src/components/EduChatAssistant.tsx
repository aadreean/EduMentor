import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Loader2,
  Globe,
  ExternalLink,
  Bot,
  User,
  Trash2,
  Zap,
  Brain,
  Search,
  Check,
  Copy,
  ChevronRight,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileCode,
} from "lucide-react";
import { AssistantChatMessage, GroundingSource, FilePayload } from "../types";
import { readFileAsBase64, extractTextSnippet } from "../utils/fileHelpers";

interface EduChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  clasa: string;
  disciplina: string;
}

export const EduChatAssistant: React.FC<EduChatAssistantProps> = ({
  isOpen,
  onClose,
  onOpen,
  clasa,
  disciplina,
}) => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Bună ziua! Sunt **Asistentul Metodist EduMentor** (autor prof. Adrian Podar). 

Sunt conectat la **Google Search** și la normele oficiale ale anului școlar **2026-2027** pentru a vă ajuta cu:
* 📅 Structura oficială pe **5 module** și săptămânile speciale (*Școala altfel* S5, *Săptămâna verde* S29)
* 📖 Programele școlare MEC, competențe specifice și conținuturi
* 🔍 Informații legislative de ultimă oră din învățământ verificate pe web
* 💡 Idei de proiectare didactică, strategii interactive și instrumente de evaluare

Despre ce doriți să discutăm astăzi?`,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-3.5-flash",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [taskType, setTaskType] = useState<"fast" | "general" | "complex">("general");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FilePayload[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [isOpen, messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
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
        console.error("Eroare citire fișier chat:", file.name, err);
      }
    }

    if (newPayloads.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newPayloads]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf") || mimeType.includes("pdf")) {
      return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    if (lower.endsWith(".doc") || lower.endsWith(".docx") || mimeType.includes("word")) {
      return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.includes("image")) {
      return <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  };

  const handleSend = async (userText: string) => {
    const textToSend = userText.trim();
    if ((!textToSend && attachedFiles.length === 0) || isLoading) return;

    const currentFiles = [...attachedFiles];

    const userMessage: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content:
        textToSend ||
        (currentFiles.length > 0
          ? `Atașez ${currentFiles.length} ${currentFiles.length === 1 ? "fișier" : "fișiere"} didactic(e). Te rog să îl/le analizezi.`
          : ""),
      attachedFiles: currentFiles.length > 0 ? currentFiles : undefined,
      timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      taskType,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // Trimite istoricul și fișierele atașate către backend
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        taskType,
        clasa,
        disciplina,
        attachedFiles: currentFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          textSnippet: f.textSnippet,
          data: f.size && f.size < 3.5 * 1024 * 1024 ? f.data : undefined,
        })),
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Eroare la obținerea răspunsului.");
      }

      const assistantMessage: AssistantChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources,
        searchQueries: data.searchQueries,
        modelUsed: data.modelUsed,
        taskType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const isFailedFetch = err?.message?.toLowerCase().includes("failed to fetch");
      const errorMessage: AssistantChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: isFailedFetch
          ? `### ⚠️ Eroare de rețea (Failed to fetch)\n\nNu s-a putut contacta serverul metodist. Dacă accesați aplicația pe o găzduire exclusiv statică (precum Netlify), asistentul conversațional necesită pornirea serverului backend Node.js. Pe mediul principal sau dacă aveți conexiune la internet, vă rugăm să reîncercați.`
          : `A apărut o eroare la procesarea mesajului: ${err.message || "Vă rugăm să reîncercați."}`,
        timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Conversația a fost resetată. Cu ce vă pot fi de folos în proiectarea didactică?",
        timestamp: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "gemini-3.5-flash",
      },
    ]);
  };

  const quickPrompts = [
    "Care este structura exactă pe module în 2026-2027?",
    "Idei de activități transdisciplinare pentru Școala altfel (S5)",
    "Cum formulez obiective operaționale măsurabile conform taxonomiei Bloom?",
    `Ce conținuturi esențiale sunt recomandate pentru ${disciplina || "disciplina mea"}?`,
  ];

  return (
    <>
      {/* 1. DISCREET FLOATING LAUNCHER BUTTON (Bottom Right - Positioned above third-party badges) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          id="btn-open-chat-assistant"
          aria-label="Deschide Asistentul Metodist & Căutare Edu"
          className="no-print fixed bottom-20 sm:bottom-24 right-6 z-[9999] btn-interaction group flex items-center gap-2.5 px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-[#14B8A6]"
          title="Asistent Metodist & Căutare Web cu Google Search"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Asistent Metodist</span>
              <span className="text-[10px] bg-[#115E59] px-1.5 py-0.2 rounded text-emerald-200">
                Google Search
              </span>
            </div>
            <p className="text-[10px] text-teal-100 font-normal">Întreabă metodistul • Legislație 2026-2027</p>
          </div>
        </button>
      )}

      {/* 2. CHAT DRAWER / MODAL INTERFACE */}
      {isOpen && (
        <div className="no-print fixed inset-0 z-[9999] flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity animate-appear-smooth">
          <div
            id="chat-assistant-drawer"
            className="w-full sm:w-[460px] md:w-[500px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 relative"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-800">
                        Asistent Metodist EduMentor
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Globe className="w-2.5 h-2.5 text-emerald-600" />
                        Search Activ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Consilier didactic & legislație MEC • autor prof. Adrian Podar
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleClear}
                    id="btn-clear-chat-history"
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Resetează conversația"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    id="btn-close-chat-assistant"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Închide panoul"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Task Mode Selector: Fast, General (Search), Complex */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setTaskType("fast")}
                  className={`flex-1 py-1 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    taskType === "fast"
                      ? "bg-amber-50 text-amber-800 font-bold shadow-2xs border border-amber-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Răspunsuri ultra-rapide (gemini-3.1-flash-lite)"
                >
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Rapid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskType("general")}
                  className={`flex-1 py-1 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    taskType === "general"
                      ? "bg-[#F0FDFA] text-[#0D9488] font-bold shadow-2xs border border-[#99F6E4]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="General cu căutare Google la zi (gemini-3.5-flash)"
                >
                  <Globe className="w-3 h-3 text-[#0D9488]" />
                  <span>General + Căutare</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskType("complex")}
                  className={`flex-1 py-1 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    taskType === "complex"
                      ? "bg-purple-50 text-purple-800 font-bold shadow-2xs border border-purple-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Analiză curriculară aprofundată (gemini-3.1-pro-preview)"
                >
                  <Brain className="w-3 h-3 text-purple-600" />
                  <span>Complex</span>
                </button>
              </div>
            </div>

            {/* Scrollable Thread of Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAF9]">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser ? "bg-slate-700 text-white" : "bg-[#0D9488] text-white"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[85%] space-y-2`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? "bg-[#0D9488] text-white rounded-tr-none shadow-xs font-medium"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs font-normal"
                        }`}
                      >
                        {/* Fișiere atașate în mesajul utilizatorului */}
                        {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {msg.attachedFiles.map((file, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                  isUser
                                    ? "bg-[#0F766E] text-teal-50 border-[#14B8A6]"
                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                }`}
                              >
                                {getFileIcon(file.name, file.type)}
                                <span className="max-w-[120px] truncate">{file.name}</span>
                                <span className="opacity-75 text-[9.5px]">({formatFileSize(file.size)})</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="markdown-body font-academic overflow-x-auto text-xs sm:text-[13px]">
                          <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                        </div>

                        {/* Verified Grounding Sources (from Google Search) */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                              <Search className="w-3 h-3 text-[#0D9488]" />
                              <span>Surse verificate pe web (Google Search):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src, i) => (
                                <a
                                  key={i}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 bg-slate-50 hover:bg-[#F0FDFA] text-slate-700 hover:text-[#0D9488] rounded-md border border-slate-200 hover:border-[#99F6E4] transition-colors"
                                  title={src.title}
                                >
                                  <span className="truncate max-w-[150px]">{src.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message footer with timestamp, model, copy */}
                      <div
                        className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.modelUsed && (
                          <>
                            <span>•</span>
                            <span className="text-[9.5px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                              {msg.modelUsed}
                            </span>
                          </>
                        )}
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                            title="Copiază răspunsul"
                          >
                            {copiedId === msg.id ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Copiat
                              </span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-2xs flex items-center space-x-2 text-xs text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0D9488]" />
                    <span>
                      {taskType === "general"
                        ? "Consult sursele oficiale via Google Search..."
                        : taskType === "complex"
                        ? "Realizez sinteza metodică avansată..."
                        : "Generez răspunsul rapid..."}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick suggestions when conversation has just the greeting */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sugestii rapide de întrebări:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="text-left text-xs text-slate-700 bg-white hover:bg-[#F0FDFA] hover:text-[#0D9488] border border-slate-200 hover:border-[#99F6E4] p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D9488] shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form with Attachment Support */}
            <div className="p-3 bg-white border-t border-slate-200">
              {/* Fișiere atașate în așteptarea trimiterii */}
              {attachedFiles.length > 0 && (
                <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-[#0D9488]" />
                    Atașate ({attachedFiles.length}):
                  </span>
                  {attachedFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-xs font-medium rounded-lg shadow-2xs"
                    >
                      {getFileIcon(file.name, file.type)}
                      <span className="max-w-[120px] truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[9.5px] text-slate-400">({formatFileSize(file.size)})</span>
                      <button
                        type="button"
                        onClick={() => removeAttachedFile(idx)}
                        className="hover:text-rose-600 p-0.5 rounded-full cursor-pointer ml-0.5"
                        title="Elimină fișierul"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                {/* Buton Atașare Fișiere (PDF, DOCX, Imagini) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  id="btn-attach-modal-chat"
                  title="Atașează documente sau imagini (PDF, DOCX, Imagini)"
                  className="btn-interaction p-2.5 bg-slate-50 hover:bg-[#F0FDFA] text-slate-600 hover:text-[#0D9488] border border-slate-200 hover:border-[#0D9488] rounded-xl text-xs font-medium transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 text-[#0D9488]" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={
                    attachedFiles.length > 0
                      ? "Adaugă detalii despre fișierele atașate sau apasă Trimite..."
                      : taskType === "general"
                      ? "Întreabă despre structură, conținuturi, atașează fișiere sau legislație..."
                      : "Scrie mesajul tău pentru asistentul metodist..."
                  }
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all"
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                  id="btn-send-chat-message"
                  className="btn-interaction px-3.5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Conectat la Google Search & suport fișiere (PDF, DOCX, imagini)</span>
                <span>EduMentor • Anul 2026-2027</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
