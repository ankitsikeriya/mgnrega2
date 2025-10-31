import { NextResponse } from "next/server";
import { getMetricsFromCSV } from "@/lib/csvData";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const state = decodeURIComponent(params.state);
  const district = decodeURIComponent(params.district);

  // If configured to use CSV, or CSV is available for MP, prefer local CSV
  const useCSV = (process.env.DATA_SOURCE || "").toLowerCase() === "csv" || !!process.env.CSV_PATH;
  if (useCSV) {
    const local = getMetricsFromCSV(state, district);
    if (local) {
      return NextResponse.json({ source: "csv", state, district, metrics: local });
    }
    // If CSV configured but no record found, still fall back below
  }

  // Lazy-load API/cache utilities only when CSV is not used
  const { getCachedPerformance, isStale, upsertPerformance } = await import("@/lib/performance");
  const { fetchMGNREGA } = await import("@/lib/govApi");
  const cached = await getCachedPerformance(state, district);
  if (cached && !isStale(cached)) {
    return NextResponse.json({ source: "cache", ...cached });
  }

  const fresh = await fetchMGNREGA(state, district);
  if (fresh) {
    await upsertPerformance(state, district, fresh);
    return NextResponse.json({ source: "live", state, district, metrics: fresh });
  }

  if (cached) {
    return NextResponse.json({ source: "stale-cache", ...cached });
  }

  return NextResponse.json(
    {
      error: "Data unavailable. Provide CSV_PATH or configure DATA_GOV_API_KEY and MGNREGA_RESOURCE_ID.",
    },
    { status: 503 }
  );
}
