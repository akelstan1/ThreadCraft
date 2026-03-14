
import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingApiKey } from './components/OnboardingApiKey';
import { StepInput } from './components/StepInput';
import { StepStrategy } from './components/StepStrategy';
import { StepResult } from './components/StepResult';
import { SettingsModal } from './components/SettingsModal';
import { HistoryView } from './components/HistoryView';
import { generateViralHooks, generateThreadContent, refineThreadContent, splitTextToThread, processVideoToThread } from './services/geminiService';
import {
  onAuthStateChange, signOut, getUser,
  loadHistory, saveHistoryItem, deleteHistoryItem,
  loadCustomCtas, saveCustomCta, deleteCustomCta,
  loadSetting, saveSetting, deleteSetting
} from './services/supabaseService';
import { AppStep, InputMode, HookOption, ThreadType, CtaType, GeneratedThread, CustomCta, HistoryItem } from './types';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.AUTH);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [authChecked, setAuthChecked] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [customCtas, setCustomCtas] = useState<CustomCta[]>([]);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Data flow
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.FROM_SCRATCH);
  const [generatedHooks, setGeneratedHooks] = useState<HookOption[]>([]);
  const [resultData, setResultData] = useState<GeneratedThread | null>(null);
  const [usedHookIds, setUsedHookIds] = useState<Set<string>>(new Set());
  const [prevStep, setPrevStep] = useState<AppStep>(AppStep.INPUT);

  // Check auth on mount
  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
        setStep(AppStep.INPUT);
      }
      setAuthChecked(true);
    };
    checkUser();

    const { data: { subscription } } = onAuthStateChange((event, user) => {
      if (event === 'SIGNED_IN' && user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
        setStep((prev: AppStep) => prev === AppStep.AUTH ? AppStep.INPUT : prev);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setUserEmail('');
        setStep(AppStep.AUTH);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      const [dbHistory, dbCtas, dbApiKey] = await Promise.all([
        loadHistory(userId),
        loadCustomCtas(userId),
        loadSetting(userId, 'gemini_api_key'),
      ]);
      if (dbHistory.length > 0) setHistory(dbHistory);
      if (dbCtas.length > 0) setCustomCtas(dbCtas);
      if (dbApiKey) {
        setApiKeyInput(dbApiKey);
        localStorage.setItem('gemini_api_key', dbApiKey);
      }
    };
    loadData();
  }, [userId]);

  const handleAuth = async () => {
    const user = await getUser();
    if (user) {
      setUserId(user.id);
      setUserEmail(user.email || '');
      setStep(AppStep.INPUT);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUserId(null);
    setUserEmail('');
    setHistory([]);
    setCustomCtas([]);
    setApiKeyInput('');
    localStorage.removeItem('gemini_api_key');
    setStep(AppStep.AUTH);
  };

  // --- Settings & Data Management ---
  const handleSaveApiKey = () => {
    if (!userId) return;
    if (apiKeyInput.trim()) {
      saveSetting(userId, 'gemini_api_key', apiKeyInput.trim());
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      alert('API Ключ сохранен!');
    } else {
      deleteSetting(userId, 'gemini_api_key');
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleDeleteApiKey = () => {
    if (!userId) return;
    if (confirm('Удалить ключ?')) {
      setApiKeyInput('');
      deleteSetting(userId, 'gemini_api_key');
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleAddCta = (text: string) => {
    if (!userId) return;
    const newCta: CustomCta = { id: Date.now().toString(), text };
    setCustomCtas(prev => [...prev, newCta]);
    saveCustomCta(userId, newCta);
  };

  const handleDeleteCta = (id: string) => {
    if (!userId) return;
    setCustomCtas(prev => prev.filter(c => c.id !== id));
    deleteCustomCta(userId, id);
  };

  const handleAddToHistory = (item: HistoryItem) => {
    if (!userId) return;
    const existingIndex = history.findIndex(h => h.id === item.id);
    let updatedHistory;

    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = item;
    } else {
      updatedHistory = [item, ...history];
    }

    setHistory(updatedHistory);
    saveHistoryItem(userId, item);
  };

  const handleDeleteHistoryItem = (id: string) => {
    if (!userId) return;
    setHistory(prev => prev.filter(h => h.id !== id));
    deleteHistoryItem(userId, id);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.threadData) {
      setResultData(item.threadData);
      setStep(AppStep.RESULT);
    }
  };

  // --- Core Generator Logic ---

  const handleNextStep = async (text: string, mode: InputMode, fileBase64?: string, mimeType?: string) => {
    setIsLoading(true);
    setInputText(text);
    setInputMode(mode);

    try {
      if (mode === InputMode.AS_IS) {
        const thread = await splitTextToThread(text);
        setResultData(thread);
        setStep(AppStep.RESULT);
      } else if (mode === InputMode.VIDEO_DIRECT) {
        if (fileBase64 && mimeType) {
          const thread = await processVideoToThread(fileBase64, mimeType);
          setResultData(thread);
          setStep(AppStep.RESULT);
        } else {
          throw new Error("Файл видео не найден");
        }
      } else {
        const hooks = await generateViralHooks(text, mode);
        setGeneratedHooks(hooks);
        setStep(AppStep.STRATEGY);
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      const msg = error?.message || '';
      if (msg.includes('API Key')) {
        alert("Ошибка: API Key не найден. Нажмите на шестеренку и укажите ключ.");
        setIsSettingsOpen(true);
      } else {
        alert(`Произошла ошибка: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreHooks = async () => {
    setIsLoading(true);
    try {
      const newHooks = await generateViralHooks(inputText, inputMode);
      const uniqueNewHooks = newHooks.map(h => ({...h, id: h.id + '_' + Date.now()}));
      setGeneratedHooks(prev => [...prev, ...uniqueNewHooks]);
    } catch (error) {
      console.error("More hooks failed:", error);
      alert("Не удалось загрузить еще варианты.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateThread = async (hook: HookOption, type: ThreadType, cta: CtaType, customCta: string) => {
    setIsLoading(true);
    try {
      const thread = await generateThreadContent(inputText, hook, type, cta, customCta);
      setResultData(thread);
      setUsedHookIds(prev => new Set(prev).add(hook.id));
      setStep(AppStep.RESULT);
    } catch (error) {
      console.error("Thread generation failed:", error);
      alert("Не удалось создать тред.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineThread = async (instructions: string) => {
    if (!resultData) return;
    setIsLoading(true);
    try {
      const refinedThread = await refineThreadContent(
        resultData.posts,
        instructions,
        { type: resultData.type, hook: resultData.selectedHook }
      );
      setResultData(refinedThread);
    } catch (error) {
      console.error("Refine failed:", error);
      alert("Не удалось исправить тред.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = (index: number, newContent: string) => {
    if (!resultData) return;
    const updatedPosts = [...resultData.posts];
    updatedPosts[index] = { ...updatedPosts[index], content: newContent, charCount: newContent.length };
    setResultData({ ...resultData, posts: updatedPosts });
  };

  const handleAddPost = (content: string = '') => {
    if (!resultData) return;
    const newPost = { content, charCount: content.length };
    setResultData({
      ...resultData,
      posts: [...resultData.posts, newPost],
      totalPosts: resultData.posts.length + 1
    });
  };

  const handleRemovePost = (index: number) => {
    if (!resultData) return;
    const updatedPosts = resultData.posts.filter((_, i) => i !== index);
    setResultData({ ...resultData, posts: updatedPosts, totalPosts: updatedPosts.length });
  };

  const handleBackToHooks = () => {
    setStep(AppStep.STRATEGY);
  };

  const handleOnboardingSaveKey = (key: string) => {
    if (!userId) return;
    setApiKeyInput(key);
    saveSetting(userId, 'gemini_api_key', key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setInputText('');
    setGeneratedHooks([]);
    setResultData(null);
    setUsedHookIds(new Set());
  };

  const hasApiKey = !!apiKeyInput.trim();

  // Loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Загрузка...</div>
      </div>
    );
  }

  // Auth screen
  if (step === AppStep.AUTH) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] text-slate-800 selection:bg-indigo-200 relative">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 z-50"></div>

      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 md:gap-3">
         {step !== AppStep.HISTORY && (
            <button
              onClick={() => { setPrevStep(step); setStep(AppStep.HISTORY); }}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 shadow-sm"
              title="Мои черновики"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
            </button>
         )}

         <button
           onClick={() => setIsSettingsOpen(true)}
           className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 shadow-sm"
           title="Настройки"
         >
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="12" r="3"></circle>
             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
           </svg>
         </button>

         <div className="flex items-center gap-2 ml-2">
           <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[150px]">{userEmail}</span>
           <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors underline decoration-slate-300 underline-offset-4">
             Выйти
           </button>
         </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKeyInput}
        onApiKeyChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        onDeleteApiKey={handleDeleteApiKey}
        customCtas={customCtas}
        onAddCta={handleAddCta}
        onDeleteCta={handleDeleteCta}
      />

      <main className="container mx-auto px-4 py-12 md:py-20">
        {step === AppStep.HISTORY && (
          <HistoryView
            history={history}
            onBack={() => setStep(prevStep)}
            onSelect={handleSelectHistoryItem}
            onDelete={handleDeleteHistoryItem}
          />
        )}

        {step === AppStep.INPUT && !hasApiKey && (
          <OnboardingApiKey onSaveKey={handleOnboardingSaveKey} />
        )}

        {step === AppStep.INPUT && hasApiKey && (
          <StepInput onNext={handleNextStep} isLoading={isLoading} />
        )}

        {step === AppStep.STRATEGY && generatedHooks.length > 0 && (
          <StepStrategy
            hooks={generatedHooks}
            usedHookIds={usedHookIds}
            onGenerate={handleGenerateThread}
            onMoreHooks={handleLoadMoreHooks}
            isGenerating={isLoading}
            onBack={() => setStep(AppStep.INPUT)}
          />
        )}

        {step === AppStep.RESULT && resultData && (
          <StepResult
            data={resultData}
            customCtas={customCtas}
            onReset={handleReset}
            onBackToHooks={generatedHooks.length > 0 ? handleBackToHooks : undefined}
            onRefine={handleRefineThread}
            onUpdatePost={handleUpdatePost}
            onAddPost={handleAddPost}
            onRemovePost={handleRemovePost}
            onAddToHistory={handleAddToHistory}
            isRefining={isLoading}
          />
        )}
      </main>

      <footer className="fixed bottom-4 left-4 text-xs text-slate-400">
        <span className="opacity-50">ThreadCraft by Aleksandr Kalinin</span>
      </footer>
    </div>
  );
}

export default App;
