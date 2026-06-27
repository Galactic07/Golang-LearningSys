export interface ScoreDetail {
  accuracy: number;
  completeness: number;
  depth: number;
  engineering: number;
  expression: number;
  overall: number;
  feedback: string;
  source: 'llm' | 'rules';
}

export const DONT_KNOW_ANSWERS = new Set([
  '不会', '不知道', '没学过', '不懂', '没了解过', '不清楚', '没做过', '跳过', 'pass',
]);

export function scoreWithRules(
  question: { keywords: string[]; referenceAnswer: string },
  answer: string,
): ScoreDetail {
  const lowerAnswer = answer.toLowerCase();
  const keywords = question.keywords.map(k => k.toLowerCase());

  const isDontKnow = Array.from(DONT_KNOW_ANSWERS).some(k => lowerAnswer.includes(k));
  if (isDontKnow) {
    return {
      accuracy: 0, completeness: 0, depth: 0, engineering: 0, expression: 0,
      overall: 0, feedback: '未作答', source: 'rules',
    };
  }

  const keywordMatch = keywords.filter(k => lowerAnswer.includes(k)).length / (keywords.length || 1);

  const wordCount = answer.length;
  const lengthScore = Math.min(wordCount / 100, 1);

  const hasCode = /`[^`]+`/.test(answer) || /\b(func|type|struct|interface|var|const|go|chan)\b/.test(lowerAnswer);
  const hasBullet = /[-*]\s/.test(answer) || /\d+\.\s/.test(answer);
  const structureScore = (hasCode ? 0.5 : 0) + (hasBullet ? 0.5 : 0);

  const accuracy = Math.round(keywordMatch * 5 * 10) / 10;
  const completeness = Math.round((keywordMatch * 0.5 + lengthScore * 0.5) * 5 * 10) / 10;
  const depth = Math.round((keywordMatch * 0.3 + structureScore * 0.7) * 5 * 10) / 10;
  const engineering = Math.round((structureScore * 0.6 + lengthScore * 0.4) * 5 * 10) / 10;
  const expression = Math.round((lengthScore * 0.7 + structureScore * 0.3) * 5 * 10) / 10;
  const overall = Math.round((accuracy * 0.3 + completeness * 0.25 + depth * 0.2 + engineering * 0.15 + expression * 0.1) * 10) / 10;

  const clampedScores = (score: number) => Math.max(0, Math.min(5, score));

  return {
    accuracy: clampedScores(accuracy),
    completeness: clampedScores(completeness),
    depth: clampedScores(depth),
    engineering: clampedScores(engineering),
    expression: clampedScores(expression),
    overall: clampedScores(overall),
    feedback: overall >= 4 ? '回答很好' : overall >= 3 ? '回答基本正确' : '需要加强',
    source: 'rules',
  };
}

export function cleanVoiceText(text: string): string {
  return text
    .replace(/[呃嗯啊哦]+/g, '')
    .replace(/(\w)\1{3,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
