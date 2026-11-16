/** Loading placeholder for admin content that streams in after the session check. */
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="h-20 rounded-[1.25rem] bg-sand/70" />
      ))}
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
