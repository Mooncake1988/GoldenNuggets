import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Node.js environments
// In production/serverless environments, use fetch for better reliability
if (process.env.NODE_ENV === 'production') {
  neonConfig.poolQueryViaFetch = true;
}

// Set WebSocket constructor for Node.js (required for Node.js v21 and earlier)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
