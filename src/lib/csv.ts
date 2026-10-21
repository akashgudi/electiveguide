export type CsvValue = string | number | boolean | null | undefined;

function formatField(value: CsvValue): string {
  if (value == null) return "";
  let text = String(value);
  // Reviews are user-submitted and the file gets opened in Excel/Sheets, so a
  // leading = + - @ (or tab/CR) would run as a formula. A leading ' keeps it text.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds a CSV string, with a UTF-8 BOM so Excel reads non-ASCII characters correctly. */
export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(formatField).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
