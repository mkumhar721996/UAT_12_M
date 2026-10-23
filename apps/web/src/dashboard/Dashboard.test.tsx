import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import type { DashboardClient, DashboardData } from "./dashboardClient";

const NOW = new Date("2026-10-23T10:00:00");

const populated: DashboardData = {
  readings: [
    { kind: "steps", value: 3000, recordedAt: "2026-10-23T07:00:00" },
    { kind: "steps", value: 8240, recordedAt: "2026-10-23T09:30:00" },
    { kind: "steps", value: 9000, recordedAt: "2026-10-22T20:00:00" },
    { kind: "heartRate", value: 62, recordedAt: "2026-10-23T08:00:00" },
    { kind: "sleep", value: 430, recordedAt: "2026-10-23T06:30:00" },
  ],
  appointments: [
    { id: "2", startsAt: "2026-10-27T09:15:00", doctorName: "Dr. Patel", reason: "Follow-up" },
    { id: "0", startsAt: "2026-10-22T09:00:00", doctorName: "Dr. Patel", reason: "Old visit" },
    { id: "1", startsAt: "2026-10-23T14:30:00", doctorName: "Dr. Patel", reason: "General check-up" },
  ],
  care: { doctorName: "Dr. Patel, General Medicine", lastVisitDate: "2026-09-12" },
};

const fakeClient = (data: DashboardData): DashboardClient => ({
  load: vi.fn().mockResolvedValue(data),
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Dashboard", () => {
  it("shows the stat tiles with the latest reading today (AC 1, 3, 4, 5)", async () => {
    render(<Dashboard client={fakeClient(populated)} now={() => NOW} />);
    const stats = await screen.findByRole("region", { name: "Today's stats" });
    expect(within(stats).getByText("Steps")).toBeInTheDocument();
    expect(within(stats).getByText("Resting heart rate")).toBeInTheDocument();
    expect(within(stats).getByText("Sleep")).toBeInTheDocument();
    expect(within(stats).getByText("8,240")).toBeInTheDocument();
    expect(within(stats).getByText("62 bpm")).toBeInTheDocument();
    expect(within(stats).getByText("7h 10m")).toBeInTheDocument();
  });

  it("shows empty text when no readings today", async () => {
    render(
      <Dashboard client={fakeClient({ ...populated, readings: [] })} now={() => NOW} />,
    );
    expect(await screen.findByText("No steps recorded today")).toBeInTheDocument();
  });

  it("shows the soonest upcoming appointment (AC 6)", async () => {
    render(<Dashboard client={fakeClient(populated)} now={() => NOW} />);
    const card = await screen.findByRole("region", { name: "Next appointment" });
    expect(within(card).getByText("Dr. Patel, General check-up")).toBeInTheDocument();
    expect(within(card).getByText("In 4 hours 30 minutes")).toBeInTheDocument();
  });

  it("shows the friendly message with no or only past appointments (AC 8)", async () => {
    const { unmount } = render(
      <Dashboard client={fakeClient({ ...populated, appointments: [] })} now={() => NOW} />,
    );
    expect(
      await screen.findByText("You have no upcoming appointment scheduled."),
    ).toBeInTheDocument();
    unmount();
    render(
      <Dashboard
        client={fakeClient({ ...populated, appointments: [populated.appointments[1]] })}
        now={() => NOW}
      />,
    );
    expect(
      await screen.findByText("You have no upcoming appointment scheduled."),
    ).toBeInTheDocument();
  });

  it("shows the care card without a diagnosis (AC 9, 10, 11)", async () => {
    const data = {
      ...populated,
      care: { ...populated.care, diagnosis: "Type 2 diabetes" },
    };
    render(<Dashboard client={fakeClient(data)} now={() => NOW} />);
    const care = within(await screen.findByRole("region", { name: "Your care" }));
    expect(care.getByText("Dr. Patel, General Medicine")).toBeInTheDocument();
    expect(care.getByText("12 Sep 2026")).toBeInTheDocument();
    expect(care.queryByText(/diagnos|condition/i)).toBeNull();
    expect(screen.queryByText("Type 2 diabetes")).not.toBeInTheDocument();
    expect(care.getAllByRole("term")).toHaveLength(2);
  });

  it("advances to the following appointment when the time passes (AC 7)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const client = fakeClient(populated);
    const { unmount } = render(<Dashboard client={client} />);
    await act(() => vi.advanceTimersByTimeAsync(0));
    const card = () => screen.getByRole("region", { name: "Next appointment" });
    expect(within(card()).getByText(/General check-up/)).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(4.5 * 60 * 60 * 1000 + 1000));
    expect(within(card()).getByText(/Follow-up/)).toBeInTheDocument();
    expect(within(card()).queryByText(/General check-up/)).not.toBeInTheDocument();
    expect(client.load).toHaveBeenCalledTimes(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("opens the vitals dialog and Cancel returns to the Dashboard (AC 12, 13)", async () => {
    render(<Dashboard client={fakeClient(populated)} now={() => NOW} />);
    const button = await screen.findByRole("button", { name: "Log vitals" });
    button.focus();
    fireEvent.click(button);
    const dialog = screen.getByRole("dialog", { name: "Log a vital" });
    expect(within(dialog).getByLabelText("Vital")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log vitals" })).toHaveFocus();
  });

  it("has no records entry point in the page (AC 14)", async () => {
    render(<Dashboard client={fakeClient(populated)} now={() => NOW} />);
    await screen.findByRole("region", { name: "Your care" });
    expect(screen.queryByRole("link", { name: /record/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /record/i })).toBeNull();
  });

  it("shows a loading state then an error with Try again", async () => {
    const load = vi
      .fn()
      .mockReturnValueOnce(new Promise(() => {}))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(populated);
    const { unmount } = render(<Dashboard client={{ load }} now={() => NOW} />);
    expect(screen.getAllByText("Loading").length).toBeGreaterThan(0);
    unmount();

    render(<Dashboard client={{ load }} now={() => NOW} />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Today's stats could not be loaded. Check your connection and try again.",
    );
    fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("8,240")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(3);
  });
});
