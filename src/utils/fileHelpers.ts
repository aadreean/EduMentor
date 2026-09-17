import { FilePayload } from "../types";

export async function processUploadedFile(file: File): Promise<FilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      reader.onload = () => {
        const result = reader.result as string;
        // Data URL format: "data:application/pdf;base64,....."
        const base64Data = result.split(",")[1] || "";
        resolve({
          name: file.name,
          size: file.size,
          type: "application/pdf",
          data: base64Data,
          textSnippet: `Fișier PDF: ${file.name} (${Math.round(file.size / 1024)} KB)`,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    } else {
      // For text files, markdown, doc, csv
      reader.onload = () => {
        const textContent = reader.result as string;
        // Also get base64 for backup
        const base64 = btoa(unescape(encodeURIComponent(textContent)));
        resolve({
          name: file.name,
          size: file.size,
          type: file.type || "text/plain",
          data: base64,
          textSnippet: textContent.slice(0, 1000),
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    }
  });
}

export function copyTableToClipboard(markdown: string, renderedHtml?: string) {
  let html = "";

  if (renderedHtml && renderedHtml.trim()) {
    html = `<div style="font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; color: #000; line-height: 1.4;">
      <style>
        table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 10pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
        h1, h2, h3, h4 { color: #000; margin-top: 16px; margin-bottom: 8px; font-weight: bold; }
        ul, ol { margin: 6px 0 12px 24px; }
        li { margin-bottom: 4px; }
        p { margin: 4px 0; }
        strong { font-weight: bold; }
      </style>
      ${renderedHtml}
    </div>`;
  } else {
    // Fallback: parse markdown into formatted HTML (including technical header and table)
    const lines = markdown.split("\n");
    const tableLines = lines.filter((l) => l.trim().startsWith("|"));

    html = `<div style="font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; color: #000; line-height: 1.4;">`;

    // Parse any pre-table content (like the official Technical Header)
    let preTableLines: string[] = [];
    for (const line of lines) {
      if (line.trim().startsWith("|")) break;
      if (line.trim().length > 0) preTableLines.push(line);
    }

    if (preTableLines.length > 0) {
      html += `<div style="margin-bottom: 20px;">`;
      for (const pLine of preTableLines) {
        if (pLine.includes("**[") && pLine.includes("]**")) {
          const cleanTitle = pLine.replace(/\*\*/g, "").trim();
          html += `<h2 style="text-align: center; font-size: 14pt; margin: 18px 0 12px 0; text-transform: uppercase;">${cleanTitle}</h2>`;
        } else {
          let formattedLine = pLine
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\s{4,}/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
          html += `<div style="margin: 3px 0;">${formattedLine}</div>`;
        }
      }
      html += `</div>`;
    }

    if (tableLines.length >= 2) {
      const headers = tableLines[0]
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const rows = tableLines
        .slice(2)
        .map((line) =>
          line
            .split("|")
            .map((s) => s.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        )
        .filter((cols) => cols.length > 0);

      html += `<table border="1" style="border-collapse:collapse; font-family:'Times New Roman',Arial,sans-serif; width:100%; font-size: 10pt; margin-top: 10px;"><thead><tr style="background:#f1f5f9;">`;
      headers.forEach((h) => {
        html += `<th style="padding:7px; border:1px solid #000; background-color: #f2f2f2; font-weight: bold; text-align: left;">${h}</th>`;
      });
      html += `</tr></thead><tbody>`;
      rows.forEach((r) => {
        html += `<tr>`;
        r.forEach((cell) => {
          html += `<td style="padding:6px 8px; border:1px solid #000; vertical-align: top;">${cell}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody></table>`;
    }

    html += `</div>`;
  }

  if (navigator.clipboard && window.ClipboardItem) {
    const textBlob = new Blob([markdown], { type: "text/plain" });
    const htmlBlob = new Blob([html], { type: "text/html" });
    navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": textBlob,
        "text/html": htmlBlob,
      }),
    ]);
    return;
  }

  navigator.clipboard.writeText(markdown);
}

export async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64Data);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function extractTextSnippet(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      resolve(`Fișier PDF atașat: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const textContent = (reader.result as string) || "";
      resolve(textContent.slice(0, 1500));
    };
    reader.onerror = () => {
      resolve(`Fișier atașat: ${file.name}`);
    };
    reader.readAsText(file);
  });
}

export function exportWordDocument(filename: string, content: string, title: string = "Document Didactic") {
  const htmlDoc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', Cambria, Georgia, serif; font-size: 11pt; color: #000; line-height: 1.4; }
        h1, h2, h3 { text-align: center; margin: 16px 0 10px 0; font-weight: bold; }
        p { margin: 4px 0; }
        table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 10pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
        ul, ol { margin: 4px 0 10px 20px; }
        li { margin-bottom: 3px; }
      </style>
    </head>
    <body>
      ${content}
      <div style="margin-top: 24px; border-top: 1px solid #ccc; padding-top: 6px; font-size: 8.5pt; color: #666; text-align: right; font-family: Arial, sans-serif;">
        Document generat cu EduMetodist România (2026-2027) • by profesor Adrian Podar
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", htmlDoc], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

