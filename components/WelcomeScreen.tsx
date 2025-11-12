import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAssessmentHistory } from '../services/historyService';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  onShowHistory: () => void;
  onShowAnalytics?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory, onShowAnalytics }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const history = getAssessmentHistory();
    setHasHistory(history.length > 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all hover:scale-105 duration-500">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-4">{t('welcome.title')}</h1>
        <p className="text-slate-600 mb-8 text-lg">
          {t('welcome.subtitle')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">{t('welcome.nameLabel')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('welcome.namePlaceholder')}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            {t('welcome.startButton')}
          </button>
        </form>
               <div className="mt-4 flex flex-col gap-2 items-center">
                 {hasHistory && (
                   <button
                     onClick={onShowHistory}
                     className="text-sm text-slate-500 hover:text-primary-600"
                   >
                     {t('welcome.viewHistory')}
                   </button>
                 )}
                 {onShowAnalytics && (
                   <button
                     onClick={onShowAnalytics}
                     className="text-sm text-slate-500 hover:text-primary-600"
                   >
                     {t('welcome.viewAnalytics') || 'Analytics'}
                   </button>
                 )}
               </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
