import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import {
  Code2, Zap, Cpu, Wrench, Globe, Database, Cloud, Layout,
  Brain, BookOpen, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Eye, Send, RotateCcw, Home, Timer, Trophy,
  Sparkles, Target, BarChart3, Lightbulb,
} from 'lucide-react';
import { DOMAINS } from '../../data/domains';
import { useQuizStore } from '../../stores/useQuizStore';
import { scoreWithRules } from '../../features/quiz/scoring';
import type { ScoreDetail } from '../../features/quiz/scoring';
import type { QuizMode, QuizQuestion } from '../../features/quiz/types';

const domainIconMap: Record<string, React.ElementType> = {
  Code2, Zap, Cpu, Wrench, Globe, Database, Cloud, Layout,
};

const DIMENSION_LABELS: Record<string, string> = {
  accuracy: '准确性',
  completeness: '完整性',
  depth: '深度',
  engineering: '工程性',
  expression: '表达力',
};

const DIMENSION_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
}

function RadarScoreChart({ scoreDetail }: { scoreDetail: ScoreDetail }) {
  const radarData = [
    { dimension: '准确性', value: scoreDetail.accuracy, fullMark: 5 },
    { dimension: '完整性', value: scoreDetail.completeness, fullMark: 5 },
    { dimension: '深度', value: scoreDetail.depth, fullMark: 5 },
    { dimension: '工程性', value: scoreDetail.engineering, fullMark: 5 },
    { dimension: '表达力', value: scoreDetail.expression, fullMark: 5 },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            gridType="circle"
            stroke="#334155"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickCount={6}
            axisLine={false}
          />
          <Radar
            name="评分"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DimensionScoreRow({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const feedbackMap: Record<string, string> = {
    accuracy: score >= 4 ? '回答准确' : score >= 3 ? '基本准确' : '需加强',
    completeness: score >= 4 ? '覆盖全面' : score >= 3 ? '覆盖主要点' : '遗漏较多',
    depth: score >= 4 ? '深入透彻' : score >= 3 ? '有一定深度' : '停留在表面',
    engineering: score >= 4 ? '工程意识强' : score >= 3 ? '有工程考量' : '缺少工程视角',
    expression: score >= 4 ? '表达清晰' : score >= 3 ? '表达尚可' : '表达含糊',
  };

  const dimensionKey = Object.entries(DIMENSION_LABELS).find(([, v]) => v === label)?.[0] ?? 'accuracy';
  const feedback = feedbackMap[dimensionKey] ?? '';

  const barWidth = (score / 5) * 100;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-16 text-sm text-slate-300 shrink-0">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-8 text-right text-sm font-mono font-bold" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <div className="w-24 text-xs text-slate-400">{feedback}</div>
    </div>
  );
}

export default function Quiz() {
  const navigate = useNavigate();
  const store = useQuizStore();

  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentScoreDetail, setCurrentScoreDetail] = useState<ScoreDetail | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [showAnswerInQuickMode, setShowAnswerInQuickMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion: QuizQuestion | null = useMemo(() => {
    if (store.currentIndex >= 0 && store.currentIndex < store.questions.length) {
      return store.questions[store.currentIndex];
    }
    return null;
  }, [store.questions, store.currentIndex]);

  const progressText = useMemo(() => {
    if (store.questions.length === 0) return '';
    const answered = store.history.length;
    const total = store.questions.length;
    return `第 ${answered + 1}/${total} 题`;
  }, [store.questions.length, store.history.length]);

  const stats = useMemo(() => {
    try {
      return store.getStats();
    } catch {
      return null;
    }
  }, [store.history, store.questions, store.startTime, store.phase]);

  const handleStartSession = useCallback(() => {
    if (!selectedDomain || !selectedLevel) return;
    store.startSession(store.mode, selectedDomain, selectedLevel);
    store.nextQuestion();
    setUserAnswer('');
    setCurrentScoreDetail(null);
    setShowReference(false);
    setShowAnswerInQuickMode(false);
  }, [selectedDomain, selectedLevel, store]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmitting) return;

    const trimmedAnswer = userAnswer.trim();
    if (!trimmedAnswer) return;

    setIsSubmitting(true);

    try {
      const scoreDetail = scoreWithRules(currentQuestion, trimmedAnswer);
      setCurrentScoreDetail(scoreDetail);

      store.recordAnswer(trimmedAnswer, scoreDetail.overall);
      store.updateSM2Card(currentQuestion.id, Math.round(scoreDetail.overall));
      store.updateMastery(currentQuestion.id, scoreDetail.overall, scoreDetail.overall >= 3);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, userAnswer, isSubmitting, store]);

  const handleDontKnow = useCallback(() => {
    if (!currentQuestion) return;

    const scoreDetail: ScoreDetail = {
      accuracy: 0,
      completeness: 0,
      depth: 0,
      engineering: 0,
      expression: 0,
      overall: 0,
      feedback: '未作答',
      source: 'rules',
    };
    setCurrentScoreDetail(scoreDetail);
    store.recordAnswer('不会', 0);
  }, [currentQuestion, store]);

  const handleNextQuestion = useCallback(() => {
    store.nextQuestion();
    setUserAnswer('');
    setCurrentScoreDetail(null);
    setShowReference(false);
    setShowAnswerInQuickMode(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [store]);

  const handleQuickModeViewAnswer = useCallback(() => {
    setShowAnswerInQuickMode(true);
  }, []);

  const handleQuickModeSelfEval = useCallback((quality: number) => {
    if (!currentQuestion) return;

    const score = quality === 5 ? 5 : quality === 3 ? 3 : 0;
    const scoreDetail: ScoreDetail = {
      accuracy: score,
      completeness: quality === 5 ? 4 : quality === 3 ? 2 : 0,
      depth: quality === 5 ? 4 : quality === 3 ? 2 : 0,
      engineering: quality === 5 ? 3 : quality === 3 ? 2 : 0,
      expression: quality === 5 ? 4 : quality === 3 ? 2 : 0,
      overall: score,
      feedback: quality === 5 ? '掌握良好' : quality === 3 ? '部分掌握' : '未掌握',
      source: 'rules',
    };

    setCurrentScoreDetail(scoreDetail);
    store.recordAnswer('', score);
    store.updateSM2Card(currentQuestion.id, quality);
    store.updateMastery(currentQuestion.id, score, score >= 3);

    setShowAnswerInQuickMode(false);
  }, [currentQuestion, store]);

  const handleEndSession = useCallback(() => {
    store.endSession();
  }, [store]);

  const handleResetSession = useCallback(() => {
    store.resetSession();
    setSelectedDomain(null);
    setSelectedLevel(null);
    setUserAnswer('');
    setCurrentScoreDetail(null);
    setShowReference(false);
    setShowAnswerInQuickMode(false);
  }, [store]);

  const handleModeChange = useCallback((mode: QuizMode) => {
    store.resetSession();
    store.startSession(mode, selectedDomain ?? undefined, selectedLevel ?? undefined);
    setSelectedDomain(null);
    setSelectedLevel(null);
    setUserAnswer('');
    setCurrentScoreDetail(null);
    setShowReference(false);
    setShowAnswerInQuickMode(false);
  }, [selectedDomain, selectedLevel, store]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (store.phase === 'answering' && store.mode === 'practice') {
        handleSubmitAnswer();
      }
    }
  }, [store.phase, store.mode, handleSubmitAnswer]);

  const selectedDomainData = useMemo(() => {
    if (selectedDomain === null) return null;
    return DOMAINS.find(d => d.id === selectedDomain) ?? null;
  }, [selectedDomain]);

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* ===== 选择阶段 ===== */}
      {store.phase === 'selecting' && (
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Brain className="w-7 h-7 text-blue-400" />
                刷题练习
              </h1>
              <p className="text-slate-400 mt-1">选择领域和难度，开始 Go 语言刷题</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => handleModeChange('practice')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  store.mode === 'practice'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                练习模式
              </button>
              <button
                onClick={() => handleModeChange('quick')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  store.mode === 'quick'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                快速模式
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                选择领域
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DOMAINS.map((domain) => {
                  const Icon = domainIconMap[domain.icon] ?? Brain;
                  const isSelected = selectedDomain === domain.id;

                  return (
                    <motion.button
                      key={domain.id}
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`relative rounded-xl p-4 text-left border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                      <div
                        className="p-2 rounded-lg inline-flex mb-3"
                        style={{ backgroundColor: `${domain.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: domain.color }} />
                      </div>
                      <div className="text-sm font-medium text-slate-200 mb-1">{domain.name}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{domain.description}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                选择难度
              </h2>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((level) => {
                  const isSelected = selectedLevel === level;
                  const levelNames = ['入门', '进阶', '深入', '精通'];
                  const levelDescriptions = ['基础概念与语法', '核心机制与应用', '底层原理与优化', '源码级理解与架构'];

                  return (
                    <motion.button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`flex-1 rounded-xl p-4 text-center border transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`text-lg font-bold mb-1 ${isSelected ? 'text-purple-400' : 'text-slate-300'}`}>
                        L{level}
                      </div>
                      <div className="text-sm font-medium text-slate-200 mb-1">{levelNames[level - 1]}</div>
                      <div className="text-xs text-slate-400">{levelDescriptions[level - 1]}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center pb-8">
              <motion.button
                onClick={handleStartSession}
                disabled={!selectedDomain || !selectedLevel}
                className={`px-10 py-4 rounded-xl text-lg font-semibold flex items-center gap-3 transition-all ${
                  selectedDomain && selectedLevel
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
                whileHover={selectedDomain && selectedLevel ? { scale: 1.03 } : {}}
                whileTap={selectedDomain && selectedLevel ? { scale: 0.97 } : {}}
              >
                <BookOpen className="w-5 h-5" />
                开始刷题
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== 作答阶段 ===== */}
      {store.phase === 'answering' && currentQuestion && (
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedDomainData?.name ?? `领域 ${currentQuestion.domain}`}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                L{currentQuestion.level}
              </span>
              <span className="text-sm text-slate-400">{progressText}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => handleModeChange('practice')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  store.mode === 'practice'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                练习
              </button>
              <button
                onClick={() => handleModeChange('quick')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  store.mode === 'quick'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                快速
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div
              className="rounded-xl p-6 mb-6 border border-slate-700"
              style={{ backgroundColor: '#1e293b' }}
            >
              <h2 className="text-xl font-semibold text-slate-100 leading-relaxed">
                {currentQuestion.question}
              </h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {currentQuestion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {store.mode === 'practice' ? (
              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的答案...（支持 Markdown 格式）"
                  className="flex-1 min-h-[200px] w-full rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm leading-relaxed"
                  style={{ backgroundColor: '#1e293b' }}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isSubmitting}
                      className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                        userAnswer.trim() && !isSubmitting
                          ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                      whileHover={userAnswer.trim() && !isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={userAnswer.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? '评分中...' : '提交答案'}
                    </motion.button>
                    <motion.button
                      onClick={handleDontKnow}
                      className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      不会
                    </motion.button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Ctrl+Enter 快捷提交
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {!showAnswerInQuickMode ? (
                  <motion.button
                    onClick={handleQuickModeViewAnswer}
                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Eye className="w-5 h-5" />
                    查看答案
                  </motion.button>
                ) : (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className="rounded-xl p-6 mb-6 border border-emerald-700"
                      style={{ backgroundColor: '#1e293b' }}
                    >
                      <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        参考答案
                      </h3>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.referenceAnswer}
                      </p>
                    </div>

                    <div className="flex justify-center gap-4">
                      {[
                        { label: '会了', quality: 5, color: 'emerald', icon: CheckCircle2 },
                        { label: '模糊', quality: 3, color: 'amber', icon: AlertCircle },
                        { label: '不会', quality: 0, color: 'red', icon: XCircle },
                      ].map(({ label, quality, color, icon: Icon }) => (
                        <motion.button
                          key={label}
                          onClick={() => handleQuickModeSelfEval(quality)}
                          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 border transition-all bg-slate-800 hover:bg-slate-700`}
                          style={{
                            borderColor: `var(--color-${color}-700)`,
                            color: `var(--color-${color}-400)`,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-5 h-5" />
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===== 结果阶段（练习模式） ===== */}
      {store.phase === 'result' && currentScoreDetail && currentQuestion && store.mode === 'practice' && (
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {selectedDomainData?.name ?? `领域 ${currentQuestion.domain}`}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              L{currentQuestion.level}
            </span>
            <span className="text-sm text-slate-400">{progressText}</span>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="rounded-xl p-6 border border-slate-700"
              style={{ backgroundColor: '#1e293b' }}
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                评分结果
                <span
                  className="ml-auto text-2xl font-bold"
                  style={{
                    color: currentScoreDetail.overall >= 4
                      ? '#10b981'
                      : currentScoreDetail.overall >= 3
                      ? '#f59e0b'
                      : '#ef4444',
                  }}
                >
                  {currentScoreDetail.overall.toFixed(1)}
                </span>
              </h3>

              <RadarScoreChart scoreDetail={currentScoreDetail} />

              <div className="mt-4 space-y-1">
                {Object.entries(DIMENSION_LABELS).map(([key, label], index) => {
                  const score = currentScoreDetail[key as keyof ScoreDetail] as number;
                  return (
                    <DimensionScoreRow
                      key={key}
                      label={label}
                      score={score}
                      color={DIMENSION_COLORS[index]}
                    />
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">总体评价：</span>
                  {currentScoreDetail.feedback}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl p-6 border border-slate-700 flex-1"
                style={{ backgroundColor: '#1e293b' }}
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  你的回答
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {store.history[store.history.length - 1]?.userAnswer || '(空)'}
                </p>
              </div>

              <div
                className="rounded-xl border border-slate-700 overflow-hidden"
                style={{ backgroundColor: '#1e293b' }}
              >
                <button
                  onClick={() => setShowReference(!showReference)}
                  className="w-full p-4 flex items-center justify-between text-sm text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    查看参考答案
                  </span>
                  <motion.div
                    animate={{ rotate: showReference ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showReference && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {currentQuestion.referenceAnswer}
                          </p>
                        </div>
                        {currentQuestion.hints.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {currentQuestion.hints.map((hint, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              >
                                💡 {hint}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pb-4">
            <motion.button
              onClick={handleEndSession}
              className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              结束会话
            </motion.button>

            <motion.button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              下一题
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ===== 结果阶段（快速模式） ===== */}
      {store.phase === 'result' && currentScoreDetail && currentQuestion && store.mode === 'quick' && (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                currentScoreDetail.overall >= 4
                  ? 'bg-emerald-500/20'
                  : currentScoreDetail.overall >= 3
                  ? 'bg-amber-500/20'
                  : 'bg-red-500/20'
              }`}
            >
              {currentScoreDetail.overall >= 4 ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : currentScoreDetail.overall >= 3 ? (
                <AlertCircle className="w-10 h-10 text-amber-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
            </motion.div>
            <p className="text-slate-300 text-lg">{currentScoreDetail.feedback}</p>
          </div>

          <div className="flex gap-4">
            {store.currentIndex < store.questions.length - 1 ? (
              <motion.button
                onClick={handleNextQuestion}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                下一题
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleEndSession}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <BarChart3 className="w-4 h-4" />
                查看结果
              </motion.button>
            )}
            <motion.button
              onClick={handleEndSession}
              className="px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              结束会话
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ===== 会话结束 ===== */}
      {store.phase === 'done' && !store.sessionActive && stats && (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
          >
            <Trophy className="w-20 h-20 text-amber-400 mb-6" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">会话结束</h2>
          <p className="text-slate-400 mb-8">
            {store.mode === 'practice' ? '练习模式' : '快速模式'} ·{' '}
            {selectedDomainData?.name ?? ''} · L{selectedLevel}
          </p>

          <div
            className="rounded-xl p-8 border border-slate-700 w-full max-w-lg"
            style={{ backgroundColor: '#1e293b' }}
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">总题数</span>
                </div>
                <div className="text-3xl font-bold text-slate-100">
                  {stats.totalQuestions}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">答对数</span>
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {stats.correctCount}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">正确率</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {stats.totalQuestions > 0
                    ? Math.round((stats.correctCount / stats.answeredQuestions) * 100)
                    : 0}
                  %
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">平均分</span>
                </div>
                <div className="text-3xl font-bold text-amber-400">
                  {stats.averageScore.toFixed(1)}
                </div>
              </div>

              <div className="text-center col-span-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">用时</span>
                </div>
                <div className="text-3xl font-bold text-slate-100">
                  {formatDuration(stats.duration)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={handleResetSession}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw className="w-4 h-4" />
              再来一轮
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-4 h-4" />
              返回仪表盘
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
