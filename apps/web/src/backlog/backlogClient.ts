import type { BacklogItem, Story } from "./types";

export const DEFAULT_PROJECT_ID = "proj_1ce836f0";

export interface BacklogClient {
  listBacklog(projectId: string): Promise<BacklogItem[]>;
  addBacklogItem(projectId: string, title: string): Promise<BacklogItem>;
  createStoryFromBacklogItem(projectId: string, backlogItemId: string): Promise<Story>;
  listStories(projectId: string): Promise<Story[]>;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request to ${url} failed: ${response.status}`);
  return (await response.json()) as T;
}

const post = (url: string, body?: unknown): Promise<never> =>
  request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const projectUrl = (projectId: string) => `/api/projects/${encodeURIComponent(projectId)}`;

export const httpBacklogClient: BacklogClient = {
  listBacklog: (projectId) => request(`${projectUrl(projectId)}/backlog-items`),
  addBacklogItem: (projectId, title) => post(`${projectUrl(projectId)}/backlog-items`, { title }),
  createStoryFromBacklogItem: (projectId, backlogItemId) =>
    post(`${projectUrl(projectId)}/backlog-items/${encodeURIComponent(backlogItemId)}/story`),
  listStories: (projectId) => request(`${projectUrl(projectId)}/stories`),
};
