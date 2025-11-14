/**
 * Script to clear analytics data (assessments, answers, summaries)
 * Run with: tsx src/scripts/clearAnalyticsData.ts
 * 
 * WARNING: This will delete all assessments, answers, and summaries!
 */

import 'dotenv/config';
import { db } from '../db/client.js';
import { assessments, answers, summaries } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function clearAnalyticsData() {
  try {
    console.log('⚠️  WARNING: This will delete all assessments, answers, and summaries!\n');
    
    // Count existing data
    const assessmentsCount = await db.select().from(assessments);
    const answersCount = await db.select().from(answers);
    const summariesCount = await db.select().from(summaries);
    
    console.log('📊 Current data:');
    console.log(`   - Assessments: ${assessmentsCount.length}`);
    console.log(`   - Answers: ${answersCount.length}`);
    console.log(`   - Summaries: ${summariesCount.length}\n`);
    
    if (assessmentsCount.length === 0 && answersCount.length === 0 && summariesCount.length === 0) {
      console.log('✅ No data to clear. Database is already empty.');
      return;
    }
    
    // Delete in order (answers -> summaries -> assessments due to foreign keys)
    console.log('🗑️  Deleting data...\n');
    
    // Delete answers
    if (answersCount.length > 0) {
      await db.delete(answers);
      console.log(`✅ Deleted ${answersCount.length} answers`);
    }
    
    // Delete summaries
    if (summariesCount.length > 0) {
      await db.delete(summaries);
      console.log(`✅ Deleted ${summariesCount.length} summaries`);
    }
    
    // Delete assessments
    if (assessmentsCount.length > 0) {
      await db.delete(assessments);
      console.log(`✅ Deleted ${assessmentsCount.length} assessments`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Analytics data cleared successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error clearing analytics data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAnalyticsData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { clearAnalyticsData };

