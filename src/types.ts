export type DocumentType =
  | "Planificare anuală"
  | "Planificare pe unitate"
  | "Schiță de lecție"
  | "Planificare integrată (Primar)";

export interface FilePayload {
  name: string;
  size: number;
  type: string;
  data: string; // base64 without prefix if sent to gemini, or raw data
  textSnippet?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  searchQueries?: string[];
  modelUsed?: string;
  taskType?: "fast" | "general" | "complex";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    clasa?: string;
    oreSaptamana?: number;
    tipDocument?: DocumentType;
    hasTable?: boolean;
    hoursBreakdown?: ModuleCalculation[];
  };
}

export interface ModuleCalculation {
  moduleNumber: number;
  name: string;
  period: string;
  totalWeeks: number;
  effectiveWeeks: number; // excluding special weeks
  hoursPerWeek: number;
  teachingHours: number;
  specialEvents: string[];
}

export interface StandardTemplate {
  id: string;
  title: string;
  category: DocumentType;
  description: string;
  content: string;
  columns: string[];
}

export interface TechnicalHeaderData {
  unitateInvatamant: string;
  anScolar: string;
  disciplina: string;
  manualSuport: string;
  clasa: string;
  nrOreSaptamana: string;
  profesor: string;
  director: string;
  respCatedra: string;
  nrInregistrare?: string;
  vacantaFebruarie?: string;
  isComplete: boolean;
  // Detalii curriculare liceu:
  filiera?: string;
  profil?: string;
  specializare?: string;
}

/**
 * Formatează denumirea clasei cu detaliile curriculare de liceu:
 * ex: „Clasa a XI-a | Filiera teoretică, Profil umanist, Specializarea filologie”
 */
export function formatClasaHeader(
  clasa: string,
  headerData?: {
    filiera?: string;
    profil?: string;
    specializare?: string;
  }
): string {
  const parts: string[] = [];
  if (headerData?.filiera?.trim()) {
    parts.push(`Filiera ${headerData.filiera.trim().toLowerCase()}`);
  }
  if (headerData?.profil?.trim()) {
    parts.push(`Profil ${headerData.profil.trim().toLowerCase()}`);
  }
  if (headerData?.specializare?.trim()) {
    parts.push(`Specializarea ${headerData.specializare.trim().toLowerCase()}`);
  }

  const baseClasa = clasa?.trim() || "";
  if (parts.length > 0) {
    return `${baseClasa} | ${parts.join(", ")}`;
  }
  return baseClasa;
}

export interface SamplePack {
  id: string;
  name: string;
  disciplina: string;
  clasa: string;
  oreSaptamana: number;
  tipDocument: DocumentType;
  programaSnippet: string;
  suportSnippet: string;
  sablonSnippet: string;
}
