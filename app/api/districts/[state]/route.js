import { NextResponse } from "next/server";
import { listDistrictsFromCSV } from "@/lib/csvData";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const state = decodeURIComponent(params.state);
  const list = listDistrictsFromCSV(state);
  return NextResponse.json({ state, districts: list });
}
