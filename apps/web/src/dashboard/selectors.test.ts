import { describe, expect, it } from "vitest";
import {
  formatSleep,
  formatUntil,
  latestReadingToday,
  nextAppointment,
} from "./selectors";
import type { Appointment, VitalReading } from "./types";

const NOW = new Date("2026-10-23T10:00:00");

const appt = (id: string, startsAt: string): Appointment => ({
  id,
  startsAt,
  doctorName: "Dr. Patel",
  reason: "Check-up",
});

describe("latestReadingToday", () => {
  const steps = [
    { kind: "steps", value: 9000, recordedAt: "2026-10-22T20:00:00" },
    { kind: "steps", value: 8240, recordedAt: "2026-10-23T09:30:00" },
    { kind: "steps", value: 3000, recordedAt: "2026-10-23T07:00:00" },
  ] as VitalReading[];

  it("returns the latest by recordedAt today, regardless of array order", () => {
    expect(latestReadingToday(steps, "steps", NOW)?.value).toBe(8240);
  });

  it("returns undefined when nothing was recorded today", () => {
    expect(latestReadingToday([steps[0]], "steps", NOW)).toBeUndefined();
  });

  it("only considers the requested kind", () => {
    const hr = [
      { kind: "heartRate", value: 62, recordedAt: "2026-10-23T08:00:00" },
      { kind: "steps", value: 1, recordedAt: "2026-10-23T09:00:00" },
    ] as VitalReading[];
    expect(latestReadingToday(hr, "heartRate", NOW)?.value).toBe(62);
    expect(latestReadingToday(hr, "sleep", NOW)).toBeUndefined();
  });
});

describe("nextAppointment", () => {
  const soonest = appt("soonest", "2026-10-23T14:30:00");
  const later = appt("later", "2026-10-27T09:15:00");
  const past = appt("past", "2026-10-23T08:00:00");

  it("returns the soonest upcoming, ignoring past ones and array order", () => {
    expect(nextAppointment([later, past, soonest], NOW)?.id).toBe("soonest");
  });

  it("returns the following appointment once the first has passed", () => {
    const after = new Date("2026-10-23T14:30:01");
    expect(nextAppointment([later, soonest], after)?.id).toBe("later");
  });

  it("returns undefined when none are upcoming", () => {
    expect(nextAppointment([past], NOW)).toBeUndefined();
    expect(nextAppointment([], NOW)).toBeUndefined();
  });
});

describe("formatters", () => {
  it("formats sleep minutes", () => {
    expect(formatSleep(430)).toBe("7h 10m");
  });

  it("formats time until", () => {
    expect(formatUntil(new Date("2026-10-23T14:30:00"), NOW)).toBe(
      "In 4 hours 30 minutes",
    );
    expect(formatUntil(new Date("2026-10-27T09:15:00"), NOW)).toBe("In 4 days");
  });
});
