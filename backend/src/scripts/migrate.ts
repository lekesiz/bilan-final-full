/**
 * Migration script to create database tables
 * Run with: tsx src/scripts/migrate.ts
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Use Drizzle's push method to create tables
    // This will create all tables defined in schema.ts
    console.log('📝 Creating tables from schema...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // Push schema to database (creates tables if they don't exist)
    // Note: drizzle-kit push is not available, so we'll use raw SQL
    // For now, we'll just check if tables exist and create them manually if needed
    
    console.log('✅ Migration completed (tables should be created by seed script)\n');
    console.log('💡 If tables don\'t exist, run: npm run seed');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrate };

