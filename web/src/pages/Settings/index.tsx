import { useState } from 'react';
import { Eye, EyeOff, Plug, Download, Upload } from 'lucide-react';
import { useConfigStore } from '../../stores/useConfigStore';
import { testConnection } from '../../services/llm';
import type { LLMProvider, QuizMode } from '../../stores/useConfigStore';

// LLM 提供商选项
const providerOptions: { value: LLMProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'custom', label: 'Custom' },
];

// 提供商对应的默认模型
const defaultModels: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  deepseek: 'deepseek-chat',
  custom: '',
};

export default function Settings() {
  const { llm, preferences, setLLMConfig, setPreferences } = useConfigStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [, setErrorMessage] = useState('');

  // 处理提供商变更
  const handleProviderChange = (provider: LLMProvider) => {
    setLLMConfig({
      provider,
      model: defaultModels[provider],
      // 切换提供商时清空 baseUrl（仅 custom 模式需要）
      baseUrl: provider === 'custom' ? llm.baseUrl : '',
    });
  };

  // 连接测试
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    const ok = await testConnection({
      provider: llm.provider,
      apiKey: llm.apiKey,
      baseUrl: llm.baseUrl,
      model: llm.model,
    });

    setTestResult(ok ? 'success' : 'error');
    if (!ok) {
      setErrorMessage('无法连接到 LLM 服务，请检查 API Key 和网络连接');
    }
    setTesting(false);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">设置</h1>
        <p className="text-slate-400 mt-1">配置 LLM 提供商和学习偏好</p>
      </div>

      {/* LLM 提供商配置 */}
      <section
        className="rounded-xl border border-slate-700 p-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-5">LLM 提供商配置</h2>

        <div className="space-y-5">
          {/* 提供商选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              提供商
            </label>
            <select
              value={llm.provider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 text-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              {providerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key 输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={llm.apiKey}
                onChange={(e) => setLLMConfig({ apiKey: e.target.value })}
                placeholder="输入你的 API Key"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 text-slate-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Base URL（仅 Custom 模式显示） */}
          {llm.provider === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={llm.baseUrl}
                onChange={(e) => setLLMConfig({ baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 text-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-500"
              />
            </div>
          )}

          {/* Model 输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              模型
            </label>
            <input
              type="text"
              value={llm.model}
              onChange={(e) => setLLMConfig({ model: e.target.value })}
              placeholder="模型名称"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 text-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-500"
            />
          </div>

          {/* 连接测试按钮 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              <Plug className="w-4 h-4" />
              {testing ? '测试中...' : '测试连接'}
            </button>
            {testResult === 'success' && (
              <span className="text-sm text-emerald-400">连接成功</span>
            )}
            {testResult === 'error' && (
              <span className="text-sm text-red-400">连接失败，请检查配置</span>
            )}
          </div>
        </div>
      </section>

      {/* 学习偏好设置 */}
      <section
        className="rounded-xl border border-slate-700 p-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-5">学习偏好</h2>

        <div className="space-y-5">
          {/* 每日新题配额 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              每日新题配额
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={preferences.dailyNewQuota}
                onChange={(e) =>
                  setPreferences({ dailyNewQuota: Number(e.target.value) })
                }
                className="flex-1 h-2 rounded-full appearance-none bg-slate-700 accent-emerald-500"
              />
              <span className="text-lg font-semibold text-emerald-400 w-12 text-right">
                {preferences.dailyNewQuota}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">每天推荐的新题目数量</p>
          </div>

          {/* 默认刷题模式 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              默认刷题模式
            </label>
            <div className="flex gap-4">
              {([
                { value: 'practice' as QuizMode, label: '练习模式', desc: '逐题作答，查看解析' },
                { value: 'fast' as QuizMode, label: '快速模式', desc: '快速浏览，标记掌握程度' },
              ]).map((mode) => (
                <label
                  key={mode.value}
                  className={`flex-1 flex flex-col items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                    preferences.defaultQuizMode === mode.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="quizMode"
                      value={mode.value}
                      checked={preferences.defaultQuizMode === mode.value}
                      onChange={(e) =>
                        setPreferences({
                          defaultQuizMode: e.target.value as QuizMode,
                        })
                      }
                      className="accent-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-200">
                      {mode.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 ml-5">{mode.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 数据管理 */}
      <section
        className="rounded-xl border border-slate-700 p-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-5">数据管理</h2>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            导出数据
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
            <Upload className="w-4 h-4" />
            导入数据
          </button>
        </div>
      </section>
    </div>
  );
}
