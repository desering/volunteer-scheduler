/**
 * Fills {name}-style placeholders in text that admins write in the admin
 * panel (email subjects and bodies). Unknown placeholders are left as they
 * are, so a typo shows up in the preview instead of silently vanishing.
 */
export const fillPlaceholders = (
  text: string,
  values: Record<string, string | number>,
) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

/** Splits admin-written text into paragraphs on blank lines. */
export const toParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
