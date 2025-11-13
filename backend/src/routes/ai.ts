import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { error, success } from '../utils/response.js';
import { z } from 'zod';

// AI Service will be imported from a shared location or recreated in backend
// For now, we'll create a proxy that calls the AI providers server-side

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

    // TODO: Implement AI service call here
    // For now, return error indicating implementation needed
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI generate question error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate question', 500);
  }
});

// POST /api/ai/generate/summary
app.post('/generate/summary', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateSummarySchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI generate summary error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate summary', 500);
  }
});

// POST /api/ai/generate/synthesis
app.post('/generate/synthesis', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateSynthesisSchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI generate synthesis error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to generate synthesis', 500);
  }
});

// POST /api/ai/analyze/themes-and-skills
app.post('/analyze/themes-and-skills', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = analyzeThemesAndSkillsSchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI analyze themes and skills error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to analyze themes and skills', 500);
  }
});

// POST /api/ai/analyze/user-profile
app.post('/analyze/user-profile', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = analyzeUserProfileSchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI analyze user profile error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to analyze user profile', 500);
  }
});

// POST /api/ai/suggest/optional-module
app.post('/suggest/optional-module', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = suggestOptionalModuleSchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI suggest optional module error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to suggest optional module', 500);
  }
});

// POST /api/ai/find/resource-leads
app.post('/find/resource-leads', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validated = findResourceLeadsSchema.parse(body);

    // TODO: Implement AI service call here
    return error(c, 'AI service not yet implemented in backend. Please use frontend AI service temporarily.', 501);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(c, `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);
    }
    console.error('AI find resource leads error:', err);
    return error(c, err instanceof Error ? err.message : 'Failed to find resource leads', 500);
  }
});

export default app;

