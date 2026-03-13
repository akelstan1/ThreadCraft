
export enum AppStep {
  AUTH = 'AUTH',
  INPUT = 'INPUT',
  STRATEGY = 'STRATEGY',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY'
}

export enum InputMode {
  FROM_SCRATCH = 'FROM_SCRATCH',
  REWRITE = 'REWRITE',
  AS_IS = 'AS_IS',
  VIDEO_DIRECT = 'VIDEO_DIRECT'
}

export interface HookOption {
  id: string;
  formula: string;
  content: string;
  explanation: string;
}

export enum ThreadType {
  STORY = 'STORY',
  PAIN_SOLUTION = 'PAIN_SOLUTION',
  CONTROVERSY = 'CONTROVERSY',
  LIST_VALUE = 'LIST_VALUE',
  MYTH_BUSTING = 'MYTH_BUSTING',
  DIRECT_PASTE = 'DIRECT_PASTE',
  VIDEO_REPURPOSE = 'VIDEO_REPURPOSE'
}

export enum CtaType {
  TELEGRAM = 'TELEGRAM',
  FOLLOW = 'FOLLOW',
  COMMENT = 'COMMENT',
  OTHER = 'OTHER'
}

export interface ThreadPost {
  content: string;
  charCount: number;
}

export interface GeneratedThread {
  selectedHook: string;
  type: string;
  posts: ThreadPost[];
  totalPosts: number;
}

export interface CustomCta {
  id: string;
  text: string;
}

export type HistoryStatus = 'DRAFT';

export interface HistoryItem {
  id: string;
  textPreview: string;
  timestamp: number;
  postCount: number;
  status: HistoryStatus;
  threadData?: GeneratedThread;
}
