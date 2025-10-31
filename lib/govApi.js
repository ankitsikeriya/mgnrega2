export async function fetchMGNREGA(state, district) {
  const apiKey = process.env.DATA_GOV_API_KEY;
  // Default to the provided endpoint resource if env not set
  const resourceId = process.env.MGNREGA_RESOURCE_ID || "ee03643a-ee4c-48c2-ac30-a864a43d0070";
  if (!apiKey || !resourceId) return null;

  const base = "https://api.data.gov.in/resource/" + resourceId;

  async function requestWithParams(paramsObj) {
    const params = new URLSearchParams(paramsObj);
    const res = await fetch(`${base}?${params.toString()}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    // First try JSON-encoded filters
    let data = await requestWithParams({
      "api-key": apiKey,
      format: "json",
      limit: "1",
      filters: JSON.stringify({ state_name: state, district_name: district }),
    });

    // If no records, try bracket-style filters in case the API expects that
    if (!data?.records?.length) {
      data = await requestWithParams({
        "api-key": apiKey,
        format: "json",
        limit: "1",
        "filters[state_name]": state,
        "filters[district_name]": district,
      });
    }

    const row = data?.records?.[0];
    if (!row) return null;

    const metrics = {
      totalHouseholdsWorked: Number(row.total_households_worked ?? 0),
      wagesDisbursed: Number(row.total_wages_disbursed ?? 0),
      totalPersonDays: Number(row.total_persondays ?? 0),
      averageDaysEmployment: Number(row.avg_days_employment ?? 0),
    };
    return metrics;
  } catch {
    return null;
  }
}

export async function fetchDistrictData(district) {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const resourceId = process.env.MGNREGA_RESOURCE_ID || "ee03643a-ee4c-48c2-ac30-a864a43d0070";
  if (!apiKey || !resourceId) return [];

  const base = "https://api.data.gov.in/resource/" + resourceId;

  async function requestWithParams(paramsObj) {
    const params = new URLSearchParams(paramsObj);
    const res = await fetch(`${base}?${params.toString()}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    let data = await requestWithParams({
      "api-key": apiKey,
      format: "json",
      limit: "100",
      filters: JSON.stringify({ district_name: district }),
    });
    if (!data?.records?.length) {
      data = await requestWithParams({
        "api-key": apiKey,
        format: "json",
        limit: "100",
        "filters[district_name]": district,
      });
    }
    return Array.isArray(data?.records) ? data.records : [];
  } catch (error) {
    return [];
  }
}

