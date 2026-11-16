import Link from "next/link";

/** Horizontal, scrollable status filter links with counts. */
export function FilterTabs({
  tabs,
  label,
}: {
  tabs: Array<{ href: string; label: string; count: number; active: boolean }>;
  label: string;
}) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-2">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-semibold whitespace-nowrap transition-colors " +
                (tab.active ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-ink/30")
              }
            >
              {tab.label}
              <span className={"tabular-nums " + (tab.active ? "text-paper/70" : "text-muted")}>{tab.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
