/**
 * Minimal CSV writer for admin exports. Quotes every field and neutralises
 * values that a spreadsheet would run as a formula (a cell starting with =, +,
 * - or @), since names are typed in by volunteers themselves. Plain phone
 * numbers ("+31 6 1234 5678") are left alone: digits, spaces, dashes and
 * brackets cannot form a formula, and the export is used to contact people.
 */
const PHONE_LIKE = /^\+?[\d\s()-]+$/;

const cell = (value: unknown) => {
  if (value === null || value === undefined) return '""';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !PHONE_LIKE.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const toCsv = (header: string[], rows: unknown[][]) =>
  [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
