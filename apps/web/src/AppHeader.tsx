export type RouteId = "home" | "records" | "expenses" | "categories" | "summary";

const NAV_ITEMS: { id: RouteId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "records", label: "Records", href: "#records" },
  { id: "expenses", label: "Expenses", href: "#expenses/new" },
  { id: "categories", label: "Categories", href: "#categories" },
  { id: "summary", label: "Summary", href: "#summary" },
];

function AppHeader({ current }: { current: RouteId }) {
  return (
    <header className="shrink-0 border-b border-border bg-surface p-space-3 min-[1024px]:w-[200px] min-[1024px]:border-b-0 min-[1024px]:border-r min-[1024px]:px-space-3 min-[1024px]:py-space-5">
      <p className="m-0 mb-space-2 px-space-3 text-lg font-semibold text-primary min-[1024px]:mb-space-4">
        Expenses
      </p>
      <nav
        aria-label="Main"
        className="flex flex-row flex-wrap gap-space-1 min-[1024px]:flex-col"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={item.id === current ? "page" : undefined}
            className={`flex min-h-[44px] items-center rounded-md border-l-[3px] px-space-3 font-semibold no-underline hover:bg-bg ${
              item.id === current
                ? "border-primary bg-bg text-primary"
                : "border-transparent text-fg"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default AppHeader;
