import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAIService, generateQuestion, generateSummary } from '../../../services/aiService';
import type { Answer, Package, CoachingStyle } from '../../../types';

// Mock environment variables
vi.mock('../../../services/aiService', async () => {
  const actual = await vi.importActual('../../../services/aiService');
  return {
    ...actual,
    getAIService: vi.fn(),
  };
});

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export getAIService function', () => {
    expect(getAIService).toBeDefined();
    expect(typeof getAIService).toBe('function');
  });

  it('should export generateQuestion function', () => {
    expect(generateQuestion).toBeDefined();
    expect(typeof generateQuestion).toBe('function');
  });

  it('should export generateSummary function', () => {
    expect(generateSummary).toBeDefined();
    expect(typeof generateSummary).toBe('function');
  });

  describe('generateQuestion', () => {
    it('should accept correct parameters', async () => {
      const mockQuestion = {
        id: 'test-id',
        title: 'Test Question',
        type: 'PARAGRAPH' as const,
        theme: 'test',
        required: true,
      };

      // Mock the service
      const mockService = {
        generateQuestion: vi.fn().mockResolvedValue(mockQuestion),
      };

      vi.mocked(getAIService).mockReturnValue(mockService as any);

      const answers: Answer[] = [];
      const result = await generateQuestion(
        'phase1',
        0,
        answers,
        'Test User',
        'collaborative',
        null,
        {},
        'fr'
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Question');
    });
  });

  describe('generateSummary', () => {
    it('should accept correct parameters', async () => {
      const mockSummary = {
        profileType: 'Test Profile',
        priorityThemes: [],
        maturityLevel: 'Intermediate',
        keyStrengths: [],
        areasForDevelopment: [],
        recommendations: [],
        actionPlan: {
          shortTerm: [],
          mediumTerm: [],
        },
      };

      const mockPackage: Package = {
        id: 'test',
        name: 'Test Package',
        totalHours: 8,
        totalQuestionnaires: 30,
        description: 'Test',
        features: [],
        phases: {
          phase1: { questionnaires: 1, duration_min: 60, name: 'Phase 1' },
          phase2: { questionnaires: 1, duration_min: 120, name: 'Phase 2' },
          phase3: { questionnaires: 1, duration_min: 120, name: 'Phase 3' },
        },
      };

      // Mock the service
      const mockService = {
        generateSummary: vi.fn().mockResolvedValue(mockSummary),
      };

      vi.mocked(getAIService).mockReturnValue(mockService as any);

      const answers: Answer[] = [];
      const result = await generateSummary(
        answers,
        mockPackage,
        'Test User',
        'collaborative',
        'fr'
      );

      expect(result).toBeDefined();
      expect(result.profileType).toBe('Test Profile');
    });
  });
});

