import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Play, CheckCircle2, XCircle, Eye, ChevronRight,
  BookOpen,
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
import { DOMAINS } from '../../data/domains';
import { DOMAIN_NAMES } from '../../features/interview/types';
import { ROUTES } from '../../app/routes';
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

// Build topic-level progress map
function buildTopicProgressMap(
  questions: QuizQuestion[],
  masteries: { questionId: number; level: number; totalAttempts: number; correctAttempts: number }[],
) {
  const topicMap = new Map<string, { topic: string; domain: number; questionIds: number[] }>();
  
  questions.forEach(q => {
    const key = `${q.domain}|${q.topic}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, { topic: q.topic, domain: q.domain, questionIds: [] });
    }
    topicMap.get(key)!.questionIds.push(q.id);
  });

  return Array.from(topicMap.values()).map(entry => {
    let masteredCount = 0;
    let viewedCount = 0;
    let minCorrectRate = 100;

    for (const id of entry.questionIds) {
      const m = masteries.find(m => m.questionId === id);
      if (m && m.totalAttempts > 0) {
        viewedCount++;
        const rate = Math.round((m.correctAttempts / m.totalAttempts) * 100);
        minCorrectRate = Math.min(minCorrectRate, rate);
        if (m.level >= 3) masteredCount++;
      }
    }

    return {
      ...entry,
      domainName: DOMAIN_NAMES[entry.domain] || '',
      questionCount: entry.questionIds.length,
      masteredCount,
      viewedCount,
      minCorrectRate: viewedCount > 0 ? minCorrectRate : 0,
      isMastered: entry.questionIds.length > 0 && masteredCount === entry.questionIds.length,
      isInProgress: viewedCount > 0 && masteredCount < entry.questionIds.length,
    };
  });
}

export default function GapAnalysis() {
  const navigate = useNavigate();
  const storeMasteries = useQuizStore(s => s.masteries);
  const [mode, setMode] = useState<'analysis' | 'testing'>('analysis');
  const [testIdx, setTestIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, boolean>>({});
  const [testComplete, setTestComplete] = useState(false);

  // Analyze domain gaps
  const domainGaps = useMemo(() => {
    return DOMAINS.map(d => {
      const domainQs = allQuestions.filter(q => q.domain === d.id);
      let viewed = 0;
      let mastered = 0;
      domainQs.forEach(q => {
        const m = storeMasteries.find(m => m.questionId === q.id);
        if (m && m.totalAttempts > 0) {
          viewed++;
          if (m.level >= 3) mastered++;
        }
      });
      return {
        domain: d.id,
        domainName: DOMAIN_NAMES[d.id] || '',
        color: d.color,
        total: domainQs.length,
        viewed,
        mastered,
        score: domainQs.length > 0 ? Math.round((mastered / domainQs.length) * 100) : 0,
      };
    }).sort((a, b) => a.score - b.score);
  }, [storeMasteries]);

  // Weakest topics
  const weakestTopics = useMemo(() => {
    const topics = buildTopicProgressMap(allQuestions, storeMasteries);
    return topics
      .filter(t => t.isInProgress && !t.isMastered)
      .sort((a, b) => {
        const ratioA = a.masteredCount / a.questionCount;
        const ratioB = b.masteredCount / b.questionCount;
        return ratioA - ratioB;
      })
      .slice(0, 10);
  }, [storeMasteries]);

  // Self-test questions
  const testQuestions = useMemo(() => {
    const picked: QuizQuestion[] = [];
    const seenIds = new Set<number>();

    DOMAINS.forEach(domain => {
      const domainQs = allQuestions.filter(q => q.domain === domain.id && !seenIds.has(q.id));
      const levels = [...new Set(domainQs.map(q => q.level))].sort();

      levels.forEach(level => {
        const pool = domainQs.filter(q => q.level === level);
        if (!pool.length) return;
        const unchecked = pool.filter(q => {
          const m = storeMasteries.find(m => m.questionId === q.id);
          return !m || m.level < 3;
        });
        const pick = unchecked.length > 0 ? unchecked[0] : pool[0];
        if (pick && !seenIds.has(pick.id)) {
          picked.push(pick);
          seenIds.add(pick.id);
        }
      });
    });

    return picked;
  }, [storeMasteries]);

  const currentTestQ = testQuestions[testIdx];
  const isLastTest = testIdx >= testQuestions.length - 1;
  const avgScore = Math.round(domainGaps.reduce((s, d) => s + d.score, 0) / domainGaps.length);

  const handleTestAnswer = (isCorrect: boolean) => {
    if (!currentTestQ) return;
    const nextResults = { ...testResults, [currentTestQ.id]: isCorrect };
    setTestResults(nextResults);

    if (isLastTest) {
      setTestComplete(true);
      const correct = Object.values(nextResults).filter(Boolean).length;
      const total = Object.keys(nextResults).length;
      setResultsSummary({ correct, total });
    } else {
      setTestIdx(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
    }
  };

  const [resultsSummary, setResultsSummary] = useState<{ correct: number; total: number } | null>(null);

  const startSelfTest = () => {
    setTestIdx(0);
    setUserAnswer('');
    setShowAnswer(false);
    setTestResults({});
    setTestComplete(false);
    setResultsSummary(null);
    setMode('testing');
  };

  // Render
  if (mode === 'testing' && currentTestQ && !testComplete) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">查漏补缺 · 自测</h1>
            <p className="text-slate-400 mt-1">检测你的真实掌握水平</p>
          </div>
          <button onClick={() => setMode('analysis')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            返回分析
          </button>
        </div>

        <motion.div
          key={currentTestQ.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5"
        >
          {/* Progress */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{testIdx + 1} / {testQuestions.length}</span>
            <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${((testIdx) / testQuestions.length) * 100}%` }} />
            </div>
          </div>

          {/* Question */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                {DOMAIN_NAMES[currentTestQ.domain] || '综合'}
              </span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                Lv{currentTestQ.level}
              </span>
            </div>
            <p className="text-lg text-slate-100 font-medium">{currentTestQ.question}</p>
          </div>

          {/* Answer */}
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="输入你的回答，以便对比参考答案..."
            className="w-full h-28 bg-slate-900 text-slate-200 rounded-xl p-4 text-sm border border-slate-600 focus:border-emerald-500 focus:outline-none resize-none"
          />

          {/* Reference answer (if toggled) */}
          {showAnswer && (
            <div className="bg-slate-900 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">参考答案</h4>
              <p className="text-sm text-slate-300">{currentTestQ.referenceAnswer}</p>
            </div>
          )}

          {/* Self-evaluation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" /> {showAnswer ? '隐藏答案' : '查看答案'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleTestAnswer(false)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              >
                <XCircle className="w-4 h-4" /> 答错了
              </button>
              <button
                onClick={() => handleTestAnswer(true)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> 答对了
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (testComplete && resultsSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Target className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">自测完成</h2>
        <div className="text-5xl font-bold text-emerald-400">
          {resultsSummary.correct}/{resultsSummary.total}
        </div>
        <p className="text-slate-400">
          正确率 {Math.round((resultsSummary.correct / resultsSummary.total) * 100)}%
        </p>
        <div className="flex gap-3">
          <button onClick={startSelfTest}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
            <Play className="w-4 h-4" /> 再次自测
          </button>
          <button onClick={() => setMode('analysis')}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors">
            查看分析
          </button>
        </div>
      </div>
    );
  }

  // Analysis mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">查漏补缺</h1>
          <p className="text-slate-400 mt-1">综合评分: <span className="text-emerald-400 font-bold">{avgScore}</span></p>
        </div>
        <button onClick={startSelfTest}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
          <Play className="w-4 h-4" /> 开始自测
        </button>
      </div>

      {/* Domain gap chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">领域掌握度排序</h2>
          <div className="space-y-3">
            {domainGaps.map(d => {
              const barColor = d.score >= 80 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={d.domain} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-300">{d.domainName}</span>
                    </div>
                    <span className="text-slate-400">{d.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${d.score}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    已掌握 {d.mastered}/{d.total} 题
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weakest topics */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">薄弱知识点 TOP 10</h2>
          {weakestTopics.length > 0 ? (
            <div className="space-y-2">
              {weakestTopics.map((t, i) => (
                <div key={`${t.domain}-${t.topic}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`${ROUTES.SYSTEMATIC_LEARNING}?topic=${encodeURIComponent(t.topic)}&domain=${t.domain}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500 w-5 shrink-0">#{i + 1}</span>
                    <span className="text-sm text-slate-200 truncate">{t.topic}</span>
                    <span className="text-xs text-slate-500 shrink-0">{t.domainName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-amber-400">
                      {t.masteredCount}/{t.questionCount}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm">暂无薄弱点，继续保持！</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={startSelfTest}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                智能自测
              </div>
              <div className="text-xs text-slate-400">覆盖所有领域，检测薄弱环节</div>
            </div>
          </div>
        </button>
        <button onClick={() => navigate(ROUTES.QUIZ)}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                刷题巩固
              </div>
              <div className="text-xs text-slate-400">针对薄弱知识点专项练习</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}