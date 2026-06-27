export interface MasteryState {
  questionId: number;
  userId: string;
  level: number;
  totalAttempts: number;
  correctAttempts: number;
  lastScore: number;
  lastUpdated: string;
}

export interface DomainMastery {
  domainId: number;
  level: number;
  progress: number;
}

/**
 * 计算掌握级别（0-4）
 * 基于正确率、尝试次数和最近得分综合判断
 */
export function calculateMasteryLevel(
  totalAttempts: number,
  correctAttempts: number,
  recentScores: number[],
): number {
  if (totalAttempts === 0) return 0;

  const accuracy = correctAttempts / totalAttempts;
  const recentAvg = recentScores.length > 0
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : 0;

  if (accuracy >= 0.9 && recentAvg >= 4 && totalAttempts >= 10) return 4;
  if (accuracy >= 0.8 && recentAvg >= 3.5 && totalAttempts >= 6) return 3;
  if (accuracy >= 0.7 && recentAvg >= 3 && totalAttempts >= 3) return 2;
  if (accuracy >= 0.5 && totalAttempts >= 1) return 1;
  return 0;
}

/**
 * 创建初始掌握状态
 */
export function createMasteryState(questionId: number, userId: string): MasteryState {
  return {
    questionId,
    userId,
    level: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    lastScore: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * 更新掌握状态
 * 根据答题得分升级或降级掌握度
 */
export function updateMastery(
  state: MasteryState,
  score: number,
  isCorrect: boolean,
): MasteryState {
  const newState: MasteryState = {
    ...state,
    totalAttempts: state.totalAttempts + 1,
    correctAttempts: state.correctAttempts + (isCorrect ? 1 : 0),
    lastScore: score,
    lastUpdated: new Date().toISOString(),
  };

  const recentScores = [score];
  const newLevel = calculateMasteryLevel(
    newState.totalAttempts,
    newState.correctAttempts,
    recentScores,
  );
  newState.level = newLevel;

  return newState;
}

/**
 * 计算领域掌握度
 * 基于该领域下所有题目的掌握度平均值
 */
export function calculateDomainMastery(
  questionMasteries: MasteryState[],
): DomainMastery {
  if (questionMasteries.length === 0) {
    return { domainId: 0, level: 0, progress: 0 };
  }

  const totalLevel = questionMasteries.reduce((sum, qm) => sum + qm.level, 0);
  const avgLevel = totalLevel / questionMasteries.length;

  const totalAttempts = questionMasteries.reduce((sum, qm) => sum + qm.totalAttempts, 0);
  const targetAttempts = questionMasteries.length * 5;
  const attemptProgress = Math.min(totalAttempts / targetAttempts, 1);

  const progress = Math.round(attemptProgress * 100);

  return {
    domainId: questionMasteries[0].userId as unknown as number,
    level: Math.round(avgLevel),
    progress,
  };
}

/**
 * 获取掌握级别对应的文本描述
 */
export function getMasteryLabel(level: number): string {
  const labels = ['未掌握', '初步了解', '基本掌握', '熟练掌握', '精通'];
  return labels[Math.min(level, 4)] ?? '未知';
}