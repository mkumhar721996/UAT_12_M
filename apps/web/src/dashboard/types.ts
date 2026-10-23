export type VitalKind = "steps" | "heartRate" | "sleep";

/** `recordedAt` is an ISO instant; sleep `value` is in minutes. */
export interface VitalReading {
  kind: VitalKind;
  value: number;
  recordedAt: string;
}

export interface Appointment {
  id: string;
  startsAt: string;
  doctorName: string;
  reason: string;
}

/** Deliberately has no diagnosis field: the Dashboard never shows one. */
export interface CareSummary {
  doctorName: string | null;
  lastVisitDate: string | null;
}
