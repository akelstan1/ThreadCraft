
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

  if (!isOpen) return null;

  const handleAddCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCtaText.trim()) {
      onAddCta(newCtaText.trim());
      setNewCtaText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#151515] border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
         
         {/* Header / Tabs */}
         <div className="flex border-b border-neutral-800">
           <button 
             onClick={() => setActiveTab('api')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'api' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 text-neutral-500'}`}
           >
             🔑 API Key
           </button>
           <button 
             onClick={() => setActiveTab('cta')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'cta' ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 text-neutral-500'}`}
           >
             📢 Библиотека CTA
           </button>
           <button 
             onClick={onClose}
             className="absolute top-2 right-2 p-2 text-neutral-500 hover:text-white z-10"
           >
             ✕
           </button>
         </div>

         {/* Content */}
         <div className="p-6 overflow-y-auto">
           {activeTab === 'api' ? (
             <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-xl font-bold">Настройки Gemini</h3>
               </div>
               <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
                 Для работы приложения нужен ключ от <strong>Google Gemini API</strong>. 
                 Он сохраняется только в твоем браузере.
               </p>
               
               <div>
                 <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Gemini API Key</label>
                 <input 
                   type="password" 
                   value={apiKey}
                   onChange={(e) => onApiKeyChange(e.target.value)}
                   placeholder="AIzaSy..."
                   className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all font-mono text-sm"
                 />
               </div>
               
               <div className="pt-2 flex gap-3">
                 <button 
                   onClick={onSaveApiKey}
                   className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors"
                 >
                   Сохранить
                 </button>
                 <button 
                   onClick={onDeleteApiKey}
                   className="px-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-xl hover:text-red-400 hover:border-red-900/30 transition-colors"
                 >
                   Удалить
                 </button>
               </div>

               <p className="text-[10px] text-neutral-600 text-center pt-2">
                 Получить ключ можно в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-neutral-400">Google AI Studio</a>.
               </p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-xl font-bold">Мои призывы к действию</h3>
                </div>
                <p className="text-neutral-400 text-sm">
                  Добавь сюда свои стандартные концовки, чтобы вставлять их в треды в один клик.
                </p>

                {/* List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {customCtas.length === 0 && (
                    <div className="text-center py-8 text-neutral-600 italic border border-dashed border-neutral-800 rounded-xl">
                      Тут пока пусто. Добавь свой первый CTA 👇
                    </div>
                  )}
                  {customCtas.map(cta => (
                    <div key={cta.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex justify-between items-start group">
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{cta.text}</p>
                      <button 
                        onClick={() => onDeleteCta(cta.id)}
                        className="ml-3 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Form */}
                <form onSubmit={handleAddCtaSubmit} className="pt-4 border-t border-neutral-800">
                   <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Новый CTA</label>
                   <div className="flex gap-2">
                     <textarea
                        value={newCtaText}
                        onChange={(e) => setNewCtaText(e.target.value)}
                        placeholder="Например: &#10;Спасибо, что дочитали! &#10;Ссылка на гайд в био..."
                        rows={3}
                        className="flex-1 bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm resize-none leading-relaxed custom-scrollbar"
                     />
                     <button 
                       type="submit"
                       disabled={!newCtaText.trim()}
                       className="bg-purple-600 text-white font-bold w-12 rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
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
