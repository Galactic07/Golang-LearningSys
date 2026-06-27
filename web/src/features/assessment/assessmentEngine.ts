// 技能评估引擎

import type { QuizQuestion } from '../quiz/types';
import type { MasteryState } from '../quiz/mastery';
import { DOMAIN_NAMES } from '../interview/types';
import { DOMAINS } from '../../data/domains';

export interface DomainScore {
  domainId: number;
  domainName: string;
  score: number;
  color: string;
  masteredCount: number;
  totalCount: number;
}

export interface SkillSnapshot {
  date: string;
  scores: Record<number, number>;
}

/** 计算 8 大领域掌握度 (0-100) */
export function calculateDomainMasteryScores(
  questions: QuizQuestion[],
  masteries: MasteryState[],
): DomainScore[] {
  return DOMAINS.map(d => {
    const domainQs = questions.filter(q => q.domain === d.id);
    const mastered = domainQs.filter(q => {
      const m = masteries.find(m => m.questionId === q.id);
      return m && m.level >= 3;
    }).length;
    const score = domainQs.length > 0 ? Math.round((mastered / domainQs.length) * 100) : 0;
    return {
      domainId: d.id,
      domainName: DOMAIN_NAMES[d.id] || '',
      score,
      color: d.color,
      masteredCount: mastered,
      totalCount: domainQs.length,
    };
  });
}

/** 计算综合评分 */
export function calculateOverallScore(scores: DomainScore[]): number {
  const valid = scores.filter(s => s.totalCount > 0);
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((sum, s) => sum + s.score, 0) / valid.length);
}

/** 保存技能快照 */
export async function saveSkillSnapshot(
  scores: Record<number, number>,
  snapshots: SkillSnapshot[],
): Promise<SkillSnapshot[]> {
  const today = new Date().toISOString().slice(0, 10);
  const lastEntry = snapshots[snapshots.length - 1];
  
  if (!lastEntry || lastEntry.date !== today ||
      JSON.stringify(lastEntry.scores) !== JSON.stringify(scores)) {
    return [...snapshots.slice(-29), { date: today, scores: { ...scores } }];
  }
  return snapshots;
}

/** 获取改进建议 */
export function getImprovements(scores: DomainScore[]): string[] {
  const weak = scores
    .filter(s => s.score < 50)
    .sort((a, b) => a.score - b.score);
  
  if (weak.length === 0) return ['各领域掌握良好，继续保持！'];
  
  return weak.map(w => `建议优先加强 ${w.domainName}（当前 ${w.score}%），已完成 ${w.masteredCount}/${w.totalCount} 题`);
}