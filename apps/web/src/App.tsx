import { useEffect, useState } from "react";
import AppHeader, { type RouteId } from "./AppHeader";
import Dashboard from "./dashboard/Dashboard";
import CategoryList from "./expenses/CategoryList";
import ExpenseDetail from "./expenses/ExpenseDetail";
import ExpenseForm from "./expenses/ExpenseForm";
import ExpenseList from "./expenses/ExpenseList";
import { createMemoryExpenseStore } from "./expenses/expenseStore";
import { todayIso } from "./expenses/period";
import SummaryView from "./expenses/SummaryView";

const ROUTES: Record<string, RouteId> = {
  "#categories": "categories",
  "#summary": "summary",
  "#expenses": "expenses",
  "#expenses/new": "expenses",
  "#records": "records",
};

function routeFromHash(hash: string): RouteId {
  if (hash.startsWith("#expenses/")) return "expenses";
  return ROUTES[hash] ?? "home";
}

// Stand-in for the signed-in user's expenses until Expense Capture provides an HTTP store.
const store = createMemoryExpenseStore("current-user");

function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const route = routeFromHash(hash);
  const expenseId = hash.startsWith("#expenses/") ? hash.slice("#expenses/".length) : null;

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="flex min-h-screen flex-col min-[1024px]:flex-row">
      <AppHeader current={route} />
      <div className="min-w-0 flex-1">
        {route === "categories" ? <CategoryList /> : null}
        {route === "expenses" && hash === "#expenses" ? <ExpenseList store={store} /> : null}
        {route === "expenses" && expenseId !== null && expenseId !== "new" ? (
          <ExpenseDetail
            store={store}
            id={expenseId}
            onDone={() => {
              window.location.hash = "#expenses";
            }}
          />
        ) : null}
        {route === "expenses" && expenseId === "new" ? (
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
