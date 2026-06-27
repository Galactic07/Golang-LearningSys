import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Home, RotateCcw, AlertTriangle, Lightbulb, Route,
  CheckCircle2, Clock, Target,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useInterviewStore } from '../../stores/useInterviewStore';

const LEVEL_LABELS: Record<number, string> = {
  1: 'L1 基础',
  2: 'L2 进阶',
  3: 'L3 深入',
  4: 'L4 专家',
};

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-600/60 text-slate-300',
  2: 'bg-emerald-600/20 text-emerald-400',
  3: 'bg-amber-600/20 text-amber-400',
  4: 'bg-red-600/20 text-red-400',
};

const SCORE_COLORS: Record<string, string> = {
  high: 'text-emerald-400',
  mid: 'text-amber-400',
  low: 'text-red-400',
};

function getScoreColor(score: number): string {
  if (score >= 4) return SCORE_COLORS.high;
  if (score >= 2.5) return SCORE_COLORS.mid;
  return SCORE_COLORS.low;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes > 0) {
    return `${minutes} 分 ${seconds} 秒`;
  }
  return `${seconds} 秒`;
}

export default function InterviewReport() {
  const navigate = useNavigate();
  const { report, reset } = useInterviewStore();
  const [displayScore, setDisplayScore] = useState(0);
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!report) return;

    const target = report.overallScore;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(eased * target);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayScore(target);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [report]);

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">暂无报告</h2>
        <p className="text-slate-400 mb-6">尚未完成面试，无法查看报告</p>
        <button
          onClick={() => navigate('/interview/text')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
        >
          开始面试
        </button>
      </div>
    );
  }

  const radarData = report.domainResults.map((d) => ({
    domain: d.domainName,
    score: Math.round(d.averageScore * 20),
  }));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <Trophy className="w-7 h-7 text-emerald-400" />
        <h1 className="text-2xl font-bold text-slate-100">面试报告</h1>
      </motion.div>

      {/* 顶部概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* 综合评分 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60
            flex flex-col items-center justify-center"
        >
          <span className="text-sm text-slate-400 mb-2">综合评分</span>
          <span className={`text-5xl font-bold tabular-nums ${getScoreColor(report.overallScore)}`}>
            {displayScore.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500 mt-1">/ 5.0</span>
        </motion.div>

        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <Target className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{report.totalQuestions}</p>
          <p className="text-xs text-slate-400 mt-1">答题总数</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-1 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <Clock className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{formatDuration(report.duration)}</p>
          <p className="text-xs text-slate-400 mt-1">面试时长</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-1 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{report.domainResults.length}</p>
          <p className="text-xs text-slate-400 mt-1">评估领域</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 雷达图 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <h3 className="text-sm font-medium text-slate-300 mb-4">领域能力分布</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 9 }}
                />
                <Radar
                  name="掌握度"
                  dataKey="score"
                  stroke="#34d399"
                  fill="#34d399"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
              暂无数据
            </div>
          )}
        </motion.div>

        {/* 各领域表现表格 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <h3 className="text-sm font-medium text-slate-300 mb-4">各领域表现</h3>
          <div className="space-y-2">
            {report.domainResults.map((result, index) => (
              <motion.div
                key={result.domain}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedDomain(
                      expandedDomain === result.domain ? null : result.domain,
                    )
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-xl
                    bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/50
                    transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200 min-w-[100px]">
                      {result.domainName}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[result.assessedLevel] ?? LEVEL_COLORS[1]}`}
                    >
                      {LEVEL_LABELS[result.assessedLevel] ?? `L${result.assessedLevel}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold tabular-nums ${getScoreColor(result.averageScore)}`}>
                      {result.averageScore.toFixed(1)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        expandedDomain === result.domain ? 'rotate-90' : ''
                      }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {expandedDomain === result.domain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 mx-2 mt-1 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      {result.answers.length === 0 ? (
                        <p className="text-xs text-slate-500">暂无答题记录</p>
                      ) : (
                        <div className="space-y-2">
                          {result.answers.map((answer, ai) => (
                            <div key={answer.questionId} className="text-xs">
                              <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span>第 {ai + 1} 题 (L{answer.level})</span>
                                <span className={`font-medium ${getScoreColor(answer.score)}`}>
                                  {answer.score.toFixed(1)} 分
                                </span>
                              </div>
                              <p className="text-slate-500 line-clamp-2 mb-1">
                                {answer.userAnswer.slice(0, 80)}
                                {answer.userAnswer.length > 80 ? '...' : ''}
                              </p>
                              {answer.followUps.length > 0 && (
                                <span className="text-emerald-500/70">
                                  追问 {answer.followUps.length} 次
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 薄弱项分析 */}
      {report.weaknesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-300">薄弱项分析</h3>
          </div>
          <ul className="space-y-2">
            {report.weaknesses.map((w, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex items-start gap-2 text-sm text-slate-400"
              >
                <span className="text-amber-400/70 mt-0.5 shrink-0">•</span>
                <span>{w}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* 改进建议 */}
      {report.improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-300">改进建议</h3>
          </div>
          <ul className="space-y-2">
            {report.improvements.map((imp, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-start gap-2 text-sm text-slate-400"
              >
                <Lightbulb className="w-4 h-4 text-emerald-400/70 mt-0.5 shrink-0" />
                <span>{imp}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* 推荐学习路径 */}
      {report.recommendedPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-300">推荐学习路径</h3>
          </div>
          <div className="space-y-3">
            {report.recommendedPath.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-600/30
                    flex items-center justify-center shrink-0 mt-0.5"
                >
                  <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed pt-1">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-4"
      >
        <button
          onClick={() => {
            reset();
            navigate('/interview/text');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500
            text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>开始新面试</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700/60 hover:bg-slate-700
            text-slate-300 rounded-xl font-medium transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span>返回仪表盘</span>
        </button>
      </motion.div>
    </div>
  );
}