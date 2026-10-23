import { useSyncExternalStore } from "react";
import type { ExpenseStore } from "./expenseStore";
import { formatDate } from "./period";
import { formatMoney } from "./summary";

function ExpenseList({ store }: { store: ExpenseStore }) {
  const expenses = useSyncExternalStore(store.subscribe, store.list);
  const newestFirst = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
      <div className="flex items-center justify-between gap-space-3">
        <h1 className="m-0 text-xl font-semibold">Expenses</h1>
        <a href="#expenses/new" className="btn btn-primary no-underline">
          Add expense
        </a>
      </div>
      {newestFirst.length === 0 ? (
        <p className="m-0 text-fg-muted">No expenses recorded</p>
      ) : (
        <ul className="m-0 list-none overflow-hidden rounded-lg border border-border p-0">
          {newestFirst.map((x) => (
            <li key={x.id} className="border-b border-border last:border-b-0">
              <a
                href={`#expenses/${x.id}`}
                className="flex min-h-[44px] items-center justify-between gap-space-4 px-space-4 py-space-3 text-fg no-underline hover:bg-surface"
              >
                <span className="font-semibold">{x.category}</span>
                <span className="text-fg-muted">{formatDate(x.date)}</span>
                <span className="font-semibold tabular-nums">{formatMoney(x.cents)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default ExpenseList;
