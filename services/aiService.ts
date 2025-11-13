/**
 * Multi-Provider AI Service
 * 
 * This service provides a unified interface for multiple AI providers (Gemini, OpenAI, Claude)
 * with automatic fallback mechanism when one provider fails.
 */

import { Answer, Package, Question, QuestionType, Summary, UserProfile, DashboardData, CoachingStyle } from '../types';

// Provider types
export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface AIProviderConfig {
  gemini?: {
    apiKey: string;
    enabled: boolean;
  };
  openai?: {
    apiKey: string;
    enabled: boolean;
    model?: string; // e.g., 'gpt-4o', 'gpt-4o-mini'
  };
  claude?: {
    apiKey: string;
    enabled: boolean;
    model?: string; // e.g., 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'
  };
}

export interface GenerateQuestionOptions {
  useJoker?: boolean;
  useGoogleSearch?: boolean;
  searchTopic?: string;
  isModuleQuestion?: { moduleId: string; questionNum: number };
}

export interface AIProviderInterface {
  name: AIProvider;
  generateQuestion(
    phaseKey: 'phase1' | 'phase2' | 'phase3',
    categoryIndex: number,
    previousAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    userProfile: UserProfile | null,
    options: GenerateQuestionOptions,
    language?: string
  ): Promise<Question>;
  
  generateSynthesis(
    lastAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    language?: string
  ): Promise<{ synthesis: string; confirmationRequest: string }>;
  
  generateSummary(
    answers: Answer[],
    pkg: Package,
    userName: string,
    coachingStyle: CoachingStyle,
    language?: string
  ): Promise<Summary>;
  
  analyzeThemesAndSkills(answers: Answer[], language?: string): Promise<DashboardData>;
  
  analyzeUserProfile(cvText: string, language?: string): Promise<UserProfile>;
  
  suggestOptionalModule(answers: Answer[], language?: string): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }>;
  
  findResourceLeads(actionItemText: string, language?: string): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }>;
}

// Provider implementations
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { ClaudeProvider } from './providers/claudeProvider';

class MultiProviderAIService {
  private providers: AIProviderInterface[] = [];
  private currentProviderIndex: number = 0;
  private providerErrors: Map<AIProvider, number> = new Map();

  constructor(config: AIProviderConfig) {
    // Initialize providers based on config
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      try {
        this.providers.push(new GeminiProvider(config.gemini.apiKey));
        console.log('✅ Gemini provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini provider:', error);
      }
    }

    if (config.openai?.enabled && config.openai?.apiKey) {
      try {
        this.providers.push(new OpenAIProvider(config.openai.apiKey, config.openai.model || 'gpt-4o'));
        console.log('✅ OpenAI provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI provider:', error);
      }
    }

    if (config.claude?.enabled && config.claude?.apiKey) {
      try {
        this.providers.push(new ClaudeProvider(config.claude.apiKey, config.claude.model || 'claude-3-5-sonnet-20241022'));
        console.log('✅ Claude provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Claude provider:', error);
      }
    }

    if (this.providers.length === 0) {
      throw new Error('No AI providers available. Please configure at least one provider in .env.local');
    }

    console.log(`✅ Multi-Provider AI Service initialized with ${this.providers.length} provider(s)`);
  }

  private async executeWithFallback<T>(
    operation: (provider: AIProviderInterface) => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    const maxAttempts = this.providers.length;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const provider = this.providers[this.currentProviderIndex];
      
      try {
        console.log(`🤖 Using ${provider.name} provider for ${operationName}`);
        const result = await operation(provider);
        
        // Reset error count on success
        this.providerErrors.set(provider.name, 0);
        return result;
      } catch (error) {
        // Preserve structured error if it exists
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const structuredError: any = errorObj;
        
        // Preserve rate limit error structure
        if ((error as any)?.code === 429 || (error as any)?.retryAfter || (error as any)?.nextRetryAt) {
          structuredError.code = (error as any).code;
          structuredError.retryAfter = (error as any).retryAfter;
          structuredError.nextRetryAt = (error as any).nextRetryAt;
          structuredError.retried = (error as any).retried;
        }
        
        lastError = structuredError;
        const errorCount = (this.providerErrors.get(provider.name) || 0) + 1;
        this.providerErrors.set(provider.name, errorCount);
        
        // Check if it's a quota/429 error - immediately switch to next provider
        const errorMessage = structuredError.message || '';
        const isQuotaError = structuredError.code === 429 ||
                            errorMessage.includes('429') || 
                            errorMessage.includes('RESOURCE_EXHAUSTED') || 
                            errorMessage.includes('quota');
        
        if (isQuotaError) {
          console.warn(`⚠️ ${provider.name} quota exceeded, switching to next provider immediately`);
          this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        } else {
          console.error(`❌ ${provider.name} provider failed for ${operationName}:`, structuredError.message);
          
          // If error count is too high, temporarily disable this provider
          if (errorCount >= 3) {
            console.warn(`⚠️ Temporarily disabling ${provider.name} provider due to repeated errors`);
            this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
          } else {
            // Try next provider immediately
            this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
          }
        }
        
        attempts++;
      }
    }

    // All providers failed - preserve structured error if it exists
    if (lastError && (lastError as any)?.code === 429) {
      const finalError: any = new Error(
        `All AI providers failed for ${operationName}. Last error: ${lastError?.message || 'Unknown error'}`
      );
      finalError.code = (lastError as any).code;
      finalError.retryAfter = (lastError as any).retryAfter;
      finalError.nextRetryAt = (lastError as any).nextRetryAt;
      finalError.retried = (lastError as any).retried;
      throw finalError;
    }
    
    throw new Error(
      `All AI providers failed for ${operationName}. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  async generateQuestion(
    phaseKey: 'phase1' | 'phase2' | 'phase3',
    categoryIndex: number,
    previousAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    userProfile: UserProfile | null,
    options: GenerateQuestionOptions,
    language?: string
  ): Promise<Question> {
    return this.executeWithFallback(
      (provider) => provider.generateQuestion(phaseKey, categoryIndex, previousAnswers, userName, coachingStyle, userProfile, options, language),
      'generateQuestion'
    );
  }

  async generateSynthesis(
    lastAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    language?: string
  ): Promise<{ synthesis: string; confirmationRequest: string }> {
    return this.executeWithFallback(
      (provider) => provider.generateSynthesis(lastAnswers, userName, coachingStyle, language),
      'generateSynthesis'
    );
  }

  async generateSummary(
    answers: Answer[],
    pkg: Package,
    userName: string,
    coachingStyle: CoachingStyle,
    language?: string
  ): Promise<Summary> {
    return this.executeWithFallback(
      (provider) => provider.generateSummary(answers, pkg, userName, coachingStyle, language),
      'generateSummary'
    );
  }

  async analyzeThemesAndSkills(answers: Answer[], language?: string): Promise<DashboardData> {
    return this.executeWithFallback(
      (provider) => provider.analyzeThemesAndSkills(answers, language),
      'analyzeThemesAndSkills'
    );
  }

  async analyzeUserProfile(cvText: string, language?: string): Promise<UserProfile> {
    return this.executeWithFallback(
      (provider) => provider.analyzeUserProfile(cvText, language),
      'analyzeUserProfile'
    );
  }

  async suggestOptionalModule(answers: Answer[], language?: string): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }> {
    return this.executeWithFallback(
      (provider) => provider.suggestOptionalModule(answers, language),
      'suggestOptionalModule'
    );
  }

  async findResourceLeads(actionItemText: string, language?: string): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }> {
    return this.executeWithFallback(
      (provider) => provider.findResourceLeads(actionItemText, language),
      'findResourceLeads'
    );
  }

  getCurrentProvider(): AIProvider {
    return this.providers[this.currentProviderIndex]?.name || 'gemini';
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.map(p => p.name);
  }
}

// Singleton instance
let aiServiceInstance: MultiProviderAIService | null = null;

export const getAIService = (): MultiProviderAIService => {
  if (!aiServiceInstance) {
    // Load configuration from environment variables
    // Support both process.env (for Vite define) and import.meta.env
    const getEnvVar = (keys: string[]): string | undefined => {
      for (const key of keys) {
        // Try multiple sources: process.env (Vite define), import.meta.env (Vite), window (browser)
        const value = (process.env as any)[key] || 
                     import.meta.env[key] || 
                     (typeof window !== 'undefined' && (window as any).__ENV__?.[key]);
        if (value && value !== 'undefined' && value !== '' && value !== 'null') {
          return value as string;
        }
      }
      return undefined;
    };
    
    // Debug: Log available env vars (without exposing keys)
    if (typeof window !== 'undefined') {
      const hasGemini = !!getEnvVar(['API_KEY', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY']);
      const hasOpenAI = !!getEnvVar(['OPENAI_API_KEY', 'VITE_OPENAI_API_KEY']);
      const hasClaude = !!getEnvVar(['CLAUDE_API_KEY', 'VITE_CLAUDE_API_KEY']);
      
      console.log('🔍 AI Provider Environment Check:', {
        hasGemini,
        hasOpenAI,
        hasClaude,
        processEnvKeys: Object.keys(process.env).filter(k => 
          k.includes('GEMINI') || k.includes('OPENAI') || k.includes('CLAUDE') || k === 'API_KEY'
        ),
        importMetaKeys: Object.keys(import.meta.env).filter(k => 
          k.includes('GEMINI') || k.includes('OPENAI') || k.includes('CLAUDE')
        ),
      });
      
      if (!hasGemini && !hasOpenAI && !hasClaude) {
        console.error('❌ No AI provider API keys found!');
        console.error('💡 Please configure at least one API key in .env.local:');
        console.error('   - VITE_GEMINI_API_KEY=your_key');
        console.error('   - VITE_OPENAI_API_KEY=your_key (optional)');
        console.error('   - VITE_CLAUDE_API_KEY=your_key (optional)');
      }
    }

    // Get API keys with fallback order
    const geminiKey = getEnvVar(['API_KEY', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY']);
    const openaiKey = getEnvVar(['OPENAI_API_KEY', 'VITE_OPENAI_API_KEY']);
    const claudeKey = getEnvVar(['CLAUDE_API_KEY', 'VITE_CLAUDE_API_KEY']);
    
    const config: AIProviderConfig = {
      gemini: {
        apiKey: geminiKey || '',
        enabled: !!geminiKey,
      },
      openai: {
        apiKey: openaiKey || '',
        enabled: !!openaiKey,
        model: getEnvVar(['OPENAI_MODEL', 'VITE_OPENAI_MODEL']) || 'gpt-4o',
      },
      claude: {
        apiKey: claudeKey || '',
        enabled: !!claudeKey,
        model: getEnvVar(['CLAUDE_MODEL', 'VITE_CLAUDE_MODEL']) || 'claude-3-5-sonnet-20241022',
      },
    };
    
    // Log configuration status (without exposing keys)
    console.log('🤖 AI Provider Configuration:', {
      gemini: config.gemini.enabled ? `✅ Enabled (key length: ${config.gemini.apiKey.length})` : '❌ Disabled',
      openai: config.openai.enabled ? `✅ Enabled (key length: ${config.openai.apiKey.length})` : '❌ Disabled',
      claude: config.claude.enabled ? `✅ Enabled (key length: ${config.claude.apiKey.length})` : '❌ Disabled',
    });

    // Check for fallback model
    const fallbackModel = getEnvVar(['GEMINI_FALLBACK_MODEL', 'VITE_GEMINI_FALLBACK_MODEL']);
    if (fallbackModel && config.gemini?.enabled) {
      console.log(`🔄 Fallback model configured: ${fallbackModel}`);
    }

    aiServiceInstance = new MultiProviderAIService(config);
  }
  return aiServiceInstance;
};

// Helper to get current language from i18next
const getCurrentLanguage = (): string => {
  try {
    // Try to get language from i18next if available
    if (typeof window !== 'undefined' && (window as any).i18next) {
      return (window as any).i18next.language || 'fr';
    }
    // Fallback to localStorage
    return localStorage.getItem('i18nextLng') || 'fr';
  } catch {
    return 'fr';
  }
};

// Try to use backend AI proxy first, fallback to frontend AI service
const useBackendAI = (): boolean => {
  // Check if backend AI is available (not returning 501)
  // For now, we'll use a feature flag or check API availability
  return import.meta.env.VITE_USE_BACKEND_AI === 'true' || false;
};

// Export convenience functions that match the old geminiService interface
// These functions now try backend API first, then fallback to frontend AI service
export const generateQuestion = async (
  phaseKey: 'phase1' | 'phase2' | 'phase3',
  categoryIndex: number,
  previousAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle,
  userProfile: UserProfile | null = null,
  options: GenerateQuestionOptions = {},
  language?: string
): Promise<Question> => {
  // Try backend API first if enabled
  if (useBackendAI()) {
    try {
      const { apiClient } = await import('./apiClient');
      const token = localStorage.getItem('bilan_auth_token');
      const response = await apiClient.generateQuestion({
        phaseKey,
        categoryIndex,
        previousAnswers,
        userName,
        coachingStyle,
        userProfile,
        options,
        language: language || getCurrentLanguage(),
      }, token);
      
      // Check if backend returned an error (501 = not implemented)
      if (response.error && response.error.includes('501')) {
        throw new Error('Backend AI not implemented, using frontend fallback');
      }
      
      return response;
    } catch (error: any) {
      // If backend fails, fallback to frontend AI service
      console.warn('Backend AI failed, using frontend AI service:', error.message);
    }
  }
  
  // Fallback to frontend AI service
  const service = getAIService();
  return service.generateQuestion(phaseKey, categoryIndex, previousAnswers, userName, coachingStyle, userProfile, options, language || getCurrentLanguage());
};

export const generateSynthesis = async (
  lastAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle,
  language?: string
): Promise<{ synthesis: string; confirmationRequest: string }> => {
  const service = getAIService();
  return service.generateSynthesis(lastAnswers, userName, coachingStyle, language || getCurrentLanguage());
};

export const generateSummary = async (
  answers: Answer[],
  pkg: Package,
  userName: string,
  coachingStyle: CoachingStyle,
  language?: string
): Promise<Summary> => {
  const service = getAIService();
  return service.generateSummary(answers, pkg, userName, coachingStyle, language || getCurrentLanguage());
};

export const analyzeThemesAndSkills = async (answers: Answer[], language?: string): Promise<DashboardData> => {
  const service = getAIService();
  return service.analyzeThemesAndSkills(answers, language || getCurrentLanguage());
};

export const analyzeUserProfile = async (cvText: string, language?: string): Promise<UserProfile> => {
  const service = getAIService();
  return service.analyzeUserProfile(cvText, language || getCurrentLanguage());
};

export const suggestOptionalModule = async (
  answers: Answer[],
  language?: string
): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }> => {
  const service = getAIService();
  return service.suggestOptionalModule(answers, language || getCurrentLanguage());
};

export const findResourceLeads = async (
  actionItemText: string,
  language?: string
): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }> => {
  const service = getAIService();
  return service.findResourceLeads(actionItemText, language || getCurrentLanguage());
};

