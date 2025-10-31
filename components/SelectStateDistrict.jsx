"use client";
import { useEffect, useState } from "react";
import { MP_DISTRICTS } from "@/lib/constants";

export default function SelectStateDistrict({ state, district, onChange }) {
  const [districts, setDistricts] = useState(MP_DISTRICTS);
  const mp = "Madhya Pradesh";

  useEffect(() => {
    const s = state || mp;
    const controller = new AbortController();
    async function load() {
      try {
        const r = await fetch(`/api/districts/${encodeURIComponent(s)}`, { signal: controller.signal });
        const json = await r.json();
        const apiList = Array.isArray(json.districts) ? json.districts : [];
        const list = apiList.length ? apiList : MP_DISTRICTS;
        setDistricts(list.map((d) => d.replace(/\b\w/g, (c) => c.toUpperCase())));
      } catch {
        setDistricts(MP_DISTRICTS.map((d) => d.replace(/\b\w/g, (c) => c.toUpperCase())));
      }
    }
    load();
    return () => controller.abort();
  }, [state]);

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <select
        className="w-full rounded-md border p-3 text-sm"
        value={state || mp}
        onChange={(e) => onChange({ state: e.target.value, district: "" })}
      >
        <option value={mp}>{mp}</option>
      </select>

      <select
        className="w-full rounded-md border p-3 text-sm"
        value={district}
        onChange={(e) => onChange({ state: state || mp, district: e.target.value })}
      >
        <option value="">Select District / जिला चुनें</option>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}
