import { describe, expect, it, vi } from "vitest";
import { createMemoryExpenseStore } from "./expenseStore";

describe("memory expense store", () => {
  it("lists only the current user's expenses (AC 6)", () => {
    const store = createMemoryExpenseStore("u1", [
      { id: "a", userId: "u1", category: "Travel", cents: 100, date: "2026-10-10" },
      { id: "b", userId: "u2", category: "Travel", cents: 900, date: "2026-10-10" },
    ]);
    expect(store.list().map((x) => x.id)).toEqual(["a"]);
  });

  it("adds with the store's user id", () => {
    const store = createMemoryExpenseStore("u1");
    const added = store.add({ category: "Meals", cents: 500, date: "2026-10-10" });
    expect(added.userId).toBe("u1");
    expect(store.list()).toEqual([added]);
  });

  it("updates and removes, notifying subscribers each time", () => {
    const store = createMemoryExpenseStore("u1");
    const listener = vi.fn();
    store.subscribe(listener);
    const { id } = store.add({ category: "Meals", cents: 500, date: "2026-10-10" });
    store.update(id, { cents: 700 });
    expect(store.list()[0].cents).toBe(700);
    store.remove(id);
    expect(store.list()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createMemoryExpenseStore("u1");
    const listener = vi.fn();
    const off = store.subscribe(listener);
    off();
    store.add({ category: "Meals", cents: 500, date: "2026-10-10" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("returns a stable list reference until something changes", () => {
    const store = createMemoryExpenseStore("u1");
    expect(store.list()).toBe(store.list());
  });
});
