import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { testConnection } from '../services/llm';

// LLM 提供商类型
export type LLMProvider = 'openai' | 'deepseek' | 'custom';

// 刷题模式类型
export type QuizMode = 'practice' | 'fast';

// LLM 配置
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 学习偏好
export interface LearningPreferences {
  dailyNewQuota: number;
  defaultQuizMode: QuizMode;
}

// 配置状态
interface ConfigState {
  llm: LLMConfig;
  preferences: LearningPreferences;
  // LLM 配置操作
  setLLMConfig: (config: Partial<LLMConfig>) => void;
  // 学习偏好操作
  setPreferences: (prefs: Partial<LearningPreferences>) => void;
  // 测试 LLM 连接
  testLLMConnection: () => Promise<boolean>;
  // 检查是否已配置 API Key
  isLLMConfigured: () => boolean;
}

// 默认 LLM 配置
const defaultLLMConfig: LLMConfig = {
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: 'gpt-4o',
};

// 默认学习偏好
const defaultPreferences: LearningPreferences = {
  dailyNewQuota: 20,
  defaultQuizMode: 'practice',
};

// 配置 Store，持久化到 localStorage
export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      llm: defaultLLMConfig,
      preferences: defaultPreferences,
      setLLMConfig: (config) =>
        set((state) => ({
          llm: { ...state.llm, ...config },
        })),
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      testLLMConnection: async () => {
        const { llm } = get();
        return testConnection({
          provider: llm.provider,
          apiKey: llm.apiKey,
          baseUrl: llm.baseUrl,
          model: llm.model,
        });
      },
      isLLMConfigured: () => {
        const { llm } = get();
        return llm.apiKey.trim().length > 0;
      },
    }),
    {
      name: 'gomaster-config',
    }
  )
);
