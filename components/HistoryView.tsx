
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
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium">
          ← Назад
        </button>
        <h2 className="text-xl font-bold text-slate-800">Мои черновики</h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{history.length}</span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 opacity-60">
           <div className="text-6xl mb-4">📭</div>
           <p className="text-xl text-slate-600">Пока пусто</p>
           <p className="text-sm text-slate-400 mt-2">Создай тред и сохрани его в черновики</p>
        </div>
      ) : (
        <div className="grid gap-4">
           {history.map(item => (
             <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all group shadow-sm">
               <div className="flex justify-between items-start gap-4 mb-4">
                  <p className="font-medium text-slate-700 line-clamp-2 flex-1 text-lg">
                    {item.textPreview}
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap pt-1">
                    {new Date(item.timestamp).toLocaleDateString('ru-RU')}
                  </span>
               </div>

               <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500">
                    {item.postCount} слайдов
                  </span>

                  <div className="ml-auto flex gap-3">
                    <button
                      onClick={() => {
                        if (confirm('Удалить черновик?')) onDelete(item.id);
                      }}
                      className="text-slate-300 hover:text-red-500 text-xs transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Удалить
                    </button>
                    <button
                      onClick={() => onSelect(item)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
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
