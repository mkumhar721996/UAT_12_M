import { CATEGORIES, type Category } from "./categories";
import type { Expense } from "./expenseStore";
import type { DateRange } from "./period";

/** All amounts are integer cents. */
export interface Summary {
  byCategory: Record<Category, number>;
  overall: number;
}

export function summarise(expenses: Expense[], range: DateRange): Summary {
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  let overall = 0;
  for (const x of expenses) {
    if (x.date < range.from || x.date > range.to) continue;
    byCategory[x.category] += x.cents;
    overall += x.cents;
  }
  return { byCategory, overall };
}

export function formatMoney(cents: number): string {
  const whole = Math.trunc(cents / 100);
  return `${whole}.${String(Math.abs(cents) % 100).padStart(2, "0")}`;
}

export function sharePercent(part: number, overall: number): number {
  return overall === 0 ? 0 : Math.round((part / overall) * 100);
}
