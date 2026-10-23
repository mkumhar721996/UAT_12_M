import type { Appointment, VitalKind, VitalReading } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function latestReadingToday(
  readings: VitalReading[],
  kind: VitalKind,
  now: Date,
): VitalReading | undefined {
  let latest: VitalReading | undefined;
  for (const reading of readings) {
    if (reading.kind !== kind) continue;
    const at = new Date(reading.recordedAt);
    if (!isSameLocalDay(at, now)) continue;
    if (!latest || at > new Date(latest.recordedAt)) latest = reading;
  }
  return latest;
}

export function nextAppointment(
  appointments: Appointment[],
  now: Date,
): Appointment | undefined {
  let next: Appointment | undefined;
  for (const appointment of appointments) {
    const startsAt = new Date(appointment.startsAt);
    if (startsAt <= now) continue;
    if (!next || startsAt < new Date(next.startsAt)) next = appointment;
  }
  return next;
}

export function formatSleep(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export function formatUntil(startsAt: Date, now: Date): string {
  const diff = Math.max(0, startsAt.getTime() - now.getTime());
  if (diff >= DAY) {
    // Whole calendar days, so 09:15 four days out reads "In 4 days" from 10:00.
    const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const days = Math.round((midnight(startsAt).getTime() - midnight(now).getTime()) / DAY);
    return `In ${plural(days, "day")}`;
  }
  const hours = Math.floor(diff / HOUR);
  const minutes = Math.floor((diff % HOUR) / MINUTE);
  if (hours === 0) return `In ${plural(minutes, "minute")}`;
  if (minutes === 0) return `In ${plural(hours, "hour")}`;
  return `In ${plural(hours, "hour")} ${plural(minutes, "minute")}`;
}
