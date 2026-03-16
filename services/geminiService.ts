
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
    Создай 4 хука (первый пост треда в Threads) по теме ниже.

    Тема: "${text}"
    Режим: ${mode === InputMode.REWRITE ? 'Переписать/Улучшить черновик' : 'Создать с нуля'}

    ЧТО ТАКОЕ ХОРОШИЙ ХУК:
    Это НЕ заголовок статьи. Это крик, эмоция, удар — после которого палец останавливается на скролле.
    Человек должен почувствовать "ЧТО?!", "ДА ЛАДНО", "БЛИН, это же про меня".
    Хук = эмоция + конкретика + интрига.

    === 6 ФОРМУЛ (выбери 4 разные) ===

    1. КРИК
    Первая строка — чистая эмоция КАПСОМ. Как будто человек не выдержал.
    "Я ОФИГЕЛ. Сделал за вечер то, за что агентство берёт $3000. Сейчас покажу"
    "ЧЁРТ. Почему мне никто не сказал это раньше. Полгода жизни впустую"
    "Я РЕАЛЬНО В ШОКЕ. Один промпт заменил мне целый отдел маркетинга"

    2. ПОЩЁЧИНА
    Резкое "хватит" / "выброси" / "забудь". Не совет — приказ. Больно но честно.
    "ВЫБРОСИ свой контент-план. Серьёзно, он тебя душит. Вот что работает вместо"
    "ХВАТИТ платить таргетологу. 3 года сливал бюджет пока не понял одну вещь"
    "ЗАБУДЬ про воронки. Всё что тебе нужно — один пост и правильный оффер"

    3. ИСПОВЕДЬ
    Честность на грани. "Я облажался" / "мне стыдно". Уязвимость цепляет сильнее экспертности.
    "Мне стыдно сколько денег я спустил на эту ерунду. Два года. Впустую"
    "Признаюсь. Я ВРАЛ клиентам. Говорил что это сложно. А это делается за 20 минут"

    4. ДЕРЗКИЙ КОНТРАСТ
    Два мира. Старый = лохи. Новый = ты, если дочитаешь.
    "Одни до сих пор платят $500 за лендинг. Другие собирают за час. Разница? Один промпт"
    "ChatGPT даёт тебе ТЕКСТ. Claude даёт тебе БИЗНЕС. Не спорьте пока не попробуете"

    5. БЕЗУМНАЯ ЦИФРА
    Результат настолько дикий, что хочется проверить.
    "40 единиц контента из ОДНОЙ темы за 20 минут. Без команды. Сейчас разложу"
    "Пост на 200 символов принёс 47 клиентов. Я сам в шоке. Рассказываю"

    6. ЗАПРЕТНОЕ ЗНАНИЕ
    "Тебе этого не расскажут". Ощущение что подслушал секрет.
    "Маркетологи будут НЕНАВИДЕТЬ этот пост. Сейчас расскажу то, за что они берут $2к"
    "Удалю через 24 часа. Слишком жирно чтобы висело в открытом доступе"

    === ПРАВИЛА ===
    - 4 хука, каждый по РАЗНОЙ формуле.
    - Хук = 2-4 предложения. Эмоция КАПСОМ в начале + конкретика + интрига.
    - Экспрессия ПРИВЕТСТВУЕТСЯ: "офигел", "чёрт", "блин", "нахрен", "забей". Но НЕ тяжёлый мат.
    - Должен звучать как живая речь, набранная с телефона в моменте.
    - Конкретно по теме "${text}", не абстрактно.
    - НЕ используй рубли. Только $ или без валюты.
    - НЕ используй стрелки (→), списки, нумерацию.
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
  STORY: `Расскажи историю. Не пересказывай — проживи.
Начни с момента, когда всё шло не так. Дай читателю почувствовать эту точку. Конкретная деталь: где сидел, что видел на экране, что чувствовал.
Потом — перелом. Что произошло. Один момент, одно решение, одна мысль.
Потом — что изменилось. Не абстрактно "стало лучше", а конкретно: цифры, результат, ощущение.
Финал: вывод из истории + CTA.`,

  PAIN_SOLUTION: `Начни с боли. Опиши так точно, чтобы читатель подумал "это про меня".
Не торопись с решением. Сначала покажи, к чему приводит бездействие. Усиль.
Потом разверни: "но я нашёл выход" или "но есть способ".
Дай решение через конкретный пример — не абстрактные советы, а "вот что я сделал".
Финал: результат + CTA.`,

  CONTROVERSY: `Заяви позицию сразу. Уверенно, без оговорок.
Не "я думаю что может быть", а "это так, и вот почему".
Дай один сильный аргумент с примером из реальной жизни, который нельзя проигнорировать.
Предвосхити возражение — и разбей его.
Финал: провокационный вопрос к аудитории + CTA.`,

  LIST_VALUE: `Дай ценность, но не перечисляй. Расскажи.
Вместо "5 советов" возьми 2-3 и раскрой каждый через историю или пример.
Каждый пост — одна мысль, раскрытая до конца. Не поверхностно.
Пиши как будто объясняешь другу. Обычным текстом, без списков и стрелок.
Финал: главный вывод + CTA.`,

  PUNCH: `1-2 поста МАКСИМУМ.
Это не тред. Это мысль, которая не отпускает. Записанная в моменте.
Сразу в суть. Каждое слово на вес золота. Никакой раскачки.
Конкретная деталь, эмоция, поворот. И всё.
Если мысль умещается в 1 пост — НЕ растягивай на 2.`,

  MYTH_BUSTING: `Назови то, во что все верят. И сломай.
Не перечисляй мифы списком. Возьми один главный и разбери его глубоко.
Покажи почему это неправда — через свой опыт, конкретный случай, цифру.
Покажи что работает НА САМОМ ДЕЛЕ.
Финал: "А вы тоже так думали?" + CTA.`
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
    Напиши тред для Threads.

    Хук (первый пост, оставь как есть): "${selectedHook.content}"
    Тема: "${topicOriginal}"
    CTA в конце: ${selectedCta} ${customCta ? `(${customCta})` : ''}

    Повествование:
    ${structureGuide}

    КАК ПИСАТЬ:
    Пиши как живой человек с телефона. Не как копирайтер, не как нейросеть.
    Короткое предложение. Потом длинное. Потом вопрос. Потом пауза (пустая строка).
    Конкретика вместо абстракций. Детали вместо обобщений.
    Каждый пост заканчивай так, чтобы хотелось листать дальше.

    ФОРМАТ:
    - Без стрелок (→), без списков (1. 2. 3.), без буллитов (- •), без нумерации (🧵 1/N).
    - Обычный текст, абзацы через пустые строки.
    - КАПС на 1-2 слова для акцента ("Это РЕАЛЬНО работает").
    - Не больше 2 эмодзи на пост.

    КОЛИЧЕСТВО ПОСТОВ:
    - 4-5 постов для обычных тредов. НЕ больше 6.
    - Для типа PUNCH: 1-2 поста.
    - Каждый пост = новая мысль или поворот. Если нечего сказать нового — не создавай пост.

    ДЛИНА ПОСТОВ:
    - Лимит Threads: 500 символов. Ни один пост не должен превышать 495.
    - Не создавай короткие посты по 150-250 символов. Если мысль короткая — объедини с следующей в один пост.
    - Но и НЕ ЛЕЙ ВОДУ ради заполнения. Если пост получился 300 символов и мысль закончена — это нормально.
    - Главное правило: каждое предложение должно заслужить своё место. Если убрать предложение и смысл не потеряется — убери.
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
    Отредактируй тред по правкам пользователя.

    Тип: ${contextData.type}
    Хук: ${contextData.hook}

    Текущий тред:
    ${currentContent}

    Правки: "${instructions}"

    Правила:
    - Если правка точечная — меняй только нужное, остальное оставь.
    - Если правка про тон/стиль — меняй весь тред.
    - Без стрелок (→), без списков, без нумерации (🧵 1/N). Обычный текст.
    - Каждый пост до 495 символов.
    - Каждое предложение должно заслужить своё место. Не лей воду.
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
    5. НЕ добавляй нумерацию (1/N, 2/N). НЕ используй стрелки (→) и списки. Пиши обычным текстом.
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
