import React from 'react';
import { Package, CurrentPhaseInfo } from '../types';

interface EnhancedProgressProps {
  current: number;
  total: number;
  pkg: Package;
  currentPhaseInfo: CurrentPhaseInfo | null;
}

const EnhancedProgress: React.FC<EnhancedProgressProps> = ({ current, total, pkg, currentPhaseInfo }) => {
  const percentage = Math.round((current / total) * 100);
  const remaining = total - current;
  
  // Calculate phase progress
  const getPhaseProgress = () => {
    if (!currentPhaseInfo) return null;
    
    const phaseProgress = Math.round((currentPhaseInfo.positionInPhase / currentPhaseInfo.totalInPhase) * 100);
    return {
      phase: currentPhaseInfo.phase,
      name: currentPhaseInfo.name,
      progress: phaseProgress,
      position: currentPhaseInfo.positionInPhase,
      total: currentPhaseInfo.totalInPhase,
    };
  };
  
  const phaseProgress = getPhaseProgress();
  
  // Estimate remaining time (average 2-3 minutes per question)
  const avgTimePerQuestion = 2.5; // minutes
  const estimatedMinutes = Math.round(remaining * avgTimePerQuestion);
  const estimatedTime = estimatedMinutes < 60 
    ? `${estimatedMinutes} min` 
    : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}min`;
  
  // Milestone notifications
  const milestones = [
    { at: 10, message: "10 soru tamamlandı! 🎉" },
    { at: Math.floor(total / 2), message: "Yarı yoldasınız! 💪" },
    { at: total - 5, message: "Son 5 soru! 🏁" },
  ];
  
  const currentMilestone = milestones.find(m => current === m.at);
  
  return (
    <div className="w-full max-w-2xl">
      {/* Overall Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-slate-700">
            Progression globale
          </span>
          <span className="text-sm font-bold text-primary-600">
            {current} / {total} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-primary-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {/* Phase Progress */}
      {phaseProgress && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-600">
              {phaseProgress.name}
            </span>
            <span className="text-xs font-semibold text-primary-600">
              {phaseProgress.position} / {phaseProgress.total} ({phaseProgress.progress}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-secondary h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${phaseProgress.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Remaining Info */}
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>
          {remaining > 0 ? (
            <>~{estimatedTime} restant{remaining > 1 ? 's' : ''}</>
          ) : (
            <span className="text-green-600 font-semibold">Terminé ! 🎉</span>
          )}
        </span>
        {remaining > 0 && (
          <span className="font-semibold">
            {remaining} question{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Milestone Notification */}
      {currentMilestone && (
        <div className="mt-2 p-2 bg-primary-50 rounded-lg text-center">
          <p className="text-sm font-semibold text-primary-700">
            {currentMilestone.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedProgress;

