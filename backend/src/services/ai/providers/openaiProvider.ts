/**
 * OpenAI Provider (Backend)
 * 
 * Implementation of AIProviderInterface for OpenAI API
 * Server-side only - no dangerouslyAllowBrowser needed
 */

import OpenAI from 'openai';
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

export class OpenAIProvider implements AIProviderInterface {
  name: 'openai' = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('OPENAI_API_KEY is required');
    }
    // No dangerouslyAllowBrowser needed - server-side only
    this.client = new OpenAI({ apiKey });
    this.model = model;
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
        return `You are an analytical and structured career coach. Your approach is methodical and data-driven. You ask precise questions to deconstruct problems logically. Language: ${langName}. Always respond with valid JSON only.`;
      case 'creative':
        return `You are a creative and inspiring career coach. Your approach is to open new perspectives and encourage out-of-the-box thinking. You use metaphors and ask stimulating questions. Language: ${langName}. Always respond with valid JSON only.`;
      case 'collaborative':
      default:
        return `You are a collaborative and encouraging career coach. Your tone is warm, supportive, and empathetic. You focus on the user's strengths and build their confidence. Language: ${langName}. Always respond with valid JSON only.`;
    }
  }

  private parseJsonResponse<T>(jsonString: string, functionName: string): T {
    try {
      const cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error(`Error parsing JSON from ${functionName}:`, error);
      console.error("Received text:", jsonString);
      throw new Error(`Failed to parse JSON response in ${functionName}.`);
    }
  }

  private async callOpenAI(prompt: string, systemInstruction: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API returned empty response');
    }
    return content;
  }

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
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    
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
        contextAwareInstruction = "IMPORTANT: The user's last answer was very short. Ask a more specific, deeper question.";
      } else if (answerLength > 300) {
        contextAwareInstruction = "IMPORTANT: The user's last answer was very detailed. Acknowledge their thoroughness.";
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
      specialInstruction = "CRITICAL: The user is stuck. Reformulate from a different angle.";
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

Generate a question in ${langName} as JSON:
{
  "id": "unique-id",
  "title": "Question text",
  "description": "Optional context",
  "type": "PARAGRAPH" or "MULTIPLE_CHOICE",
  "theme": "Theme name",
  "choices": ["option1", "option2"] (only if MULTIPLE_CHOICE),
  "required": true
}`;

    const response = await this.callOpenAI(prompt, systemInstruction);
    const questionData = this.parseJsonResponse<any>(response, 'generateQuestion');
    const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
    return { ...questionData, type, choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined } as Question;
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
    
    const history = lastAnswers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');
    
    const answerExamples = lastAnswers
      .map(a => a.value.length > 20 ? a.value.substring(0, 100) + '...' : a.value)
      .join(' | ');
    
    const prompt = `Context: User Name: ${userName}. 

Task: Create a concise, personalized summary with specific examples. Then formulate a polite confirmation question.

IMPORTANT: 
- Include at least one specific detail from the user's answers
- Keep it concise (1-2 sentences maximum)

Last answers:
${history}

Key points: ${answerExamples}

Respond as JSON:
{
  "synthesis": "One sentence summary in ${langName} with examples",
  "confirmationRequest": "Polite confirmation question in ${langName}"
}`;

    const response = await this.callOpenAI(prompt, systemInstruction);
    return this.parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(response, 'generateSynthesis');
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

Task: Generate a comprehensive, personalized summary in ${langName} as JSON.

CRITICAL REQUIREMENTS:
1. Use the user's name (${userName}) and reference specific details
2. Each point MUST include 'sources' array with 1-3 direct quotes
3. Action Plan items must have unique 'id' and 'text'
4. Profile Type: descriptive, personalized title
5. Priority Themes: 3-5 themes from answers
6. Recommendations: 3-4 specific recommendations

JSON structure:
{
  "profileType": "Title in ${langName}",
  "priorityThemes": ["theme1", ...],
  "maturityLevel": "Description in ${langName}",
  "keyStrengths": [{"text": "strength", "sources": ["quote1", ...]}, ...],
  "areasForDevelopment": [{"text": "area", "sources": ["quote1", ...]}, ...],
  "recommendations": ["rec1", ...],
  "actionPlan": {
    "shortTerm": [{"id": "id1", "text": "action1"}, ...],
    "mediumTerm": [{"id": "id2", "text": "action2"}, ...]
  }
}`;

    const response = await this.callOpenAI(prompt, systemInstruction);
    const summaryData = this.parseJsonResponse<any>(response, 'generateSummary');
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
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers. Identify themes and assess 5 core skills.

Respond as JSON:
{
  "themes": [{"text": "theme1", "weight": 8}, ...],
  "skills": [
    {"label": "Communication", "score": 4},
    {"label": "Leadership", "score": 3},
    {"label": "Analyse", "score": 5},
    {"label": "Adaptabilité", "score": 4},
    {"label": "Collaboration", "score": 4}
  ]
}

Answers: ${history}`;

    const response = await this.callOpenAI(prompt, this.getSystemInstruction('collaborative', language));
    return this.parseJsonResponse<DashboardData>(response, 'analyzeThemesAndSkills');
  }

  async analyzeUserProfile(cvText: string, language: string = 'fr'): Promise<UserProfile> {
    const prompt = `Analyze the following professional profile text and extract key information.

Respond as JSON:
{
  "fullName": "Name if available",
  "currentRole": "Current job title",
  "keySkills": ["skill1", "skill2", ...],
  "pastExperiences": ["exp1", "exp2", ...]
}

Text: ${cvText}`;

    const response = await this.callOpenAI(prompt, this.getSystemInstruction('collaborative', language));
    return this.parseJsonResponse<UserProfile>(response, 'analyzeUserProfile');
  }

  async suggestOptionalModule(answers: Answer[], language: string = 'fr'): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they need a module on: 'transition-management', 'self-confidence', or 'work-life-balance'. Only set isNeeded to true if the signal is clear.

Respond as JSON:
{
  "isNeeded": true/false,
  "moduleId": "transition-management" | "self-confidence" | "work-life-balance" (only if isNeeded is true),
  "reason": "Short explanation in ${langName}" (only if isNeeded is true)
}

Answers: ${history}`;

    const response = await this.callOpenAI(prompt, this.getSystemInstruction('collaborative', language));
    return this.parseJsonResponse<any>(response, 'suggestOptionalModule');
  }

  async findResourceLeads(actionItemText: string, language: string = 'fr'): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }> {
    const languageMap: { [key: string]: string } = { 'fr': 'French', 'en': 'English', 'de': 'German', 'tr': 'Turkish' };
    const langName = languageMap[language] || 'French';
    const prompt = `Context: Action item: "${actionItemText}". Provide research leads in ${langName}.

Respond as JSON:
{
  "searchKeywords": ["keyword1", ...],
  "resourceTypes": ["type1", ...],
  "platformExamples": ["platform1", ...]
}`;

    const response = await this.callOpenAI(prompt, this.getSystemInstruction('collaborative', language));
    return this.parseJsonResponse<any>(response, 'findResourceLeads');
  }
}

