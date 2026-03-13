import { createClient } from '@supabase/supabase-js';
import { HistoryItem, GeneratedThread, CustomCta, HookOption } from '../types';

const supabaseUrl = 'https://qvfyngrgbhbjinkziidy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZnluZ3JnYmhiamlua3ppaWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzY0MjgsImV4cCI6MjA4NzYxMjQyOH0.L2SF4bWyN5v0uVd1Xb7YHsIwg46Fu8KN_k68VpxyVGs';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ========== AUTH ==========

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

// ========== HISTORY ==========

export const loadHistory = async (userId: string): Promise<HistoryItem[]> => {
  const { data, error } = await supabase
    .from('public_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('loadHistory error:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    textPreview: row.text_preview,
    timestamp: row.timestamp,
    postCount: row.post_count,
    status: 'DRAFT' as const,
    threadData: row.thread_data as GeneratedThread | undefined,
  }));
};

export const saveHistoryItem = async (userId: string, item: HistoryItem): Promise<void> => {
  const { error } = await supabase
    .from('public_history')
    .upsert({
      id: item.id,
      user_id: userId,
      text_preview: item.textPreview,
      timestamp: item.timestamp,
      post_count: item.postCount,
      status: item.status,
      thread_data: item.threadData || null,
    });

  if (error) {
    console.error('saveHistoryItem error:', error);
  }
};

export const deleteHistoryItem = async (userId: string, id: string): Promise<void> => {
  const { error } = await supabase
    .from('public_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('deleteHistoryItem error:', error);
  }
};

// ========== CUSTOM CTAs ==========

export const loadCustomCtas = async (userId: string): Promise<CustomCta[]> => {
  const { data, error } = await supabase
    .from('public_custom_ctas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('loadCustomCtas error:', error);
    return [];
  }

  return (data || []).map(row => ({ id: row.id, text: row.text }));
};

export const saveCustomCta = async (userId: string, cta: CustomCta): Promise<void> => {
  const { error } = await supabase
    .from('public_custom_ctas')
    .upsert({ id: cta.id, user_id: userId, text: cta.text });

  if (error) {
    console.error('saveCustomCta error:', error);
  }
};

export const deleteCustomCta = async (userId: string, id: string): Promise<void> => {
  const { error } = await supabase
    .from('public_custom_ctas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('deleteCustomCta error:', error);
  }
};

// ========== SETTINGS ==========

export const loadSetting = async (userId: string, key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('public_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return data.value;
};

export const saveSetting = async (userId: string, key: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from('public_settings')
    .upsert({ user_id: userId, key, value });

  if (error) {
    console.error('saveSetting error:', error);
  }
};

export const deleteSetting = async (userId: string, key: string): Promise<void> => {
  const { error } = await supabase
    .from('public_settings')
    .delete()
    .eq('user_id', userId)
    .eq('key', key);

  if (error) {
    console.error('deleteSetting error:', error);
  }
};
