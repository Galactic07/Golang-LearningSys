export interface SM2Card {
  questionId: number;
  repetition: number;
  easinessFactor: number;
  interval: number;
  nextReviewDate: string;
  lastReviewDate: string | null;
}

export interface SM2Result {
  card: SM2Card;
  quality: number;
}

/**
 * SM-2 间隔重复算法
 * 根据回答质量（0-5）计算下次复习时间
 * 质量评分：
 *   5 - 完全正确，回答流畅
 *   4 - 正确，稍有犹豫
 *   3 - 正确，但较困难
 *   2 - 错误，但能回忆起答案
 *   1 - 错误，看到答案能想起
 *   0 - 完全忘记
 */
export function applySM2(card: SM2Card, quality: number): SM2Card {
  const clampedQuality = Math.max(0, Math.min(5, quality));
  const newCard = { ...card };

  if (clampedQuality < 3) {
    newCard.repetition = 0;
    newCard.interval = 1;
  } else {
    if (newCard.repetition === 0) {
      newCard.interval = 1;
    } else if (newCard.repetition === 1) {
      newCard.interval = 6;
    } else {
      newCard.interval = Math.round(newCard.interval * newCard.easinessFactor);
    }
    newCard.repetition++;
  }

  let newEF = newCard.easinessFactor + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
  newEF = Math.max(1.3, Math.min(2.5, newEF));
  newCard.easinessFactor = Math.round(newEF * 100) / 100;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newCard.interval);
  newCard.nextReviewDate = nextDate.toISOString();
  newCard.lastReviewDate = new Date().toISOString();

  return newCard;
}

/**
 * 创建初始 SM2 卡片
 */
export function createSM2Card(questionId: number): SM2Card {
  return {
    questionId,
    repetition: 0,
    easinessFactor: 2.5,
    interval: 0,
    nextReviewDate: new Date().toISOString(),
    lastReviewDate: null,
  };
}

/**
 * 获取需要复习的卡片（到期或已过期）
 */
export function getDueCards(cards: SM2Card[]): SM2Card[] {
  const now = new Date();
  return cards.filter(card => new Date(card.nextReviewDate) <= now);
}

/**
 * 根据分数将得分映射为 SM-2 质量评分
 */
export function scoreToQuality(score: number): number {
  if (score >= 4.5) return 5;
  if (score >= 3.5) return 4;
  if (score >= 2.5) return 3;
  if (score >= 1.5) return 2;
  if (score >= 0.5) return 1;
  return 0;
}