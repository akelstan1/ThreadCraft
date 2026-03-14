
import React, { useState, useRef, useEffect } from 'react';
import { GeneratedThread, CustomCta, HistoryItem } from '../types';

interface StepResultProps {
  data: GeneratedThread;
  customCtas: CustomCta[];
  onReset: () => void;
  onBackToHooks?: () => void;
  onRefine: (instructions: string) => void;
  onUpdatePost: (index: number, content: string) => void;
  onAddPost: (content?: string) => void;
  onRemovePost: (index: number) => void;
  onAddToHistory: (item: HistoryItem) => void;
  isRefining: boolean;
}

export const StepResult: React.FC<StepResultProps> = ({
  data,
  customCtas,
  onReset,
  onBackToHooks,
  onRefine,
  onUpdatePost,
  onAddPost,
  onRemovePost,
  onAddToHistory,
  isRefining,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [refineText, setRefineText] = useState('');
  const [showCtaPicker, setShowCtaPicker] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    textareaRefs.current.forEach(adjustHeight);
  }, [data.posts]);

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = data.posts.map(p => p.content).join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmitRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (refineText.trim()) {
      onRefine(refineText);
      setRefineText('');
    }
  };

  const handleSaveDraft = () => {
    const draftId = `draft_${Date.now()}`;
    onAddToHistory({
        id: draftId,
        textPreview: data.posts[0].content.slice(0, 100),
        timestamp: Date.now(),
        postCount: data.posts.length,
        status: 'DRAFT',
        threadData: data
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in pb-48">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
           {onBackToHooks && (
             <button onClick={onBackToHooks} className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 font-medium">
               ← Другой хук
             </button>
           )}
           <button onClick={onReset} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2">
             {onBackToHooks ? 'Сначала' : '← Начать заново'}
           </button>
         </div>
         <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full border border-indigo-100 font-medium">
               {data.type}
            </span>
         </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute left-[26px] top-8 bottom-8 w-0.5 bg-slate-200"></div>

        <div className="space-y-6">
            {data.posts.map((post, index) => (
                <div key={index} className="relative pl-16 group">
                    <div className="absolute left-0 top-0 w-14 h-14 flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold z-10 transition-all ${
                            isRefining
                                ? 'bg-slate-100 border-slate-200 text-slate-300'
                                : 'bg-white border-slate-200 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600 shadow-sm'
                        }`}>
                            {index + 1}
                        </div>
                    </div>

                    <div className={`rounded-2xl p-5 relative transition-all ${
                        isRefining
                            ? 'bg-white/50 border border-slate-200/50 opacity-50 blur-[1px]'
                            : 'bg-white border border-slate-200 hover:border-slate-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 shadow-sm hover:shadow-md'
                    }`}>
                        <button
                           onClick={() => {
                             if(confirm('Удалить этот пост?')) {
                               onRemovePost(index);
                             }
                           }}
                           className="absolute top-3 right-3 p-2 rounded-lg bg-transparent text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all z-20"
                           title="Удалить слайд"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>

                        <textarea
                            ref={el => textareaRefs.current[index] = el}
                            value={post.content}
                            onChange={(e) => {
                                onUpdatePost(index, e.target.value);
                                adjustHeight(e.target);
                            }}
                            className="w-full bg-transparent text-slate-700 leading-relaxed mb-2 text-[15px] outline-none resize-none overflow-hidden pr-8"
                            spellCheck={false}
                        />

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className={`text-xs ${post.charCount > 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {post.charCount} / 500
                            </span>
                            <button
                                onClick={() => handleCopy(post.content, index)}
                                disabled={isRefining}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {copiedIndex === index ? (
                                    <span className="text-green-600">Скопировано!</span>
                                ) : (
                                    "Копировать"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Buttons: Add Post & Add CTA */}
      <div className="pl-16 mb-12 grid grid-cols-2 gap-4">
        <button
          onClick={() => onAddPost()}
          className="py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all font-medium flex items-center justify-center gap-2 group"
        >
          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            +
          </div>
          Слайд
        </button>

        <div className="relative">
          <button
            onClick={() => setShowCtaPicker(!showCtaPicker)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all font-medium flex items-center justify-center gap-2 group"
          >
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              +
            </div>
            Вставить CTA
          </button>

          {showCtaPicker && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in max-h-60 overflow-y-auto">
              {customCtas.length === 0 ? (
                 <div className="p-3 text-xs text-center text-slate-400">
                   Нет сохраненных CTA. Добавь их в настройках.
                 </div>
              ) : (
                customCtas.map(cta => (
                   <button
                     key={cta.id}
                     onClick={() => {
                        onAddPost(cta.text);
                        setShowCtaPicker(false);
                     }}
                     className="w-full text-left p-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border-b border-slate-100 last:border-0"
                   >
                     {cta.text}
                   </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-24 shadow-sm">
         <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
            Что поправить?
         </h3>
         <form onSubmit={handleSubmitRefine} className="flex flex-col gap-3">
             <textarea
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                placeholder="Опиши правки..."
                disabled={isRefining}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all disabled:opacity-50 resize-y"
             />
             <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!refineText.trim() || isRefining}
                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        !refineText.trim() || isRefining
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                >
                    {isRefining ? 'Исправляем...' : 'Применить правки'}
                </button>
             </div>
         </form>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-2xl shadow-xl z-50 w-[90%] max-w-sm justify-center">

        {/* Save Draft */}
        <button
           onClick={handleSaveDraft}
           disabled={isRefining}
           className={`p-3 rounded-xl transition-all disabled:opacity-50 ${
             isSaved
               ? 'bg-green-50 text-green-600 border border-green-200'
               : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
           }`}
           title="Сохранить в черновики"
        >
           {isSaved ? (
             <span className="text-sm font-bold px-2">Сохранено</span>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
               <polyline points="17 21 17 13 7 13 7 21"></polyline>
               <polyline points="7 3 7 8 15 8"></polyline>
             </svg>
           )}
        </button>

        {/* Copy All — main action */}
        <button
            onClick={handleCopyAll}
            disabled={isRefining}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
        >
            {copiedIndex === -1 ? "Скопировано!" : "Копировать весь тред"}
        </button>
      </div>
    </div>
  );
};
