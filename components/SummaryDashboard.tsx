import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Summary, SummaryPoint, ActionPlanItem, Answer, DashboardData } from '../types';
import { findResourceLeads, analyzeThemesAndSkills } from '../services/aiService';
import { usePermissions } from '../src/core/permissions/usePermissions';
import SkillsRadar from './SkillsRadar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SummaryDashboardProps {
  summary: Summary;
  answers: Answer[];
  userName: string;
  packageName: string;
  onRestart: () => void;
  onViewHistory: () => void;
  isHistoryView?: boolean;
}

const SourceModal: React.FC<{ sources: string[], onClose: () => void }> = ({ sources, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-display text-primary-800 mb-4">{t('summary.sourceModalTitle')}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {sources.map((source, i) => <blockquote key={i} className="border-l-4 border-primary-300 pl-4 py-2 bg-slate-50 italic text-slate-700">"{source}"</blockquote>)}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">{t('common.close')}</button>
            </div>
        </div>
    );
};

const CoachModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-display text-primary-800 mb-4">{t('summary.coachModalTitle')}</h3>
                <p className="text-slate-600 mb-4">{t('summary.coachModalText1')}</p>
                <p className="text-slate-600">{t('summary.coachModalText2')}</p>
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">{t('summary.coachModalButton')}</button>
            </div>
        </div>
    );
};

const ResourceModal: React.FC<{ item: ActionPlanItem, onClose: () => void }> = ({ item, onClose }) => {
    const { t } = useTranslation();
    const [leads, setLeads] = useState<{ searchKeywords: string[], resourceTypes: string[], platformExamples: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                const result = await findResourceLeads(item.text);
                setLeads(result);
            } catch (error) { console.error("Failed to fetch resource leads:", error); }
            finally { setIsLoading(false); }
        };
        fetchLeads();
    }, [item]);

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-display text-primary-800 mb-2">{t('summary.resourceModalTitle')} : "{item.text}"</h3>
                <p className="text-slate-600 mb-4">{t('summary.resourceModalText')}</p>
                {isLoading ? <p>{t('summary.resourceSearching')}</p> : leads ? (
                    <div className="space-y-4">
                        <div><h4 className="font-semibold text-slate-700">{t('summary.resourceKeywords')} :</h4><p className="text-slate-600 text-sm">{leads.searchKeywords.join(', ')}</p></div>
                        <div><h4 className="font-semibold text-slate-700">{t('summary.resourceTypes')} :</h4><p className="text-slate-600 text-sm">{leads.resourceTypes.join(', ')}</p></div>
                        <div><h4 className="font-semibold text-slate-700">{t('summary.resourcePlatforms')} :</h4><p className="text-slate-600 text-sm">{leads.platformExamples.join(', ')}</p></div>
                    </div>
                ) : <p>{t('summary.resourceNotFound')}</p>}
                <button onClick={onClose} className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">{t('common.close')}</button>
            </div>
        </div>
    );
};

interface ExportModalProps {
    onExportJson: () => void;
    onExportCsv: () => void;
    onClose: () => void;
    canExportJson: boolean;
    canExportCsv: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ onExportJson, onExportCsv, onClose, canExportJson, canExportCsv }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold font-display text-primary-800 mb-4">{t('summary.exportModalTitle')}</h3>
                <p className="text-slate-600 mb-6">{t('summary.exportModalText')}</p>
                <div className="space-y-3">
                    {canExportJson && (
                        <button onClick={onExportJson} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50">
                            <strong>JSON</strong>
                            <p className="text-sm text-slate-500">{t('summary.exportJsonDesc')}</p>
                        </button>
                    )}
                    {canExportCsv && (
                        <button onClick={onExportCsv} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50">
                            <strong>CSV</strong>
                            <p className="text-sm text-slate-500">{t('summary.exportCsvDesc')}</p>
                        </button>
                    )}
                    {!canExportJson && !canExportCsv && (
                        <p className="text-sm text-slate-500 text-center py-4">{t('summary.noExportPermission')}</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-slate-200 py-2 rounded-lg hover:bg-slate-300">{t('common.cancel')}</button>
            </div>
        </div>
    );
};

const StrengthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const DevelopmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const RecommendationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ActionPlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const CoachIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.284-.24-1.88M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.284.24-1.88M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const BenchmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const SummaryCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4"><span className="text-primary-600">{icon}</span><h2 className="text-xl font-bold font-display text-primary-800">{title}</h2></div>
        {children}
    </div>
);

const ActionItem: React.FC<{ item: ActionPlanItem, onToggle: (id: string) => void, onFindLeads: (item: ActionPlanItem) => void }> = ({ item, onToggle, onFindLeads }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
            <input type="checkbox" checked={item.completed} onChange={() => onToggle(item.id)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <div className="flex-1">
                <label className={`text-slate-700 ${item.completed ? 'line-through text-slate-400' : ''}`}>{item.text}</label>
                {!item.completed && <button onClick={() => onFindLeads(item)} className="text-xs text-primary-600 hover:underline">{t('summary.findLeads')}</button>}
            </div>
        </div>
    );
};

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ summary, answers, userName, packageName, onRestart, onViewHistory, isHistoryView = false }) => {
    const { t } = useTranslation();
    const { canAccess } = usePermissions();
    const [selectedSources, setSelectedSources] = useState<string[] | null>(null);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState<ActionPlanItem | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [actionPlan, setActionPlan] = useState(summary.actionPlan);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    // Permission checks for export features
    const canExportJson = canAccess('bilan', 'export') || canAccess('bilan:export', 'json') || canAccess('bilan:export', 'read');
    const canExportCsv = canAccess('bilan', 'export') || canAccess('bilan:export', 'csv') || canAccess('bilan:export', 'read');
    const canExportPdf = canAccess('bilan', 'export') || canAccess('bilan:export', 'pdf') || canAccess('bilan:export', 'read');

    const ACTION_PLAN_STORAGE_KEY = `actionPlan-${userName}-${packageName}-${summary.profileType}`;

    useEffect(() => {
        if (!isHistoryView) {
            const savedPlan = localStorage.getItem(ACTION_PLAN_STORAGE_KEY);
            if (savedPlan) {
                setActionPlan(JSON.parse(savedPlan));
            }
        }
    }, [isHistoryView, ACTION_PLAN_STORAGE_KEY]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (answers && answers.length > 0) {
                setIsDashboardLoading(true);
                try {
                    const data = await analyzeThemesAndSkills(answers);
                    setDashboardData(data);
                } catch (error) {
                    console.error("Failed to analyze skills for summary:", error);
                } finally {
                    setIsDashboardLoading(false);
                }
            } else {
                 setIsDashboardLoading(false);
            }
        };

        fetchDashboardData();
    }, [answers]);

    useEffect(() => {
        if (!isHistoryView) {
            localStorage.setItem(ACTION_PLAN_STORAGE_KEY, JSON.stringify(actionPlan));
        }
    }, [actionPlan, isHistoryView, ACTION_PLAN_STORAGE_KEY]);
    
    const summaryRef = useRef<HTMLDivElement>(null);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    const handleDownloadPdf = async () => {
        const content = summaryRef.current;
        if (!content) {
            console.error('❌ PDF: Content not found');
            alert(t('summary.pdfError'));
            return;
        }

        setIsPdfGenerating(true);
        try {
            console.log('📄 PDF oluşturuluyor...');
            
            // html2canvas ile screenshot al
            const canvas = await html2canvas(content, { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f1f5f9'
            });
            
            const imgData = canvas.toDataURL('image/png');
            console.log('✅ Canvas oluşturuldu, PDF oluşturuluyor...');
            
            // jsPDF ile PDF oluştur
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;

            let heightLeft = imgHeight;
            let position = 0;

            // İlk sayfa
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Ek sayfalar gerekirse
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const fileName = `Bilan_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            console.log('✅ PDF indirildi:', fileName);
        } catch (error) {
            console.error('❌ PDF oluşturma hatası:', error);
            alert(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const handleExportJson = () => {
        // JSON export - tüm bilgileri dahil et
        const data = {
            metadata: {
                userName: userName,
                packageName: packageName,
                exportDate: new Date().toISOString(),
                totalQuestions: answers.length,
            },
            summary: summary,
            answers: answers.map((answer, index) => ({
                questionNumber: index + 1,
                questionId: answer.questionId,
                questionTitle: (answer as any).questionTitle || answer.questionId,
                questionDescription: (answer as any).questionDescription || null,
                questionType: (answer as any).questionType || null,
                questionTheme: (answer as any).questionTheme || null,
                questionChoices: (answer as any).questionChoices || null,
                value: answer.value,
                answeredAt: (answer as any).answeredAt || null,
            })),
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `Bilan_Complet_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        setIsExportModalOpen(false);
    };

    const handleExportCsv = () => {
        // Debug: İlk answer'ı kontrol et
        if (answers.length > 0) {
            const firstAnswer = answers[0] as any;
            const hasAllFields = !!(firstAnswer.questionTitle && firstAnswer.questionType && firstAnswer.questionTheme);
            
            console.log('📊 CSV Export - First answer data:', {
                questionId: firstAnswer.questionId,
                questionTitle: firstAnswer.questionTitle,
                questionDescription: firstAnswer.questionDescription,
                questionType: firstAnswer.questionType,
                questionTheme: firstAnswer.questionTheme,
                questionChoices: firstAnswer.questionChoices,
                hasAllFields: hasAllFields,
                allAnswerKeys: Object.keys(firstAnswer)
            });
            
            // Eğer eksik bilgiler varsa uyarı göster
            if (!hasAllFields) {
                console.warn('⚠️ CSV Export: Bazı soru bilgileri eksik!', {
                    missingTitle: !firstAnswer.questionTitle,
                    missingType: !firstAnswer.questionType,
                    missingTheme: !firstAnswer.questionTheme,
                    missingDescription: !firstAnswer.questionDescription
                });
            }
        }
        
        // Gelişmiş CSV export - tüm soru ve cevap bilgileri
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // CSV escaping: double quotes içindeki tırnak işaretlerini escape et
        const escapeCsv = (str: string | null | undefined) => {
            if (!str && str !== '0') return '';
            return `"${String(str).replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')}"`;
        };
        
        // Header row - Excel uyumlu (UTF-8 BOM)
        csvContent += "\ufeff"; // UTF-8 BOM for Excel
        csvContent += "Soru No,Soru ID,Soru Başlığı,Soru Açıklaması,Soru Tipi,Soru Teması,Soru Seçenekleri,Cevap,Tarih\r\n";
        
        // Her cevap için detaylı bilgi
        answers.forEach((answer, index) => {
            // Backend'den gelen answer objesi question bilgilerini içermeyebilir
            // Bu yüzden sadece mevcut bilgileri kullanıyoruz
            const questionNumber = index + 1;
            const questionId = answer.questionId || '';
            
            // Tüm alanları kontrol et ve fallback değerler kullan
            const questionTitle = (answer as any).questionTitle || (answer as any).questionId || questionId || '';
            const questionDescription = (answer as any).questionDescription || (answer as any).questionDesc || '';
            const questionType = (answer as any).questionType || (answer as any).type || '';
            const questionTheme = (answer as any).questionTheme || (answer as any).theme || '';
            
            // Question choices'ı düzgün formatla
            let questionChoices = '';
            const choices = (answer as any).questionChoices || (answer as any).choices;
            if (choices) {
                if (Array.isArray(choices)) {
                    questionChoices = choices.join('; ');
                } else if (typeof choices === 'string') {
                    try {
                        const parsed = JSON.parse(choices);
                        questionChoices = Array.isArray(parsed) ? parsed.join('; ') : String(parsed);
                    } catch {
                        questionChoices = String(choices);
                    }
                } else {
                    questionChoices = String(choices);
                }
            }
            
            const value = answer.value || '';
            const date = (answer as any).answeredAt ? 
                new Date((answer as any).answeredAt).toLocaleString('fr-FR') : 
                new Date().toLocaleString('fr-FR');
            
            csvContent += [
                escapeCsv(String(questionNumber)),
                escapeCsv(questionId),
                escapeCsv(questionTitle),
                escapeCsv(questionDescription),
                escapeCsv(questionType),
                escapeCsv(questionTheme),
                escapeCsv(questionChoices),
                escapeCsv(value),
                escapeCsv(date)
            ].join(',') + '\r\n';
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Bilan_Complet_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportModalOpen(false);
    };

    const handleToggleActionItem = (id: string) => {
        const newActionPlan = {
            shortTerm: actionPlan.shortTerm.map(item => item.id === id ? { ...item, completed: !item.completed } : item),
            mediumTerm: actionPlan.mediumTerm.map(item => item.id === id ? { ...item, completed: !item.completed } : item),
        };
        setActionPlan(newActionPlan);
    };

    const handleFindLeads = (item: ActionPlanItem) => {
        setSelectedActionItem(item);
        setIsResourceModalOpen(true);
    };

    return (
        <>
            {selectedSources && <SourceModal sources={selectedSources} onClose={() => setSelectedSources(null)} />}
            {isCoachModalOpen && <CoachModal onClose={() => setIsCoachModalOpen(false)} />}
            {isResourceModalOpen && selectedActionItem && <ResourceModal item={selectedActionItem} onClose={() => setIsResourceModalOpen(false)} />}
            {isExportModalOpen && (
                <ExportModal 
                    onExportJson={handleExportJson} 
                    onExportCsv={handleExportCsv} 
                    onClose={() => setIsExportModalOpen(false)}
                    canExportJson={canExportJson}
                    canExportCsv={canExportCsv}
                />
            )}

            <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
                <div ref={summaryRef} className="max-w-4xl mx-auto p-8 bg-slate-100 rounded-lg">
                    <header className="text-center mb-12 border-b pb-8">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">{t('summary.title')}</h1>
                        <p className="text-lg text-slate-600">{userName} - {packageName}</p>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">"{summary.profileType}"</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SummaryCard icon={<StrengthIcon/>} title={t('summary.keyStrengths')}>
                            <ul className="space-y-3">
                                {summary.keyStrengths.map((point: SummaryPoint, i) => (
                                    <li key={i} className="flex gap-2 items-start"><span className="text-secondary mt-1">✓</span><div>{point.text}<button onClick={() => setSelectedSources(point.sources)} className="text-xs text-primary-600 hover:underline ml-1">({t('summary.why')})</button></div></li>
                                ))}
                            </ul>
                        </SummaryCard>

                         <SummaryCard icon={<DevelopmentIcon/>} title={t('summary.developmentAreas')}>
                             <ul className="space-y-3">
                                {summary.areasForDevelopment.map((point: SummaryPoint, i) => (
                                    <li key={i} className="flex gap-2 items-start"><span className="text-amber-500 mt-1">→</span><div>{point.text}<button onClick={() => setSelectedSources(point.sources)} className="text-xs text-primary-600 hover:underline ml-1">({t('summary.why')})</button></div></li>
                                ))}
                            </ul>
                        </SummaryCard>

                        <SummaryCard icon={<RecommendationIcon/>} title={t('summary.recommendations')}>
                            <ul className="space-y-3 list-disc list-inside text-slate-700">
                                {summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </SummaryCard>
                        
                         <SummaryCard icon={<ActionPlanIcon/>} title={t('summary.actionPlan')}>
                            <div><h3 className="font-semibold text-slate-800 mb-2">{t('summary.shortTerm')}</h3><div className="divide-y">{actionPlan.shortTerm.map(item => <ActionItem key={item.id} item={item} onToggle={handleToggleActionItem} onFindLeads={handleFindLeads} />)}</div></div>
                            <div className="mt-4"><h3 className="font-semibold text-slate-800 mb-2">{t('summary.mediumTerm')}</h3><div className="divide-y">{actionPlan.mediumTerm.map(item => <ActionItem key={item.id} item={item} onToggle={handleToggleActionItem} onFindLeads={handleFindLeads} />)}</div></div>
                        </SummaryCard>
                        
                        <div className="md:col-span-2">
                            <SummaryCard icon={<BenchmarkIcon/>} title={t('summary.skillsPositioning')}>
                                <p className="text-sm text-slate-600 mb-4">{t('summary.skillsDescription')}</p>
                                {isDashboardLoading ? (
                                    <div className="text-center p-4"><p className="text-sm text-slate-500">{t('summary.skillsAnalyzing')}</p></div>
                                ) : dashboardData && dashboardData.skills ? (
                                    <SkillsRadar data={dashboardData.skills} />
                                ) : (
                                    <div className="text-center p-4"><p className="text-sm text-slate-500">{t('summary.skillsNotAvailable')}</p></div>
                                )}
                            </SummaryCard>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-8 flex flex-wrap justify-center items-center gap-4">
                     {!isHistoryView && <button onClick={onRestart} className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700">{t('summary.restart')}</button>}
                     <button onClick={onViewHistory} className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300">{isHistoryView ? t('summary.backHistory') : t('summary.viewHistory')}</button>
                     {canExportPdf && (
                        <button 
                            onClick={handleDownloadPdf} 
                            disabled={isPdfGenerating}
                            className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-secondary-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isPdfGenerating ? t('summary.generatingPdf') : t('summary.downloadPdf')}
                        </button>
                     )}
                     {(canExportJson || canExportCsv) && (
                        <button onClick={() => setIsExportModalOpen(true)} className="text-sm text-slate-500 hover:text-primary-600">
                            {t('summary.exportData')}
                        </button>
                     )}
                     <button onClick={() => setIsCoachModalOpen(true)} className="text-sm text-slate-500 hover:text-primary-600">{t('summary.discussCoach')}</button>
                </div>
            </div>
        </>
    );
};

export default SummaryDashboard;