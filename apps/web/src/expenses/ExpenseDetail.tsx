import { useState, useSyncExternalStore } from "react";
import { CATEGORIES, type Category } from "./categories";
import type { ExpenseStore } from "./expenseStore";
import { formatDate } from "./period";
import { formatMoney, parseCents } from "./summary";

interface ExpenseDetailProps {
  store: ExpenseStore;
  id: string;
  /** Called after the expense is deleted. */
  onDone: () => void;
}

function ExpenseDetail({ store, id, onDone }: ExpenseDetailProps) {
  const expenses = useSyncExternalStore(store.subscribe, store.list);
  const expense = expenses.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [error, setError] = useState<string | null>(null);

  if (!expense) {
    return (
      <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
        <h1 className="m-0 text-xl font-semibold">Expense</h1>
        <p className="m-0 text-fg-muted">Expense not found.</p>
      </main>
    );
  }

  const startEdit = () => {
    setAmount(formatMoney(expense.cents));
    setDate(expense.date);
    setCategory(expense.category);
    setError(null);
    setEditing(true);
  };

  const save = () => {
    const cents = parseCents(amount);
    if (cents === null || cents <= 0) {
      setError("Enter an amount greater than 0.00.");
      return;
    }
    store.update(expense.id, { cents, date, category });
    setEditing(false);
  };

  return (
    <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
      <h1 className="m-0 text-xl font-semibold">Expense</h1>
      {editing ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex max-w-[420px] flex-col gap-space-4"
        >
          <div className="field">
            <label htmlFor="edit-amount">Amount</label>
            <input
              id="edit-amount"
              className="input"
              inputMode="decimal"
              value={amount}
              aria-invalid={error ? true : undefined}
              onChange={(e) => setAmount(e.target.value)}
            />
            {error ? (
              <div role="alert" className="text-sm text-danger">
                {error}
              </div>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="edit-date">Date</label>
            <input
              id="edit-date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-category">Category</label>
            <select
              id="edit-category"
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-space-3">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="m-0 grid max-w-[420px] grid-cols-[140px_1fr] gap-x-space-4 gap-y-space-3">
            <dt className="text-fg-muted">Amount</dt>
            <dd className="m-0 font-semibold tabular-nums">{formatMoney(expense.cents)}</dd>
            <dt className="text-fg-muted">Date</dt>
            <dd className="m-0 font-semibold tabular-nums">{formatDate(expense.date)}</dd>
            <dt className="text-fg-muted">Category</dt>
            <dd className="m-0">
              <span
                data-category-badge
                className="inline-block rounded-sm border border-border bg-surface px-space-3 py-space-1 text-sm font-semibold"
              >
                {expense.category}
              </span>
            </dd>
          </dl>
          <div className="flex items-center gap-space-3">
            <button type="button" className="btn btn-secondary" onClick={startEdit}>
              Edit
            </button>
            <button
              type="button"
              className="btn bg-transparent text-danger"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          </div>
        </>
      )}

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed left-1/2 top-space-6 z-30 w-[min(420px,calc(100vw-24px))] -translate-x-1/2 rounded-lg border border-border bg-bg p-space-5"
        >
          <h2 id="delete-title" className="m-0 mb-space-2 text-lg font-semibold">
            Delete this expense?
          </h2>
          <p className="text-fg-muted">
            The expense is removed and category and overall totals drop by its amount.
          </p>
          <div className="flex justify-end gap-space-3">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                store.remove(expense.id);
                onDone();
              }}
            >
              Delete expense
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default ExpenseDetail;
