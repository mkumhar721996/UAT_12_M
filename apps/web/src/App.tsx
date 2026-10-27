import { useEffect, useState } from "react";
import AppHeader from "./AppHeader";
import BacklogPage from "./backlog/BacklogPage";
import StoryList from "./backlog/StoryList";
import Dashboard from "./dashboard/Dashboard";

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      <AppHeader />
      {hash === "#backlog" ? <BacklogPage /> : hash === "#stories" ? <StoryList /> : <Dashboard />}
    </>
  );
}

export default App;
