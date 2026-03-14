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
         <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium">
           ← Назад
         </button>
         <h2 className="text-2xl font-bold text-slate-800">Настройка стратегии</h2>
         <div className="w-16"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Hook Selection */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">1</div>
             <h3 className="text-xl font-bold text-slate-800">Выбери убойный Хук</h3>
           </div>
           <p className="text-slate-400 text-sm mb-4">Какой заголовок заставит их остановиться?</p>

           <div className="space-y-3">
             {hooks.map((hook) => {
               const isUsed = usedHookIds.has(hook.id);
               return (
               <div
                  key={hook.id}
                  onClick={() => setSelectedHook(hook)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                    selectedHook?.id === hook.id
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                      : isUsed
                        ? 'bg-white/60 border-slate-200 hover:border-slate-300'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md shadow-sm'
                  }`}
               >
                 {selectedHook?.id === hook.id && (
                   <div className="absolute top-0 right-0 p-2">
                     <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                   </div>
                 )}
                 {isUsed && selectedHook?.id !== hook.id && (
                   <div className="absolute top-0 right-0 p-2">
                     <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Использован</span>
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                     {hook.formula}
                   </span>
                 </div>
                 <p className="text-slate-800 font-medium text-lg leading-snug mb-3">
                   {hook.content}
                 </p>
                 <p className="text-xs text-slate-400 border-t border-slate-100 pt-2 italic">
                   {hook.explanation}
                 </p>
               </div>
               );
             })}

             <button
                onClick={onMoreHooks}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all font-medium flex items-center justify-center gap-2"
             >
                {isGenerating ? (
                    <span className="animate-pulse">Придумываем...</span>
                ) : (
                    <>Придумать еще +4 варианта</>
                )}
             </button>
           </div>
        </div>

        {/* Right Column: Structure & CTA */}
        <div className="space-y-8">
          {/* Structure */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold text-slate-800">Выбери структуру</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">Как мы подадим информацию?</p>

            <div className="grid grid-cols-1 gap-3">
              {THREAD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as ThreadType)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-4 ${
                    selectedType === type.id
                      ? 'bg-indigo-50 border-indigo-400 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm shadow-sm'
                  }`}
                >
                  <div className="text-2xl">{type.icon}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{type.label}</div>
                    <div className="text-xs text-slate-400">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-lg font-bold text-slate-800">Призыв к действию (CTA)</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {CTA_TYPES.map((cta) => (
                <button
                  key={cta.id}
                  onClick={() => setSelectedCta(cta.id as CtaType)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedCta === cta.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#f0f2f8] via-[#f0f2f8]/90 to-transparent z-40 pointer-events-none flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={!selectedType || !selectedHook || isGenerating}
          className={`pointer-events-auto w-[90%] max-w-2xl py-4 rounded-xl font-bold text-xl transition-all shadow-2xl ${
            !selectedType || !selectedHook || isGenerating
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200'
          }`}
        >
          {isGenerating ? "Пишем тред..." : "Создать Тред"}
        </button>
      </div>
    </div>
  );
};
