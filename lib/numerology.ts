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
  ["2", "8", "4"]
];

export function reduceNumber(n: number): number {
  if (n === 0) return 0;
  while (n > 9) {
    n = String(n).split("").reduce((a, d) => a + Number(d), 0);
  }
  return n;
}

export function mulank(dob: string): number {
  const digits = dob.replace(/\D/g, "");
  const day = Number(digits.slice(-8, -6));
  return reduceNumber(day);
}

export function bhagyank(dob: string): number {
  const digits = dob.replace(/\D/g, "");
  return reduceNumber(
    digits.split("").reduce((sum, d) => sum + Number(d), 0)
  );
}

// Chaldean-style name mapping commonly used in Indian numerology.
// This can be replaced by your exact Mauksh name-number mapping later.
const NAME_VALUES: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
  // 9 is normally not assigned to letters in this system.
};

export function nameNumber(name: string): number {
  const total = name
    .toUpperCase()
    .split("")
    .reduce((sum, char) => sum + (NAME_VALUES[char] || 0), 0);
  return reduceNumber(total);
}

export function buildGrid(dob: string): Record<string, number> {
  const digits = dob.replace(/\D/g, "");
  const counts: Record<string, number> = {
    "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
    "6": 0, "7": 0, "8": 0, "9": 0
  };

  // Mauksh rule: exclude century digits; keep DD + last two digits of YYYY.
  const clean = digits.length >= 8
    ? digits.slice(0, 2) + digits.slice(-2)
    : digits;

  for (const d of clean) {
    if (d !== "0" && counts[d] !== undefined) counts[d]++;
  }
  return counts;
}

export function calculateProfile(name: string, dob: string): NumerologyProfile {
  const m = mulank(dob);
  const b = bhagyank(dob);
  return {
    name,
    dob,
    mulank: m,
    bhagyank: b,
    nameNumber: nameNumber(name),
    favourableNumber: m,
    grid: buildGrid(dob)
  };
}