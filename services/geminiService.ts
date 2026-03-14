
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";
import { HookOption, GeneratedThread, ThreadPost, ThreadType, CtaType, InputMode } from "../types";

const getClient = () => {
  // 1. Try to get key from Local Storage (User Settings)
  let apiKey = '';
  if (typeof window !== 'undefined') {
    apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  // 2. Fallback to Environment Variable
  if (!apiKey) {
    apiKey = process.env.API_KEY || '';
  }

  // 3. Throw if still missing
  if (!apiKey) {
    throw new Error("API Key не найден. Пожалуйста, укажите его в настройках (шестеренка справа сверху) или в .env файле.");
  }
  
  return new GoogleGenAI({ apiKey });
};

// 1. Generate Viral Hooks Options
export const generateViralHooks = async (
  text: string, 
  mode: InputMode
): Promise<HookOption[]> => {
  const ai = getClient();
  
  const prompt = `
    Твоя задача — создать 4 феноменальных, вирусных заголовка (хука) для первого поста в Threads.
    Год: 2026.
    
    ВХОДНЫЕ ДАННЫЕ:
    Режим: ${mode === InputMode.REWRITE ? 'Переписать/Улучшить черновик' : 'Создать с нуля по идее'}
    Текст/Тема: "${text}"

    ЭТАПЫ МЫШЛЕНИЯ (Thinking Process):
    1. Определи ядро темы и боли ЦА.
    2. Найди неочевидный угол или спорный момент.
    3. Сформулируй 4 варианта.

    ТРЕБОВАНИЯ К ХУКАМ:
    - Без воды.
    - Максимальная интрига или польза.
    - Язык: Русский, современный, живой.
    - Формулы: Шок/Цифры, Непопулярное мнение, Инсайд, Фреймворк.
    - НИКОГДА не используй рубли (₽, руб., рублей, рубля). Если нужна валюта — только доллары ($). Это ЖЁСТКОЕ правило.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      hooks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            formula: { type: Type.STRING },
            content: { type: Type.STRING, description: "Текст хука" },
            explanation: { type: Type.STRING }
          },
          required: ["id", "formula", "content", "explanation"]
        }
      }
    },
    required: ["hooks"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: schema,
      thinkingConfig: { thinkingBudget: 4096 } 
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No response from AI");
  
  const cleanJson = jsonText.replace(/```json|```/g, '').trim();
  
  try {
      const result = JSON.parse(cleanJson);
      return result.hooks as HookOption[];
  } catch (e) {
      console.error("JSON Parse Error:", jsonText);
      throw new Error("Failed to parse hooks from AI");
  }
};

// Structure descriptions for each thread type
const STRUCTURE_INSTRUCTIONS: Record<string, string> = {
  STORY: `ЛИЧНАЯ ИСТОРИЯ / КЕЙС
Пиши как рассказ с сюжетом. Обязательная структура:
- Пост 2: Точка А — как было раньше (проблема, боль, ситуация)
- Пост 3: Кризис / переломный момент — что случилось
- Пост 4: Инсайт / осознание — что понял герой
- Пост 5-6: Точка Б — как стало после, результат
- Последний пост: вывод + CTA
Используй конкретные детали, цифры, эмоции. Читатель должен увидеть историю как фильм.`,

  PAIN_SOLUTION: `БОЛЬ → РЕШЕНИЕ
Структура "проблема-агитация-решение":
- Пост 2: Опиши боль/проблему максимально точно — читатель должен узнать себя
- Пост 3: Усугуби проблему — покажи последствия если ничего не делать
- Пост 4: Поверни — "но есть выход" / "я нашёл способ"
- Пост 5-6: Дай конкретное решение по шагам
- Последний пост: результат + CTA
Давим на эмоции в начале, даём чёткую практику в конце.`,

  CONTROVERSY: `ПРОВОКАЦИЯ / СПОРНОЕ МНЕНИЕ
Структура "удар-аргумент-разворот":
- Пост 2: Заяви спорную позицию уверенно, без оговорок
- Пост 3-4: Приведи 2-3 сильных аргумента ПОЧЕМУ ты так считаешь (факты, опыт, цифры)
- Пост 5: Покажи обратную сторону — "да, кто-то скажет что..." и разбей этот аргумент
- Последний пост: Финальный вывод + провокационный вопрос к аудитории + CTA
Тон: уверенный, категоричный, но не агрессивный. Цель — вызвать дискуссию.`,

  LIST_VALUE: `ПОЛЬЗА / СПИСОК
Структура "чистая ценность":
- Пост 2: Контекст — почему эта тема важна (1-2 предложения) и сразу в первый пункт
- Пост 3-6: По 1-2 пункта на пост. Каждый пункт: название → объяснение → пример/результат
- Последний пост: Бонусный совет или главный вывод + CTA
Формат: нумерованный список, стрелки (→), чёткие формулировки. Минимум воды, максимум конкретики.`,

  MYTH_BUSTING: `РАЗРУШЕНИЕ МИФОВ
Структура "миф-правда-доказательство":
- Пост 2: Назови популярное заблуждение — "Все думают что..." / "Нам годами говорили..."
- Пост 3: Разбей миф — покажи почему это неправда (факты, исследования, личный опыт)
- Пост 4-5: Покажи как на самом деле — что работает вместо мифа
- Пост 6: Ещё 1-2 мини-мифа по теме (коротко разбей)
- Последний пост: "Какие ещё мифы вы знаете?" + CTA
Тон: "открываю глаза", инсайдерское знание, лёгкое возмущение от распространённости мифа.`
};

// 2. Generate Full Thread based on Selected Hook
export const generateThreadContent = async (
  topicOriginal: string,
  selectedHook: HookOption,
  selectedType: ThreadType,
  selectedCta: CtaType,
  customCta?: string
): Promise<GeneratedThread> => {
  const ai = getClient();

  const structureGuide = STRUCTURE_INSTRUCTIONS[selectedType] || selectedType;

  const prompt = `
    Напиши мощный тред для Threads. Год 2026.

    СТРУКТУРА:
    1. ПОСТ 1 (Хук - оставь как есть): "${selectedHook.content}"
    2. КОНТЕКСТ: "${topicOriginal}"
    3. СТРУКТУРА ПОВЕСТВОВАНИЯ:
    ${structureGuide}
    4. CTA (Финал): ${selectedCta} ${customCta ? `(Текст: ${customCta})` : ''}
    
    ВАЖНО:
    - Пиши глубоко, экспертно, но без занудства.
    - Используй метафоры и примеры.
    - В конце постов (кроме последнего) делай связки (крючки) к следующему.
    - Нумерация "🧵 1/N".

    КРИТИЧЕСКОЕ ОГРАНИЧЕНИЕ:
    - КАЖДЫЙ пост СТРОГО до 500 символов (включая пробелы и эмодзи).
    - Если текст не влезает — разбей на два поста.
    - Перед выдачей проверь длину каждого поста. Ни один не должен превышать 490 символов.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      posts: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Текст поста"
        }
      }
    },
    required: ["posts"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No response from AI");
  
  const cleanJson = jsonText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanJson);

  const posts: ThreadPost[] = result.posts.map((content: string) => ({
    content,
    charCount: content.length
  }));

  return {
    selectedHook: selectedHook.content,
    type: selectedType,
    posts,
    totalPosts: posts.length
  };
};

// 3. Refine/Edit Thread
export const refineThreadContent = async (
  currentPosts: ThreadPost[],
  instructions: string,
  contextData: { type: string, hook: string }
): Promise<GeneratedThread> => {
  const ai = getClient();

  const currentContent = currentPosts.map(p => p.content).join('\n---\n');

  const prompt = `
    Ты — редактор. Твоя задача — переписать/улучшить существующий тред на основе правок пользователя.
    
    КОНТЕКСТ:
    Тип треда: ${contextData.type}
    Исходный хук: ${contextData.hook}
    Год: 2026.
    
    ТЕКУЩИЙ ТЕКСТ ТРЕДА:
    ${currentContent}
    
    ИНСТРУКЦИИ ПОЛЬЗОВАТЕЛЯ (ЧТО ИСПРАВИТЬ):
    "${instructions}"
    
    ЗАДАЧА:
    1. Примени правки пользователя.
    2. Если пользователь просит изменить тон/стиль — меняй весь тред.
    3. Если пользователь просит точечную правку — меняй только нужную часть, остальное оставь.
    4. Сохрани нумерацию "🧵 1/N".
    5. КАЖДЫЙ пост СТРОГО до 500 символов. Ни один не должен превышать 490 символов.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      posts: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Обновленный текст поста"
        }
      }
    },
    required: ["posts"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No response from AI");

  const cleanJson = jsonText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanJson);

  const posts: ThreadPost[] = result.posts.map((content: string) => ({
    content,
    charCount: content.length
  }));

  return {
    selectedHook: contextData.hook,
    type: contextData.type,
    posts,
    totalPosts: posts.length
  };
};

// 4. Split Text (AS IS Mode)
export const splitTextToThread = async (text: string): Promise<GeneratedThread> => {
    const ai = getClient();

    const prompt = `
      Твоя задача — разбить предоставленный текст на серию постов для Threads (тред).
      
      ГЛАВНОЕ ПРАВИЛО:
      НЕ МЕНЯЙ ФОРМУЛИРОВКИ И СЛОВА АВТОРА. Оставь текст "как есть".
      Твоя задача — только грамотное форматирование и разбивка.
      
      СТРАТЕГИЯ РАЗБИВКИ (ВАЖНО):
      1. ПОСТ №1 (ХУК): Должен быть коротким (до 200 символов), чтобы зацепить внимание.
      2. ОСТАЛЬНЫЕ ПОСТЫ: Заполняй их МАКСИМАЛЬНО ПЛОТНО. Стремись к 450-490 символам в каждом посте.
         - Не разбивай текст на мелкие куски по 200 символов, если можно объединить.
         - Не обрывай предложения на полуслове.
         - Максимальный лимит Threads: 500 символов.
      
      ТЕКСТ:
      "${text}"
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        posts: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Текст поста (оригинал)"
          }
        }
      },
      required: ["posts"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const cleanJson = jsonText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);

    const posts: ThreadPost[] = result.posts.map((content: string) => ({
      content,
      charCount: content.length
    }));

    return {
      selectedHook: "Авторский текст",
      type: "DIRECT_PASTE",
      posts,
      totalPosts: posts.length
    };
};

// 5. Video to Thread (Direct/As Is)
export const processVideoToThread = async (base64Data: string, mimeType: string): Promise<GeneratedThread> => {
  const ai = getClient();

  const prompt = `
    Твоя задача — проанализировать это видео (Reels/Shorts) и превратить его в текстовый тред для Threads.
    
    СТРОГИЕ ПРАВИЛА:
    1. Сделай транскрипцию того, что говорится в видео.
    2. Сохрани стиль и слова автора (AS IS) — не переписывай в "нейросетевой" стиль.
    3. Разбей это на посты для Threads.
    
    СТРАТЕГИЯ РАЗБИВКИ (ВАЖНО):
    - ПОСТ №1 (ХУК): Короткий, интригующий (до 200 символов).
    - ОСТАЛЬНЫЕ ПОСТЫ: Максимально плотные (стремись к 480-490 символам). 
      Не делай короткие посты по 2-3 предложения, объединяй их, чтобы вместить максимум смысла в 500 символов.
      
    4. Если в видео есть текст на экране, который важен — включи его.
    5. Добавь нумерацию (1/N, 2/N).
  `;

  const videoPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };

  const textPart = {
    text: prompt
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      posts: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Текст поста (транскрипция видео)"
        }
      }
    },
    required: ["posts"]
  };

  // Switch to Gemini 3.0 Flash Preview for Video Multimodal
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: { parts: [videoPart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No response from AI");

  const cleanJson = jsonText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanJson);

  const posts: ThreadPost[] = result.posts.map((content: string) => ({
    content,
    charCount: content.length
  }));

  return {
    selectedHook: "Видео Транскрипция",
    type: "VIDEO_REPURPOSE",
    posts,
    totalPosts: posts.length
  };
};
