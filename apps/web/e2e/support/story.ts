import type { Page } from "@playwright/test";

export interface StoryFixture {
  id: string;
  url: string;
}

const DEFAULT_IMPLEMENT_TIMEOUT_MS = 600_000;

export const IMPLEMENT_TIMEOUT =
  Number(process.env.ARC_E2E_IMPLEMENT_TIMEOUT_MS) || DEFAULT_IMPLEMENT_TIMEOUT_MS;

/** True when the run targets a deployed system under test with a sandbox repository. */
export function isImplementStageConfigured(): boolean {
  return Boolean(process.env.ARC_E2E_BASE_URL && process.env.ARC_SANDBOX_REPO_URL);
}

export function sandboxRepoUrl(): string {
  const url = process.env.ARC_SANDBOX_REPO_URL;
  if (!url) throw new Error("ARC_SANDBOX_REPO_URL is not set");
  return url.replace(/\/+$/, "");
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Creates a story in the planned state through the platform API; takes no further action on it. */
export async function createPlannedStory(page: Page): Promise<StoryFixture> {
  const token = process.env.ARC_E2E_TOKEN;
  const response = await page.request.post("/api/stories", {
    data: { state: "planned" },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok()) {
    throw new Error(`Could not set up a planned story: ${response.status()}`);
  }
  const { id } = (await response.json()) as { id: string };
  return { id, url: `/stories/${encodeURIComponent(id)}` };
}

export async function openStory(page: Page, story: StoryFixture): Promise<void> {
  await page.goto(story.url);
}
