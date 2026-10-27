import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = import.meta.dirname;

export const authFile = path.join(dir, ".auth.json");
const stateFile = path.join(dir, ".state.json");

export type StoryState = { id: string; title: string };

export function writeStoryState(state: StoryState): void {
  writeFileSync(stateFile, JSON.stringify(state));
}

export function readStoryState(): StoryState {
  return JSON.parse(readFileSync(stateFile, "utf8")) as StoryState;
}
