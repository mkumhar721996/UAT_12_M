import { CalendarIcon } from "./icons";
import { formatUntil } from "./selectors";
import type { Appointment } from "./types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatWhen(startsAt: Date, now: Date): string {
  const hours = startsAt.getHours();
  const time = `${hours % 12 || 12}:${String(startsAt.getMinutes()).padStart(2, "0")} ${hours < 12 ? "am" : "pm"}`;
  const sameDay =
    startsAt.getFullYear() === now.getFullYear() &&
    startsAt.getMonth() === now.getMonth() &&
    startsAt.getDate() === now.getDate();
  const day = sameDay
    ? "Today"
    : `${WEEKDAYS[startsAt.getDay()]} ${startsAt.getDate()} ${MONTHS[startsAt.getMonth()]}`;
  return `${day}, ${time}`;
}

interface NextAppointmentCardProps {
  appointment: Appointment | undefined;
  now: Date;
}

function NextAppointmentCard({ appointment, now }: NextAppointmentCardProps) {
  const startsAt = appointment ? new Date(appointment.startsAt) : undefined;
  return (
    <section className="card" aria-labelledby="appt-title" aria-live="polite">
      <h2 id="appt-title" className="mb-space-2 text-lg font-semibold">
        Next appointment
      </h2>
      {appointment && startsAt ? (
        <div>
          <p className="m-0 text-xl font-semibold">{formatWhen(startsAt, now)}</p>
          <p className="mb-space-3 mt-space-1">
            {appointment.doctorName}, {appointment.reason}
          </p>
          <span className="chip chip-warning">
            <CalendarIcon />
            {formatUntil(startsAt, now)}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-space-3 text-fg-muted">
          <CalendarIcon className="h-6 w-6" />
          <p className="m-0">You have no upcoming appointment scheduled.</p>
        </div>
      )}
    </section>
  );
}

export default NextAppointmentCard;
