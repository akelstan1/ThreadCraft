
import React, { useState, useRef } from 'react';
import { InputMode } from '../types';

interface StepInputProps {
  onNext: (text: string, mode: InputMode, fileBase64?: string, mimeType?: string) => void;
  isLoading: boolean;
}

export const StepInput: React.FC<StepInputProps> = ({ onNext, isLoading }) => {
  const [mode, setMode] = useState<InputMode>(InputMode.FROM_SCRATCH);
  const [text, setText] = useState('');
  
  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === InputMode.VIDEO_DIRECT) {
      if (videoFile && videoPreview) {
        // Remove header from base64 (e.g. "data:video/mp4;base64,")
        const base64Data = videoPreview.split(',')[1];
        onNext("Video content", mode, base64Data, videoFile.type);
      }
    } else {
      if (text.trim()) {
        onNext(text, mode);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert("Файл слишком большой! Пожалуйста, загрузите видео до 25 МБ (обычно это Reels до 1 минуты).");
        return;
      }
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case InputMode.FROM_SCRATCH:
        return "О чем будет тред? (например: 'Как я набрал 10к подписчиков без вложений' или 'Почему удаленка убивает карьеру')";
      case InputMode.REWRITE:
        return "Вставь сюда черновик, текст из Телеграм или статью для улучшения...";
      case InputMode.AS_IS:
        return "Вставь готовый текст. Мы просто разобьем его на посты для Threads, не меняя слов.";
      default:
        return "";
    }
  };

  const getButtonText = () => {
     if (isLoading) {
        return (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === InputMode.AS_IS || mode === InputMode.VIDEO_DIRECT ? "Обрабатываем..." : "Придумываем хуки..."}
            </span>
        );
     }
     if (mode === InputMode.VIDEO_DIRECT) return "Распознать Видео 📹";
     if (mode === InputMode.AS_IS) return "Разбить и Опубликовать 🚀";
     return "Сгенерировать Хуки 🔥";
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          Генератор Вирусных Тредов
        </h1>
        <p className="text-neutral-400 text-lg">Создавай контент, который репостят тысячи.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-1 mb-6">
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-xl">
          <button
            onClick={() => setMode(InputMode.FROM_SCRATCH)}
            className={`py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === InputMode.FROM_SCRATCH
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ✨ С нуля
          </button>
          <button
            onClick={() => setMode(InputMode.REWRITE)}
            className={`py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === InputMode.REWRITE
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ♻️ Улучшить
          </button>
          <button
            onClick={() => setMode(InputMode.AS_IS)}
            className={`py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === InputMode.AS_IS
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            📋 Текст 1в1
          </button>
          <button
            onClick={() => setMode(InputMode.VIDEO_DIRECT)}
            className={`py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === InputMode.VIDEO_DIRECT
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            📹 Из Видео
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          
          <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
            {mode === InputMode.VIDEO_DIRECT ? (
               <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-800 hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  {videoFile ? (
                    <div className="space-y-2">
                        <div className="text-4xl">✅</div>
                        <p className="font-bold text-white">{videoFile.name}</p>
                        <p className="text-xs text-neutral-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-xs text-green-400 mt-2">Готово к обработке</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pointer-events-none">
                        <div className="text-4xl">📤</div>
                        <p className="font-bold text-white">Нажми, чтобы загрузить Reels/Video</p>
                        <p className="text-sm text-neutral-500">MP4, до 25 MB</p>
                    </div>
                  )}
               </div>
            ) : (
              <textarea
                className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none transition-all placeholder-neutral-600 text-lg leading-relaxed focus:bg-neutral-900/50"
                placeholder={getPlaceholder()}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={(mode === InputMode.VIDEO_DIRECT ? !videoFile : !text.trim()) || isLoading}
          className={`w-full py-5 rounded-xl font-bold text-xl transition-all transform ${
            (mode === InputMode.VIDEO_DIRECT ? !videoFile : !text.trim()) || isLoading
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-white text-black hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
          }`}
        >
          {getButtonText()}
        </button>
      </form>
    </div>
  );
};
