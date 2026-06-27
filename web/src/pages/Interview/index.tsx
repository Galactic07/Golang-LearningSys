import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mic, FileText, Sparkles } from 'lucide-react';

const MODE_CARDS = [
  {
    id: 'text',
    icon: Brain,
    title: '文字面试',
    description: '键盘输入回答，LLM 实时评分',
    color: 'from-emerald-500 to-teal-600',
    path: '/interview/text',
    available: true,
  },
  {
    id: 'voice',
    icon: Mic,
    title: '语音面试',
    description: '语音输入回答，模拟真实面试场景',
    color: 'from-violet-500 to-purple-600',
    path: '',
    available: false,
  },
  {
    id: 'jd',
    icon: FileText,
    title: 'JD 定向面试',
    description: '基于职位描述定制面试问题',
    color: 'from-amber-500 to-orange-600',
    path: '',
    available: false,
  },
];

export default function Interview() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl font-bold text-slate-100">AI 模拟面试</h1>
        </div>
        <p className="text-slate-400 ml-10">
          选择面试模式，开始你的 Go 语言面试练习
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODE_CARDS.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (mode.available && mode.path) {
                  navigate(mode.path);
                }
              }}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden
                bg-slate-800/60 border border-slate-700/60
                ${mode.available
                  ? 'hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300'
                  : 'opacity-60 cursor-not-allowed'
                }`}
            >
              <div className="p-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color}
                    flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {mode.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {mode.description}
                </p>

                {!mode.available && (
                  <span className="inline-block mt-4 text-xs font-medium text-slate-500 bg-slate-700/50 px-3 py-1 rounded-full">
                    开发中
                  </span>
                )}

                {mode.available && (
                  <div className="mt-4 flex items-center gap-1 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>开始面试</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>

              {mode.available && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-500/0 group-hover:ring-emerald-500/20 transition-all duration-300" />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-5 rounded-xl bg-slate-800/30 border border-slate-700/40"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">提示</p>
            <p className="text-sm text-slate-500">
              文字面试模式使用自适应出题引擎，根据你的回答动态调整难度和领域。
              语音面试和 JD 定向面试即将上线。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
