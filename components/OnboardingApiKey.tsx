
import React, { useState } from 'react';

interface OnboardingApiKeyProps {
  onSaveKey: (key: string) => void;
}

export const OnboardingApiKey: React.FC<OnboardingApiKeyProps> = ({ onSaveKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSaveKey(apiKey.trim());
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Активируй бонус $300',
      subtitle: 'Google Cloud Console',
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>1. Перейди в <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-4 hover:text-indigo-700">Google Cloud Console</a></p>
          <p>2. Войди в Google аккаунт</p>
          <p>3. Нажми <strong className="text-slate-800">"Start Free"</strong> или <strong className="text-slate-800">"Try for free"</strong></p>
          <p>4. Выбери страну и введи данные карты</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-xs">
            Google спишет и вернет $0-1 для проверки. Реальные деньги НЕ спишутся, пока ты сам не перейдешь на платный тариф.
          </div>
          <p className="text-slate-400 text-xs">После регистрации автоматически создастся "Проект" (My First Project)</p>
        </div>
      )
    },
    {
      num: 2,
      title: 'Получи API ключ',
      subtitle: 'Google AI Studio',
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>1. Перейди в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-4 hover:text-indigo-700">Google AI Studio</a></p>
          <p>2. Нажми синюю кнопку <strong className="text-slate-800">"Create API Key"</strong></p>
          <p>3. В поле "Search for a Google Cloud Project" выбери проект из Шага 1</p>
          <p>4. Скопируй ключ (начинается на <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 border border-indigo-100">AIza...</code>)</p>
        </div>
      )
    },
    {
      num: 3,
      title: 'Вставь ключ сюда',
      subtitle: 'Последний шаг',
      content: (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono text-sm"
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              !apiKey.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            Сохранить и начать
          </button>
        </form>
      )
    }
  ];

  return (
    <div className="max-w-xl mx-auto w-full animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
          ThreadCraft
        </h1>
        <p className="text-slate-500 text-lg mb-2">Генератор вирусных тредов для Threads</p>
        <p className="text-slate-400 text-sm">Для работы нужен бесплатный Gemini API ключ</p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Как это работает?</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center text-xl">💳</div>
            <p className="text-xs text-slate-500"><strong className="text-slate-700">Google Cloud</strong><br/>Гаманець ($300 бонус)</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🔑</div>
            <p className="text-xs text-slate-500"><strong className="text-slate-700">AI Studio</strong><br/>Тут берём ключ</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🔗</div>
            <p className="text-xs text-slate-500"><strong className="text-slate-700">Проект</strong><br/>Зв'язує все разом</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`border rounded-2xl transition-all overflow-hidden ${
              expandedStep === step.num
                ? 'bg-white border-slate-300 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === step.num ? null : step.num)}
              className="w-full p-4 flex items-center gap-4 text-left"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                expandedStep === step.num
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step.num}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">{step.title}</div>
                <div className="text-xs text-slate-400">{step.subtitle}</div>
              </div>
              <div className={`text-slate-400 transition-transform ${expandedStep === step.num ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>

            {expandedStep === step.num && (
              <div className="px-4 pb-4 pt-0 animate-fade-in">
                <div className="pl-13 ml-[52px]">
                  {step.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-slate-400 text-xs mt-8">
        Ключ хранится только в твоем аккаунте. Мы не имеем к нему доступа.
      </p>
    </div>
  );
};
