import { NextResponse } from "next/server";
import { STATES_DISTRICTS } from "@/lib/constants";
import { fetchMGNREGA } from "@/lib/govApi";
import { upsertPerformance } from "@/lib/performance";

export const dynamic = "force-dynamic";

export async function POST() {
  let updated = 0;
  for (const { state, districts } of STATES_DISTRICTS) {
    for (const d of districts) {
      const metrics = await fetchMGNREGA(state, d);
      if (metrics) {
        await upsertPerformance(state, d, metrics);
        updated += 1;
      }
    }
  }
  return NextResponse.json({ updated });
}
