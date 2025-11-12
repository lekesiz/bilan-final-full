import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../types';
import { analyzeUserProfile } from '../services/aiService';

interface PersonalizationStepProps {
  onComplete: (profile: UserProfile | null) => void;
}

const PersonalizationStep: React.FC<PersonalizationStepProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [cvText, setCvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!cvText.trim()) {
      setError(t('personalization.errorEmpty'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const profile = await analyzeUserProfile(cvText);
      onComplete(profile);
    } catch (err) {
      console.error("Error analyzing profile:", err);
      setError(t('personalization.errorAnalysis'));
      // Wait a bit before continuing so user can read the error
      setTimeout(() => onComplete(null), 2000);
    }
  };
  
  const handleSkip = () => {
    onComplete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-800 mb-2">{t('personalization.title')}</h1>
          <p className="text-slate-600 text-lg">
            {t('personalization.subtitle')}
          </p>
          <p className="text-sm text-slate-500 mt-1">{t('personalization.optional')}</p>
        </header>
        
        <textarea
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder={t('personalization.placeholder')}
          rows={10}
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
        
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !cvText.trim()}
            className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? t('personalization.analyzing') : t('personalization.personalize')}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-sm text-slate-500 hover:text-primary-600"
          >
            {t('personalization.skip')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationStep;
