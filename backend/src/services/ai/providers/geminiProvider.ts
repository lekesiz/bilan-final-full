/**
 * Gemini AI Provider (Backend)
 * 
 * Implementation of AIProviderInterface for Google Gemini API
 * Server-side only - no dangerouslyAllowBrowser needed
 */

import { GoogleGenAI, Type } from "@google/genai";
import type {
  Answer,
  Package,
  Question,
  Summary,
  UserProfile,
  DashboardData,
  CoachingStyle,
  GenerateQuestionOptions,
  AIProviderInterface,
} from '../../../types/ai.js';
import { QuestionType } from '../../../types/ai.js';
import { QUESTION_CATEGORIES } from '../../../constants/questionCategories.js';
import { callGeminiWithBackoff } from '../../../utils/geminiClient.js';
import { logger } from '../../../utils/logger.js';

export class GeminiProvider implements AIProviderInterface {
  name: 'gemini' = 'gemini';
  private ai: GoogleGenAI;
  private fallbackModel: string | null = null;
  private currentModel: string = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
    
    // Check for fallback model from env
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL as string;
    if (fallbackModel) {
      this.fallbackModel = fallbackModel;
      logger.info(`🔄 Fallback model configured: ${fallbackModel}`);
    }
  }

  private getSystemInstruction(style: CoachingStyle, language: string = 'fr'): string {
    const languageMap: { [key: string]: string } = {
      'fr': 'French',
      'en': 'English',
      'de': 'German',
      'tr': 'Turkish'
    };
    const langName = languageMap[language] || 'French';
    
    switch (style) {
      case 'analytic':
        return `You are an analytical and structured career coach. Your approach is methodical and data-driven. You ask precise questions to deconstruct problems logically. Language: ${langName}.`;
      case 'creative':
        return `You are a creative and inspiring career coach. Your approach is to open new perspectives and encourage out-of-the-box thinking. You use metaphors and ask stimulating questions. Language: ${langName}.`;
      case 'collaborative':
      default:
        return `You are a collaborative and encouraging career coach. Your tone is warm, supportive, and empathetic. You focus on the user's strengths and build their confidence. Language: ${langName}.`;
    }
  }

  private parseJsonResponse<T>(jsonString: string, functionName: string): T {
    try {
      return JSON.parse(jsonString.trim()) as T;
    } catch (error) {
      console.error(`Error parsing JSON from ${functionName}:`, error);
      console.error("Received text:", jsonString);
      throw new Error(`Failed to parse JSON response in ${functionName}.`);
    }
  }

  // Schemas
  private questionSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique identifier for the question (e.g., 'motivation-01')." },
      title: { type: Type.STRING, description: "The main question text in French." },
      description: { type: Type.STRING, description: "Optional: additional context or explanation for the question in French." },
      type: { type: Type.STRING, enum: ['PARAGRAPH', 'MULTIPLE_CHOICE'], description: "The type of answer expected." },
      theme: { type: Type.STRING, description: "The main theme of the question (e.g., 'Motivations', 'Compétences Techniques')." },
      choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of choices, only if type is MULTIPLE_CHOICE." },
      required: { type: Type.BOOLEAN, description: "Whether the question is mandatory." }
    },
    required: ["id", "title", "type", "theme", "required"]
  };

  private synthesisSchema = {
    type: Type.OBJECT,
    properties: {
      synthesis: { type: Type.STRING, description: "A concise, one-sentence summary of the user's last answers in French." },
      confirmationRequest: { type: Type.STRING, description: "A polite question to confirm if the summary is correct in French." }
    },
    required: ["synthesis", "confirmationRequest"]
  };

  private summaryPointSchema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "The summarized point (strength or area for development) in French." },
      sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 1 to 3 direct quotes from the user's answers that justify this point." }
    },
    required: ["text", "sources"]
  };

  private actionPlanItemSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique identifier for the action item (e.g., 'short-term-1')." },
      text: { type: Type.STRING, description: "The specific action item text in French." }
    },
    required: ["id", "text"]
  };

  private summarySchema = {
    type: Type.OBJECT,
    properties: {
      profileType: { type: Type.STRING, description: "A descriptive title for the user's professional profile in French (e.g., 'Le Spécialiste en Transition', 'Le Leader Créatif')." },
      priorityThemes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 main themes that emerged during the assessment." },
      maturityLevel: { type: Type.STRING, description: "A sentence describing the user's level of clarity regarding their career project in French." },
      keyStrengths: { type: Type.ARRAY, items: this.summaryPointSchema, description: "A list of key strengths identified." },
      areasForDevelopment: { type: Type.ARRAY, items: this.summaryPointSchema, description: "A list of areas for development." },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 general recommendations in French." },
      actionPlan: {
        type: Type.OBJECT,
        properties: {
          shortTerm: { type: Type.ARRAY, items: this.actionPlanItemSchema, description: "Action items for the next 1-3 months." },
          mediumTerm: { type: Type.ARRAY, items: this.actionPlanItemSchema, description: "Action items for the next 3-6 months." }
        },
        required: ["shortTerm", "mediumTerm"]
      }
    },
    required: ["profileType", "priorityThemes", "maturityLevel", "keyStrengths", "areasForDevelopment", "recommendations", "actionPlan"]
  };

  private userProfileSchema = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING, description: "The user's full name, if available." },
      currentRole: { type: Type.STRING, description: "The user's most recent or current job title." },
      keySkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the most prominent skills mentioned." },
      pastExperiences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A brief summary of key past experiences or companies." }
    },
    required: ["currentRole", "keySkills", "pastExperiences"]
  };

  private dashboardDataSchema = {
    type: Type.OBJECT,
    properties: {
      themes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            weight: { type: Type.NUMBER, description: "A value from 1 to 10 representing importance." }
          },
          required: ["text", "weight"]
        }
      },
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Communication", "Leadership", "Analyse", "Adaptabilité", "Collaboration"] },
            score: { type: Type.NUMBER, description: "A score from 1 to 5." }
          },
          required: ["label", "score"]
        }
      }
    },
    required: ["themes", "skills"]
  };

  private optionalModuleSchema = {
    type: Type.OBJECT,
    properties: {
      isNeeded: { type: Type.BOOLEAN, description: "Set to true only if a strong, specific user need is detected." },
      moduleId: { type: Type.STRING, enum: ["transition-management", "self-confidence", "work-life-balance"], description: "The ID of the suggested module if needed." },
      reason: { type: Type.STRING, description: "A short, polite sentence in French explaining why this module is suggested." }
    },
    required: ["isNeeded"],
  };

  private resourceLeadsSchema = {
    type: Type.OBJECT,
    properties: {
      searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      resourceTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
      platformExamples: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["searchKeywords", "resourceTypes", "platformExamples"]
  };

  async generateQuestion(
    phaseKey: 'phase1' | 'phase2' | 'phase3',
    categoryIndex: number,
    previousAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    userProfile: UserProfile | null = null,
    options: GenerateQuestionOptions = {},
    language: string = 'fr'
  ): Promise<Question> {
    const systemInstruction = this.getSystemInstruction(coachingStyle, language);
    
    const history = previousAnswers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');
    
    const previousQuestionTitles = previousAnswers
      .map(a => (a as any).questionTitle || '')
      .filter(title => title.length > 0);
    
    const lastAnswer = previousAnswers[previousAnswers.length - 1];
    let contextAwareInstruction = "";
    if (lastAnswer) {
      const answerLength = lastAnswer.value.length;
      if (answerLength < 50) {
        contextAwareInstruction = "IMPORTANT: The user's last answer was very short. Ask a more specific, deeper question to help them elaborate.";
      } else if (answerLength > 300) {
        contextAwareInstruction = "IMPORTANT: The user's last answer was very detailed. Acknowledge their thoroughness and ask a follow-up question.";
      }
    }

    let taskDescription = "";
    if (options.isModuleQuestion) {
      taskDescription = `This is question ${options.isModuleQuestion.questionNum}/3 for the optional module on '${options.isModuleQuestion.moduleId}'.`;
    } else {
      const phaseInfo = QUESTION_CATEGORIES[phaseKey];
      const category = phaseInfo.categories[categoryIndex];
      taskDescription = `Phase: ${phaseInfo.name}, Current Category: ${category}. Generate the next question.`;
    }

    let profileContext = "";
    if (userProfile && previousAnswers.length === 0) {
      profileContext = `Role: ${userProfile.currentRole}, Key Skills: ${userProfile.keySkills.join(', ')}, Past Experiences: ${userProfile.pastExperiences.join(', ')}.`;
    }

    let specialInstruction = "";
    if (options.useJoker) {
      specialInstruction = "CRITICAL: The user is stuck. Reformulate from a different angle or ask a simpler question.";
    } else if (options.useGoogleSearch && options.searchTopic) {
      specialInstruction = `CRITICAL: The user mentioned '${options.searchTopic}'. Use Google Search results to ask an enriched follow-up question.`;
    }

    const questionNumber = previousAnswers.length + 1;
    const difficultyInstruction = questionNumber <= 5 
      ? "This is an early question. Keep it simple and welcoming."
      : questionNumber <= 15
      ? "This is a mid-assessment question. Go deeper."
      : "This is a later question. Ask deeper, more reflective questions.";
    
    const duplicatePrevention = previousQuestionTitles.length > 0
      ? `CRITICAL: Do NOT repeat these questions: ${previousQuestionTitles.slice(-5).join(', ')}.`
      : "";
    
    const prompt = `Context: User Name: ${userName}. ${profileContext} 

Previous Q&A History:
${history || "None."}

${duplicatePrevention}
${contextAwareInstruction}
${difficultyInstruction}
${specialInstruction}

Task: ${taskDescription}

The response MUST be a valid JSON object.`;

    const config: any = {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: this.questionSchema,
    };

    if (options.useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      const response = await callGeminiWithBackoff(
        async () => {
          return await this.ai.models.generateContent({
            model: this.currentModel,
            contents: prompt,
            config: config,
          });
        },
        prompt,
        this.currentModel,
        'generateQuestion'
      );

          const responseText = (response as any).text || (response as any).response?.text || '';
          if (!responseText) {
            throw new Error('Empty response from Gemini API');
          }
          const questionData = this.parseJsonResponse<any>(responseText, 'generateQuestion');
      const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
      return { ...questionData, type, choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined } as Question;
    } catch (error: any) {
      // Try fallback model if rate limited
      if (this.fallbackModel && (error?.code === 429 || error?.error?.code === 429)) {
          logger.warn(`⚠️ Switching to fallback model: ${this.fallbackModel}`);
        try {
          const response = await this.ai.models.generateContent({
            model: this.fallbackModel,
            contents: prompt,
            config: config,
          });
          const responseText = (response as any).text || (response as any).response?.text || '';
          if (!responseText) {
            throw new Error('Empty response from Gemini API (fallback)');
          }
          const questionData = this.parseJsonResponse<any>(responseText, 'generateQuestion');
          const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
          return { ...questionData, type, choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined } as Question;
        } catch (fallbackError) {
          throw error; // Throw original error if fallback fails
        }
      }
      throw error;
    }
  }

  async generateSynthesis(
    lastAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    language: string = 'fr'
  ): Promise<{ synthesis: string; confirmationRequest: string }> {
    const systemInstruction = this.getSystemInstruction(coachingStyle, language);
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const history = lastAnswers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}. Task: Create a concise, one-sentence summary and a polite confirmation question. Language: ${langName}. Last answers: ${history}`;
    
      const model = this.currentModel || 'gemini-2.5-flash';
      const response = await callGeminiWithBackoff(
        async () => {
          return await this.ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: this.synthesisSchema }
          });
        },
        prompt,
        model,
        'generateSynthesis'
      );
    
    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    return this.parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(responseText, 'generateSynthesis');
  }

  async generateSummary(
    answers: Answer[],
    pkg: Package,
    userName: string,
    coachingStyle: CoachingStyle,
    language: string = 'fr'
  ): Promise<Summary> {
    const systemInstruction = this.getSystemInstruction(coachingStyle, language);
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    
    const fullTranscript = answers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');

    const maxTranscriptLength = 10000;
    const truncatedTranscript = fullTranscript.length > maxTranscriptLength
      ? fullTranscript.substring(0, maxTranscriptLength) + '\n\n[... transcript tronqué ...]'
      : fullTranscript;

    const prompt = `Context: User Name: ${userName}, Package: ${pkg.name}. 

Transcript:
${truncatedTranscript}

Task: Generate a comprehensive, personalized summary in ${langName}. Use the user's name and reference specific details. Each point MUST include 'sources' array with quotes.`;

    const model = this.currentModel === 'gemini-2.5-flash' ? 'gemini-2.5-pro' : (this.currentModel || 'gemini-2.5-pro');
    const response = await callGeminiWithBackoff(
      async () => {
        return await this.ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: this.summarySchema
          }
        });
      },
      prompt,
      model,
      'generateSummary'
    );

    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    const summaryData = this.parseJsonResponse<any>(responseText, 'generateSummary');
    const processActionPlan = (items: any[]): any[] => items.map(item => ({ ...item, completed: false }));

    if (summaryData.actionPlan && summaryData.actionPlan.shortTerm && summaryData.actionPlan.mediumTerm) {
      return {
        ...summaryData,
        actionPlan: {
          shortTerm: processActionPlan(summaryData.actionPlan.shortTerm),
          mediumTerm: processActionPlan(summaryData.actionPlan.mediumTerm)
        }
      };
    }

    return { ...summaryData, actionPlan: { shortTerm: [], mediumTerm: [] } };
  }

  async analyzeThemesAndSkills(answers: Answer[], language: string = 'fr'): Promise<DashboardData> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers. Identify themes and assess 5 core skills. Language: ${langName}. Answers: --- ${history} ---`;
    
    const response = await callGeminiWithBackoff(
      async () => {
        return await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: this.dashboardDataSchema },
        });
      },
      prompt,
      'gemini-2.5-flash',
      'analyzeThemesAndSkills'
    );
    
    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    return this.parseJsonResponse<DashboardData>(responseText, 'analyzeThemesAndSkills');
  }

  async analyzeUserProfile(cvText: string, language: string = 'fr'): Promise<UserProfile> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const prompt = `Analyze the following professional profile text and extract key information. Language: ${langName}. Text: --- ${cvText} ---`;
    
    const model = this.currentModel || 'gemini-2.5-flash';
    const response = await callGeminiWithBackoff(
      async () => {
        return await this.ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: this.userProfileSchema },
        });
      },
      prompt,
      model,
      'analyzeUserProfile'
    );
    
    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    return this.parseJsonResponse<UserProfile>(responseText, 'analyzeUserProfile');
  }

  async suggestOptionalModule(answers: Answer[], language: string = 'fr'): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they need a module on: 'transition-management', 'self-confidence', or 'work-life-balance'. Only set isNeeded to true if the signal is clear. Language: ${langName}. Answers: --- ${history} ---`;
    
    const model = this.currentModel || 'gemini-2.5-flash';
    const response = await callGeminiWithBackoff(
      async () => {
        return await this.ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: this.optionalModuleSchema },
        });
      },
      prompt,
      model,
      'suggestOptionalModule'
    );
    
    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    return this.parseJsonResponse<any>(responseText, 'suggestOptionalModule');
  }

  async findResourceLeads(actionItemText: string, language: string = 'fr'): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const prompt = `Context: Action item: "${actionItemText}". Provide research leads in ${langName}: searchKeywords (3-5), resourceTypes (2-4), platformExamples (2-3).`;
    
    const model = this.currentModel || 'gemini-2.5-flash';
    const response = await callGeminiWithBackoff(
      async () => {
        return await this.ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: this.resourceLeadsSchema }
        });
      },
      prompt,
      model,
      'findResourceLeads'
    );
    
    const responseText = (response as any).text || (response as any).response?.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    return this.parseJsonResponse<any>(responseText, 'findResourceLeads');
  }
}

