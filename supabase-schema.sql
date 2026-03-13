-- ThreadCraft Public — Multi-user Schema
-- Выполнить в Supabase SQL Editor

-- История черновиков (у каждого юзера своя)
CREATE TABLE public_history (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_preview TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  post_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  thread_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- Кастомные CTA (у каждого юзера свои)
CREATE TABLE public_custom_ctas (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- Настройки (API ключ и т.д., у каждого свои)
CREATE TABLE public_settings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- RLS: каждый видит только свои данные
ALTER TABLE public_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_custom_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own history" ON public_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own ctas" ON public_custom_ctas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own settings" ON public_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
