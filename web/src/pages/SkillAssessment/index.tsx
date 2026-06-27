import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TrendingUp, Target, BarChart3,
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
import { progressCache } from '../../lib/storage';
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

interface SkillSnapshot {
  date: string;
  scores: Record<number, number>;
}

export default function SkillAssessment() {
  const storeMasteries = useQuizStore(s => s.masteries);
  const [snapshots, setSnapshots] = useState<SkillSnapshot[]>([]);

  useEffect(() => {
    progressCache.get('skillSnapshots').then(data => {
      if (data) setSnapshots(data as SkillSnapshot[]);
    });
  }, []);

  // Calculate domain scores
  const domainScores = useMemo(() => {
    const scores: Record<number, number> = {};
    DOMAINS.forEach(d => {
      const domainQs = allQuestions.filter(q => q.domain === d.id);
      if (domainQs.length === 0) { scores[d.id] = 0; return; }
      let mastered = 0;
      domainQs.forEach(q => {
        const m = storeMasteries.find(m => m.questionId === q.id);
        if (m && m.level >= 3) mastered++;
      });
      scores[d.id] = Math.round((mastered / domainQs.length) * 100);
    });
    return scores;
  }, [storeMasteries]);

  const avgScore = Math.round(
    Object.values(domainScores).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(domainScores).length)
  );

  // Radar data
  const radarData = useMemo(() =>
    DOMAINS.map(d => ({
      domain: DOMAIN_NAMES[d.id] || '',
      score: domainScores[d.id] || 0,
      fullMark: 100,
      color: d.color,
    })),
    [domainScores],
  );

  // Trend data
  const trendData = useMemo(() => {
    if (snapshots.length < 2) return [];
    return snapshots.map(s => {
      const scores = Object.values(s.scores);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { date: s.date.slice(5), 平均分: avg };
    });
  }, [snapshots]);

  // Domain detail
  const domainDetails = useMemo(() =>
    DOMAINS.map(d => {
      const score = domainScores[d.id] || 0;
      const domainQs = allQuestions.filter(q => q.domain === d.id);
      const mastered = domainQs.filter(q => {
        const m = storeMasteries.find(m => m.questionId === q.id);
        return m && m.level >= 3;
      }).length;
      const level = score >= 80 ? 4 : score >= 60 ? 3 : score >= 30 ? 2 : score >= 1 ? 1 : 0;
      return { ...d, score, mastered, total: domainQs.length, level };
    }),
    [domainScores, storeMasteries],
  );

  const hasData = Object.values(domainScores).some(s => s > 0);

  // Save snapshot
  const saveSnapshot = useCallback(async () => {
    const lastEntry = snapshots[snapshots.length - 1];
    const today = new Date().toISOString().slice(0, 10);
    if (!lastEntry || lastEntry.date !== today ||
        JSON.stringify(lastEntry.scores) !== JSON.stringify(domainScores)) {
      const updated = [...snapshots.slice(-29), { date: today, scores: { ...domainScores } }];
      setSnapshots(updated);
      await progressCache.set('skillSnapshots', updated);
    }
  }, [snapshots, domainScores]);

  // Improvement suggestions
  const improvements = useMemo(() => {
    const weak = domainDetails
      .filter(d => d.score < 50)
      .sort((a, b) => a.score - b.score);
    if (weak.length === 0) return ['各领域掌握良好，继续保持！'];
    return weak.map(w =>
      `建议优先加强 ${w.name}（当前 ${w.score}%），已完成 ${w.mastered}/${w.total} 题`
    );
  }, [domainDetails]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">能力评估</h1>
          <p className="text-slate-400 mt-1">综合评分: <span className="text-emerald-400 font-bold">{avgScore}</span></p>
        </div>
        <button onClick={saveSnapshot}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-sm font-medium transition-colors">
          <TrendingUp className="w-4 h-4" /> 保存快照
        </button>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
          <Target className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">暂无评估数据</h2>
          <p className="text-slate-500">先去刷题，积累答题记录后再来查看能力评估</p>
        </div>
      ) : (
        <>
          {/* Radar + Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">能力雷达</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#334155" gridType="circle" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickCount={6} axisLine={false} />
                  <Radar name="掌握度" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">历史趋势</h2>
              {trendData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="平均分" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-slate-500">
                  <BarChart3 className="w-8 h-8 mb-2" />
                  <p className="text-sm">保存快照后查看趋势</p>
                </div>
              )}
            </div>
          </div>

          {/* Domain detail */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">各领域详情</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {domainDetails.map(d => {
                const levelStars = Array.from({ length: 4 }, (_, i) => i < d.level);
                return (
                  <div key={d.id} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium text-slate-200">{d.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100 mb-1">{d.score}%</div>
                    <div className="text-xs text-slate-400 mb-2">{d.mastered}/{d.total} 题已掌握</div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${d.score}%`, backgroundColor: d.score >= 80 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <div className="flex gap-0.5 mt-2">
                      {levelStars.map((filled, i) => (
                        <div key={i} className={`w-4 h-1.5 rounded-full ${filled ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">改进建议</h2>
            <ul className="space-y-2">
              {improvements.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}