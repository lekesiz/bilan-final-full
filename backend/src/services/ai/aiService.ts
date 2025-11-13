/**
 * Multi-Provider AI Service (Backend)
 * 
 * Server-side AI service with automatic fallback mechanism
 */

import type {
  AIProvider,
  AIProviderInterface,
  AIProviderConfig,
  Question,
  Answer,
  Package,
  Summary,
  UserProfile,
  DashboardData,
  CoachingStyle,
  GenerateQuestionOptions,
} from '../../types/ai.js';
import { GeminiProvider } from './providers/geminiProvider.js';
// TODO: Add OpenAI and Claude providers when needed
// import { OpenAIProvider } from './providers/openaiProvider.js';
// import { ClaudeProvider } from './providers/claudeProvider.js';

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

    // TODO: Add OpenAI and Claude providers
    // if (config.openai?.enabled && config.openai?.apiKey) {
    //   try {
    //     this.providers.push(new OpenAIProvider(config.openai.apiKey, config.openai.model || 'gpt-4o'));
    //     console.log('✅ OpenAI provider initialized');
    //   } catch (error) {
    //     console.error('❌ Failed to initialize OpenAI provider:', error);
    //   }
    // }

    // if (config.claude?.enabled && config.claude?.apiKey) {
    //   try {
    //     this.providers.push(new ClaudeProvider(config.claude.apiKey, config.claude.model || 'claude-3-5-sonnet-20241022'));
    //     console.log('✅ Claude provider initialized');
    //   } catch (error) {
    //     console.error('❌ Failed to initialize Claude provider:', error);
    //   }
    // }

    if (this.providers.length === 0) {
      throw new Error('No AI providers available. Please configure at least one provider in .env');
    }

    console.log(`✅ Multi-Provider AI Service initialized with ${this.providers.length} provider(s)`);
  }

  private async executeWithFallback<T>(
    operation: (provider: AIProviderInterface) => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    const maxAttempts = this.providers.length * 2; // Try each provider up to 2 times
    let attempts = 0;

    while (attempts < maxAttempts) {
      const provider = this.providers[this.currentProviderIndex];
      
      try {
        const result = await operation(provider);
        
        // Reset error count on success
        this.providerErrors.set(provider.name, 0);
        return result;
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;
        
        // Track provider errors
        const errorCount = (this.providerErrors.get(provider.name) || 0) + 1;
        this.providerErrors.set(provider.name, errorCount);
        
        // If provider failed 3 times, skip to next
        if (errorCount >= 3) {
          console.warn(`⚠️ Provider ${provider.name} has failed ${errorCount} times, trying next provider`);
          this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
          continue;
        }
        
        // Try next provider
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      }
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
}

// Singleton instance
let aiServiceInstance: MultiProviderAIService | null = null;

export const getAIService = (): MultiProviderAIService => {
  if (!aiServiceInstance) {
    const config: AIProviderConfig = {
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        enabled: !!process.env.GEMINI_API_KEY,
      },
      // TODO: Add OpenAI and Claude when providers are implemented
      // openai: {
      //   apiKey: process.env.OPENAI_API_KEY || '',
      //   enabled: !!process.env.OPENAI_API_KEY,
      //   model: process.env.OPENAI_MODEL || 'gpt-4o',
      // },
      // claude: {
      //   apiKey: process.env.CLAUDE_API_KEY || '',
      //   enabled: !!process.env.CLAUDE_API_KEY,
      //   model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      // },
    };

    console.log('🤖 AI Provider Configuration:', {
      gemini: config.gemini?.enabled ? `✅ Enabled` : '❌ Disabled',
      // openai: config.openai?.enabled ? `✅ Enabled` : '❌ Disabled',
      // claude: config.claude?.enabled ? `✅ Enabled` : '❌ Disabled',
    });

    aiServiceInstance = new MultiProviderAIService(config);
  }
  return aiServiceInstance;
};

