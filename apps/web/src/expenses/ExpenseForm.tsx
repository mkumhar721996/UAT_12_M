import { useRef, useState, type FormEvent } from "react";
import { AlertIcon } from "../dashboard/icons";
import { CATEGORIES, type Category } from "./categories";
import type { Expense, ExpenseStore } from "./expenseStore";
import { parseCents } from "./summary";

interface ExpenseFormProps {
  store: ExpenseStore;
  today: () => string;
  onSaved?: (e: Expense) => void;
}

type FormError = { field: "amount" | "category"; message: string };

function ExpenseForm({ store, today, onSaved }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<Category | "">("");
  const [error, setError] = useState<FormError | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const fail = (next: FormError, ref: { current: HTMLElement | null }) => {
    setError(next);
    ref.current?.focus();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cents = parseCents(amount);
    if (cents === null || cents <= 0) {
      fail({ field: "amount", message: "Enter an amount greater than 0.00." }, amountRef);
      return;
    }
    if (category === "") {
      fail({ field: "category", message: "Choose a category before saving." }, categoryRef);
      return;
    }
    const saved = store.add({ category, cents, date });
    setError(null);
    setAmount("");
    setCategory("");
    onSaved?.(saved);
  };

  const errorFor = (field: FormError["field"]) => (error?.field === field ? error : null);
  const invalid = (field: FormError["field"]) => (errorFor(field) ? "border-danger" : "");
  const message = (field: FormError["field"], id: string) => {
    const e = errorFor(field);
    return e ? (
      <div id={id} role="alert" className="flex items-center gap-space-1 text-sm text-danger">
        <AlertIcon />
        <span>{e.message}</span>
      </div>
    ) : null;
  };

  return (
    <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
      <h1 className="m-0 text-xl font-semibold">Add expense</h1>
      <form noValidate onSubmit={handleSubmit} className="flex max-w-[420px] flex-col gap-space-4">
        <div className="field">
          <label htmlFor="expense-amount">Amount</label>
          <input
            ref={amountRef}
            id="expense-amount"
            className={`input ${invalid("amount")}`}
            inputMode="decimal"
            value={amount}
            aria-invalid={errorFor("amount") ? true : undefined}
            aria-describedby={errorFor("amount") ? "expense-amount-error" : undefined}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error?.field === "amount") setError(null);
            }}
          />
          {message("amount", "expense-amount-error")}
        </div>
        <div className="field">
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="expense-category">Category</label>
          <select
            ref={categoryRef}
            id="expense-category"
            className={`select ${invalid("category")}`}
            value={category}
            aria-invalid={errorFor("category") ? true : undefined}
            aria-describedby={errorFor("category") ? "expense-category-error" : undefined}
            onChange={(e) => {
              setCategory(e.target.value as Category | "");
              if (error?.field === "category") setError(null);
            }}
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {message("category", "expense-category-error")}
        </div>
        <div className="flex justify-end gap-space-3">
          <a href="#summary" className="btn btn-secondary no-underline">
            Cancel
          </a>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </main>
  );
}

export default ExpenseForm;
