import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, CheckCircle2, Eye, Send, ChevronRight,
  Brain, Calendar, TrendingUp,
} from 'lucide-react';
import basicsQuestions from '../../data/questions/basics.json';
import concurrencyQuestions from '../../data/questions/concurrency.json';
import runtimeQuestions from '../../data/questions/runtime.json';
import engineeringQuestions from '../../data/questions/engineering.json';
import microserviceQuestions from '../../data/questions/microservice.json';
import datastoreQuestions from '../../data/questions/datastore.json';
import cloudnativeQuestions from '../../data/questions/cloudnative.json';
import systemdesignQuestions from '../../data/questions/systemdesign.json';
import { useQuizStore } from '../../stores/useQuizStore';
import { getDueCards, scoreToQuality } from '../../features/quiz/spacedRepetition';
import { scoreWithRules, DONT_KNOW_ANSWERS } from '../../features/quiz/scoring';
import type { SM2Card } from '../../features/quiz/spacedRepetition';
import type { QuizQuestion } from '../../features/quiz/types';

const allQuestions: QuizQuestion[] = [
  ...(basicsQuestions as QuizQuestion[]),
  ...(concurrencyQuestions as QuizQuestion[]),
  ...(runtimeQuestions as QuizQuestion[]),
  ...(engineeringQuestions as QuizQuestion[]),
  ...(microserviceQuestions as QuizQuestion[]),
  ...(datastoreQuestions as QuizQuestion[]),
  ...(cloudnativeQuestions as QuizQuestion[]),
  ...(systemdesignQuestions as QuizQuestion[]),
];

function toSM2Card(card: { questionId: number; repetition: number; easinessFactor: number; interval: number; nextReviewDate: string; lastReviewDate: string | null }): SM2Card {
  return {
    questionId: card.questionId,
    repetition: card.repetition,
    easinessFactor: card.easinessFactor,
    interval: card.interval,
    nextReviewDate: card.nextReviewDate,
    lastReviewDate: card.lastReviewDate,
  };
}

export default function Review() {
  const storeSm2Cards = useQuizStore(s => s.sm2Cards);
  const updateSM2Card = useQuizStore(s => s.updateSM2Card);
  const updateMastery = useQuizStore(s => s.updateMastery);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  // Build review items from SM-2 cards
  const reviewItems = useMemo(() => {
    const sm2Cards = storeSm2Cards.map(toSM2Card);
    const dueCards = getDueCards(sm2Cards);
    return dueCards
      .map(card => {
        const question = allQuestions.find(q => q.id === card.questionId);
        if (!question) return null;
        return { questionId: card.questionId, question, sm2Card: card };
      })
      .filter(Boolean) as { questionId: number; question: QuizQuestion; sm2Card: SM2Card }[];
  }, [storeSm2Cards]);

  const stats = useMemo(() => {
    const total = storeSm2Cards.length;
    const now = new Date();
    const due = storeSm2Cards.filter(c => new Date(c.nextReviewDate) <= now).length;
    const mastered = storeSm2Cards.filter(c => c.repetition >= 3).length;
    return { total, due, mastered };
  }, [storeSm2Cards]);

  const currentItem = reviewItems[currentIdx];
  const isLastItem = currentIdx >= reviewItems.length - 1;
  const isCompleted = currentItem ? completedIds.has(currentItem.questionId) : false;

  const handleNext = useCallback(() => {
    if (!isLastItem) {
      setCurrentIdx(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
    }
  }, [isLastItem]);

  // Submit answer + update SM-2
  const handleSubmitAndNext = useCallback(() => {
    if (!currentItem || !userAnswer.trim()) return;
    setShowAnswer(true);
    setCompletedIds(prev => new Set([...prev, currentItem.questionId]));

    // Score and save
    const trimmed = userAnswer.trim();
    const isDontKnow = Array.from(DONT_KNOW_ANSWERS).some(k => trimmed.toLowerCase().includes(k));
    const scoreDetail = scoreWithRules(
      { keywords: currentItem.question.keywords, referenceAnswer: currentItem.question.referenceAnswer },
      isDontKnow ? '' : trimmed,
    );
    const quality = scoreToQuality(scoreDetail.overall);

    updateSM2Card(currentItem.questionId, quality);
    updateMastery(currentItem.questionId, scoreDetail.overall, quality >= 3);

    if (!isLastItem) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
        setUserAnswer('');
        setShowAnswer(false);
      }, 800);
    }
  }, [currentItem, userAnswer, isLastItem, updateSM2Card, updateMastery]);

  const scoreResult = useMemo(() => {
    if (!currentItem || !showAnswer || !userAnswer.trim()) return null;
    const trimmed = userAnswer.trim();
    const isDontKnow = Array.from(DONT_KNOW_ANSWERS).some(k => trimmed.toLowerCase().includes(k));
    if (isDontKnow) return { overall: 0, label: '未作答', color: '#ef4444' };

    const detail = scoreWithRules(
      { keywords: currentItem.question.keywords, referenceAnswer: currentItem.question.referenceAnswer },
      trimmed,
    );
    const quality = scoreToQuality(detail.overall);
    const label = quality >= 4 ? '掌握良好' : quality >= 3 ? '基本掌握' : '需要加强';
    const color = quality >= 4 ? '#10b981' : quality >= 3 ? '#f59e0b' : '#ef4444';
    return { overall: detail.overall, label, color };
  }, [currentItem, showAnswer, userAnswer]);

  // Filter by due items only
  const dueItems = reviewItems;

  if (dueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">暂无待复习内容</h2>
        <p className="text-slate-400">先去刷题，积累 SM-2 卡片吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">复习系统</h1>
          <p className="text-slate-400 mt-1">基于 SM-2 间隔重复，科学巩固知识</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-400">
            <Brain className="w-4 h-4" />
            <span>待复习: <span className="text-amber-400 font-bold">{stats.due}</span></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>已掌握: <span className="text-emerald-400 font-bold">{stats.mastered}</span></span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '总卡片', value: stats.total, icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: '待复习', value: stats.due, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: '已掌握', value: stats.mastered, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-slate-700`}>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              {stat.label}
            </div>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Review area */}
      {currentItem ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.questionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5"
          >
            {/* Progress bar */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>复习 {Math.min(completedIds.size + 1, dueItems.length)}/{dueItems.length}</span>
              <div className="h-1.5 flex-1 mx-4 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${((completedIds.size + (isCompleted ? 0 : 0)) / dueItems.length) * 100}%` }}
                />
              </div>
              <button onClick={() => { setCurrentIdx(0); setUserAnswer(''); setShowAnswer(false); setCompletedIds(new Set()); }}
                className="text-emerald-400 hover:text-emerald-300">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Question */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  {currentItem.question.keywords?.join(', ') || '综合'}
                </span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  重复 {currentItem.sm2Card.repetition} 次
                </span>
              </div>
              <p className="text-lg text-slate-100 font-medium">{currentItem.question.question}</p>
            </div>

            {/* Answer input */}
            <div>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="输入你的回答..."
                className="w-full h-28 bg-slate-900 text-slate-200 rounded-xl p-4 text-sm border border-slate-600 focus:border-emerald-500 focus:outline-none resize-none"
                disabled={showAnswer}
              />
            </div>

            {/* Actions */}
            {!showAnswer ? (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAndNext}
                  disabled={!userAnswer.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" /> 提交评分
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowAnswer(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700 transition-colors"
                >
                  <Eye className="w-4 h-4" /> 重答
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {isLastItem ? '完成复习' : '下一题'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Score result */}
            {showAnswer && scoreResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-slate-700"
              >
                <div className="flex items-center gap-4 bg-slate-900 rounded-xl p-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: `${scoreResult.color}20`, color: scoreResult.color }}
                  >
                    {scoreResult.overall}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{scoreResult.label}</div>
                    <div className="text-xs text-slate-400">综合评分 (0-5)</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">参考答案</h4>
                  <p className="text-sm text-slate-300 bg-slate-900 rounded-xl p-4">
                    {currentItem.question.referenceAnswer}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-200 mb-2">本次复习完成！</h2>
          <p className="text-slate-400 mb-4">已复习 {completedIds.size} 道题目</p>
          <button
            onClick={() => { setCurrentIdx(0); setUserAnswer(''); setShowAnswer(false); setCompletedIds(new Set()); }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> 开始新的复习
          </button>
        </div>
      )}
    </div>
  );
}