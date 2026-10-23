import type { Category } from "./categories";

export interface Expense {
  id: string;
  userId: string;
  category: Category;
  /** Integer cents, to avoid float drift. */
  cents: number;
  /** Local ISO date, YYYY-MM-DD. */
  date: string;
}

export type ExpenseInput = Omit<Expense, "id" | "userId">;

export interface ExpenseStore {
  /** The current user's expenses only; the same reference until something changes. */
  list(): Expense[];
  add(e: ExpenseInput): Expense;
  update(id: string, patch: Partial<ExpenseInput>): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}

export function createMemoryExpenseStore(userId: string, seed: Expense[] = []): ExpenseStore {
  let expenses = seed.filter((x) => x.userId === userId);
  let nextId = 1;
  const listeners = new Set<() => void>();

  const commit = (next: Expense[]) => {
    expenses = next;
    listeners.forEach((l) => l());
  };

  return {
    list: () => expenses,
    add(input) {
      const created: Expense = { ...input, id: `exp-${nextId++}`, userId };
      commit([...expenses, created]);
      return created;
    },
    update(id, patch) {
      commit(expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    },
    remove(id) {
      commit(expenses.filter((x) => x.id !== id));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
