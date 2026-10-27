import { useEffect, useState } from "react";
import { DEFAULT_PROJECT_ID, httpBacklogClient, type BacklogClient } from "./backlogClient";
import type { Story } from "./types";

interface StoryListProps {
  projectId?: string;
  client?: BacklogClient;
}

function StoryList({ projectId = DEFAULT_PROJECT_ID, client = httpBacklogClient }: StoryListProps) {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    client.listStories(projectId).then(setStories, () => setFailed(true));
  }, [client, projectId]);

  return (
    <main className="p-space-5">
      <h1 className="mb-space-4 text-xl font-semibold text-fg">Stories</h1>
      {failed && <p role="alert">Could not load stories.</p>}
      {stories?.length === 0 && <p className="text-fg">No stories yet.</p>}
      <ul className="m-0 flex list-none flex-col gap-space-2 p-0">
        {stories?.map((story) => (
          <li key={story.id} className="rounded-lg border border-border bg-bg p-space-3">
            {story.title}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default StoryList;
