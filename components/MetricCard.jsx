import { resolveIndicatorColor } from "@/lib/indicators";

export default function MetricCard({ titleEn, titleHi, value, ratio }) {
  const bar = resolveIndicatorColor(ratio);
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className={`h-1 w-full rounded ${bar}`} />
      <div className="mt-3 text-sm text-neutral-500">{titleEn}</div>
      <div className="text-xs text-neutral-400">{titleHi}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {Intl.NumberFormat("en-IN").format(Number(value || 0))}
      </div>
    </div>
  );
}
