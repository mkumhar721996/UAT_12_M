import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_PROJECT_ID, httpBacklogClient, type BacklogClient } from "./backlogClient";
import type { BacklogItem } from "./types";

interface BacklogPageProps {
  projectId?: string;
  client?: BacklogClient;
}

function BacklogPage({ projectId = DEFAULT_PROJECT_ID, client = httpBacklogClient }: BacklogPageProps) {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    client.listBacklog(projectId).then(setItems, () => setFailed(true));
  }, [client, projectId]);

  const addItem = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    client.addBacklogItem(projectId, trimmed).then(
      (item) => {
        setItems((current) => [...current, item]);
        setTitle("");
        setFailed(false);
      },
      () => setFailed(true),
    );
  };

  const createStory = (item: BacklogItem) => {
    client.createStoryFromBacklogItem(projectId, item.id).then(
      (story) => {
        setMessage(`Story created: ${story.title}`);
        setFailed(false);
      },
      () => setFailed(true),
    );
  };

  return (
    <main className="p-space-5">
      <h1 className="mb-space-4 text-xl font-semibold text-fg">Backlog</h1>
      <form onSubmit={addItem} className="mb-space-4 flex items-end gap-space-3">
        <label className="flex flex-col gap-space-1 font-semibold text-fg">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-[44px] rounded-md border border-border bg-bg px-space-3 font-normal"
          />
        </label>
        <button
          type="submit"
          className="min-h-[44px] rounded-md bg-primary px-space-4 font-semibold text-bg"
        >
          Add item
        </button>
      </form>
      {failed && <p role="alert">Something went wrong. Please try again.</p>}
      {message && <p role="status">{message}</p>}
      <ul className="m-0 flex list-none flex-col gap-space-2 p-0">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border bg-bg p-space-3"
          >
            <span>{item.title}</span>
            <button
              type="button"
              onClick={() => createStory(item)}
              className="min-h-[44px] rounded-md border border-primary px-space-3 font-semibold text-primary"
            >
              Create story
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default BacklogPage;
