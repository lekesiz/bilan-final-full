// AI Service Types (shared with frontend)

export enum QuestionType {
  PARAGRAPH = 'PARAGRAPH',
  MULTIPLE_CHOICE = 'multiple_choice',
}

export type CoachingStyle = 'collaborative' | 'analytic' | 'creative';

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  theme: string;
  choices?: string[];
  required: boolean;
}

export interface Answer {
  questionId: string;
  value: string;
  id?: string;
}

export interface Package {
  id: string;
  name: string;
  totalHours: number;
  totalQuestionnaires: number;
  description: string;
  features: string[];
  phases: {
    phase1: { questionnaires: number; duration_min: number; name: string };
    phase2: { questionnaires: number; duration_min: number; name: string };
    phase3: { questionnaires: number; duration_min: number; name: string };
  };
}

export interface SummaryPoint {
  text: string;
  sources: string[];
}

export interface ActionPlanItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Summary {
  profileType: string;
  priorityThemes: string[];
  maturityLevel: string;
  keyStrengths: SummaryPoint[];
  areasForDevelopment: SummaryPoint[];
  recommendations: string[];
  actionPlan: {
    shortTerm: ActionPlanItem[];
    mediumTerm: ActionPlanItem[];
  };
}

export interface UserProfile {
  fullName?: string;
  currentRole: string;
  keySkills: string[];
  pastExperiences: string[];
}

export interface DashboardData {
  themes: Array<{ text: string; weight: number }>;
  skills: Array<{ label: string; score: number }>;
}

export interface GenerateQuestionOptions {
  useJoker?: boolean;
  useGoogleSearch?: boolean;
  searchTopic?: string;
  isModuleQuestion?: { moduleId: string; questionNum: number };
}

export type AIProvider = 'gemini' | 'openai' | 'claude';

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

export interface AIProviderConfig {
  gemini?: {
    apiKey: string;
    enabled: boolean;
  };
  openai?: {
    apiKey: string;
    enabled: boolean;
    model?: string;
  };
  claude?: {
    apiKey: string;
    enabled: boolean;
    model?: string;
  };
}

