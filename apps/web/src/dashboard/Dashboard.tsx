import { useCallback, useEffect, useState } from "react";
import CareCard from "./CareCard";
import { httpDashboardClient, type DashboardClient, type DashboardData } from "./dashboardClient";
import { AlertIcon, PlusIcon } from "./icons";
import NextAppointmentCard from "./NextAppointmentCard";
import { formatSleep, latestReadingToday, nextAppointment } from "./selectors";
import StatTiles from "./StatTiles";
import VitalsDialog from "./VitalsDialog";

interface DashboardProps {
  client?: DashboardClient;
  now?: () => Date;
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: DashboardData };

// setTimeout overflows (fires immediately) above this delay.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`mb-space-2 block h-space-4 rounded-sm bg-border ${className}`} />;
}

function LoadingState() {
  return (
    <>
      <div className="grid grid-cols-3 gap-space-4 max-[720px]:grid-cols-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-bg p-space-4">
            <Skeleton className="!h-space-5 w-3/5" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </>
  );
}

function Dashboard({ client = httpDashboardClient, now: getNow = () => new Date() }: DashboardProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [now, setNow] = useState(getNow);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(() => {
    setState({ status: "loading" });
    client.load().then(
      (data) => setState({ status: "ready", data }),
      () => setState({ status: "error" }),
    );
  }, [client]);

  useEffect(load, [load]);

  const data = state.status === "ready" ? state.data : undefined;
  const upcoming = data ? nextAppointment(data.appointments, now) : undefined;
  const upcomingStart = upcoming?.startsAt;

  // When the shown appointment starts, move on to the following one without refetching.
  useEffect(() => {
    if (!upcomingStart) return;
    const delay = Math.min(new Date(upcomingStart).getTime() - now.getTime(), MAX_TIMEOUT_MS);
    const timer = setTimeout(() => setNow(getNow()), Math.max(delay, 0));
    return () => clearTimeout(timer);
    // getNow is a stable default or injected clock; only the appointment or the clock should reschedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingStart, now]);

  const reading = (kind: "steps" | "heartRate" | "sleep") =>
    data ? latestReadingToday(data.readings, kind, now) : undefined;
  const steps = reading("steps");
  const heartRate = reading("heartRate");
  const sleep = reading("sleep");

  return (
    <main className="mx-auto flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[720px]:p-space-4">
      <div className="flex flex-wrap items-center justify-between gap-space-3">
        <h1 className="m-0 text-xl font-semibold">Today</h1>
      </div>

      {state.status === "error" && (
        <div
          role="alert"
          className="flex items-center gap-space-3 rounded-md border border-danger bg-danger-bg px-space-4 py-space-3 text-danger"
        >
          <AlertIcon />
          <span>Today's stats could not be loaded. Check your connection and try again.</span>
          <button type="button" className="btn btn-secondary" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {state.status === "loading" ? (
        <LoadingState />
      ) : (
        <StatTiles
          values={{
            steps: steps ? steps.value.toLocaleString("en-GB") : null,
            heartRate: heartRate ? `${heartRate.value} bpm` : null,
            sleep: sleep ? formatSleep(sleep.value) : null,
          }}
        />
      )}

      <div>
        <button type="button" className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <PlusIcon />
          Log vitals
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-2 items-start gap-space-4 max-[720px]:grid-cols-1">
          <NextAppointmentCard appointment={upcoming} now={now} />
          <CareCard care={data.care} />
        </div>
      )}

      <VitalsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
    </main>
  );
}

export default Dashboard;
