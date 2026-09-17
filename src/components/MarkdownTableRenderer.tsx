import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  Table as TableIcon,
} from "lucide-react";
import { copyTableToClipboard } from "../utils/fileHelpers";

interface MarkdownTableRendererProps {
  content: string;
  title?: string;
}

export const MarkdownTableRenderer: React.FC<MarkdownTableRendererProps> = ({
  content,
  title = "Document Pedagogic Generat",
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedWord, setCopiedWord] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWordTable = () => {
    const container = document.getElementById("plan-table-content");
    copyTableToClipboard(content, container?.innerHTML);
    setCopiedWord(true);
    setTimeout(() => setCopiedWord(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin: 15mm; color: #000; line-height: 1.35; }
            h1, h2, h3, h4 { margin: 14px 0 6px 0; color: #000; }
            h1, h2 { text-align: center; }
            p { margin: 4px 0; }
            ul, ol { margin: 4px 0 10px 20px; }
            li { margin-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 14px; font-size: 10pt; }
            th, td { border: 1px solid #000; padding: 5px 7px; vertical-align: top; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
            .special-week { font-weight: bold; background-color: #fcf8e3; }
            @page { size: landscape; margin: 12mm; }
          </style>
        </head>
        <body>
          <div>${document.getElementById("plan-table-content")?.innerHTML || content}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.35; }
        h1, h2, h3, h4 { margin: 14px 0 6px 0; color: #000; font-weight: bold; }
        h1, h2 { text-align: center; }
        p { margin: 4px 0; }
        ul, ol { margin: 4px 0 10px 20px; }
        li { margin-bottom: 3px; }
        table { border-collapse: collapse; width: 100%; font-size: 10pt; margin-top: 14px; margin-bottom: 14px; }
        th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
        th { background: #f2f2f2; font-weight: bold; text-align: center; }
      </style>
      </head>
      <body>
        ${document.getElementById("plan-table-content")?.innerHTML || content}
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_2026_2027.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Top Action Bar */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <TableIcon className="w-4 h-4 text-indigo-600" />
          <span>Tabel Metodic Structurat (WebView)</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleCopyWordTable}
            id="btn-copy-word"
            type="button"
            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs"
            title="Copiază formatat pentru lipire directă în Word/Excel"
          >
            {copiedWord ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copiat în Word!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                <span>Copiază pt. Word/Excel</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyMarkdown}
            type="button"
            className="inline-flex items-center px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs"
            title="Copiază codul Markdown brut"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          <button
            onClick={handleDownloadWord}
            type="button"
            className="inline-flex items-center px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs"
            title="Descarcă document Word (.doc)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline ml-1">.doc</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs"
            title="Printează sau salvează ca PDF landscape"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline ml-1">Print/PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Table Content */}
      <div
        id="plan-table-content"
        className="p-4 sm:p-5 overflow-x-auto text-xs text-slate-800 leading-relaxed max-w-full"
      >
        <div className="prose prose-slate max-w-none prose-table:border-collapse prose-th:bg-slate-100/90 prose-th:border prose-th:border-slate-300 prose-th:p-2.5 prose-th:text-[11px] prose-th:font-bold prose-th:text-slate-900 prose-td:border prose-td:border-slate-300 prose-td:p-2 prose-td:text-[11px] prose-td:align-top prose-tr:hover:bg-slate-50/60">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    </div>
  );
};
