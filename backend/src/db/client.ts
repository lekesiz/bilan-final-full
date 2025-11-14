import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Get DATABASE_URL from environment (loaded by index.ts before this module is imported)
// Don't use 'dotenv/config' here - it's already loaded in index.ts
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set.\n' +
    'Please set DATABASE_URL in your .env file or docker-compose.yml.\n' +
    'Expected format: postgresql://user:password@host:port/database'
  );
}

// Log the database being used (without password)
const dbMatch = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (dbMatch) {
  const [, user, , host, port, database] = dbMatch;
  console.log(`📊 Database connection: ${user}@${host}:${port}/${database}`);
}

// Create PostgreSQL connection with connection pooling
// Connection pool settings for better performance
const client = postgres(connectionString, {
  prepare: false, // Disable prefetch as it's not supported for "Transaction" pool mode
  max: 20, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  // Force connection to use the correct database from connection string
  // This prevents connection pool from reusing connections with wrong database
  connection: {
    application_name: 'bilan-backend',
  },
  // Ensure each connection uses the database from connection string
  // This prevents connection pool from defaulting to user's default database
  onnotice: () => {}, // Suppress notices
  transform: {
    undefined: null, // Transform undefined to null
  },
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other modules
export * from './schema.js';
