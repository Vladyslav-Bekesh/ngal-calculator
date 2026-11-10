const MAX_DATE_DIGITS = 16;
const GROUP_SIZES = [2, 2, 4, 2, 2, 4] as const;
const EMPTY_SLOT = "х";

/** Повна маска з незаповненими позиціями. */
export const DATE_MASK_EMPTY = buildMaskedDate("");

export function extractDateDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, MAX_DATE_DIGITS);
}

export function buildMaskedDate(digits: string): string {
  const d = extractDateDigits(digits);
  let idx = 0;
  const segments: string[] = [];

  for (const size of GROUP_SIZES) {
    let part = "";
    for (let i = 0; i < size; i++) {
      part += idx < d.length ? d[idx++] : EMPTY_SLOT;
    }
    segments.push(part);
  }

  return `${segments[0]}.${segments[1]}.${segments[2]}-${segments[3]}.${segments[4]}.${segments[5]}`;
}

/** Значення з поля → лише цифри → знову повна маска. */
export function applyDateMask(raw: string): string {
  return buildMaskedDate(extractDateDigits(raw));
}
