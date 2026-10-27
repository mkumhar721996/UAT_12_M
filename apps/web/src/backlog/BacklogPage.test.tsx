import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BacklogPage from "./BacklogPage";
import type { BacklogClient } from "./backlogClient";
import StoryList from "./StoryList";

const PROJECT_ID = "proj_1ce836f0";

const fakeClient = (overrides: Partial<BacklogClient> = {}): BacklogClient => ({
  listBacklog: vi.fn().mockResolvedValue([]),
  addBacklogItem: vi.fn().mockImplementation(async (_p: string, title: string) => ({
    id: "bi_1",
    title,
  })),
  createStoryFromBacklogItem: vi.fn().mockResolvedValue({
    id: "st_1",
    title: "Export report",
    backlogItemId: "bi_1",
  }),
  listStories: vi.fn().mockResolvedValue([]),
  ...overrides,
});

async function addItem(title: string) {
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });
  fireEvent.click(screen.getByRole("button", { name: "Add item" }));
  await screen.findByText(title);
}

describe("BacklogPage", () => {
  it("lists a backlog item the test added itself (AC 1)", async () => {
    const fake = fakeClient();
    render(<BacklogPage projectId={PROJECT_ID} client={fake} />);
    await addItem("Export report");
    expect(screen.getByText("Export report")).toBeVisible();
    expect(fake.addBacklogItem).toHaveBeenCalledWith(PROJECT_ID, "Export report");
  });

  it("creates a story from a backlog item (AC 2)", async () => {
    const fake = fakeClient();
    render(<BacklogPage projectId={PROJECT_ID} client={fake} />);
    await addItem("Export report");
    fireEvent.click(screen.getByRole("button", { name: "Create story" }));
    await waitFor(() =>
      expect(fake.createStoryFromBacklogItem).toHaveBeenCalledWith(PROJECT_ID, "bi_1"),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Story created");
  });
});

describe("StoryList", () => {
  it("lists the project's stories (AC 4)", async () => {
    const fake = fakeClient({
      listStories: vi
        .fn()
        .mockResolvedValue([{ id: "st_1", title: "Export report", backlogItemId: "bi_1" }]),
    });
    render(<StoryList projectId={PROJECT_ID} client={fake} />);
    expect(screen.getByRole("heading", { name: "Stories" })).toBeVisible();
    expect(await screen.findByRole("listitem")).toHaveTextContent("Export report");
    expect(fake.listStories).toHaveBeenCalledWith(PROJECT_ID);
  });
});
