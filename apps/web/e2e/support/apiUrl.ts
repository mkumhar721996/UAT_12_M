// ARC_API_URL points the e2e at a Workflow API on another origin; unset, the
// Playwright baseURL is used (API reached through the same origin at /api).
export function apiUrl(path: string, base: string | undefined = process.env.ARC_API_URL): string {
  return base ? `${base.replace(/\/+$/, "")}${path}` : path;
}
