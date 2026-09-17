export type DocumentType =
  | "Planificare anuală"
  | "Planificare pe unitate"
  | "Schiță de lecție";

export interface FilePayload {
  name: string;
  size: number;
  type: string;
  data: string; // base64 without prefix if sent to gemini, or raw data
  textSnippet?: string;
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
