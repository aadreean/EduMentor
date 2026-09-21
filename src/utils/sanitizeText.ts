/**
 * Curăță și normalizează etichetele HTML din textul generat de AI.
 * - Transformă etichetele <br>, <br/>, <br /> în pauze de rând reale Markdown în afara tabelelor.
 * - În celulele de tabel Markdown GFM (| col |), normalizează la <br /> valid pentru a nu sparge rândul de tabel.
 * - Elimină etichete accidentale precum <p>, </p>, <span>, <div> etc.
 */
export function sanitizeHtmlTags(content: string): string {
  if (!content) return "";

  const lines = content.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableRow) {
      // În celulele de tabel Markdown, păstrăm <br /> standard pentru a păstra rândul integru
      return line.replace(/<br\s*\/?>/gi, "<br />");
    } else {
      // În afara tabelelor, transformăm <br> direct în pauză de rând reală Markdown
      return line.replace(/<br\s*\/?>/gi, "  \n");
    }
  });

  let sanitized = processedLines.join("\n");

  // Curățare etichete accidentale de paragraf/container generate uneori de LLM
  sanitized = sanitized
    .replace(/<p>/gi, "\n\n")
    .replace(/<\/p>/gi, "")
    .replace(/<\/?(span|div|font)[^>]*>/gi, "");

  return sanitized;
}
