import StatTile from "./StatTile";

export interface StatTileValues {
  steps: string | null;
  heartRate: string | null;
  sleep: string | null;
}

function StatTiles({ values }: { values: StatTileValues }) {
  return (
    <section
      aria-label="Today's stats"
      aria-live="polite"
      className="grid grid-cols-3 gap-space-4 max-[720px]:grid-cols-1"
    >
      <StatTile label="Steps" value={values.steps} emptyText="No steps recorded today" />
      <StatTile
        label="Resting heart rate"
        value={values.heartRate}
        emptyText="No heart rate recorded today"
      />
      <StatTile label="Sleep" value={values.sleep} emptyText="No sleep recorded today" />
    </section>
  );
}

export default StatTiles;
