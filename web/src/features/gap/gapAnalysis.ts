// 查漏补缺 - 分析薄弱知识点

import type { QuizQuestion } from '../quiz/types';
import type { MasteryState } from '../quiz/mastery';
import type { SM2Card } from '../quiz/spacedRepetition';
import { DOMAIN_NAMES } from '../interview/types';
import { DOMAINS } from '../../data/domains';

export interface GapTopic {
  topic: string;
  domain: number;
  domainName: string;
  questionCount: number;
  masteredCount: number;
  viewedCount: number;
  minCorrectCount: number;
  isMastered: boolean;
  isInProgress: boolean;
  masteryLevel: number;
}

export interface DomainGap {
  domain: number;
  domainName: string;
  color: string;
  total: number;
  viewed: number;
  mastered: number;
  score: number;
  masteryRate: number;
  viewedRate: number;
}

/** 按 domain+topic 聚合全部知识点进度 */
export function buildTopicProgressMap(
  questions: QuizQuestion[],
  masteries: MasteryState[],
  sm2Cards: SM2Card[],
): GapTopic[] {
  const topicMap = new Map<string, {
    topic: string;
    domain: number;
    questionIds: number[];
  }>();

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
    let minCorrectCount = 5;
    let totalMasteryLevel = 0;

    for (const id of entry.questionIds) {
      const m = masteries.find(m => m.questionId === id);
      const card = sm2Cards.find(c => c.questionId === id);

      if (m) {
        viewedCount++;
        totalMasteryLevel += m.level;
        const attempts = m.totalAttempts || 1;
        if (m.level >= 3) masteredCount++;
        minCorrectCount = Math.min(minCorrectCount, Math.round(m.correctAttempts / attempts * 100));
      }
      if (!m && card) {
        viewedCount++;
      }
    }

    const questionCount = entry.questionIds.length;
    if (viewedCount === 0) minCorrectCount = 0;

    return {
      ...entry,
      domainName: DOMAIN_NAMES[entry.domain] || '',
      questionCount,
      masteredCount,
      viewedCount,
      minCorrectCount,
      isMastered: questionCount > 0 && masteredCount === questionCount,
      isInProgress: viewedCount > 0 && masteredCount < questionCount,
      masteryLevel: viewedCount > 0 ? Math.round(totalMasteryLevel / viewedCount) : 0,
    };
  });
}

/** 薄弱点 TOP-N */
export function getWeakestTopics(topics: GapTopic[], limit = 10): GapTopic[] {
  return topics
    .filter(t => t.isInProgress && !t.isMastered)
    .sort((a, b) => {
      const ratioA = a.masteredCount / a.questionCount;
      const ratioB = b.masteredCount / b.questionCount;
      if (ratioA !== ratioB) return ratioA - ratioB;
      return a.minCorrectCount - b.minCorrectCount;
    })
    .slice(0, limit);
}

/** 领域层面分析 */
export function calculateDomainGaps(
  questions: QuizQuestion[],
  masteries: MasteryState[],
): DomainGap[] {
  const domainData = new Map<number, { total: number; viewed: number; mastered: number }>();
  
  DOMAINS.forEach(d => domainData.set(d.id, { total: 0, viewed: 0, mastered: 0 }));

  questions.forEach(q => {
    const data = domainData.get(q.domain);
    if (!data) return;
    data.total++;

    const m = masteries.find(m => m.questionId === q.id);
    if (m) {
      data.viewed++;
      if (m.level >= 3) data.mastered++;
    }
  });

  return Array.from(domainData.entries()).map(([domain, data]) => {
    const domainInfo = DOMAINS.find(d => d.id === domain);
    return {
      domain,
      domainName: DOMAIN_NAMES[domain] || '',
      color: domainInfo?.color || '#64748b',
      ...data,
      score: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
      masteryRate: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
      viewedRate: data.total > 0 ? Math.round((data.viewed / data.total) * 100) : 0,
    };
  }).sort((a, b) => a.score - b.score);
}

/** 自测选题：每个领域 × 每个难度各选 1 题 */
export function pickSelfTestQuestions(
  questions: QuizQuestion[],
  masteries: MasteryState[],
): QuizQuestion[] {
  const picked: QuizQuestion[] = [];
  const seenIds = new Set<number>();

  DOMAINS.forEach(domain => {
    const domainQs = questions.filter(q => q.domain === domain.id && !seenIds.has(q.id));
    const difficulties = [...new Set(domainQs.map(q => q.level))].sort();

    difficulties.forEach(level => {
      const pool = domainQs.filter(q => q.level === level);
      if (!pool.length) return;
      
      // 优先选未掌握（或未答题）的
      const unchecked = pool.filter(q => {
        const m = masteries.find(m => m.questionId === q.id);
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
}