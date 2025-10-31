import { getDb } from "./mongodb";

export async function getCachedPerformance(state, district) {
  const db = await getDb();
  if (!db) return null;
  const coll = db.collection("performance");
  const doc = await coll.findOne({ state, district });
  return doc || null;
}

export async function upsertPerformance(state, district, metrics) {
  const db = await getDb();
  if (!db) return;
  const coll = db.collection("performance");
  await coll.updateOne(
    { state, district },
    { $set: { state, district, metrics, updatedAt: new Date() } },
    { upsert: true }
  );
}

export function isStale(doc, maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!doc || !doc.updatedAt) return true;
  const age = Date.now() - new Date(doc.updatedAt).getTime();
  return age > maxAgeMs;
}
