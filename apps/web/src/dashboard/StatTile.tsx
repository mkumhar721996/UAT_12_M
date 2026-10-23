interface StatTileProps {
  label: string;
  value: string | null;
  emptyText: string;
}

/** Display-only: deliberately not a button, link or focus stop. */
function StatTile({ label, value, emptyText }: StatTileProps) {
  return (
    <div className="flex cursor-default flex-col gap-space-1 rounded-lg border border-border bg-bg p-space-4">
      <span className="text-md text-fg-muted">{label}</span>
      {value === null ? (
        <span className="text-md text-fg-muted">{emptyText}</span>
      ) : (
        <span className="text-xl font-semibold">{value}</span>
      )}
    </div>
  );
}

export default StatTile;
