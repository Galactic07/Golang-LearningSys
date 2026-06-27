import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, ArrowLeft, Loader2, Trophy, ChevronRight, X, Sparkles } from 'lucide-react';
import { useInterviewStore } from '../../stores/useInterviewStore';
import { DOMAIN_NAMES } from '../../features/interview/types';
import { generateFollowUp } from '../../features/interview/followUp';

const LEVEL_LABELS: Record<number, string> = {
  1: '基础',
  2: '进阶',
  3: '深入',
  4: '专家',
};

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-600 text-slate-200',
  2: 'bg-emerald-600/20 text-emerald-400',
  3: 'bg-amber-600/20 text-amber-400',
  4: 'bg-red-600/20 text-red-400',
};

export default function TextInterview() {
  const navigate = useNavigate();
  const store = useInterviewStore();
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [nextDomainName, setNextDomainName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const followUpRef = useRef<HTMLTextAreaElement>(null);
  const scoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!store.currentQuestion && store.phase === 'idle') {
      store.startInterview('text');
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current && store.phase === 'asking') {
      textareaRef.current.focus();
    }
  }, [store.currentQuestion?.id, store.phase]);

  useEffect(() => {
    if (followUpRef.current && store.phase === 'followup') {
      followUpRef.current.focus();
    }
  }, [store.phase]);

  // 数字滚动动画
  useEffect(() => {
    if (!showScorePopup || lastScore === null) return;
    const target = lastScore;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(eased * target);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(target);
      }
    };

    requestAnimationFrame(animate);
  }, [showScorePopup, lastScore]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scoreTimerRef.current) clearTimeout(scoreTimerRef.current);
    };
  }, []);

  // 结束面试
  const handleEndInterview = useCallback(() => {
    store.endInterview();
    navigate('/interview/report');
  }, [store, navigate]);

  // 返回
  const handleBack = useCallback(() => {
    store.reset();
    navigate('/interview');
  }, [store, navigate]);

  // 获取当前题目在领域结果中的追问次数
  const getFollowUpCount = (questionId: string): number => {
    for (const dr of store.domainResults) {
      for (const a of dr.answers) {
        if (a.questionId === questionId) {
          return a.followUps.length;
        }
      }
    }
    return 0;
  };

  // 提交答案
  const handleSubmit = async () => {
    if (!userAnswer.trim() || isSubmitting || !store.currentQuestion) return;
    setIsSubmitting(true);

    const questionSnapshot = store.currentQuestion;
    const answerText = userAnswer;

    store.submitAnswer(answerText);

    const score = getScoreForDomain();
    setUserAnswer('');
    setIsSubmitting(false);

    if (store.phase === 'followup') {
      const fq = generateFollowUp(
        questionSnapshot.question,
        answerText,
        score ?? 3,
        getFollowUpCount(questionSnapshot.id),
        questionSnapshot.domain,
      );
      setFollowUpQuestion(fq);
      setFollowUpAnswer('');
    }

    if (score !== null) {
      setLastScore(score);
    } else {
      setLastScore(3);
    }
    setShowScorePopup(true);

    scoreTimerRef.current = setTimeout(() => {
      setShowScorePopup(false);
    }, 1500);
  };

  // 处理追问提交
  const handleFollowUpSubmit = () => {
    if (!followUpAnswer.trim() || !store.currentQuestion) return;

    const score = 3;
    store.handleFollowUp(followUpAnswer, score);
    setFollowUpQuestion(null);
    setFollowUpAnswer('');
    setLastScore(score);
    setShowScorePopup(true);

    scoreTimerRef.current = setTimeout(() => {
      setShowScorePopup(false);
    }, 1500);
  };

  // 下一题
  const handleNextQuestion = () => {
    const prevDomain = store.currentQuestion?.domain;
    store.nextQuestion();
    const newQuestion = store.currentQuestion;

    if (newQuestion && newQuestion.domain !== prevDomain) {
      setNextDomainName(DOMAIN_NAMES[newQuestion.domain]);
    } else {
      setNextDomainName(null);
    }

    if (!newQuestion || store.phase === 'done') {
      navigate('/interview/report');
    }
  };

  // 计算最近一次回答的分数（用于提交后展示）
  const getScoreForDomain = (): number | null => {
    const results = store.domainResults;
    if (results.length === 0) return null;
    const last = results[results.length - 1];
    if (last.answers.length === 0) return null;
    return last.answers[last.answers.length - 1].score;
  };

  const { currentQuestion, phase, progress } = store;
  const currentDomainName = currentQuestion
    ? DOMAIN_NAMES[currentQuestion.domain] ?? ''
    : '';
  const totalDomains = 8;
  const currentDomainIndex = currentQuestion
    ? (() => {
        const domains = Object.keys(DOMAIN_NAMES).map(Number);
        return domains.indexOf(currentQuestion.domain) + 1;
      })()
    : 0;

  if (!currentQuestion && phase === 'done') {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className="w-16 h-16 text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">面试完成</h2>
        <p className="text-slate-400 mb-6">正在生成报告...</p>
        <button
          onClick={() => navigate('/interview/report')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
        >
          查看报告
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <button
          onClick={handleEndInterview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-800/40 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          <span>结束面试</span>
        </button>
      </div>

      {/* 进度条区域 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300 font-medium">
              {currentDomainName}
            </span>
            <span className="text-slate-500">
              {currentDomainIndex}/{totalDomains}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              第 {progress.current + 1} 题
            </span>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[currentQuestion.level] ?? LEVEL_COLORS[1]}`}
          >
            L{currentQuestion.level} {LEVEL_LABELS[currentQuestion.level] ?? ''}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((progress.current / Math.max(progress.total, 1)) * 100, 100)}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 题目展示区 */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-emerald-400/70 font-medium mb-2">
                题目
              </p>
              <p className="text-xl text-slate-100 leading-relaxed font-medium">
                {currentQuestion.question}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 追问区域 */}
      <AnimatePresence>
        {phase === 'followup' && followUpQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-6 p-5 rounded-2xl bg-emerald-900/20 border border-emerald-700/40"
          >
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-400/70 font-medium mb-1">
                  追问
                </p>
                <p className="text-base text-slate-100 leading-relaxed">
                  {followUpQuestion}
                </p>
              </div>
            </div>

            <textarea
              ref={followUpRef}
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
              placeholder="输入你的追问回答..."
              rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl p-3.5
                text-slate-200 placeholder-slate-500 text-sm resize-none
                focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
                transition-all duration-200"
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={handleFollowUpSubmit}
                disabled={!followUpAnswer.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500
                  disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl
                  text-sm font-medium transition-all duration-200
                  disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>提交追问回答</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 作答区 */}
      <motion.div
        layout
        className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-slate-400 font-medium">
            {phase === 'followup' && followUpQuestion ? '追问已回答，继续下一题' : '你的回答'}
          </label>
          <span className="text-xs text-slate-500">
            {userAnswer.length} 字
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={
            phase === 'followup'
              ? '继续回答或点击下一题...'
              : '输入你对这道题的回答，尽量详细完整...'
          }
          rows={6}
          className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl p-4
            text-slate-200 placeholder-slate-500 text-base resize-none
            focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
            transition-all duration-200"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              if (phase === 'followup' && followUpQuestion) {
                handleFollowUpSubmit();
              } else {
                handleSubmit();
              }
            }
          }}
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-600">
            按 Ctrl+Enter 快速提交
          </p>
          <div className="flex items-center gap-3">
            {phase === 'followup' && followUpQuestion ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500
                  text-white rounded-xl text-sm font-medium transition-all duration-200"
              >
                <span>下一题</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500
                  disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl
                  text-sm font-medium transition-all duration-200
                  disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? '评分中...' : '提交答案'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 分数弹窗动画 */}
      <AnimatePresence>
        {showScorePopup && lastScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              pointer-events-none"
          >
            <div
              className="flex flex-col items-center justify-center w-36 h-36 rounded-full
                bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10"
            >
              <span className="text-sm text-slate-400 mb-1">得分</span>
              <span className="text-4xl font-bold text-emerald-400 tabular-nums">
                {displayScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 mt-1">/ 5.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 领域切换提示 */}
      <AnimatePresence>
        {nextDomainName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="px-5 py-2.5 rounded-xl bg-slate-800/90 border border-emerald-700/40
              shadow-lg backdrop-blur-sm"
            >
              <p className="text-sm text-slate-300">
                进入下一领域：
                <span className="text-emerald-400 font-medium ml-1">{nextDomainName}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
