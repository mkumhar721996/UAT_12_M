const NAV_ITEMS = [
  { id: "home", label: "Home", href: "#home", current: true },
  { id: "records", label: "Records", href: "#records", current: false },
];

function AppHeader() {
  return (
    <header className="flex items-center gap-space-5 border-b border-border bg-bg px-space-5 py-space-3 max-[720px]:gap-space-3 max-[720px]:px-space-4 max-[720px]:py-space-2">
      <p className="m-0 text-lg font-semibold text-primary">Health</p>
      <nav aria-label="Main" className="flex gap-space-2">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center border-b-2 px-space-3 font-semibold no-underline hover:bg-surface ${
              item.current
                ? "rounded-t-md border-primary text-primary"
                : "rounded-md border-transparent text-fg"
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
