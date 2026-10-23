import type { CareSummary } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-12" -> "12 Sep 2026", without a timezone shift. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function CareCard({ care }: { care: CareSummary }) {
  return (
    <section className="card" aria-labelledby="care-title">
      <h2 id="care-title" className="mb-space-2 text-lg font-semibold">
        Your care
      </h2>
      <dl className="m-0 grid gap-space-3">
        <div className="flex flex-col">
          <dt className="text-sm font-semibold text-fg-muted">Doctor</dt>
          <dd className="m-0">
            {care.doctorName ?? <span className="text-fg-muted">No doctor assigned</span>}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-sm font-semibold text-fg-muted">Last visit</dt>
          <dd className="m-0">
            {care.lastVisitDate ? (
              formatDate(care.lastVisitDate)
            ) : (
              <span className="text-fg-muted">No previous visit</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default CareCard;
