import { CATEGORIES, CATEGORY_HINTS } from "./categories";

function CategoryList() {
  return (
    <main className="flex max-w-[960px] flex-col gap-space-5 p-space-5 max-[1023px]:p-space-4">
      <h1 className="m-0 text-xl font-semibold">Categories</h1>
      <ul className="m-0 list-none overflow-hidden rounded-lg border border-border p-0">
        {CATEGORIES.map((c) => (
          <li
            key={c}
            className="flex justify-between gap-space-4 border-b border-border px-space-4 py-space-3 last:border-b-0"
          >
            <b className="font-semibold">{c}</b>
            <span className="text-fg-muted">{CATEGORY_HINTS[c]}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-fg-muted">Categories are fixed and cannot be changed.</p>
    </main>
  );
}

export default CategoryList;
