import type { Appointment, CareSummary, VitalReading } from "./types";

export interface DashboardData {
  readings: VitalReading[];
  appointments: Appointment[];
  care: CareSummary;
}

export interface DashboardClient {
  load(): Promise<DashboardData>;
}

export const httpDashboardClient: DashboardClient = {
  async load() {
    const response = await fetch("/api/dashboard");
    if (!response.ok) throw new Error(`Dashboard request failed: ${response.status}`);
    return (await response.json()) as DashboardData;
  },
};
