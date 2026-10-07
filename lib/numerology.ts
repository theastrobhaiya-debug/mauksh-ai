// lib/numerology.ts

export type NumerologyProfile = {
  name: string;
  dob: string;
  mulank: number;
  bhagyank: number;
  nameNumber: number;
  favourableNumber: number;
  grid: Record<string, number>;
};

// Mauksh / Vedic Numerology Grid
//
// 3 | 1 | 9
// ---------
// 6 | 7 | 5
// ---------
// 2 | 8 | 4
export const GRID = [
  ["3", "1", "9"],
  ["6", "7", "5"],
  ["2", "8", "4"],
];

/**
 * Reduce a number to a single digit.
 *
 * Examples:
 * 19 → 1
 * 28 → 1
 * 41 → 5
 * 27 → 9
 */
export function reduceNumber(n: number): number {
  n = Math.abs(Math.trunc(n));

  if (n === 0) {
    return 0;
  }

  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return n;
}

/**
 * Parse DOB.
 *
 * Mauksh display format:
 * DD-MM-YYYY
 *
 * HTML <input type="date"> format:
 * YYYY-MM-DD
 *
 * We support BOTH so the frontend doesn't break.
 */
function parseDOB(dob: string): {
  day: number;
  month: number;
  year: number;
} {
  const value = dob.trim();

  let day: number;
  let month: number;
  let year: number;

  // --------------------------------------------------
  // DD-MM-YYYY
  // --------------------------------------------------

  let match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (match) {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  } else {
    // --------------------------------------------------
    // YYYY-MM-DD
    //
    // HTML date inputs return this format.
    // --------------------------------------------------

    match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
      throw new Error(
        "Invalid date of birth. Please use DD-MM-YYYY."
      );
    }

    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }

  // --------------------------------------------------
  // Validate date
  // --------------------------------------------------

  if (!Number.isInteger(year)) {
    throw new Error("Invalid birth year.");
  }

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
 * Mauksh rule:
 * ONLY the day of birth is used.
 *
 * Examples:
 *
 * 01 → 1
 * 10 → 1
 * 19 → 1
 * 28 → 1
 *
 * 02 → 2
 * 11 → 2
 * 20 → 2
 * 29 → 2
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
 * Mauksh rule:
 * Use the COMPLETE date of birth.
 *
 * Century digits ARE included.
 *
 * Example:
 *
 * 27-08-1995
 *
 * 2 + 7 + 0 + 8 + 1 + 9 + 9 + 5
 * = 41
 * = 5
 */
export function bhagyank(dob: string): number {
  const { day, month, year } = parseDOB(dob);

  const digits =
    day.toString().padStart(2, "0") +
    month.toString().padStart(2, "0") +
    year.toString();

  const total = digits
    .split("")
    .reduce(
      (sum, digit) => sum + Number(digit),
      0
    );

  return reduceNumber(total);
}

/**
 * Chaldean-style Name Number mapping.
 *
 * 1 = A I J Q Y
 * 2 = B K R
 * 3 = C G L S
 * 4 = D M T
 * 5 = E H N X
 * 6 = U V W
 * 7 = O Z
 * 8 = F P
 *
 * 9 is not assigned to letters.
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

/**
 * Calculate Name Number.
 */
export function nameNumber(name: string): number {
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const total = cleanName
    .split("")
    .reduce(
      (sum, char) =>
        sum + (NAME_VALUES[char] ?? 0),
      0
    );

  return reduceNumber(total);
}

/**
 * VEDIC NUMEROLOGY GRID
 *
 * Mauksh rule:
 *
 * 1. Take DD from DOB
 * 2. Take last two digits of YYYY
 * 3. Ignore century digits
 * 4. Ignore zero
 *
 * Example:
 *
 * DOB = 27-08-1995
 *
 * Used digits:
 *
 * 27 + 95
 *
 * = 2, 7, 9, 5
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

  const dayDigits = day
    .toString()
    .padStart(2, "0");

  const yearLastTwo = (year % 100)
    .toString()
    .padStart(2, "0");

  // DD + last two digits of YYYY
  const usableDigits =
    `${dayDigits}${yearLastTwo}`;

  for (const digit of usableDigits) {
    // Zero is ignored
    if (digit === "0") {
      continue;
    }

    if (counts[digit] !== undefined) {
      counts[digit]++;
    }
  }

  return counts;
}

/**
 * Calculate complete Mauksh Numerology Profile.
 */
export function calculateProfile(
  name: string,
  dob: string
): NumerologyProfile {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Please enter your full name.");
  }

  // Validate DOB
  parseDOB(dob);

  const m = mulank(dob);
  const b = bhagyank(dob);
  const n = nameNumber(cleanName);
  const grid = buildGrid(dob);

  return {
    name: cleanName,
    dob,

    // Birth day only
    mulank: m,

    // Complete DOB
    bhagyank: b,

    // Name calculation
    nameNumber: n,

    // Current Mauksh rule
    favourableNumber: m,

    // Vedic grid
    grid,
  };
}
