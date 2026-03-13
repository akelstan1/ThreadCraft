import React, { useState } from 'react';
import { HookOption, ThreadType, CtaType } from '../types';
import { THREAD_TYPES, CTA_TYPES } from '../constants';

interface StepStrategyProps {
  hooks: HookOption[];
  usedHookIds: Set<string>;
  onGenerate: (hook: HookOption, type: ThreadType, cta: CtaType, customCta: string) => void;
  onMoreHooks: () => void;
  isGenerating: boolean;
  onBack: () => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ hooks, usedHookIds, onGenerate, onMoreHooks, isGenerating, onBack }) => {
  const [selectedHook, setSelectedHook] = useState<HookOption | null>(null);
  const [selectedType, setSelectedType] = useState<ThreadType | null>(null);
  const [selectedCta, setSelectedCta] = useState<CtaType>(CtaType.TELEGRAM);
  const [customCta, setCustomCta] = useState('');

  const handleGenerate = () => {
    if (selectedType && selectedHook) {
      onGenerate(selectedHook, selectedType, selectedCta, customCta);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <button onClick={onBack} className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 font-medium">
           ← Назад
         </button>
         <h2 className="text-2xl font-bold">Настройка стратегии</h2>
         <div className="w-16"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Hook Selection */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold text-lg">1</div>
             <h3 className="text-xl font-bold">Выбери убойный Хук</h3>
           </div>
           <p className="text-neutral-400 text-sm mb-4">Какой заголовок заставит их остановиться?</p>
           
           <div className="space-y-3">
             {hooks.map((hook) => {
               const isUsed = usedHookIds.has(hook.id);
               return (
               <div
                  key={hook.id}
                  onClick={() => setSelectedHook(hook)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                    selectedHook?.id === hook.id
                      ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500'
                      : isUsed
                        ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/50'
                  }`}
               >
                 {selectedHook?.id === hook.id && (
                   <div className="absolute top-0 right-0 p-2">
                     <div className="w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                   </div>
                 )}
                 {isUsed && selectedHook?.id !== hook.id && (
                   <div className="absolute top-0 right-0 p-2">
                     <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md border border-green-400/20">Использован</span>
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-md">
                     {hook.formula}
                   </span>
                 </div>
                 <p className="text-white font-medium text-lg leading-snug mb-3">
                   {hook.content}
                 </p>
                 <p className="text-xs text-neutral-500 border-t border-neutral-700/50 pt-2 italic">
                   💡 {hook.explanation}
                 </p>
               </div>
               );
             })}

             <button 
                onClick={onMoreHooks}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white transition-all font-medium flex items-center justify-center gap-2"
             >
                {isGenerating ? (
                    <span className="animate-pulse">Придумываем...</span>
                ) : (
                    <>🔄 Придумать еще +4 варианта</>
                )}
             </button>
           </div>
        </div>

        {/* Right Column: Structure & CTA */}
        <div className="space-y-8">
          {/* Structure */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold">Выбери структуру</h3>
            </div>
            <p className="text-neutral-400 text-sm mb-4">Как мы подадим информацию?</p>

            <div className="grid grid-cols-1 gap-3">
              {THREAD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as ThreadType)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-4 ${
                    selectedType === type.id
                      ? 'bg-neutral-800 border-white shadow-lg'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-2xl">{type.icon}</div>
                  <div>
                    <div className="font-bold text-white text-sm">{type.label}</div>
                    <div className="text-xs text-neutral-400">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-lg font-bold">Призыв к действию (CTA)</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {CTA_TYPES.map((cta) => (
                <button
                  key={cta.id}
                  onClick={() => setSelectedCta(cta.id as CtaType)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedCta === cta.id
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {cta.label}
                </button>
              ))}
            </div>
            
            {selectedCta === CtaType.OTHER && (
              <div className="mt-4 animate-fade-in">
                <input
                  type="text"
                  value={customCta}
                  onChange={(e) => setCustomCta(e.target.value)}
                  placeholder="Например: 'Подпишись на рассылку...'"
                  className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pointer-events-none flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={!selectedType || !selectedHook || isGenerating}
          className={`pointer-events-auto w-[90%] max-w-2xl py-4 rounded-xl font-bold text-xl transition-all shadow-2xl ${
            !selectedType || !selectedHook || isGenerating
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-white text-black hover:scale-105 active:scale-95 shadow-purple-500/30'
          }`}
        >
          {isGenerating ? "Пишем тред..." : "Создать Тред 🚀"}
        </button>
      </div>
    </div>
  );
};
