/** Maximum characters shown before truncation notice is appended. */
export const JSON_DISPLAY_MAX_LENGTH = 65_536;

/** Removes C0 control chars except tab, LF, CR (safe for plain-text display). */
function stripControlCharacters(value: string): string {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isAllowed = code === 9 || code === 10 || code === 13;
    const isControl = (code >= 0 && code <= 8) || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;
    if (!isControl || isAllowed) {
      result += value[i];
    }
  }
  return result;
}

export interface FormatDisplayValueResult {
  text: string;
  truncated: boolean;
  isJson: boolean;
}

/**
 * Sanitizes and prettifies a raw string for safe plain-text display.
 * Never returns HTML; output is intended for textContent / interpolation only.
 */
export function formatDisplayValue(raw: string | null | undefined): FormatDisplayValueResult {
  if (raw == null || raw === '') {
    return { text: '—', truncated: false, isJson: false };
  }

  const sanitized = stripControlCharacters(raw);
  const trimmed = sanitized.trim();

  let display = trimmed;
  let isJson = false;

  if (looksLikeJson(trimmed)) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      display = JSON.stringify(parsed, null, 2);
      isJson = true;
    } catch {
      display = trimmed;
    }
  }

  let truncated = false;
  if (display.length > JSON_DISPLAY_MAX_LENGTH) {
    display = display.slice(0, JSON_DISPLAY_MAX_LENGTH);
    truncated = true;
  }

  if (truncated) {
    display += '\n\n… (truncated for display)';
  }

  return { text: display, truncated, isJson };
}

export function looksLikeJson(value: string): boolean {
  const t = value.trim();
  return (
    (t.startsWith('{') && t.endsWith('}')) ||
    (t.startsWith('[') && t.endsWith(']'))
  );
}
