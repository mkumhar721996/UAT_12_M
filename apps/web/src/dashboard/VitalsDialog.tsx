import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { VitalKind } from "./types";

export interface VitalEntry {
  kind: VitalKind;
  /** In the domain unit: steps, bpm, or sleep in minutes. */
  value: number;
}

interface VitalsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: VitalEntry) => void;
}

const OPTIONS: { id: VitalKind; label: string }[] = [
  { id: "steps", label: "Steps" },
  { id: "heartRate", label: "Resting heart rate (bpm)" },
  { id: "sleep", label: "Sleep (hours)" },
];

function VitalsDialog({ open, onClose, onSubmit }: VitalsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [kind, setKind] = useState<VitalKind>("steps");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("select, input, button")?.focus();
    return () => {
      openerRef.current?.focus();
      setValue("");
      setError("");
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    const parsed = Number(trimmed);
    if (trimmed === "" || !Number.isFinite(parsed)) {
      setError("Enter a number, for example 8240.");
      return;
    }
    setError("");
    onSubmit({ kind, value: kind === "sleep" ? Math.round(parsed * 60) : parsed });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "select, input, button:not([disabled])",
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-fg opacity-45" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vitals-title"
        onKeyDown={handleKeyDown}
        className="fixed left-1/2 top-1/2 z-[101] w-[min(440px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg p-space-5"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-4">
          <div>
            <h2 id="vitals-title" className="m-0 text-lg font-semibold">
              Log a vital
            </h2>
            <p className="mb-0 mt-space-1 text-sm text-fg-muted">
              Add a reading for today. It will appear on your dashboard.
            </p>
          </div>
          <div className="field">
            <label htmlFor="vital-type">Vital</label>
            <select
              id="vital-type"
              className="select"
              value={kind}
              onChange={(e) => setKind(e.target.value as VitalKind)}
            >
              {OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="vital-value">Value</label>
            <input
              id="vital-value"
              className="input"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-describedby="vital-err"
            />
            <span id="vital-err" role="alert" className="text-sm text-danger">
              {error}
            </span>
          </div>
          <div className="flex justify-end gap-space-3">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save reading
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default VitalsDialog;
