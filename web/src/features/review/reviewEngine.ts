// 复习引擎 - SM-2 驱动的间隔重复复习系统

import { applySM2, createSM2Card, getDueCards, scoreToQuality } from '../quiz/spacedRepetition';
import { updateMastery, createMasteryState } from '../quiz/mastery';
import type { SM2Card } from '../quiz/spacedRepetition';
import type { MasteryState } from '../quiz/mastery';
import type { QuizQuestion } from '../quiz/types';
import { progressCache } from '../../lib/storage';
import { scoreWithRules } from '../quiz/scoring';

export interface ReviewItem {
  questionId: number;
  question: QuizQuestion;
  sm2Card: SM2Card;
  mastery: MasteryState;
}

export interface ReviewResult {
  updatedSM2: SM2Card;
  updatedMastery: MasteryState;
  score: number;
}

const DEFAULT_USER_ID = 'local';

/** 从存储中加载所有 SM2 卡片 */
async function loadSM2Cards(): Promise<SM2Card[]> {
  return (await progressCache.get('sm2Cards')) || [];
}

/** 保存 SM2 卡片 */
async function saveSM2Cards(cards: SM2Card[]): Promise<void> {
  await progressCache.set('sm2Cards', cards);
}

/** 从存储中加载掌握度数据 */
async function loadMasteries(): Promise<MasteryState[]> {
  return (await progressCache.get('masteries')) || [];
}

/** 保存掌握度数据 */
async function saveMasteries(masteries: MasteryState[]): Promise<void> {
  await progressCache.set('masteries', masteries);
}

/** 获取需要复习的题目 */
export async function getDueReviewItems(questions: QuizQuestion[], maxItems: number = 20): Promise<ReviewItem[]> {
  const cards = await loadSM2Cards();
  const masteries = await loadMasteries();
  const allDue = getDueCards(cards);
  const dueCards = allDue.slice(0, maxItems);

  return dueCards
    .map(card => {
      const question = questions.find(q => q.id === card.questionId);
      if (!question) return null;
      const mastery = masteries.find(m => m.questionId === card.questionId) || createMasteryState(card.questionId, DEFAULT_USER_ID);
      return { questionId: card.questionId, question, sm2Card: card, mastery };
    })
    .filter((item): item is ReviewItem => item !== null);
}

/** 获取总复习统计 */
export async function getReviewStats(): Promise<{
  total: number;
  due: number;
  mastered: number;
}> {
  const cards = await loadSM2Cards();
  const now = new Date();
  const due = cards.filter(c => new Date(c.nextReviewDate) <= now).length;
  const mastered = cards.filter(c => c.repetition >= 3).length;
  return { total: cards.length, due, mastered };
}

/** 提交复习结果 */
export async function submitReview(
  item: ReviewItem,
  userAnswer: string,
): Promise<ReviewResult> {
  // 1. 用规则引擎评分
  const scoreDetail = scoreWithRules(
    { keywords: item.question.keywords, referenceAnswer: item.question.referenceAnswer },
    userAnswer,
  );
  
  // 2. 转换为 SM-2 quality
  const quality = scoreToQuality(scoreDetail.overall);
  
  // 3. 更新 SM-2 卡片
  const updatedSM2 = applySM2(item.sm2Card, quality);
  
  // 4. 更新掌握度
  const updatedMastery = updateMastery(
    item.mastery,
    scoreDetail.overall,
    quality >= 3,
  );
  
  // 5. 持久化
  const cards = await loadSM2Cards();
  const idx = cards.findIndex(c => c.questionId === item.questionId);
  if (idx >= 0) cards[idx] = updatedSM2;
  else cards.push(updatedSM2);
  await saveSM2Cards(cards);

  const masteries = await loadMasteries();
  const mIdx = masteries.findIndex(m => m.questionId === item.questionId);
  if (mIdx >= 0) masteries[mIdx] = updatedMastery;
  else masteries.push(updatedMastery);
  await saveMasteries(masteries);

  return {
    updatedSM2,
    updatedMastery,
    score: scoreDetail.overall,
  };
}

/** 初始化 SM-2 卡片（如果还没有） */
export async function ensureSM2Card(questionId: number): Promise<SM2Card> {
  const cards = await loadSM2Cards();
  const existing = cards.find(c => c.questionId === questionId);
  if (existing) return existing;
  
  const newCard = createSM2Card(questionId);
  cards.push(newCard);
  await saveSM2Cards(cards);
  return newCard;
}