"use client";
import { useEffect, useMemo, useState } from "react";
import SelectStateDistrict from "@/components/SelectStateDistrict";
import MetricCard from "@/components/MetricCard";
import { SimpleBar, CompareBars } from "@/components/Charts";

function usePerformance(state, district) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!state || !district) {
      setData(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(
          `/api/performance/${encodeURIComponent(state)}/${encodeURIComponent(district)}`,
          { signal: controller.signal }
        );
        if (!r.ok) throw new Error("Failed to load data");
        const json = await r.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [state, district]);

  return { data, loading, error };
}

export default function Home() {
  const [sel, setSel] = useState({ state: "Madhya Pradesh", district: "" });
  const [compare, setCompare] = useState({ state: "Madhya Pradesh", district: "" });
  const { data, loading, error } = usePerformance(sel.state, sel.district);
  const cmp = usePerformance(compare.state, compare.district);

  const barData = useMemo(() => {
    const m = data?.metrics;
    if (!m) return [];
    return [
      { name: "Households", value: m.totalHouseholdsWorked },
      { name: "Wages", value: m.wagesDisbursed },
      { name: "Person-Days", value: m.totalPersonDays },
      { name: "Avg Days", value: m.averageDaysEmployment },
    ];
  }, [data]);

  const cmpBarData = useMemo(() => {
    const m = cmp.data?.metrics;
    if (!m) return [];
    return [
      { name: "Households", value: m.totalHouseholdsWorked },
      { name: "Wages", value: m.wagesDisbursed },
      { name: "Person-Days", value: m.totalPersonDays },
      { name: "Avg Days", value: m.averageDaysEmployment },
    ];
  }, [cmp.data]);

  useEffect(() => {
    // Optional: attempt geolocation to preselect. Placeholder only.
    // navigator.geolocation?.getCurrentPosition(() => {});
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--brand-black)] dark:text-white">
          Our Voice, Our Rights
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Simplifying MGNREGA data for every citizen. Currently showing <strong>Madhya Pradesh</strong> data. / हर नागरिक के लिए मनरेगा डेटा सरल बनाना — फिलहाल सिर्फ <strong>मध्य प्रदेश</strong> का डेटा।
        </p>
      </header>

      <section className="mb-4">
        <SelectStateDistrict state={sel.state} district={sel.district} onChange={setSel} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard titleEn="Total Households Worked" titleHi="कुल कार्यरत परिवार" value={data?.metrics?.totalHouseholdsWorked} ratio={(data?.metrics?.averageDaysEmployment ?? 0) / 100} />
        <MetricCard titleEn="Wages Disbursed" titleHi="वितरित मजदूरी" value={data?.metrics?.wagesDisbursed} ratio={(data?.metrics?.wagesDisbursed ?? 0) > 0 ? 0.7 : 0.2} />
        <MetricCard titleEn="Total Person-Days" titleHi="कुल मानव-दिवस" value={data?.metrics?.totalPersonDays} ratio={(data?.metrics?.totalPersonDays ?? 0) > 0 ? 0.6 : 0.2} />
        <MetricCard titleEn="Avg Days of Employment" titleHi="औसत रोजगार दिवस" value={data?.metrics?.averageDaysEmployment} ratio={(data?.metrics?.averageDaysEmployment ?? 0) / 100} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">District Snapshot / जिला अवलोकन</div>
          {error && <div className="text-red-600 text-sm">{String(error.message)}</div>}
          {loading && <div className="text-sm">Loading...</div>}
          {!loading && barData.length > 0 && <SimpleBar data={barData} />}
        </div>

        <div className="card">
          <div className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-300">Compare Districts / जिलों की तुलना</div>
          <SelectStateDistrict state={compare.state} district={compare.district} onChange={setCompare} />
          <div className="mt-4">
            {cmp.loading && <div className="text-sm">Loading...</div>}
            {!cmp.loading && cmpBarData.length > 0 && (
              <CompareBars
                left={barData}
                right={cmpBarData}
                leftLabel={sel.district || "District A"}
                rightLabel={compare.district || "District B"}
              />
            )}
          </div>
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-neutral-500">
        Data via data.gov.in (cached daily). Colors: 🟢 High, 🟠 Average, 🔴 Low.
      </footer>
    </main>
  );
}
