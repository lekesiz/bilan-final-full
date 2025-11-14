import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HistoryItem, Summary, Answer } from '../types';
import { getAssessmentHistory, clearAssessmentHistory } from '../services/historyService';
import { useApi } from '../services/apiClient';
import { HistoryItemSkeleton } from './SkeletonLoader';
import type { Assessment } from '../services/apiClient';

interface HistoryScreenProps {
    onViewRecord: (record: HistoryItem) => void;
    onBack: () => void;
    onResumeAssessment?: (assessmentId: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewRecord, onBack, onResumeAssessment }) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPackage, setFilterPackage] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'package'>('date');
    const [inProgressAssessments, setInProgressAssessments] = useState<Assessment[]>([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
    const LIMIT = 10; // Pagination limit
    
    // useApi hook'u artık useMemo ile stable reference döndürüyor
    const api = useApi();
    
    // useRef ile loading flag - infinite loop'u önlemek için
    const isLoadingRef = useRef(false);
    
    useEffect(() => {
        // Eğer zaten loading ise, yeni bir request başlatma
        if (isLoadingRef.current) {
            return;
        }
        
        let isMounted = true;
        isLoadingRef.current = true;
        
        const loadHistory = async () => {
            setIsLoading(true);
            try {
                // Backend'den completed assessments çek (pagination ile)
                const response = await api.getAssessments({ 
                    status: 'completed', 
                    limit: LIMIT,
                    offset: offset 
                });
                
                if (!isMounted) return;
                
                const assessments: Assessment[] = response.data || [];
                setHasMore(assessments.length === LIMIT);
                
                // Her assessment için summary ve answers çek
                const historyItems: HistoryItem[] = await Promise.all(
                    assessments.map(async (assessment) => {
                        try {
                            const [summaryResponse, answersResponse] = await Promise.all([
                                api.getSummary(assessment.id),
                                api.getAnswers(assessment.id),
                            ]);
                            
                            if (!isMounted) return null;
                            
                            const summary: Summary = {
                                profileType: summaryResponse.profileType,
                                priorityThemes: summaryResponse.priorityThemes as string[],
                                maturityLevel: summaryResponse.maturityLevel,
                                keyStrengths: summaryResponse.keyStrengths as any[],
                                areasForDevelopment: summaryResponse.areasForDevelopment as any[],
                                recommendations: summaryResponse.recommendations as string[],
                                actionPlan: {
                                    shortTerm: summaryResponse.actionPlan.shortTerm.map((item: any) => ({
                                        id: item.id,
                                        text: item.text,
                                        completed: item.completed || false,
                                    })),
                                    mediumTerm: summaryResponse.actionPlan.mediumTerm.map((item: any) => ({
                                        id: item.id,
                                        text: item.text,
                                        completed: item.completed || false,
                                    })),
                                },
                            };
                            
                            const answers: Answer[] = (answersResponse.answers || []).map((a: any) => ({
                                questionId: a.questionId,
                                value: a.value,
                                // Add new fields from backend if available
                                questionDescription: a.questionDescription,
                                questionChoices: a.questionChoices,
                                questionTitle: a.questionTitle,
                                questionType: a.questionType,
                                questionTheme: a.questionTheme,
                                answeredAt: a.answeredAt,
                            }));
                            
                            return {
                                id: assessment.id,
                                date: assessment.completedAt || assessment.createdAt,
                                userName: assessment.userName,
                                packageName: assessment.packageName,
                                summary: summary,
                                answers: answers,
                            };
                        } catch (error) {
                            console.error(`Failed to load assessment ${assessment.id}:`, error);
                            return null;
                        }
                    })
                );
                
                if (!isMounted) return;
                
                // null değerleri filtrele
                const validItems = historyItems.filter((item): item is HistoryItem => item !== null);
                
                // localStorage'dan da oku (fallback)
                const localHistory = getAssessmentHistory();
                
                // Birleştir ve duplicate'leri kaldır (backend öncelikli)
                const allHistory = [...validItems, ...localHistory];
                const uniqueHistory = allHistory.filter((item, index, self) => 
                    index === self.findIndex((t) => t.id === item.id)
                );
                
                // Tarihe göre sırala (en yeni önce)
                uniqueHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                // Pagination: offset 0 ise replace, değilse append
                if (offset === 0) {
                    setHistory(uniqueHistory);
                } else {
                    setHistory(prev => {
                        const combined = [...prev, ...uniqueHistory];
                        // Duplicate'leri kaldır
                        return combined.filter((item, index, self) => 
                            index === self.findIndex((t) => t.id === item.id)
                        );
                    });
                }
            } catch (error) {
                console.error('Failed to load history from backend:', error);
                // Fallback: localStorage'dan oku
                if (isMounted) {
                    setHistory(getAssessmentHistory());
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    isLoadingRef.current = false;
                }
            }
        };
        
        loadHistory();
        
        // Cleanup function
        return () => {
            isMounted = false;
            isLoadingRef.current = false;
        };
    }, [offset, api]); // api'yi dependency array'e ekledik - useMemo ile stable

    // Load in_progress assessments (drafts)
    useEffect(() => {
        let isMounted = true;
        
        const loadDrafts = async () => {
            setIsLoadingDrafts(true);
            try {
                const response = await api.getAssessments({ 
                    status: 'in_progress', 
                    limit: 20,
                    offset: 0 
                });
                
                if (!isMounted) return;
                
                const assessments: Assessment[] = response.data || [];
                setInProgressAssessments(assessments);
            } catch (error) {
                console.error('Failed to load drafts:', error);
            } finally {
                if (isMounted) {
                    setIsLoadingDrafts(false);
                }
            }
        };
        
        loadDrafts();
        
        return () => {
            isMounted = false;
        };
    }, [api]);
    
    const loadMore = () => {
        if (!isLoading && hasMore) {
            setOffset(prev => prev + LIMIT);
        }
    };

    const handleClearHistory = () => {
        if (window.confirm(t('history.clearConfirm'))) {
            clearAssessmentHistory();
            setHistory([]);
        }
    };

    // Filter and search logic
    const filteredHistory = history.filter(item => {
        const matchesSearch = searchQuery === '' || 
            item.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.profileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answers.some(answer => answer.value.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPackage = filterPackage === 'all' || item.packageName === filterPackage;
        
        return matchesSearch && matchesPackage;
    });

    // Sort logic
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            return a.packageName.localeCompare(b.packageName);
        }
    });

    // Get unique package names for filter
    const uniquePackages = Array.from(new Set(history.map(item => item.packageName)));

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">{t('history.title')}</h1>
                    <p className="text-lg text-slate-600">{t('history.subtitle')}</p>
                </header>

                {/* In Progress Assessments (Drafts) */}
                {!isLoadingDrafts && inProgressAssessments.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('history.inProgress')} ({inProgressAssessments.length})
                        </h2>
                        <div className="space-y-3">
                            {inProgressAssessments.map((assessment) => (
                                <div 
                                    key={assessment.id} 
                                    className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">{assessment.packageName}</h3>
                                        <p className="text-sm text-slate-600">
                                            {assessment.userName} • {t('history.question')} {assessment.currentQuestionIndex || 0} {t('history.of')} {assessment.totalQuestions}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {t('history.lastActivity')}: {new Date(assessment.lastActivityAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                    {onResumeAssessment && (
                                        <button
                                            onClick={() => onResumeAssessment(assessment.id)}
                                            className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {t('history.continue')}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search and Filter Bar */}
                {history.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder={t('history.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                                />
                            </div>
                            
                            {/* Package Filter */}
                            <select
                                value={filterPackage}
                                onChange={(e) => setFilterPackage(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                            >
                                <option value="all">{t('history.filterAll')}</option>
                                {uniquePackages.map(pkg => (
                                    <option key={pkg} value={pkg}>{pkg}</option>
                                ))}
                            </select>
                            
                            {/* Sort By */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'package')}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                            >
                                <option value="date">{t('history.sortDate')}</option>
                                <option value="package">{t('history.sortPackage')}</option>
                            </select>
                        </div>
                        
                        {/* Results count */}
                        <p className="text-sm text-slate-600">
                            {sortedHistory.length} {sortedHistory.length !== 1 ? t('history.resultsPlural') : t('history.results')} {t('history.onTotal')} {history.length}
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <HistoryItemSkeleton key={i} />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center bg-white p-8 rounded-xl shadow-md">
                        <p className="text-slate-600 text-lg">{t('history.noHistoryMessage')}</p>
                        <button onClick={onBack} className="mt-6 bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors">
                            {t('history.startNew')}
                        </button>
                    </div>
                ) : sortedHistory.length === 0 ? (
                    <div className="text-center bg-white p-8 rounded-xl shadow-md">
                        <p className="text-slate-600 text-lg">{t('history.noResults')}</p>
                        <button onClick={() => { setSearchQuery(''); setFilterPackage('all'); }} className="mt-4 text-primary-600 hover:underline">
                            {t('history.resetFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedHistory.map((item) => (
                            <div key={item.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="font-bold text-primary-800">{item.packageName}</p>
                                    <p className="text-sm text-slate-500">
                                        {t('history.doneBy')} {item.userName} {t('history.on')} {new Date(item.date).toLocaleDateString('fr-FR')}
                                    </p>
                                    <p className="text-slate-700 mt-1">{t('history.profile')} : {item.summary.profileType}</p>
                                </div>
                                <button onClick={() => onViewRecord(item)} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors w-full sm:w-auto flex-shrink-0">
                                    {t('history.view')}
                                </button>
                            </div>
                        ))}
                        {hasMore && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? t('common.loading') : t('history.loadMore')}
                                </button>
                            </div>
                        )}
                        <div className="flex justify-center gap-4 pt-8">
                             <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary-600">
                                {t('history.backHome')}
                            </button>
                            <button onClick={handleClearHistory} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                {t('history.clearHistoryButton')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;
