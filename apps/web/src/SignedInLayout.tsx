import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import type { RouteId } from "./routes";

// The single place the shared header is mounted; screens shown before sign-in render outside it.
function SignedInLayout({ current, children }: { current: RouteId; children: ReactNode }) {
  return (
    <>
      <AppHeader current={current} />
      {children}
    </>
  );
}

export default SignedInLayout;
