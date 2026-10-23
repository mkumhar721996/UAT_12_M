export type Preset = "week" | "month" | "year";

/** Inclusive range of local ISO dates (YYYY-MM-DD), compared as strings. */
export interface DateRange {
  from: string;
  to: string;
}

export type RangeResult = { ok: true; range: DateRange } | { ok: false; message: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => String(n).padStart(2, "0");

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

function toIso(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function presetRange(preset: Preset, today: string): DateRange {
  const [y, m, d] = parts(today);
  if (preset === "year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  if (preset === "month") {
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(lastDay)}` };
  }
  const day = new Date(Date.UTC(y, m - 1, d));
  const sinceMonday = (day.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(y, m - 1, d - sinceMonday));
  const sunday = new Date(Date.UTC(y, m - 1, d - sinceMonday + 6));
  return { from: toIso(monday), to: toIso(sunday) };
}

export function validateCustomRange(from: string, to: string): RangeResult {
  if (!from || !to) return { ok: false, message: "Enter both a from date and a to date." };
  if (from > to) return { ok: false, message: "From date must be on or before the to date." };
  return { ok: true, range: { from, to } };
}

export function formatDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatRange(r: DateRange): string {
  return `${formatDate(r.from)} to ${formatDate(r.to)}`;
}
