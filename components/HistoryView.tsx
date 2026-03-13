
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onBack: () => void;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onSelect, onDelete }) => {
  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 font-medium">
          ← Назад
        </button>
        <h2 className="text-xl font-bold">Мои черновики</h2>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-lg">{history.length}</span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 opacity-50">
           <div className="text-6xl mb-4">📭</div>
           <p className="text-xl">Пока пусто</p>
           <p className="text-sm text-neutral-500 mt-2">Создай тред и сохрани его в черновики</p>
        </div>
      ) : (
        <div className="grid gap-4">
           {history.map(item => (
             <div key={item.id} className="bg-[#151515] border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all group">
               <div className="flex justify-between items-start gap-4 mb-4">
                  <p className="font-medium text-neutral-200 line-clamp-2 flex-1 text-lg">
                    {item.textPreview}
                  </p>
                  <span className="text-xs text-neutral-600 whitespace-nowrap pt-1">
                    {new Date(item.timestamp).toLocaleDateString('ru-RU')}
                  </span>
               </div>

               <div className="flex items-center gap-4 pt-2 border-t border-neutral-800/50">
                  <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-neutral-500">
                    {item.postCount} слайдов
                  </span>

                  <div className="ml-auto flex gap-3">
                    <button
                      onClick={() => {
                        if (confirm('Удалить черновик?')) onDelete(item.id);
                      }}
                      className="text-neutral-600 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Удалить
                    </button>
                    <button
                      onClick={() => onSelect(item)}
                      className="text-purple-400 hover:text-purple-300 font-bold text-xs bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20"
                    >
                      Открыть
                    </button>
                  </div>
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
