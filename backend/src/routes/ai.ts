import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { error, success } from '../utils/response.js';
import { z } from 'zod';
import { getAIService } from '../services/ai/aiService.js';
import type { Package } from '../types/ai.js';
import { logger } from '../utils/logger.js';

const app = new Hono();

// Request schemas
const generateQuestionSchema = z.object({
  phaseKey: z.enum(['phase1', 'phase2', 'phase3']),
  categoryIndex: z.number(),
  previousAnswers: z.array(z.any()),
  userName: z.string(),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  userProfile: z.any().nullable(),
  options: z.object({
    useJoker: z.boolean().optional(),
    useGoogleSearch: z.boolean().optional(),
    searchTopic: z.string().optional(),
    isModuleQuestion: z.object({
      moduleId: z.string(),
      questionNum: z.number(),
    }).optional(),
  }).optional(),
  language: z.string().optional(),
});

const generateSummarySchema = z.object({
  answers: z.array(z.any()),
  packageName: z.string(),
  userName: z.string(),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  language: z.string().optional(),
});

const generateSynthesisSchema = z.object({
  lastAnswers: z.array(z.any()),
  userName: z.string(),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  language: z.string().optional(),
});

const analyzeThemesAndSkillsSchema = z.object({
  answers: z.array(z.any()),
  language: z.string().optional(),
});

const analyzeUserProfileSchema = z.object({
  cvText: z.string(),
  language: z.string().optional(),
});

const suggestOptionalModuleSchema = z.object({
  answers: z.array(z.any()),
  language: z.string().optional(),
});

const findResourceLeadsSchema = z.object({
  actionItemText: z.string(),
  language: z.string().optional(),
});

// POST /api/ai/generate/question
app.post('/generate/question', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateQuestionSchema.parse(body);

    const aiService = getAIService();
    const question = await aiService.generateQuestion(
      validated.phaseKey,
      validated.categoryIndex,
      validated.previousAnswers,
      validated.userName,
      validated.coachingStyle,
      validated.userProfile,
      validated.options || {},
      validated.language || 'fr'
    );

    return success(c, question);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI generate question error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate question', 500);
  }
});

// POST /api/ai/generate/summary
app.post('/generate/summary', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateSummarySchema.parse(body);

    // Convert packageName to Package object
    const pkg: Package = {
      id: validated.packageName.toLowerCase().replace(/\s+/g, '-'),
      name: validated.packageName,
      totalHours: 8,
      totalQuestionnaires: 30,
      description: '',
      features: [],
      phases: {
        phase1: { questionnaires: 1, duration_min: 60, name: "Phase d'Investigation" },
        phase2: { questionnaires: 1, duration_min: 120, name: "Phase d'Analyse" },
        phase3: { questionnaires: 1, duration_min: 120, name: "Phase de Conclusion" }
      }
    };

    const aiService = getAIService();
    const summary = await aiService.generateSummary(
      validated.answers,
      pkg,
      validated.userName,
      validated.coachingStyle,
      validated.language || 'fr'
    );

    return success(c, summary);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI generate summary error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate summary', 500);
  }
});

// POST /api/ai/generate/synthesis
app.post('/generate/synthesis', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateSynthesisSchema.parse(body);

    const aiService = getAIService();
    const result = await aiService.generateSynthesis(
      validated.lastAnswers,
      validated.userName,
      validated.coachingStyle,
      validated.language || 'fr'
    );

    return success(c, result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI generate synthesis error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate synthesis', 500);
  }
});

// POST /api/ai/analyze/themes-and-skills
app.post('/analyze/themes-and-skills', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = analyzeThemesAndSkillsSchema.parse(body);

    const aiService = getAIService();
    const result = await aiService.analyzeThemesAndSkills(
      validated.answers,
      validated.language || 'fr'
    );

    return success(c, result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI analyze themes and skills error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to analyze themes and skills', 500);
  }
});

// POST /api/ai/analyze/user-profile
app.post('/analyze/user-profile', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = analyzeUserProfileSchema.parse(body);

    const aiService = getAIService();
    const result = await aiService.analyzeUserProfile(
      validated.cvText,
      validated.language || 'fr'
    );

    return success(c, result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI analyze user profile error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to analyze user profile', 500);
  }
});

// POST /api/ai/suggest/optional-module
app.post('/suggest/optional-module', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = suggestOptionalModuleSchema.parse(body);

    const aiService = getAIService();
    const result = await aiService.suggestOptionalModule(
      validated.answers,
      validated.language || 'fr'
    );

    return success(c, result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI suggest optional module error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to suggest optional module', 500);
  }
});

// POST /api/ai/find/resource-leads
app.post('/find/resource-leads', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = findResourceLeadsSchema.parse(body);

    const aiService = getAIService();
    const result = await aiService.findResourceLeads(
      validated.actionItemText,
      validated.language || 'fr'
    );

    return success(c, result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    logger.error('AI find resource leads error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to find resource leads', 500);
  }
});

export default app;

