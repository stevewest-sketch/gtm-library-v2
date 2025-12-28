import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment
const connectionString = process.env.DATABASE_URL!;

// For query purposes - add SSL require for Supabase connection
const queryClient = postgres(connectionString, {
  ssl: connectionString?.includes('supabase') ? 'require' : undefined,
  max: 10, // Allow more connections for concurrent requests
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});
export const db = drizzle(queryClient, { schema });

// Re-export schema for convenience
export * from './schema';
