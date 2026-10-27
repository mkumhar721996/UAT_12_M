import { expect, type APIRequestContext } from "@playwright/test";

// Assumed Workflow API contract, reached through the Playwright baseURL (a proxy at /api).
export const PROJECT_ID = "proj_1ce836f0";

export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  refinementStatus: "none" | "running" | "done" | "failed";
}

const storiesPath = `/api/projects/${PROJECT_ID}/stories`;

export async function createStory(
  api: APIRequestContext,
  input: { title: string; description: string },
): Promise<Story> {
  const response = await api.post(storiesPath, { data: input });
  expect(response.ok()).toBe(true);
  return response.json();
}

export async function listStories(api: APIRequestContext): Promise<Story[]> {
  const response = await api.get(storiesPath);
  expect(response.ok()).toBe(true);
  return response.json();
}

export async function refineStory(api: APIRequestContext, id: string): Promise<void> {
  const response = await api.post(`${storiesPath}/${id}/refine`);
  expect(response.ok()).toBe(true);
}

export async function waitForRefined(api: APIRequestContext, id: string): Promise<Story> {
  let story: Story | undefined;
  await expect
    .poll(
      async () => {
        story = (await listStories(api)).find((s) => s.id === id);
        return story?.refinementStatus;
      },
      { timeout: 60_000 },
    )
    .toBe("done");
  return story as Story;
}
