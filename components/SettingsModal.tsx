
import React, { useState } from 'react';
import { CustomCta } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: () => void;
  onDeleteApiKey: () => void;
  customCtas: CustomCta[];
  onAddCta: (text: string) => void;
  onDeleteCta: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  onSaveApiKey,
  onDeleteApiKey,
  customCtas,
  onAddCta,
  onDeleteCta
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'cta'>('api');
  const [newCtaText, setNewCtaText] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleAddCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCtaText.trim()) {
      onAddCta(newCtaText.trim());
      setNewCtaText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">

         {/* Header / Tabs */}
         <div className="flex border-b border-slate-100">
           <button
             onClick={() => setActiveTab('api')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'api' ? 'bg-slate-50 text-slate-800 border-b-2 border-indigo-500' : 'hover:bg-slate-50 text-slate-400'}`}
           >
             API Key
           </button>
           <button
             onClick={() => setActiveTab('cta')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'cta' ? 'bg-slate-50 text-slate-800 border-b-2 border-indigo-500' : 'hover:bg-slate-50 text-slate-400'}`}
           >
             Библиотека CTA
           </button>
           <button
             onClick={onClose}
             className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 z-10"
           >
             ✕
           </button>
         </div>

         {/* Content */}
         <div className="p-6 overflow-y-auto">
           {activeTab === 'api' ? (
             <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-xl font-bold text-slate-800">Настройки Gemini</h3>
               </div>
               <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                 Для работы приложения нужен ключ от <strong className="text-slate-700">Google Gemini API</strong>.
                 Он сохраняется только в твоем аккаунте.
               </p>

               {/* Collapsible Guide */}
               <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                 <button
                   onClick={() => setShowGuide(!showGuide)}
                   className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                 >
                   <span className="text-sm font-medium text-indigo-600">Как получить ключ бесплатно?</span>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showGuide ? 'rotate-180' : ''}`}>
                     <polyline points="6 9 12 15 18 9"></polyline>
                   </svg>
                 </button>

                 {showGuide && (
                   <div className="px-4 py-3 space-y-4 text-sm text-slate-600 border-t border-slate-200 animate-fade-in">
                     {/* Step 1 */}
                     <div>
                       <div className="flex items-center gap-2 mb-1.5">
                         <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                         <span className="font-bold text-slate-700">Активируй бонус $300</span>
                       </div>
                       <div className="ml-8 space-y-1">
                         <p>Перейди в <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700">Google Cloud Console</a></p>
                         <p>Войди в Google аккаунт и нажми <strong className="text-slate-700">"Start Free"</strong></p>
                         <p>Выбери страну и введи данные карты</p>
                         <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700 text-xs mt-1">
                           Google спишет и вернет $0-1 для проверки. Реальные деньги НЕ спишутся, пока ты сам не перейдешь на платный тариф.
                         </div>
                       </div>
                     </div>

                     {/* Step 2 */}
                     <div>
                       <div className="flex items-center gap-2 mb-1.5">
                         <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                         <span className="font-bold text-slate-700">Получи API ключ</span>
                       </div>
                       <div className="ml-8 space-y-1">
                         <p>Перейди в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700">Google AI Studio</a></p>
                         <p>Нажми <strong className="text-slate-700">"Create API Key"</strong></p>
                         <p>Выбери проект из Шага 1 и скопируй ключ</p>
                         <p className="text-xs text-slate-400">Ключ начинается на <code className="bg-indigo-50 px-1 py-0.5 rounded text-indigo-600 border border-indigo-100">AIza...</code></p>
                       </div>
                     </div>

                     {/* Step 3 */}
                     <div>
                       <div className="flex items-center gap-2 mb-1.5">
                         <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                         <span className="font-bold text-slate-700">Вставь ключ ниже и нажми "Сохранить"</span>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gemini API Key</label>
                 <input
                   type="password"
                   value={apiKey}
                   onChange={(e) => onApiKeyChange(e.target.value)}
                   placeholder="AIzaSy..."
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono text-sm"
                 />
               </div>

               <div className="pt-2 flex gap-3">
                 <button
                   onClick={onSaveApiKey}
                   className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                 >
                   Сохранить
                 </button>
                 <button
                   onClick={onDeleteApiKey}
                   className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                 >
                   Удалить
                 </button>
               </div>

               <p className="text-[10px] text-slate-400 text-center pt-2">
                 Ключ хранится только в твоем аккаунте. Мы не имеем к нему доступа.
               </p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-xl font-bold text-slate-800">Мои призывы к действию</h3>
                </div>
                <p className="text-slate-500 text-sm">
                  Добавь сюда свои стандартные концовки, чтобы вставлять их в треды в один клик.
                </p>

                {/* List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {customCtas.length === 0 && (
                    <div className="text-center py-8 text-slate-400 italic border border-dashed border-slate-200 rounded-xl">
                      Тут пока пусто. Добавь свой первый CTA
                    </div>
                  )}
                  {customCtas.map(cta => (
                    <div key={cta.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-start group">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{cta.text}</p>
                      <button
                        onClick={() => onDeleteCta(cta.id)}
                        className="ml-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Form */}
                <form onSubmit={handleAddCtaSubmit} className="pt-4 border-t border-slate-100">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Новый CTA</label>
                   <div className="flex gap-2">
                     <textarea
                        value={newCtaText}
                        onChange={(e) => setNewCtaText(e.target.value)}
                        placeholder="Например: &#10;Спасибо, что дочитали! &#10;Ссылка на гайд в био..."
                        rows={3}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none leading-relaxed"
                     />
                     <button
                       type="submit"
                       disabled={!newCtaText.trim()}
                       className="bg-indigo-600 text-white font-bold w-12 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                     >
                       <span className="text-xl">+</span>
                     </button>
                   </div>
                </form>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};
