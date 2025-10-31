const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "mgnrega";

if (!uri) {
  console.warn("MONGODB_URI is not set. API will use in-memory fallback only.");
}

let connPromise = null;
let mongooseConn = null; // cache the resolved mongoose connection

async function connect() {
  if (!uri) return null;
  if (connPromise) return connPromise;
  connPromise = (async () => {
    try {
      const mod = await import("mongoose");
      const mongoose = mod.default || mod;
      await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 3000 });
      mongooseConn = mongoose.connection;
      return mongooseConn;
    } catch {
      return null;
    }
  })();
  return connPromise;
}

export async function getDb() {
  const conn = await connect();
  if (!conn) return null;
  return conn.db;
}
