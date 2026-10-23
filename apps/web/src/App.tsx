import { useEffect, useState } from "react";
import AppHeader, { type RouteId } from "./AppHeader";
import Dashboard from "./dashboard/Dashboard";
import CategoryList from "./expenses/CategoryList";
import ExpenseForm from "./expenses/ExpenseForm";
import { createMemoryExpenseStore } from "./expenses/expenseStore";
import { todayIso } from "./expenses/period";
import SummaryView from "./expenses/SummaryView";

const ROUTES: Record<string, RouteId> = {
  "#categories": "categories",
  "#summary": "summary",
  "#expenses/new": "expenses",
  "#records": "records",
};

function routeFromHash(hash: string): RouteId {
  return ROUTES[hash] ?? "home";
}

// Stand-in for the signed-in user's expenses until Expense Capture provides an HTTP store.
const store = createMemoryExpenseStore("current-user");

function App() {
  const [route, setRoute] = useState<RouteId>(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="flex min-h-screen flex-col min-[1024px]:flex-row">
      <AppHeader current={route} />
      <div className="min-w-0 flex-1">
        {route === "categories" ? <CategoryList /> : null}
        {route === "expenses" ? (
          <ExpenseForm
            store={store}
            today={todayIso}
            onSaved={() => {
              window.location.hash = "#summary";
            }}
          />
        ) : null}
        {route === "summary" ? <SummaryView store={store} /> : null}
        {route === "home" || route === "records" ? <Dashboard /> : null}
      </div>
    </div>
  );
}

export default App;
