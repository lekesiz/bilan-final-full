import { z } from 'zod';

// User Profile Schema - Strict validation to prevent JSON injection
export const userProfileSchema = z.object({
  fullName: z.string().max(255).optional(),
  currentRole: z.string().max(255),
  keySkills: z.array(z.string().max(100)).max(50), // Max 50 skills, each max 100 chars
  pastExperiences: z.array(z.string().max(500)).max(50), // Max 50 experiences, each max 500 chars
}).strict(); // Reject unknown properties

// Dashboard Data Schema - Strict validation
export const dashboardDataSchema = z.object({
  themes: z.array(z.object({
    text: z.string().max(255),
    weight: z.number().min(1).max(10),
  })).max(20).optional(),
  skills: z.array(z.object({
    label: z.string().max(100),
    score: z.number().min(1).max(5),
  })).max(20).optional(),
}).strict().optional();

// Schema pour créer un assessment
export const createAssessmentSchema = z.object({
  userName: z.string().min(1, 'User name is required').max(255),
  packageId: z.enum(['decouverte', 'approfondi', 'strategique']),
  packageName: z.string().min(1).max(255),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  totalQuestions: z.number().int().positive(),
  userProfile: userProfileSchema.optional(),
  dashboardData: dashboardDataSchema.optional(),
});

// Schema pour mettre à jour un assessment
export const updateAssessmentSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  lastActivityAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  userProfile: userProfileSchema.optional(),
  dashboardData: dashboardDataSchema.optional(),
}).strict();

// Schema pour créer une answer
export const createAnswerSchema = z.object({
  questionId: z.string().min(1).max(255),
  questionTitle: z.string().min(1),
  questionDescription: z.string().optional(), // Soru açıklaması
  questionType: z.enum(['PARAGRAPH', 'MULTIPLE_CHOICE']),
  questionTheme: z.string().optional(),
  questionChoices: z.array(z.string()).optional(), // Multiple choice seçenekleri
  value: z.string().min(1),
});

// Schema pour mettre à jour une answer
export const updateAnswerSchema = z.object({
  value: z.string().min(1, 'Answer value is required'),
});

// Schema pour créer une summary
export const createSummarySchema = z.object({
  profileType: z.string().min(1).max(255),
  priorityThemes: z.array(z.string()),
  maturityLevel: z.string().min(1),
  keyStrengths: z.array(z.object({
    text: z.string(),
    sources: z.array(z.string()),
  })),
  areasForDevelopment: z.array(z.object({
    text: z.string(),
    sources: z.array(z.string()),
  })),
  recommendations: z.array(z.string()),
  actionPlan: z.object({
    shortTerm: z.array(z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean().optional(),
    })),
    mediumTerm: z.array(z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean().optional(),
    })),
  }),
});

// Schema pour satisfaction rating
export const createSatisfactionSchema = z.object({
  phaseName: z.string().min(1).max(255),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Schema pour module
export const createModuleSchema = z.object({
  moduleId: z.enum(['transition-management', 'self-confidence', 'work-life-balance']),
  reason: z.string().min(1),
  accepted: z.boolean(),
});
