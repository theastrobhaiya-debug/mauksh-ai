export type NumerologyProfile = {
  name: string;
  dob: string;
  mulank: number;
  bhagyank: number;
  nameNumber: number;
  favourableNumber: number;
  grid: Record<string, number>;
};

export const GRID = [
  ["3", "1", "9"],
  ["6", "7", "5"],
  ["2", "8", "4"],
];

export function reduceNumber(n: number): number {
  n = Math.abs(Math.trunc(n));

  if (n === 0) return 0;

  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return n;
}

/**
 * Mauksh DOB format:
 * DD-MM-YYYY
 */
function parseDOB(dob: string): {
  day: number;
  month: number;
  year: number;
} {
  const match = dob.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (!match) {
    throw new Error("DOB must be in DD-MM-YYYY format.");
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) {
    throw new Error("Invalid birth month.");
  }

  if (day < 1 || day > 31) {
    throw new Error("Invalid birth day.");
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("Invalid date of birth.");
  }

  return {
    day,
    month,
    year,
  };
}

/**
 * MULANK
 *
 * Only the birth DAY is used.
 *
 * 1  → 1
 * 10 → 1
 * 19 → 1
 * 28 → 1
 *
 * 27 → 9
 */
export function mulank(dob: string): number {
  const { day } = parseDOB(dob);

  return reduceNumber(day);
}

/**
 * BHAGYANK
 *
 * Complete DOB is used.
 * Century digits ARE included.
 *
 * Example:
 * 27-08-1995
 *
 * 2+7+0+8+1+9+9+5 = 41
 * 4+1 = 5
 */
export function bhagyank(dob: string): number {
  const { day, month, year } = parseDOB(dob);

  const digits = `${day
    .toString()
    .padStart(2, "0")}${month
    .toString()
    .padStart(2, "0")}${year}`;

  const total = digits
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);

  return reduceNumber(total);
}

/**
 * Chaldean-style name mapping.
 */
const NAME_VALUES: Record<string, number> = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,

  B: 2,
  K: 2,
  R: 2,

  C: 3,
  G: 3,
  L: 3,
  S: 3,

  D: 4,
  M: 4,
  T: 4,

  E: 5,
  H: 5,
  N: 5,
  X: 5,

  U: 6,
  V: 6,
  W: 6,

  O: 7,
  Z: 7,

  F: 8,
  P: 8,
};

export function nameNumber(name: string): number {
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const total = cleanName
    .split("")
    .reduce(
      (sum, char) => sum + (NAME_VALUES[char] ?? 0),
      0
    );

  return reduceNumber(total);
}

/**
 * VEDIC NUMEROLOGY GRID
 *
 * Mauksh grid:
 *
 * 3 | 1 | 9
 * ---------
 * 6 | 7 | 5
 * ---------
 * 2 | 8 | 4
 *
 * Uses:
 * DD + last two digits of YYYY
 *
 * Does NOT use:
 * century digits
 * zero
 */
export function buildGrid(
  dob: string
): Record<string, number> {
  const { day, year } = parseDOB(dob);

  const counts: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
  };

  const dayDigits = day.toString().padStart(2, "0");
  const yearLastTwo = (year % 100)
    .toString()
    .padStart(2, "0");

  // DD + last two digits of YYYY
  const usableDigits = `${dayDigits}${yearLastTwo}`;

  for (const digit of usableDigits) {
    if (digit === "0") continue;

    if (counts[digit] !== undefined) {
      counts[digit]++;
    }
  }

  return counts;
}

/**
 * COMPLETE MAUKSH NUMEROLOGY PROFILE
 */
export function calculateProfile(
  name: string,
  dob: string
): NumerologyProfile {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Name is required.");
  }

  // Validate DD-MM-YYYY
  parseDOB(dob);

  const m = mulank(dob);
  const b = bhagyank(dob);

  return {
    name: cleanName,
    dob,
    mulank: m,
    bhagyank: b,
    nameNumber: nameNumber(cleanName),
    favourableNumber: m,
    grid: buildGrid(dob),
  };
}
