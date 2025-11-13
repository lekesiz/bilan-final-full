import { Hono } from 'hono';
import { db, assessments, answers, summaries } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAnyPermission } from '../middleware/permissions.js';
import { eq, and, sql, count, desc, gte, lte, inArray } from 'drizzle-orm';
import { success, error } from '../utils/response.js';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// GET /api/admin/analytics - Analytics dashboard data
// Requires: analytics:read OR admin:read OR dashboard:read permission
app.get('/', requireAuth, requireAnyPermission([
  { resource: 'analytics', action: 'read' },
  { resource: 'admin', action: 'read' },
  { resource: 'dashboard', action: 'read' },
]), async (c) => {
  try {
    const userId = c.get('userId');

    // Date range filters (optional)
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    
    // Build date filter
    const dateFilter = [];
    if (startDate) {
      dateFilter.push(gte(assessments.startedAt, new Date(startDate)));
    }
    if (endDate) {
      dateFilter.push(lte(assessments.startedAt, new Date(endDate)));
    }

    // 1. Total Assessments
    const totalAssessmentsResult = await db
      .select({ count: count() })
      .from(assessments)
      .where(dateFilter.length > 0 ? and(...dateFilter) : undefined);
    const totalAssessments = totalAssessmentsResult[0]?.count || 0;

    // 2. Completed vs In Progress
    const statusBreakdown = await db
      .select({
        status: assessments.status,
        count: count(),
      })
      .from(assessments)
      .where(dateFilter.length > 0 ? and(...dateFilter) : undefined)
      .groupBy(assessments.status);
    
    const completedCount = statusBreakdown.find(s => s.status === 'completed')?.count || 0;
    const inProgressCount = statusBreakdown.find(s => s.status === 'in_progress')?.count || 0;
    const completionRate = totalAssessments > 0 
      ? Math.round((completedCount / totalAssessments) * 100) 
      : 0;

    // 3. Package Distribution
    const packageDistribution = await db
      .select({
        packageId: assessments.packageId,
        packageName: assessments.packageName,
        count: count(),
      })
      .from(assessments)
      .where(dateFilter.length > 0 ? and(...dateFilter) : undefined)
      .groupBy(assessments.packageId, assessments.packageName)
      .orderBy(desc(count()));

    // 4. Coaching Style Distribution
    const coachingStyleDistribution = await db
      .select({
        coachingStyle: assessments.coachingStyle,
        count: count(),
      })
      .from(assessments)
      .where(dateFilter.length > 0 ? and(...dateFilter) : undefined)
      .groupBy(assessments.coachingStyle)
      .orderBy(desc(count()));

    // 5. Average Completion Time (for completed assessments)
    const avgCompletionTimeResult = await db
      .select({
        avgTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${assessments.completedAt} - ${assessments.startedAt})) / 3600)`.as('avgTime'),
      })
      .from(assessments)
      .where(
        and(
          eq(assessments.status, 'completed'),
          dateFilter.length > 0 ? and(...dateFilter) : undefined
        )
      );
    
    const avgCompletionHours = avgCompletionTimeResult.length > 0 && avgCompletionTimeResult[0]?.avgTime
      ? Math.round(Number(avgCompletionTimeResult[0].avgTime) * 10) / 10
      : 0;

    // 6. Drop-off Analysis (by phase)
    // Phase 1: 0-33% of questions
    // Phase 2: 34-66% of questions
    // Phase 3: 67-100% of questions
    const dropOffAnalysis = await db
      .select({
        phase: sql<string>`CASE
          WHEN ${assessments.currentQuestionIndex}::float / NULLIF(${assessments.totalQuestions}, 0) <= 0.33 THEN 'Phase 1'
          WHEN ${assessments.currentQuestionIndex}::float / NULLIF(${assessments.totalQuestions}, 0) <= 0.66 THEN 'Phase 2'
          ELSE 'Phase 3'
        END`,
        count: count(),
      })
      .from(assessments)
      .where(
        and(
          eq(assessments.status, 'in_progress'),
          dateFilter.length > 0 ? and(...dateFilter) : undefined
        )
      )
      .groupBy(sql`CASE
        WHEN ${assessments.currentQuestionIndex}::float / NULLIF(${assessments.totalQuestions}, 0) <= 0.33 THEN 'Phase 1'
        WHEN ${assessments.currentQuestionIndex}::float / NULLIF(${assessments.totalQuestions}, 0) <= 0.66 THEN 'Phase 2'
        ELSE 'Phase 3'
      END`);

    // 7. Total Answers Count
    let totalAnswers = 0;
    if (dateFilter.length > 0) {
      const assessmentIds = await db
        .select({ id: assessments.id })
        .from(assessments)
        .where(and(...dateFilter));
      
      if (assessmentIds.length > 0) {
        const ids = assessmentIds.map(a => a.id);
        const totalAnswersResult = await db
          .select({ count: count() })
          .from(answers)
          .where(inArray(answers.assessmentId, ids));
        totalAnswers = totalAnswersResult[0]?.count || 0;
      }
    } else {
      const totalAnswersResult = await db
        .select({ count: count() })
        .from(answers);
      totalAnswers = totalAnswersResult[0]?.count || 0;
    }

    // 8. Average Answers per Assessment
    const avgAnswersPerAssessment = totalAssessments > 0
      ? Math.round((totalAnswers / totalAssessments) * 10) / 10
      : 0;

    // 9. Recent Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await db
      .select({ count: count() })
      .from(assessments)
      .where(
        and(
          gte(assessments.lastActivityAt, sevenDaysAgo),
          dateFilter.length > 0 ? and(...dateFilter) : undefined
        )
      );
    const recentActivityCount = recentActivity[0]?.count || 0;

    // 10. Summaries Generated
    let summariesCount = 0;
    if (dateFilter.length > 0) {
      const assessmentIds = await db
        .select({ id: assessments.id })
        .from(assessments)
        .where(and(...dateFilter));
      
      if (assessmentIds.length > 0) {
        const ids = assessmentIds.map(a => a.id);
        const summariesCountResult = await db
          .select({ count: count() })
          .from(summaries)
          .where(inArray(summaries.assessmentId, ids));
        summariesCount = summariesCountResult[0]?.count || 0;
      }
    } else {
      const summariesCountResult = await db
        .select({ count: count() })
        .from(summaries);
      summariesCount = summariesCountResult[0]?.count || 0;
    }

    return success(c, {
      overview: {
        totalAssessments,
        completedCount,
        inProgressCount,
        completionRate,
        totalAnswers,
        avgAnswersPerAssessment,
        avgCompletionHours,
        recentActivityCount,
        summariesCount,
      },
      distributions: {
        packages: packageDistribution,
        coachingStyles: coachingStyleDistribution,
      },
      dropOffAnalysis: dropOffAnalysis.map(d => ({
        phase: d.phase,
        count: d.count,
      })),
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s.count,
      })),
    });
  } catch (err) {
    console.error('Analytics error:', err);
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch analytics', 500);
  }
});

export default app;

