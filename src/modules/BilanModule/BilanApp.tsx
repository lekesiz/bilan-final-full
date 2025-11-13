import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '../../../components/WelcomeScreen';
import PackageSelector from '../../../components/PackageSelector';
import PhasePreliminaire from '../../../components/PhasePreliminaire';
import PersonalizationStep from '../../../components/PersonalizationStep';
import Questionnaire from '../../../components/Questionnaire';
import SummaryDashboard from '../../../components/SummaryDashboard';
import HistoryScreen from '../../../components/HistoryScreen';
import { PACKAGES } from '../../../constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from '../../../types';
import { saveAssessmentToHistory } from '../../../services/historyService';
import { useApi } from '../../../services/apiClient';
import { useToast } from '../../../components/Toast';
import type { Assessment } from '../../../services/apiClient';

type BilanAppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'summary' | 'history' | 'view-history-record';

/**
 * BILAN Module - Standalone BILAN application
 * This is the existing BILAN app wrapped as a module
 */
export const BilanApp: React.FC = () => {
  const [appState, setAppState] = useState<BilanAppState>('welcome');
  const [userName, setUserName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('collaborative');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [viewingRecord, setViewingRecord] = useState<HistoryItem | null>(null);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  
  const api = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleStart = (name: string) => {
    setUserName(name);
    setAppState('package-selection');
  };

  const handlePackageSelect = async (pkg: Package) => {
    if (!userName || userName.trim() === '') {
      showToast('Erreur: Nom d\'utilisateur manquant', 'error', 3000);
      return;
    }
    
    setSelectedPackage(pkg);
    setIsCreatingAssessment(true);
    
    try {
      const assessment = await api.createAssessment({
        userName: userName,
        packageId: pkg.id as 'decouverte' | 'approfondi' | 'strategique',
        packageName: pkg.name,
        coachingStyle: coachingStyle,
        totalQuestions: pkg.totalQuestionnaires,
      });
      
      setCurrentAssessmentId(assessment.id);
      showToast('Bilan créé avec succès', 'success', 3000);
      setAppState('preliminary-phase');
    } catch (error) {
      console.error('Failed to create assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(
        `Impossible de créer le bilan. Continuons quand même. (${errorMessage})`,
        'warning',
        5000
      );
      setAppState('preliminary-phase');
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  const handlePreliminaryConfirm = () => {
    if (!currentAssessmentId) {
      showToast('Bilan ID bulunamadı, ama devam ediyoruz', 'warning', 3000);
    }
    setAppState('personalization-step');
  };

  const handlePersonalizationComplete = async (profile: UserProfile | null) => {
    setUserProfile(profile);
    
    // Eğer assessment varsa ve userProfile varsa, assessment'ı güncelle
    if (currentAssessmentId && profile) {
      try {
        await api.updateAssessment(currentAssessmentId, {
          userProfile: {
            fullName: profile.fullName,
            currentRole: profile.currentRole,
            keySkills: profile.keySkills,
            pastExperiences: profile.pastExperiences,
          }
        });
        showToast('Profil mis à jour', 'success', 2000);
      } catch (error) {
        console.error('Failed to update assessment with user profile:', error);
        showToast('Impossible de sauvegarder le profil, mais nous continuons', 'warning', 3000);
      }
    }
    
    setAppState('questionnaire');
  };

  const handleQuestionnaireComplete = async (answers: Answer[], summary: Summary) => {
    // Eğer assessmentId varsa, backend'den tam answer bilgilerini çek
    let fullAnswers = answers;
    if (currentAssessmentId) {
      try {
        console.log('📥 Backend\'den answers çekiliyor, assessmentId:', currentAssessmentId);
        const answersResponse = await api.getAnswers(currentAssessmentId);
        console.log('✅ Backend\'den gelen answers:', answersResponse);
        
        // Backend'den gelen tam bilgileri kullan
        fullAnswers = (answersResponse.answers || []).map((a: any) => {
          const mapped = {
            questionId: a.questionId,
            value: a.value,
            // Backend'den gelen ek bilgileri ekle
            questionTitle: a.questionTitle,
            questionDescription: a.questionDescription,
            questionType: a.questionType,
            questionTheme: a.questionTheme,
            questionChoices: a.questionChoices,
            answeredAt: a.answeredAt,
          };
          return mapped;
        }) as Answer[];
        
        console.log('✅ Mapped fullAnswers:', fullAnswers.length, 'answers');
      } catch (error) {
        console.error('❌ Failed to fetch full answers from backend:', error);
        // Hata durumunda mevcut answers'ı kullan
        showToast('Impossible de récupérer les détails complets, mais nous continuons', 'warning', 3000);
      }
    } else {
      console.warn('⚠️ AssessmentId yok, backend\'den veri çekilemiyor. Mevcut answers kullanılıyor:', answers.length);
    }
    
    setCurrentAnswers(fullAnswers);
    setCurrentSummary(summary);
    
    // Save to history
    const historyItem: HistoryItem = {
      id: currentAssessmentId || new Date().toISOString(),
      date: new Date().toISOString(),
      userName,
      packageName: selectedPackage?.name || '',
      summary,
      answers: fullAnswers,
    };
    saveAssessmentToHistory(historyItem);
    
    setAppState('summary');
  };

  const handleResumeAssessment = async (assessmentId: string) => {
    try {
      const assessment = await api.getAssessment(assessmentId);
      const answers = await api.getAnswers(assessmentId);
      
      setCurrentAssessmentId(assessment.id);
      setUserName(assessment.userName);
      setSelectedPackage(PACKAGES.find(p => p.id === assessment.packageId) || null);
      setCoachingStyle(assessment.coachingStyle as CoachingStyle);
      setCurrentAnswers(answers.answers || []);
      
      // Load user profile if exists
      if (assessment.userProfile) {
        setUserProfile(assessment.userProfile as UserProfile);
      }
      
      setAppState('questionnaire');
    } catch (error) {
      console.error('Failed to resume assessment:', error);
      showToast('Erreur lors de la reprise du bilan', 'error', 3000);
    }
  };

  const handleViewHistory = () => {
    setAppState('history');
  };

  const handleShowAnalytics = () => {
    // Analytics is handled by the main dashboard route
    // Navigate to analytics dashboard using React Router
    navigate('/analytics');
  };

  const handleViewHistoryRecord = (record: HistoryItem) => {
    setViewingRecord(record);
    setAppState('view-history-record');
  };

  const handleBackToHistory = () => {
    setViewingRecord(null);
    setAppState('history');
  };

  const handleNewAssessment = () => {
    setAppState('welcome');
    setUserName('');
    setSelectedPackage(null);
    setCoachingStyle('collaborative');
    setUserProfile(null);
    setCurrentAnswers([]);
    setCurrentSummary(null);
    setCurrentAssessmentId(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={handleStart}
            onShowHistory={handleViewHistory}
            onShowAnalytics={handleShowAnalytics}
          />
        );
      case 'package-selection':
        return (
          <PackageSelector
            onSelect={handlePackageSelect}
            isLoading={isCreatingAssessment}
          />
        );
      case 'preliminary-phase':
        return (
          <PhasePreliminaire
            pkg={selectedPackage!}
            userName={userName}
            coachingStyle={coachingStyle}
            setCoachingStyle={(style) => {
              setCoachingStyle(style);
            }}
            onConfirm={handlePreliminaryConfirm}
            onGoBack={() => setAppState('package-selection')}
          />
        );
      case 'personalization-step':
        return (
          <PersonalizationStep
            onComplete={handlePersonalizationComplete}
          />
        );
      case 'questionnaire':
        return (
          <Questionnaire
            pkg={selectedPackage!}
            userName={userName}
            userProfile={userProfile}
            coachingStyle={coachingStyle}
            assessmentId={currentAssessmentId}
            onComplete={handleQuestionnaireComplete}
          />
        );
      case 'summary':
        return (
          <SummaryDashboard
            userName={userName}
            packageName={selectedPackage?.name || ''}
            answers={currentAnswers}
            summary={currentSummary!}
            onNewAssessment={handleNewAssessment}
            onViewHistory={handleViewHistory}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onResumeAssessment={handleResumeAssessment}
            onViewRecord={handleViewHistoryRecord}
          />
        );
      case 'assessments':
        // This case is handled by BilanModule index.tsx routing
        return null;
      case 'view-history-record':
        return (
          <SummaryDashboard
            userName={viewingRecord?.userName || ''}
            packageName={viewingRecord?.packageName || ''}
            answers={viewingRecord?.answers || []}
            summary={viewingRecord?.summary!}
            onNewAssessment={handleNewAssessment}
            onViewHistory={handleViewHistory}
          />
        );
      default:
        return <WelcomeScreen onStart={handleStart} onShowHistory={handleViewHistory} onShowAnalytics={handleShowAnalytics} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {renderContent()}
    </div>
  );
};

