import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CareCard from "./CareCard";
import NextAppointmentCard from "./NextAppointmentCard";
import StatTiles from "./StatTiles";
import VitalsDialog from "./VitalsDialog";

const NOW = new Date("2026-10-23T10:00:00");

describe("StatTiles", () => {
  const tiles = {
    steps: "8,240",
    heartRate: "62 bpm",
    sleep: "7h 10m",
  };

  it("renders the three tiles", () => {
    render(<StatTiles values={tiles} />);
    const stats = screen.getByRole("region", { name: "Today's stats" });
    expect(within(stats).getByText("Steps")).toBeInTheDocument();
    expect(within(stats).getByText("Resting heart rate")).toBeInTheDocument();
    expect(within(stats).getByText("Sleep")).toBeInTheDocument();
    expect(within(stats).getByText("62 bpm")).toBeInTheDocument();
  });

  it("shows the empty text when nothing is recorded today", () => {
    render(<StatTiles values={{ steps: null, heartRate: null, sleep: null }} />);
    expect(screen.getByText("No steps recorded today")).toBeInTheDocument();
    expect(screen.getByText("No heart rate recorded today")).toBeInTheDocument();
    expect(screen.getByText("No sleep recorded today")).toBeInTheDocument();
  });

  it("tiles are inert: nothing opens and no data can be entered", () => {
    render(<StatTiles values={tiles} />);
    const tile = screen.getByText("Steps").parentElement!;
    expect(tile).not.toHaveAttribute("tabindex");
    expect(tile).not.toHaveAttribute("role");
    fireEvent.click(tile);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Today's stats" })).queryByRole("button"),
    ).toBeNull();
  });
});

describe("NextAppointmentCard", () => {
  it("shows the friendly message with no upcoming appointment", () => {
    render(<NextAppointmentCard appointment={undefined} now={NOW} />);
    expect(
      screen.getByText("You have no upcoming appointment scheduled."),
    ).toBeInTheDocument();
  });

  it("shows the appointment and time until", () => {
    render(
      <NextAppointmentCard
        appointment={{
          id: "a",
          startsAt: "2026-10-23T14:30:00",
          doctorName: "Dr. Patel",
          reason: "General check-up",
        }}
        now={NOW}
      />,
    );
    const card = screen.getByRole("region", { name: "Next appointment" });
    expect(within(card).getByText("Dr. Patel, General check-up")).toBeInTheDocument();
    expect(within(card).getByText("In 4 hours 30 minutes")).toBeInTheDocument();
  });
});

describe("CareCard", () => {
  const care = { doctorName: "Dr. Patel, General Medicine", lastVisitDate: "2026-09-12" };

  it("shows the doctor name (AC 9)", () => {
    render(<CareCard care={care} />);
    expect(screen.getByText("Doctor").nextSibling).toHaveTextContent(
      "Dr. Patel, General Medicine",
    );
  });

  it("shows the last visit date (AC 10)", () => {
    render(<CareCard care={care} />);
    expect(screen.getByText("Last visit").nextSibling).toHaveTextContent("12 Sep 2026");
  });

  it("shows no diagnosis (AC 11)", () => {
    const withDiagnosis = { ...care, diagnosis: "Type 2 diabetes" };
    render(<CareCard care={withDiagnosis} />);
    const card = within(screen.getByRole("region", { name: "Your care" }));
    expect(card.queryByText(/diagnos|condition|diabetes/i)).toBeNull();
    expect(card.getAllByRole("term")).toHaveLength(2);
  });

  it("shows neutral text when there is no doctor or visit", () => {
    render(<CareCard care={{ doctorName: null, lastVisitDate: null }} />);
    expect(screen.getByText("No doctor assigned")).toBeInTheDocument();
    expect(screen.getByText("No previous visit")).toBeInTheDocument();
  });
});

describe("VitalsDialog", () => {
  it("renders nothing when closed", () => {
    render(<VitalsDialog open={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens with its fields and closes on Cancel and Escape", () => {
    const onClose = vi.fn();
    render(<VitalsDialog open onClose={onClose} onSubmit={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "Log a vital" });
    expect(within(dialog).getByLabelText("Vital")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("validates the value and submits kind and number", () => {
    const onSubmit = vi.fn();
    render(<VitalsDialog open onClose={vi.fn()} onSubmit={onSubmit} />);
    const save = screen.getByRole("button", { name: "Save reading" });
    fireEvent.click(save);
    expect(screen.getByText("Enter a number, for example 8240.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "8240" } });
    fireEvent.click(save);
    expect(onSubmit).toHaveBeenCalledWith({ kind: "steps", value: 8240 });
  });
});
