import { useRef, useState, useSyncExternalStore } from "react";
import { AlertIcon } from "../dashboard/icons";
import { CATEGORIES } from "./categories";
import type { Expense, ExpenseStore } from "./expenseStore";
import {
  formatRange,
  presetRange,
  todayIso,
  validateCustomRange,
  type DateRange,
  type Preset,
} from "./period";
import { formatMoney, sharePercent, summarise } from "./summary";

interface SummaryViewProps {
  store: ExpenseStore;
  today?: () => string;
}

type PeriodId = Preset | "custom";

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom" },
];

function SummaryView({ store, today = todayIso }: SummaryViewProps) {
  const expenses = useSyncExternalStore(store.subscribe, store.list);
  const [period, setPeriod] = useState<PeriodId>("month");
  const [draft, setDraft] = useState({ from: "", to: "" });
  const [applied, setApplied] = useState<{ from: string; to: string } | null>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const custom = applied && validateCustomRange(applied.from, applied.to);
  const range: DateRange | null =
    period !== "custom" ? presetRange(period, today()) : custom?.ok ? custom.range : null;
  const summary = range ? summarise(expenses, range) : null;
  const showError = period === "custom" && custom !== null && !custom.ok;

  const apply = () => {
    setApplied(draft);
    const badField = draft.from === "" || draft.from > draft.to ? fromRef : toRef;
    if (!validateCustomRange(draft.from, draft.to).ok) badField.current?.focus();
  };

  return (
    <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
      <h1 className="m-0 text-xl font-semibold">Summary</h1>
      <div
        role="tablist"
        aria-label="Period"
        className="inline-flex self-start overflow-hidden rounded-md border border-border"
      >
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`min-h-[44px] min-w-[64px] cursor-pointer border-0 border-r border-border px-space-4 font-semibold last:border-r-0 ${
              period === p.id ? "bg-primary text-primary-fg" : "bg-bg text-fg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" ? (
        <div className="flex flex-wrap items-end gap-space-3">
          <div className="field">
            <label htmlFor="range-from">From</label>
            <input
              ref={fromRef}
              id="range-from"
              type="date"
              className={`input ${showError ? "border-danger" : ""}`}
              value={draft.from}
              aria-invalid={showError ? true : undefined}
              aria-describedby={showError ? "range-error" : undefined}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="range-to">To</label>
            <input
              ref={toRef}
              id="range-to"
              type="date"
              className="input"
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={apply}>
            Apply
          </button>
        </div>
      ) : null}

      {custom && !custom.ok && showError ? (
        <div id="range-error" role="alert" className="flex items-center gap-space-1 text-sm text-danger">
          <AlertIcon />
          <span>{custom.message}</span>
        </div>
      ) : null}

      {range && summary ? (
        <>
          <p className="m-0 text-fg-muted">{formatRange(range)}</p>
          <div className="grid grid-cols-4 gap-space-3 max-[640px]:grid-cols-2">
            {CATEGORIES.map((c) => {
              const percent = sharePercent(summary.byCategory[c], summary.overall);
              const latest = expenses
                .filter((x) => x.category === c && x.date >= range.from && x.date <= range.to)
                .reduce<Expense | null>((a, x) => (a && a.date > x.date ? a : x), null);
              const Tile = latest ? "a" : "div";
              return (
                <Tile
                  key={c}
                  href={latest ? `#expenses/${latest.id}` : undefined}
                  className="card flex flex-col gap-space-1 text-fg no-underline"
                >
                  <span className="tile-label text-sm font-semibold text-fg-muted">{c}</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatMoney(summary.byCategory[c])}
                  </span>
                  <span className="h-space-1 overflow-hidden rounded-sm bg-border">
                    <i className="block h-full bg-primary" style={{ width: `${percent}%` }} />
                  </span>
                  <span className="text-sm text-fg-muted">{percent}% of total</span>
                </Tile>
              );
            })}
          </div>
          <div className="card flex items-baseline justify-between border-l-4 border-l-primary max-[640px]:flex-col">
            <span className="text-sm font-semibold text-fg-muted">Overall total</span>
            <span className="text-[34px] font-semibold tabular-nums">
              {formatMoney(summary.overall)}
            </span>
          </div>
          {summary.overall === 0 ? (
            <div
              role="status"
              className="flex items-center gap-space-2 rounded-lg border border-dashed border-border p-space-4"
            >
              No expenses in this period
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

export default SummaryView;
