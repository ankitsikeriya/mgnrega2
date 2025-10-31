"use client";

export function SimpleBar({ data }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value || 0)));
  return (
    <div className="w-full space-y-3">
      {data.map((d) => {
        const pct = Math.round((Number(d.value || 0) / max) * 100);
        return (
          <div className="flex items-center gap-3" key={d.name}>
            <div className="w-28 shrink-0 text-xs text-neutral-600 dark:text-neutral-300">{d.name}</div>
            <div className="relative h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800">
              <div
                className="absolute left-0 top-0 h-3 rounded bg-[color:var(--brand-teal)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="w-20 shrink-0 text-right text-xs text-neutral-700 dark:text-neutral-200">
              {Intl.NumberFormat("en-IN").format(Number(d.value || 0))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompareBars({ left, right, leftLabel = "A", rightLabel = "B" }) {
  const keys = Array.from(new Set([...left.map((d) => d.name), ...right.map((d) => d.name)]));
  const values = keys.map((k) => ({
    name: k,
    a: Number(left.find((d) => d.name === k)?.value || 0),
    b: Number(right.find((d) => d.name === k)?.value || 0),
  }));
  const max = Math.max(1, ...values.map((v) => Math.max(v.a, v.b)));
  return (
    <div className="w-full space-y-4">
      {values.map((v) => {
        const aPct = Math.round((v.a / max) * 100);
        const bPct = Math.round((v.b / max) * 100);
        return (
          <div className="space-y-1" key={v.name}>
            <div className="text-xs text-neutral-600 dark:text-neutral-300">{v.name}</div>
            <div className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-[10px] text-neutral-500">{leftLabel}</div>
              <div className="relative h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800">
                <div className="absolute left-0 top-0 h-3 rounded bg-[color:var(--brand-teal)]" style={{ width: `${aPct}%` }} />
              </div>
              <div className="w-24 shrink-0 text-right text-[10px] text-neutral-700 dark:text-neutral-200">{Intl.NumberFormat("en-IN").format(v.a)}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-[10px] text-neutral-500">{rightLabel}</div>
              <div className="relative h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800">
                <div className="absolute left-0 top-0 h-3 rounded bg-orange-500" style={{ width: `${bPct}%` }} />
              </div>
              <div className="w-24 shrink-0 text-right text-[10px] text-neutral-700 dark:text-neutral-200">{Intl.NumberFormat("en-IN").format(v.b)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
