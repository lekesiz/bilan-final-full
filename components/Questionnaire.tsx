import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Answer, Question, QuestionType, Message, CurrentPhaseInfo, Summary, UserProfile, DashboardData, CoachingStyle } from '../types';
import { generateQuestion, generateSummary, generateSynthesis, analyzeThemesAndSkills, suggestOptionalModule } from '../services/aiService';
import { QUESTION_CATEGORIES } from '../constants';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useApi } from '../services/apiClient';
import { useToast } from './Toast';
import { useOfflineDetection } from '../hooks/useOfflineDetection';
import { useDebouncedCallback } from '../hooks/useDebounce';
import { useThrottle } from '../hooks/useThrottle';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { MessageSkeleton } from './SkeletonLoader';
import TypingIndicator from './TypingIndicator';
import BreakSuggestionModal from './BreakSuggestionModal';
import SpeechSettings from './SpeechSettings';
import Dashboard from './Dashboard';
import JourneyProgress from './JourneyProgress';
import EnhancedProgress from './EnhancedProgress';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v4a7 7 0 0014 0V8M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" /></svg>;
const SpeakerIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 17.142a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const JokerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5 5a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm2-3a1 1 0 00-1.414 1.414L8.586 18l-1.293 1.293a1 1 0 101.414 1.414L10 19.414l1.293 1.293a1 1 0 001.414-1.414L11.414 18l1.293-1.293a1 1 0 00-1.414-1.414L10 16.586 8.707 15.293zM5 11a1 1 0 100 2h.01a1 1 0 100-2H5zm14-1a1 1 0 11-2 0v-2a1 1 0 112 0v2zM15 9a1 1 0 100-2h-.01a1 1 0 100 2H15z" clipRule="evenodd" /></svg>;

const BadgeNotification: React.FC<{ phaseName: string; onClose: () => void }> = ({ phaseName, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 bg-secondary text-white p-4 rounded-lg shadow-lg animate-fade-in-down z-50">
            <p className="font-bold">🎉 Badge débloqué !</p>
            <p>Vous avez terminé : {phaseName}</p>
        </div>
    );
};

const SatisfactionModal: React.FC<{ phaseName: string; onSubmit: (rating: number, comment: string) => void; }> = ({ phaseName, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">Votre avis sur la phase terminée</h2>
                <p className="text-slate-600 mb-4">"{phaseName}"</p>
                <div className="mb-4">
                    <p className="mb-2 text-slate-700">Cette phase vous a-t-elle semblé pertinente ?</p>
                    <div className="flex justify-center text-3xl gap-2">{[1, 2, 3, 4, 5].map(star => <span key={star} onClick={() => setRating(star)} className={`cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>)}</div>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Un commentaire ? (optionnel)" rows={3} className="w-full p-2 border rounded-lg" />
                <button onClick={() => onSubmit(rating, comment)} disabled={rating === 0} className="mt-4 w-full bg-primary-600 text-white font-bold py-3 rounded-lg disabled:bg-slate-400">Valider</button>
            </div>
        </div>
    );
};

const ModuleModal: React.FC<{ reason: string; onAccept: () => void; onDecline: () => void; }> = ({ reason, onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">Approfondissement proposé</h2>
            <p className="text-slate-600 mb-4">{reason}</p>
            <p className="text-sm text-slate-500 mb-6">Souhaitez-vous explorer ce sujet avec quelques questions supplémentaires ? C'est entièrement optionnel.</p>
            <div className="flex gap-4">
                <button onClick={onAccept} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">Oui, je suis intéressé(e)</button>
                <button onClick={onDecline} className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300">Non, merci</button>
            </div>
        </div>
    </div>
);

const EditAnswerModal: React.FC<{ 
    isOpen: boolean; 
    currentValue: string; 
    onSave: (newValue: string) => void; 
    onCancel: () => void;
    questionTitle?: string;
}> = ({ isOpen, currentValue, onSave, onCancel, questionTitle }) => {
    const { t } = useTranslation();
    const [editedValue, setEditedValue] = useState(currentValue);
    
    useEffect(() => {
        if (isOpen) {
            setEditedValue(currentValue);
        }
    }, [isOpen, currentValue]);
    
    if (!isOpen) return null;
    
    const handleSave = () => {
        if (editedValue.trim()) {
            onSave(editedValue.trim());
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                <h2 className="text-2xl font-bold font-display text-primary-800 dark:text-primary-200 mb-2">
                    {t('questionnaire.editAnswer')}
                </h2>
                {questionTitle && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm italic">"{questionTitle}"</p>
                )}
                <textarea 
                    value={editedValue} 
                    onChange={e => setEditedValue(e.target.value)} 
                    placeholder={t('questionnaire.editAnswer') + '...'} 
                    rows={6}
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-4"
                    autoFocus
                />
                <div className="flex gap-4">
                    <button 
                        onClick={handleSave} 
                        disabled={!editedValue.trim()}
                        className="flex-1 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {t('common.save')}
                    </button>
                    <button 
                        onClick={onCancel} 
                        className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface QuestionnaireProps {
  pkg: Package;
  userName: string;
  userProfile: UserProfile | null;
  coachingStyle: CoachingStyle;
  assessmentId: string | null;
  onComplete: (answers: Answer[], summary: Summary) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ pkg, userName, userProfile, coachingStyle, assessmentId, onComplete }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const api = useApi();
    const { showToast } = useToast();
    const isOnline = useOfflineDetection();
    const [currentPhaseInfo, setCurrentPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
    const [textInput, setTextInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
    const [satisfactionPhaseInfo, setSatisfactionPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
    const [satisfactionSubmittedForPhase, setSatisfactionSubmittedForPhase] = useState<number | null>(null);
    const [isAwaitingSynthesisConfirmation, setIsAwaitingSynthesisConfirmation] = useState(false);
    const [synthesisConfirmed, setSynthesisConfirmed] = useState<boolean | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);
    const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
    const [suggestedModule, setSuggestedModule] = useState<{ id: string, reason: string } | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [moduleQuestionCount, setModuleQuestionCount] = useState(0);
    const [isRequestPending, setIsRequestPending] = useState(false);
    const [rateLimitToastShown, setRateLimitToastShown] = useState(false);
    const [shownMilestones, setShownMilestones] = useState<Set<number>>(new Set());
    const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
    const [lastBreakSuggestionAt, setLastBreakSuggestionAt] = useState(0);
    const [lastBreakSuggestionTime, setLastBreakSuggestionTime] = useState(0);
    const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null);
    const [answerIdMap, setAnswerIdMap] = useState<{ [key: number]: string }>({}); // answerIndex -> answerId mapping

    const chatEndRef = useRef<HTMLDivElement>(null);
    const SESSION_STORAGE_KEY = `autosave-${userName}-${pkg.id}`;
    const { isSpeaking, isSupported: speechSynthSupported, voices, settings, speak, cancel, onSettingsChange } = useSpeechSynthesis();
    const { isListening, isSupported: speechRecSupported, interimTranscript, finalTranscript, startListening, stopListening } = useSpeechRecognition({ lang: 'fr-FR' });

    useEffect(() => { setTextInput(interimTranscript || finalTranscript); }, [interimTranscript, finalTranscript]);
    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages]);

    const getPhaseInfo = useCallback((questionCount: number): CurrentPhaseInfo => {
        // Her phase'de kaç soru sorulacağını hesapla
        // questionnaires = kategori döngüsü sayısı
        // Her phase'de 4 kategori var
        // Her kategori için soru sayısı: package'a göre değişir
        const getQuestionsPerCategory = (pkgId: string, phaseNum: number): number => {
            if (pkgId === 'decouverte') {
                return phaseNum === 1 ? 2.5 : phaseNum === 2 ? 3.5 : 2.5; // Ortalama 2-3 soru/kategori
            } else if (pkgId === 'approfondi') {
                return phaseNum === 1 ? 3 : phaseNum === 2 ? 4 : 4; // Ortalama 3-4 soru/kategori
            } else { // strategique
                return phaseNum === 1 ? 3 : phaseNum === 2 ? 4 : 5; // Ortalama 3-5 soru/kategori
            }
        };
        
        const { phase1, phase2, phase3 } = pkg.phases;
        const categoriesPerPhase = 4; // Her phase'de 4 kategori var
        
        // Her phase için toplam soru sayısı = questionnaires × categoriesPerPhase × questionsPerCategory
        const qInPhase1 = Math.round(phase1.questionnaires * categoriesPerPhase * getQuestionsPerCategory(pkg.id, 1));
        const qInPhase2 = Math.round(phase2.questionnaires * categoriesPerPhase * getQuestionsPerCategory(pkg.id, 2));
        const qInPhase3 = Math.round(phase3.questionnaires * categoriesPerPhase * getQuestionsPerCategory(pkg.id, 3));

        if (questionCount < qInPhase1) return { phase: 1, name: QUESTION_CATEGORIES.phase1.name, positionInPhase: questionCount + 1, totalInPhase: qInPhase1, satisfactionActive: QUESTION_CATEGORIES.phase1.satisfactionActive };
        if (questionCount < qInPhase1 + qInPhase2) return { phase: 2, name: QUESTION_CATEGORIES.phase2.name, positionInPhase: questionCount - qInPhase1 + 1, totalInPhase: qInPhase2, satisfactionActive: QUESTION_CATEGORIES.phase2.satisfactionActive };
        return { phase: 3, name: QUESTION_CATEGORIES.phase3.name, positionInPhase: questionCount - qInPhase1 - qInPhase2 + 1, totalInPhase: qInPhase3, satisfactionActive: QUESTION_CATEGORIES.phase3.satisfactionActive };
    }, [pkg]);
    
    const updateDashboard = useCallback(async (currentAnswers: Answer[]) => {
        // Dashboard için en az 1 cevap yeterli
        if (currentAnswers.length < 1) return;
        setIsDashboardLoading(true);
        try {
            const data = await analyzeThemesAndSkills(currentAnswers);
            setDashboardData(data);
        } catch (error) { console.error("Error updating dashboard:", error); } 
        finally { setIsDashboardLoading(false); }
    }, []);
    
    // Debounced dashboard update (500ms delay)
    const debouncedUpdateDashboard = useDebouncedCallback(updateDashboard, 500);

    const fetchNextQuestion = useCallback(async (options: { useJoker?: boolean, currentAnswers?: Answer[] } = {}) => {
        // ÖNEMLİ: currentAnswers parametresi varsa onu kullan, yoksa answers state'ini kullan
        // Bu, state güncellemesi gecikmelerini önler
        const answersToUse = options.currentAnswers || answers;
        // Debug: fetchNextQuestion called
        
        if (isRequestPending) {
            // Request already pending, skipping
            return;
        }
        
        setIsRequestPending(true);
        setIsLoading(true);
        setCurrentQuestion(null);
        try {
            let question;
            if (activeModule) {
                // Generating module question
                question = await generateQuestion('phase2', 0, answersToUse, userName, coachingStyle, null, { isModuleQuestion: { moduleId: activeModule, questionNum: moduleQuestionCount + 1 } });
            } else {
                const info = getPhaseInfo(answersToUse.length);
                // Phase info calculated
                setCurrentPhaseInfo(info);
                const phaseKey = `phase${info.phase}` as 'phase1' | 'phase2' | 'phase3';
                const phaseCategories = QUESTION_CATEGORIES[phaseKey].categories;
                const categoryIndex = (info.positionInPhase - 1) % phaseCategories.length;
                
                // Generating question
                
                let genOptions: any = { useJoker: options.useJoker };
                if (info.phase === 2 && info.positionInPhase === 2 && answersToUse.length > 0 && answersToUse[answersToUse.length - 1].value.length > 3) {
                    genOptions.useGoogleSearch = true; genOptions.searchTopic = answersToUse[answersToUse.length - 1].value;
                }
                question = await generateQuestion(phaseKey, categoryIndex, answersToUse, userName, coachingStyle, answersToUse.length === 0 ? userProfile : null, genOptions);
            }
            // Question generated successfully
            setCurrentQuestion(question);
            const aiMessage: Message = { sender: 'ai', text: `${question.title}${question.description ? `\n\n${question.description}` : ''}`, question };
            setMessages(prev => [...prev, aiMessage]);
            if (speechSynthSupported && settings.voice) speak(aiMessage.text as string);
        } catch (error: any) {
            console.error("❌ Error generating question:", error);
            console.error("❌ Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                options,
                answersLength: answersToUse.length,
            });
            
            const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
            const isRateLimit = error?.code === 429 ||
                              error?.error?.code === 429 ||
                              errorMessage.includes('429') || 
                              errorMessage.includes('RESOURCE_EXHAUSTED') || 
                              errorMessage.includes('quota');
            
            // Show single toast for rate limit
            if (isRateLimit && !rateLimitToastShown) {
                setRateLimitToastShown(true);
                const retryAfter = error?.retryAfter;
                const nextRetryAt = error?.nextRetryAt;
                let toastMessage = "Model rate limit reached. We'll retry automatically.";
                
                if (nextRetryAt) {
                    const retryTime = new Date(nextRetryAt).toLocaleTimeString();
                    toastMessage += ` Next retry: ${retryTime}`;
                } else if (retryAfter) {
                    const retrySeconds = Math.round(retryAfter / 1000);
                    toastMessage += ` Retrying in ${retrySeconds}s...`;
                }
                
                showToast(toastMessage, 'warning', 8000);
                
                // Reset toast flag after delay
                setTimeout(() => setRateLimitToastShown(false), 10000);
            } else if (!isRateLimit) {
                const userFriendlyMessage = errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API_KEY')
                    ? "⚠️ Erreur de configuration: Clé API manquante. Vérifiez votre fichier .env.local"
                    : errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')
                    ? "⚠️ Service temporairement indisponible. Réessayons dans quelques instants..."
                    : "Désolé, une erreur est survenue. Laissez-moi un instant...";
                setMessages(prev => [...prev, { sender: 'ai', text: userFriendlyMessage }]);
                showToast(`Erreur: ${errorMessage.substring(0, 100)}`, 'error', 5000);
            }
            
            // If all retries failed, show CTA
            if (isRateLimit && error?.retried === false) {
                const retryAfter = error?.retryAfter;
                if (retryAfter) {
                    const retrySeconds = Math.round(retryAfter / 1000);
                    showToast(`Try again in ${retrySeconds} seconds`, 'info', 10000);
                } else {
                    showToast("Try again in a moment", 'info', 5000);
                }
            } else {
                setTimeout(() => fetchNextQuestion(options), 3000);
            }
        } finally {
            setIsLoading(false);
            setIsRequestPending(false);
        }
    }, [answers, userName, coachingStyle, getPhaseInfo, speak, speechSynthSupported, userProfile, activeModule, moduleQuestionCount, settings.voice, isRequestPending, rateLimitToastShown, showToast]);

    const handleGenerateSynthesis = useCallback(async (currentAnswers: Answer[]) => {
        setIsLoading(true);
        try {
            const { synthesis, confirmationRequest } = await generateSynthesis(currentAnswers.slice(-3), userName, coachingStyle);
            const synthesisMessage: Message = { sender: 'ai', text: (<>{synthesis}<br/><br/>{confirmationRequest}</>), isSynthesis: true };
            setMessages(prev => [...prev, synthesisMessage]);
            setIsAwaitingSynthesisConfirmation(true);
        } catch (error) {
            console.error("Error generating synthesis:", error);
            // Synthesis hatası durumunda, mevcut answers ile devam et
            await fetchNextQuestion({ currentAnswers });
        } finally {
            setIsLoading(false);
        }
    }, [userName, coachingStyle, fetchNextQuestion]);

    const runNextStep = useCallback(async (currentAnswers: Answer[], skipSynthesis: boolean = false) => {
        // Synthesis beklenirken veya zaten oluşturulmuşsa, synthesis kontrolünü atla
        if (isAwaitingSynthesisConfirmation && !skipSynthesis) {
            // Synthesis pending, skipping runNextStep
            return;
        }

        // runNextStep called

        // Tüm sorular tamamlandı mı?
        // ÖNEMLİ: Sadece gerçekten tüm sorular tamamlandıysa summary oluştur
        if (currentAnswers.length >= pkg.totalQuestionnaires) {
            // All questions completed, generating final summary
            setIsSummarizing(true);
            
            try {
                // Timeout ile summary oluştur (max 60 saniye)
                const summaryPromise = generateSummary(currentAnswers, pkg, userName, coachingStyle);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Summary generation timeout (60s)')), 60000)
                );
                
                const finalSummary = await Promise.race([summaryPromise, timeoutPromise]) as Summary;
                
                // Summary generated successfully
                
                // Backend'e summary kaydet
                if (assessmentId) {
                    try {
                        await api.createSummary(assessmentId, {
                            profileType: finalSummary.profileType,
                            priorityThemes: finalSummary.priorityThemes,
                            maturityLevel: finalSummary.maturityLevel,
                            keyStrengths: finalSummary.keyStrengths,
                            areasForDevelopment: finalSummary.areasForDevelopment,
                            recommendations: finalSummary.recommendations,
                            actionPlan: {
                                shortTerm: finalSummary.actionPlan.shortTerm.map(item => ({
                                    id: item.id,
                                    text: item.text,
                                    completed: item.completed || false,
                                })),
                                mediumTerm: finalSummary.actionPlan.mediumTerm.map(item => ({
                                    id: item.id,
                                    text: item.text,
                                    completed: item.completed || false,
                                })),
                            },
                        });
                        
                        // Assessment'ı completed olarak işaretle
                        await api.updateAssessment(assessmentId, {
                            status: 'completed',
                            completedAt: new Date().toISOString(),
                        });
                        showToast('Synthèse sauvegardée avec succès', 'success', 3000);
                    } catch (error) {
                        console.error('Failed to save summary to backend:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                        showToast(
                            `Synthèse générée mais erreur de sauvegarde: ${errorMessage}`,
                            'error',
                            5000
                        );
                        // Hata durumunda da devam et
                    }
                }
                
                localStorage.removeItem(SESSION_STORAGE_KEY);
                setIsSummarizing(false);
                onComplete(currentAnswers, finalSummary);
                return;
            } catch (error) {
                console.error('❌ Summary oluşturma hatası:', error);
                setIsSummarizing(false);
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                showToast(
                    `Erreur lors de la génération de la synthèse: ${errorMessage}. Veuillez réessayer.`,
                    'error',
                    5000
                );
                // Hata durumunda kullanıcıya seçenek sun
                if (window.confirm('La génération de la synthèse a échoué. Voulez-vous réessayer ?')) {
                    // Tekrar dene
                    runNextStep(currentAnswers, false);
                }
                return;
            }
        }

        // Her 5 cevapta bir kaydet ve dashboard güncelle
        if (currentAnswers.length > 0 && currentAnswers.length % 5 === 0) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentAnswers));
            setShowSaveNotification(true); setTimeout(() => setShowSaveNotification(false), 3000);
            // Debounced dashboard update
            debouncedUpdateDashboard(currentAnswers);
            
            // Dashboard data'yı backend'e kaydet (debounced, sadece son güncelleme)
            if (assessmentId) {
                // Backend update'i de debounce et (1 saniye)
                setTimeout(async () => {
                    try {
                        const dashboardData = await analyzeThemesAndSkills(currentAnswers);
                        await api.updateAssessment(assessmentId, {
                            dashboardData: dashboardData,
                        });
                    } catch (error) {
                        console.error('Failed to save dashboard data to backend:', error);
                        // Dashboard hatası kritik değil, sessizce devam et
                    }
                }, 1000);
            }
        } else if (currentAnswers.length > 0) {
            // Her answer'da debounced update (ama sadece 5'te bir backend'e kaydet)
            debouncedUpdateDashboard(currentAnswers);
        }

        // Milestone notifications
        const milestones = [
            { at: 10, message: "10 soru tamamlandı! 🎉" },
            { at: Math.floor(pkg.totalQuestionnaires / 2), message: "Yarı yoldasınız! 💪" },
            { at: pkg.totalQuestionnaires - 5, message: "Son 5 soru! 🏁" },
        ];
        
        const currentMilestone = milestones.find(m => currentAnswers.length === m.at);
        if (currentMilestone && !shownMilestones.has(currentMilestone.at)) {
            setShownMilestones(prev => new Set([...prev, currentMilestone.at]));
            showToast(currentMilestone.message, 'success', 4000);
        }
        
        // Break suggestion (her 25 soruda bir, minimum 5 dakika arayla)
        const BREAK_SUGGESTION_INTERVAL = 25;
        const MIN_BREAK_INTERVAL_MS = 5 * 60 * 1000; // 5 dakika
        
        if (
            currentAnswers.length > 0 &&
            currentAnswers.length % BREAK_SUGGESTION_INTERVAL === 0 &&
            currentAnswers.length !== lastBreakSuggestionAt
        ) {
            // Zaman kontrolü için ayrı bir state kullan
            const now = Date.now();
            const lastBreakTime = localStorage.getItem(`lastBreakSuggestionTime-${userName}-${pkg.id}`);
            const timeSinceLastBreak = lastBreakTime ? now - parseInt(lastBreakTime, 10) : MIN_BREAK_INTERVAL_MS + 1;
            
            if (timeSinceLastBreak > MIN_BREAK_INTERVAL_MS) {
                setLastBreakSuggestionAt(currentAnswers.length);
                localStorage.setItem(`lastBreakSuggestionTime-${userName}-${pkg.id}`, now.toString());
                setShowBreakSuggestion(true);
            }
        }

        // Phase geçişi kontrolü
        if (currentAnswers.length > 0) {
            const info = getPhaseInfo(currentAnswers.length);
            const prevInfo = getPhaseInfo(currentAnswers.length - 1);
            if (info.phase !== prevInfo.phase) {
                // Phase transition detected
                setUnlockedBadge(`Phase ${prevInfo.phase} : ${prevInfo.name}`);
                const moduleSuggestion = await suggestOptionalModule(currentAnswers);
                if (moduleSuggestion.isNeeded && moduleSuggestion.moduleId && moduleSuggestion.reason) {
                    // Module suggestion received
                    setSuggestedModule({ id: moduleSuggestion.moduleId, reason: moduleSuggestion.reason });
                    return;
                }
                // ÖNEMLİ: Eğer bu phase için satisfaction zaten gönderildiyse, tekrar gösterme
                if (prevInfo.satisfactionActive && satisfactionSubmittedForPhase !== prevInfo.phase) {
                    // Showing satisfaction modal
                    setSatisfactionPhaseInfo(prevInfo);
                    setShowSatisfactionModal(true);
                    return;
                } else if (prevInfo.satisfactionActive && satisfactionSubmittedForPhase === prevInfo.phase) {
                    // Satisfaction already submitted, skipping
                }
            }
        }

        // Synthesis kontrolü: Her 3 cevapta bir (ama 5'in katı değilse) VE synthesis beklenmiyorsa
        // İLK CEVAPTA SYNTHESIS OLUŞTURMA! (currentAnswers.length > 1 kontrolü eklendi)
        if (!skipSynthesis && currentAnswers.length > 1 && currentAnswers.length % 3 === 0 && currentAnswers.length % 5 !== 0) {
            // Generating synthesis (3rd answer)
            await handleGenerateSynthesis(currentAnswers);
            return;
        }
        
        // Sonraki soruyu getir
        // Fetching next question
        
        // Eğer tüm sorular tamamlandıysa, buraya gelmemeli (yukarıdaki kontrol zaten yapıldı)
        if (currentAnswers.length >= pkg.totalQuestionnaires) {
            console.error('⚠️ HATA: Tüm sorular tamamlandı ama runNextStep devam ediyor!');
            return;
        }
        
        // ÖNEMLİ: fetchNextQuestion'a currentAnswers parametresini geçir
        // Bu, state güncellemesi gecikmelerini önler
        await fetchNextQuestion({ currentAnswers });
    }, [pkg, userName, coachingStyle, onComplete, SESSION_STORAGE_KEY, getPhaseInfo, updateDashboard, fetchNextQuestion, handleGenerateSynthesis, assessmentId, api, isAwaitingSynthesisConfirmation, satisfactionSubmittedForPhase, shownMilestones, showToast, lastBreakSuggestionAt, lastBreakSuggestionTime]);

    useEffect(() => {
        const loadSession = async () => {
            // Önce backend'den in_progress assessment'ı kontrol et
            if (assessmentId) {
                try {
                    const assessment = await api.getAssessment(assessmentId);
                    if (assessment.status === 'in_progress' && assessment.currentQuestionIndex > 0) {
                        // Answers'ları çek
                        const answersResponse = await api.getAnswers(assessmentId);
                        const savedAnswers: Answer[] = (answersResponse.answers || []).map((a: any) => ({
                            questionId: a.questionId,
                            value: a.value,
                            id: a.id, // Backend'den gelen id'yi ekle
                        }));
                        
                        // answerIdMap'i oluştur
                        const newAnswerIdMap: { [key: number]: string } = {};
                        savedAnswers.forEach((answer, index) => {
                            if (answer.id) {
                                newAnswerIdMap[index] = answer.id;
                            }
                        });
                        
                        if (savedAnswers.length > 0) {
                            if (window.confirm(`Une session inachevée a été trouvée (${savedAnswers.length} réponses). Voulez-vous la reprendre ?`)) {
                                setAnswers(savedAnswers);
                                setAnswerIdMap(newAnswerIdMap);
                                setMessages([{ sender: 'ai', text: `Bonjour ${userName}, reprenons où nous nous étions arrêtés.` }]);
                                await runNextStep(savedAnswers);
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to load session from backend:', error);
                    // Fallback: localStorage'a bak
                }
            }
            
            // Fallback: localStorage'dan yükle
            const savedAnswersJSON = localStorage.getItem(SESSION_STORAGE_KEY);
            if (savedAnswersJSON) {
                const savedAnswers: Answer[] = JSON.parse(savedAnswersJSON);
                if (window.confirm("Une session inachevée a été trouvée (localStorage). Voulez-vous la reprendre ?")) {
                    setAnswers(savedAnswers);
                    setMessages([{ sender: 'ai', text: `Bonjour ${userName}, reprenons où nous nous étions arrêtés.` }]);
                    await runNextStep(savedAnswers);
                    return;
                } else {
                    localStorage.removeItem(SESSION_STORAGE_KEY);
                }
            }
            await fetchNextQuestion();
        };
        loadSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (synthesisConfirmed !== null) {
            // Synthesis confirmation received
            // Synthesis confirmation sonrası, synthesis kontrolünü atlayarak devam et
            try {
                runNextStep(answers, true); // skipSynthesis = true
            } catch (error) {
                console.error('❌ runNextStep hatası (synthesis confirmation sonrası):', error);
                showToast('Erreur lors de la transition. Réessayons...', 'error', 3000);
                // Retry after 2 seconds
                setTimeout(() => {
                    runNextStep(answers, true);
                }, 2000);
            }
            setSynthesisConfirmed(null);
        }
    }, [synthesisConfirmed, answers, runNextStep, showToast]);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            action: () => {
                if (currentQuestion && !isLoading && !isAwaitingSynthesisConfirmation && !isRequestPending) {
                    handleJoker();
                }
            },
            description: 'Utiliser le joker (reformuler la question)'
        },
        {
            key: 's',
            ctrl: true,
            action: () => {
                if (answers.length > 0) {
                    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(answers));
                    showToast('Sauvegardé avec succès', 'success', 2000);
                }
            },
                    description: t('questionnaire.saveSession')
        },
        {
            key: 'Escape',
            action: () => {
                if (showSettings) {
                    setShowSettings(false);
                }
                if (showSatisfactionModal) {
                    setShowSatisfactionModal(false);
                }
            },
            description: 'Fermer les modales'
        }
    ], !isLoading);

    // Throttle answer submission
    const throttledAnswerSubmit = useThrottle(async (value: string) => {
        await handleAnswerSubmitInternal(value);
    }, 1500);

    const handleAnswerSubmit = async (value: string) => {
        if (isLoading || !currentQuestion || isAwaitingSynthesisConfirmation || isRequestPending) return;
        throttledAnswerSubmit(value);
    };

    const handleAnswerSubmitInternal = async (value: string) => {
        if (isLoading || !currentQuestion || isAwaitingSynthesisConfirmation || isRequestPending) return;
        cancel();
        const newAnswer: Answer = { questionId: currentQuestion.id, value };
        
        // OPTIMISTIC UPDATE: Önce UI'ı güncelle
        const newAnswers = [...answers, newAnswer];
        setMessages(prev => [...prev, { sender: 'user', text: value }]);
        setAnswers(newAnswers);
        setTextInput('');
        
        // Mevcut question'ı temizle (optimistic)
        const previousQuestion = currentQuestion;
        setCurrentQuestion(null);

        // Backend'e answer kaydet (async, hata durumunda rollback)
        // ÖNEMLİ: runNextStep her durumda çağrılmalı, backend kaydı başarısız olsa bile
        let shouldContinue = true;
        
        if (assessmentId && previousQuestion && isOnline) {
            try {
                // Saving answers to backend
                const answerResponse = await api.addAnswer(assessmentId, {
                    questionId: previousQuestion.id,
                    questionTitle: previousQuestion.title,
                    questionDescription: previousQuestion.description,
                    questionType: previousQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'MULTIPLE_CHOICE' : 'PARAGRAPH',
                    questionTheme: previousQuestion.theme,
                    questionChoices: previousQuestion.choices,
                    value: value,
                });
                
                // Backend'den gelen answer id'sini ekle
                if (answerResponse && answerResponse.id) {
                    const lastAnswerIndex = newAnswers.length - 1;
                    if (lastAnswerIndex >= 0) {
                        newAnswers[lastAnswerIndex] = { ...newAnswers[lastAnswerIndex], id: answerResponse.id };
                        setAnswers(newAnswers);
                    }
                }
                
                // Assessment'ı güncelle (currentQuestionIndex)
                await api.updateAssessment(assessmentId, {
                    currentQuestionIndex: newAnswers.length,
                    lastActivityAt: new Date().toISOString(),
                });
                
                // Otomatik taslak kaydetme (her 5 soruda bir)
                if (newAnswers.length > 0 && newAnswers.length % 5 === 0) {
                    await api.updateAssessment(assessmentId, {
                        status: 'in_progress',
                        currentQuestionIndex: newAnswers.length,
                        lastActivityAt: new Date().toISOString(),
                    });
                    // Auto-saved draft
                }
                
                // Answers saved to backend
            } catch (error) {
                console.error('❌ Failed to save answer to backend:', error);
                
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                if (errorMessage.includes('Failed to fetch') || !isOnline) {
                    showToast('Mode hors ligne: réponse sauvegardée localement', 'warning', 4000);
                    // Offline durumunda optimistic update'i koru ve devam et
                } else {
                    showToast(
                        `Erreur lors de la sauvegarde. Réessayez. (${errorMessage})`,
                        'error',
                        5000
                    );
                    // Hata durumunda da devam et (optimistic update korunuyor)
                }
            }
        } else if (!isOnline) {
            showToast('Mode hors ligne: réponse sauvegardée localement', 'info', 3000);
        }

        // Her durumda sonraki adıma geç (backend kaydı başarısız olsa bile)
        if (shouldContinue) {
            // Moving to next step
            
            // ÖNEMLİ: Eğer tüm sorular tamamlandıysa runNextStep çağrılmalı (summary için)
            // Ama eğer henüz sorular varsa, runNextStep çağrılmalı (sonraki soru için)
            if (activeModule) {
                if (moduleQuestionCount + 1 >= 3) {
                    // Module completed, returning to normal flow
                    setActiveModule(null); 
                    setModuleQuestionCount(0);
                    runNextStep(newAnswers);
                } else {
                    // Continuing module question
                    setModuleQuestionCount(prev => prev + 1);
                    fetchNextQuestion();
                }
            } else {
                // Normal flow: calling runNextStep
                // ÖNEMLİ: runNextStep içinde totalQuestionnaires kontrolü var
                // Eğer newAnswers.length < pkg.totalQuestionnaires ise, fetchNextQuestion çağrılacak
                // Eğer newAnswers.length >= pkg.totalQuestionnaires ise, summary oluşturulacak
                runNextStep(newAnswers);
            }
        }
    };
    
    const handleSynthesisConfirmation = (confirmed: boolean) => {
        // Synthesis confirmation
        setIsAwaitingSynthesisConfirmation(false);
        setMessages(prev => [...prev, { sender: 'user', text: confirmed ? "Oui, c'est exact." : "Non, pas tout à fait." }]);
        // Synthesis confirmation sonrası bir sonraki soruya geç
        // useEffect ile runNextStep çağrılacak (skipSynthesis = true ile)
        setSynthesisConfirmed(confirmed);
    };
    
    const handleSatisfactionSubmit = (rating: number, comment: string) => {
        console.log('⭐ Satisfaction gönderildi:', { phase: satisfactionPhaseInfo?.name, rating, comment });
        const currentPhase = satisfactionPhaseInfo?.phase;
        if (currentPhase !== undefined) {
            // Bu phase için satisfaction gönderildiğini işaretle
            setSatisfactionSubmittedForPhase(currentPhase);
            console.log('✅ Satisfaction Phase', currentPhase, 'için işaretlendi');
        }
        setShowSatisfactionModal(false);
        setSatisfactionPhaseInfo(null);
        // Satisfaction sonrası normal akışa devam et
        runNextStep(answers, false);
    };

    const handleModuleAccept = () => { 
        console.log('✅ Module kabul edildi:', suggestedModule!.id);
        setActiveModule(suggestedModule!.id); 
        setSuggestedModule(null); 
        fetchNextQuestion(); 
    };
    const handleModuleDecline = () => { 
        console.log('❌ Module reddedildi');
        setSuggestedModule(null); 
        runNextStep(answers, false); 
    };
    const handleJoker = () => { if (!isLoading) { fetchNextQuestion({ useJoker: true }); } };

    // Edit answer handler
    const handleEditAnswer = (answerIndex: number) => {
        setEditingAnswerIndex(answerIndex);
    };

    const handleSaveEditedAnswer = async (newValue: string) => {
        if (editingAnswerIndex === null) return;
        
        const answer = answers[editingAnswerIndex];
        if (!answer) return;

        // UI'ı güncelle (optimistic update)
        const updatedAnswers = [...answers];
        updatedAnswers[editingAnswerIndex] = { ...answer, value: newValue };
        setAnswers(updatedAnswers);

        // Messages'ı güncelle
        const userMessageIndex = messages.findIndex((msg, idx) => 
            msg.sender === 'user' && 
            // Her user mesajı bir cevap, index'e göre eşleştir
            messages.slice(0, idx + 1).filter(m => m.sender === 'user').length - 1 === editingAnswerIndex
        );
        if (userMessageIndex >= 0) {
            const updatedMessages = [...messages];
            updatedMessages[userMessageIndex] = { ...updatedMessages[userMessageIndex], text: newValue };
            setMessages(updatedMessages);
        }

        // Backend'e kaydet
        const answerId = answer.id || answerIdMap[editingAnswerIndex];
        if (assessmentId && answerId && isOnline) {
            try {
                await api.updateAnswer(assessmentId, answerId, { value: newValue });
                showToast(t('questionnaire.answerUpdated'), 'success', 3000);
            } catch (error) {
                console.error('❌ Failed to update answer:', error);
                showToast(t('questionnaire.answerUpdateError'), 'error', 5000);
                // Rollback
                setAnswers(answers);
                if (userMessageIndex >= 0) {
                    setMessages(messages);
                }
            }
        } else if (!isOnline) {
            showToast(t('questionnaire.offlineSave'), 'warning', 3000);
        }

        setEditingAnswerIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingAnswerIndex(null);
    };

    // Save draft handler
    const handleSaveDraft = async () => {
        if (!assessmentId) return;
        
        try {
                await api.updateAssessment(assessmentId, {
                status: 'in_progress',
                currentQuestionIndex: answers.length,
                lastActivityAt: new Date().toISOString(),
            });
            showToast(t('questionnaire.draftSaved'), 'success', 4000);
        } catch (error) {
            console.error('❌ Failed to save draft:', error);
            showToast(t('questionnaire.draftError'), 'error', 5000);
        }
    };

    // isSummarizing sadece gerçekten summary oluşturulurken true olmalı
    // Eğer currentQuestion varsa, summary oluşturulmuyor demektir
    if (isSummarizing && !currentQuestion) {
        return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-2xl font-bold">{t('questionnaire.synthesizing')}</div><p>{t('questionnaire.synthesizingWait')}</p></div></div>;
    }

    return (
        <>
            {unlockedBadge && <BadgeNotification phaseName={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
            {showSatisfactionModal && satisfactionPhaseInfo && <SatisfactionModal phaseName={satisfactionPhaseInfo.name} onSubmit={handleSatisfactionSubmit} />}
            {suggestedModule && <ModuleModal reason={suggestedModule.reason} onAccept={handleModuleAccept} onDecline={handleModuleDecline} />}
            {editingAnswerIndex !== null && (
                <EditAnswerModal
                    isOpen={true}
                    currentValue={answers[editingAnswerIndex]?.value || ''}
                    onSave={handleSaveEditedAnswer}
                    onCancel={handleCancelEdit}
                    questionTitle={messages.find((msg, idx) => 
                        msg.sender === 'ai' && 
                        messages.slice(0, idx + 1).filter(m => m.sender === 'user').length === editingAnswerIndex
                    )?.text?.toString()}
                />
            )}
            {showSaveNotification && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">{t('questionnaire.progressSaved')}</div>}
            {!isOnline && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{t('questionnaire.offlineMode')}</span>
                </div>
            )}
            
            {/* Break Suggestion Modal */}
            <BreakSuggestionModal
                isOpen={showBreakSuggestion}
                onContinue={() => {
                    setShowBreakSuggestion(false);
                    showToast(t('questionnaire.continuePace'), 'info', 3000);
                }}
                onTakeBreak={() => {
                    setShowBreakSuggestion(false);
                    // Session zaten otomatik kaydediliyor, sadece bilgi ver
                    showToast(t('questionnaire.progressSavedMessage'), 'success', 5000);
                    // Kullanıcı isterse welcome screen'e dönebilir veya sayfayı kapatabilir
                }}
                questionsCompleted={answers.length}
                totalQuestions={pkg.totalQuestionnaires}
            />
            
            <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors">
                <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm">
                    <div>
                        <h1 className="font-bold text-lg text-primary-800 dark:text-primary-200 font-display">{pkg.name}</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{currentPhaseInfo?.name}</p>
                    </div>
                    {currentPhaseInfo && (
                        <EnhancedProgress 
                            current={answers.length} 
                            total={pkg.totalQuestionnaires} 
                            pkg={pkg}
                            currentPhaseInfo={currentPhaseInfo}
                        />
                    )}
                    <div className="flex items-center gap-4">
                        {speechSynthSupported && <button onClick={() => isSpeaking ? cancel() : speak(messages[messages.length - 1]?.text as string)} className="text-slate-500 hover:text-primary-600"><SpeakerIcon active={isSpeaking} /></button>}
                        <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:text-primary-600"><SettingsIcon /></button>
                    </div>
                </header>
                
                {showSettings && speechSynthSupported && <div className="border-b"><SpeechSettings voices={voices} settings={settings} onSettingsChange={onSettingsChange} /></div>}

                <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow transition-colors">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => {
                                // User mesajı için answer index'ini bul
                                const userMessageCount = messages.slice(0, index + 1).filter(m => m.sender === 'user').length;
                                const answerIndex = msg.sender === 'user' ? userMessageCount - 1 : -1;
                                const canEdit = msg.sender === 'user' && answerIndex >= 0 && answerIndex < answers.length && (answers[answerIndex]?.id || answerIdMap[answerIndex]);
                                
                                return (
                                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center flex-shrink-0">IA</div>}
                                        <div className={`max-w-xl p-4 rounded-2xl relative group ${msg.sender === 'user' ? 'bg-primary-600 dark:bg-primary-700 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                                            <p>{msg.text}</p>
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleEditAnswer(answerIndex)}
                                                    className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    title={t('questionnaire.editAnswerTitle')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {msg.isSynthesis && (
                                                <div className="mt-4 flex gap-2">
                                                    <button onClick={() => handleSynthesisConfirmation(true)} className="bg-white/20 px-3 py-1 rounded-full text-xs">Oui, c'est exact</button>
                                                    <button onClick={() => handleSynthesisConfirmation(false)} className="bg-white/20 px-3 py-1 rounded-full text-xs">Non, pas tout à fait</button>
                                                </div>
                                            )}
                                            {msg.question?.type === QuestionType.MULTIPLE_CHOICE && msg.question.choices && (
                                                <div className="mt-4 space-y-2">
                                                    {msg.question.choices.map(choice => (
                                                        <button key={choice} onClick={() => handleAnswerSubmit(choice)} className="w-full text-left bg-primary-50 text-primary-800 p-3 rounded-lg hover:bg-primary-100 transition">
                                                            {choice}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {isLoading && <TypingIndicator message={t('questionnaire.typing')} />}
                            {isSummarizing && (
                                <TypingIndicator message={t('questionnaire.synthesizing')} />
                            )}
                            <div ref={chatEndRef} />
                        </div>

                    <div className="p-4 border-t bg-white dark:bg-slate-800 rounded-b-xl transition-colors">
                        {currentQuestion?.type === QuestionType.PARAGRAPH && (
                            <form onSubmit={e => { e.preventDefault(); handleAnswerSubmit(textInput); }} className="flex items-center gap-2">
                                <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder={t('questionnaire.placeholder')} className="flex-1 w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" disabled={isLoading || isAwaitingSynthesisConfirmation || isRequestPending} />
                                {speechRecSupported && <button type="button" onClick={() => isListening ? stopListening() : startListening()} className="p-3 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400" disabled={isRequestPending}><MicIcon active={isListening} /></button>}
                                <button type="submit" className="bg-primary-600 dark:bg-primary-700 text-white p-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={isLoading || !textInput.trim() || isAwaitingSynthesisConfirmation || isRequestPending}><SendIcon /></button>
                            </form>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={handleJoker} className="flex-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || isAwaitingSynthesisConfirmation || isRequestPending}>
                                <JokerIcon/> {t('questionnaire.joker')}
                            </button>
                            {assessmentId && answers.length > 0 && (
                                <button 
                                    onClick={handleSaveDraft} 
                                    className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || isRequestPending}
                                    title={t('questionnaire.saveDraftTitle')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    {t('questionnaire.saveDraft')}
                                </button>
                            )}
                        </div>
                        </div>
                    </div>
                    <aside className="hidden lg:block sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow p-6 transition-colors">
                        <Dashboard data={dashboardData} isLoading={isDashboardLoading} />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Questionnaire;