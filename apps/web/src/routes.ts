import { useEffect, useState } from "react";

export type RouteId = "dashboard" | "health-records";

export const ROUTE_HASH: Record<RouteId, string> = {
  dashboard: "#dashboard",
  "health-records": "#health-records",
};

// An empty or unknown hash falls back to the dashboard.
export function parseRoute(hash: string): RouteId {
  return hash === ROUTE_HASH["health-records"] ? "health-records" : "dashboard";
}

export function useHashRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
