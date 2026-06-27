import type { InterviewMode, InterviewPhase, InterviewQuestion, InterviewAnswer, DomainResult, InterviewReport, ScoreDetail } from './types';
import { DOMAIN_PRIORITY, DOMAIN_NAMES } from './types';
import { INTERVIEW_QUESTIONS } from './questionBank';

export class InterviewEngine {
  private mode: InterviewMode = 'text';
  private phase: InterviewPhase = 'idle';
  private domainIndex: number = 0;
  private currentDomain: number = 2;
  private currentLevel: number = 2;
  private currentQuestion: InterviewQuestion | null = null;
  private domainResults: Map<number, DomainResult> = new Map();
  private answers: Map<string, InterviewAnswer> = new Map();
  private followUpCount: number = 0;
  private consecutiveCorrect: number = 0;
  private usedQuestions: Set<string> = new Set();
  private startTime: number = 0;
  // 当前领域已答对题目的最高难度
  private domainHighestLevel: Map<number, number> = new Map();
  // 当前领域的答题计数（用于判断稳定性）
  private domainAnswerCount: Map<number, { correct: number; incorrect: number }> = new Map();
  // 当前面试的所有问题列表（用于进度追踪）
  private questionHistory: string[] = [];

  getPhase(): InterviewPhase {
    return this.phase;
  }

  getCurrentQuestion(): InterviewQuestion | null {
    return this.currentQuestion;
  }

  getMode(): InterviewMode {
    return this.mode;
  }

  getProgress(): { current: number; total: number } {
    const answered = this.answers.size;
    const total = this.getEstimatedTotal();
    return { current: answered, total: Math.max(answered, total) };
  }

  getDomainResults(): DomainResult[] {
    return Array.from(this.domainResults.values());
  }

  get answersMap(): Map<string, InterviewAnswer> {
    return this.answers;
  }

  // 开始面试
  startInterview(mode: InterviewMode, _jdId?: string): void {
    this.mode = mode;
    this.phase = 'intro';
    this.domainIndex = 0;
    this.currentDomain = DOMAIN_PRIORITY[0];
    this.currentLevel = 2;
    this.followUpCount = 0;
    this.consecutiveCorrect = 0;
    this.usedQuestions.clear();
    this.domainResults.clear();
    this.answers.clear();
    this.domainHighestLevel.clear();
    this.domainAnswerCount.clear();
    this.questionHistory = [];
    this.currentQuestion = null;
    this.startTime = Date.now();
  }

  // 获取下一个问题
  getNextQuestion(): InterviewQuestion | null {
    if (this.phase === 'intro') {
      this.phase = 'asking';
    }

    if (this.phase === 'done') {
      return null;
    }

    const question = this.selectQuestion();
    if (!question) {
      this.phase = 'done';
      return null;
    }

    this.currentQuestion = question;
    this.followUpCount = 0;
    this.questionHistory.push(question.id);
    return question;
  }

  // 提交答案并评分
  submitAnswer(userAnswer: string, llmScore?: number): { score: number; needsFollowUp: boolean } {
    if (!this.currentQuestion) {
      return { score: 0, needsFollowUp: false };
    }

    const ruleScore = this.ruleBasedScore(userAnswer);
    const score = llmScore ?? ruleScore;

    this.recordAnswer(userAnswer, score);

    if (score >= 2.5 && score < 4 && this.followUpCount < 2) {
      this.phase = 'followup';
      return { score, needsFollowUp: true };
    }

    this.updateDomainAssessment(score);

    if (score >= 4) {
      this.currentLevel = Math.min(4, this.currentLevel + 1);
      this.consecutiveCorrect++;
    } else if (score < 2.5) {
      this.currentLevel = Math.max(1, this.currentLevel - 1);
      this.consecutiveCorrect = 0;
    }

    if (this.isDomainComplete()) {
      this.advanceToNextDomain();
    }

    this.phase = 'asking';
    return { score, needsFollowUp: false };
  }

  // 处理追问
  handleFollowUp(followUpAnswer: string, score: number): void {
    this.followUpCount++;

    const currentQ = this.currentQuestion;
    if (!currentQ) return;

    const existing = this.answers.get(currentQ.id);
    if (existing) {
      existing.followUps.push({
        question: `追问 ${this.followUpCount}`,
        userAnswer: followUpAnswer,
        score,
      });
    }

    if (this.followUpCount >= 2 || score < 2.5) {
      this.updateDomainAssessment(score);
      if (score < 2.5) {
        this.currentLevel = Math.max(1, this.currentLevel - 1);
      }
      if (this.isDomainComplete()) {
        this.advanceToNextDomain();
      }
      this.phase = 'asking';
    }
  }

  // 生成报告
  generateReport(): InterviewReport {
    const duration = Date.now() - this.startTime;
    const domainResults = Array.from(this.domainResults.values());
    const totalQuestions = this.answers.size;

    const totalScore = domainResults.reduce((sum, d) => sum + d.averageScore, 0);
    const overallScore = domainResults.length > 0
      ? Math.round((totalScore / domainResults.length) * 10) / 10
      : 0;

    const weaknesses = this.analyzeWeaknesses(domainResults);
    const improvements = this.generateImprovements(weaknesses);
    const recommendedPath = this.generateLearningPath(domainResults);

    return {
      overallScore,
      domainResults,
      weaknesses,
      improvements,
      recommendedPath,
      totalQuestions,
      duration,
    };
  }

  // 获取当前领域的所有可用题目数量
  getAvailableQuestionCount(domain: number, level: number): number {
    return INTERVIEW_QUESTIONS.filter(
      q => q.domain === domain && q.level === level && !this.usedQuestions.has(q.id)
    ).length;
  }

  // ==================== 私有方法 ====================

  // 选择题目
  private selectQuestion(): InterviewQuestion | null {
    const maxAttempts = 3;
    let attempt = 0;
    let level = this.currentLevel;

    while (attempt < maxAttempts) {
      const candidates = INTERVIEW_QUESTIONS.filter(
        q => q.domain === this.currentDomain
          && q.level === level
          && !this.usedQuestions.has(q.id)
      );

      if (candidates.length > 0) {
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        this.usedQuestions.add(picked.id);
        return {
          id: picked.id,
          domain: picked.domain,
          domainName: DOMAIN_NAMES[picked.domain] ?? '',
          level: picked.level,
          question: picked.question,
          referenceAnswer: picked.referenceAnswer,
        };
      }

      attempt++;
      if (attempt === 1) {
        const nextLevel = level + 1 <= 4 ? level + 1 : level;
        const prevLevel = level - 1 >= 1 ? level - 1 : level;
        const altCandidates = INTERVIEW_QUESTIONS.filter(
          q => q.domain === this.currentDomain
            && (q.level === nextLevel || q.level === prevLevel)
            && !this.usedQuestions.has(q.id)
        );
        if (altCandidates.length > 0) {
          const picked = altCandidates[Math.floor(Math.random() * altCandidates.length)];
          this.usedQuestions.add(picked.id);
          this.currentLevel = picked.level;
          return {
            id: picked.id,
            domain: picked.domain,
            domainName: DOMAIN_NAMES[picked.domain] ?? '',
            level: picked.level,
            question: picked.question,
            referenceAnswer: picked.referenceAnswer,
          };
        }
      }

      if (attempt === 2) {
        const allDomainQuestions = INTERVIEW_QUESTIONS.filter(
          q => q.domain === this.currentDomain && !this.usedQuestions.has(q.id)
        );
        if (allDomainQuestions.length > 0) {
          const picked = allDomainQuestions[Math.floor(Math.random() * allDomainQuestions.length)];
          this.usedQuestions.add(picked.id);
          this.currentLevel = picked.level;
          return {
            id: picked.id,
            domain: picked.domain,
            domainName: DOMAIN_NAMES[picked.domain] ?? '',
            level: picked.level,
            question: picked.question,
            referenceAnswer: picked.referenceAnswer,
          };
        }
      }
    }

    return null;
  }

  // 基于规则的评分
  private ruleBasedScore(answer: string): number {
    if (!answer || answer.trim().length === 0) return 0;

    const trimmed = answer.trim();
    const question = this.currentQuestion;
    if (!question) return 1;

    const questionData = INTERVIEW_QUESTIONS.find(q => q.id === question.id);
    if (!questionData) return 1;

    const keywords = questionData.keywords;
    if (keywords.length === 0) return 2;

    const matchedCount = keywords.filter(kw =>
      trimmed.toLowerCase().includes(kw.toLowerCase())
    ).length;

    const matchRatio = matchedCount / keywords.length;
    const lengthScore = Math.min(trimmed.length / 50, 1);
    const hasStructure = this.checkStructure(trimmed);

    let baseScore: number;
    if (matchRatio >= 0.7) baseScore = 4;
    else if (matchRatio >= 0.5) baseScore = 3;
    else if (matchRatio >= 0.3) baseScore = 2;
    else baseScore = 1;

    baseScore += lengthScore * 0.5;
    if (hasStructure) baseScore += 0.3;

    const finalScore = Math.min(5, Math.max(0, baseScore));
    return Math.round(finalScore * 10) / 10;
  }

  // 检查回答是否有结构（分点、分段等）
  private checkStructure(answer: string): boolean {
    const structureIndicators = [
      /^\d+[.、）)]/m,
      /^[-*•]/m,
      /^(首先|其次|然后|最后|第一|第二|第三|总结)/m,
      /\n\n+/,
    ];
    return structureIndicators.some(pattern => pattern.test(answer));
  }

  // 判断当前领域是否已完成评估
  private isDomainComplete(): boolean {
    const counts = this.domainAnswerCount.get(this.currentDomain);
    if (!counts) return false;
    return counts.correct >= 2 || counts.incorrect >= 2;
  }

  // 前进到下一个领域
  private advanceToNextDomain(): void {
    this.domainIndex++;
    if (this.domainIndex >= DOMAIN_PRIORITY.length) {
      this.phase = 'done';
      return;
    }
    this.currentDomain = DOMAIN_PRIORITY[this.domainIndex];
    this.currentLevel = 2;
    this.consecutiveCorrect = 0;
    this.followUpCount = 0;
  }

  // 更新领域评估
  private updateDomainAssessment(score: number): void {
    const counts = this.domainAnswerCount.get(this.currentDomain) ?? { correct: 0, incorrect: 0 };
    if (score >= 3) {
      counts.correct++;
      const currentHighest = this.domainHighestLevel.get(this.currentDomain) ?? 0;
      if (this.currentLevel > currentHighest) {
        this.domainHighestLevel.set(this.currentDomain, this.currentLevel);
      }
    } else {
      counts.incorrect++;
    }
    this.domainAnswerCount.set(this.currentDomain, counts);

    const domainAnswers = Array.from(this.answers.values()).filter(
      a => a.domain === this.currentDomain
    );
    const avgScore = domainAnswers.length > 0
      ? domainAnswers.reduce((sum, a) => sum + a.score, 0) / domainAnswers.length
      : 0;

    const assessedLevel = this.domainHighestLevel.get(this.currentDomain) ?? 1;

    this.domainResults.set(this.currentDomain, {
      domain: this.currentDomain,
      domainName: DOMAIN_NAMES[this.currentDomain] ?? '',
      assessedLevel,
      answers: domainAnswers,
      averageScore: Math.round(avgScore * 10) / 10,
    });
  }

  // 记录答案
  private recordAnswer(userAnswer: string, score: number): void {
    const question = this.currentQuestion;
    if (!question) return;

    const scoreDetail: ScoreDetail = this.computeScoreDetail(userAnswer, score);

    const answer: InterviewAnswer = {
      questionId: question.id,
      domain: question.domain,
      level: question.level,
      userAnswer,
      score,
      scoreDetail,
      followUps: [],
      answeredAt: new Date().toISOString(),
    };

    this.answers.set(question.id, answer);
  }

  // 计算评分详情
  private computeScoreDetail(userAnswer: string, _overallScore: number): ScoreDetail {
    const question = this.currentQuestion;
    if (!question) {
      return { accuracy: 0, completeness: 0, depth: 0, engineering: 0, expression: 0 };
    }

    const questionData = INTERVIEW_QUESTIONS.find(q => q.id === question.id);
    const keywords = questionData?.keywords ?? [];
    const trimmed = userAnswer.trim();

    const matchedCount = keywords.filter(kw =>
      trimmed.toLowerCase().includes(kw.toLowerCase())
    ).length;
    const matchRatio = keywords.length > 0 ? matchedCount / keywords.length : 0;

    const hasCode = /`[^`]+`/.test(trimmed) || /```[\s\S]*```/.test(trimmed);
    const hasExample = /例如|比如|示例|例子/.test(trimmed);
    const lengthScore = Math.min(trimmed.length / 100, 1);

    return {
      accuracy: Math.round(Math.min(matchRatio + 0.2, 1) * 10) / 10,
      completeness: Math.round(Math.min(lengthScore + 0.3, 1) * 10) / 10,
      depth: Math.round(Math.min((hasExample ? 0.3 : 0) + (hasCode ? 0.4 : 0) + 0.3, 1) * 10) / 10,
      engineering: Math.round(Math.min((hasCode ? 0.5 : 0) + (matchRatio > 0.5 ? 0.3 : 0) + 0.2, 1) * 10) / 10,
      expression: Math.round(Math.min(this.checkStructure(trimmed) ? 0.4 : 0.1 + lengthScore * 0.5, 1) * 10) / 10,
    };
  }

  // 分析薄弱项
  private analyzeWeaknesses(domainResults: DomainResult[]): string[] {
    const weaknesses: string[] = [];
    for (const result of domainResults) {
      if (result.averageScore < 3) {
        weaknesses.push(`${result.domainName}：平均得分 ${result.averageScore}，评估等级 L${result.assessedLevel}，基础知识需加强`);
      } else if (result.averageScore < 4) {
        weaknesses.push(`${result.domainName}：平均得分 ${result.averageScore}，评估等级 L${result.assessedLevel}，深度理解有待提升`);
      }
    }
    return weaknesses;
  }

  // 生成改进建议
  private generateImprovements(weaknesses: string[]): string[] {
    if (weaknesses.length === 0) {
      return ['整体表现良好，建议保持学习节奏，深入掌握高级特性和最佳实践'];
    }
    return weaknesses.map(w => {
      if (w.includes('基础知识')) return `建议系统复习 ${w.split('：')[0]} 的核心概念和基础用法，配合官方文档和经典书籍`;
      return `建议深入学习 ${w.split('：')[0]} 的高级特性和源码实现，关注业界最佳实践`;
    });
  }

  // 生成推荐学习路径
  private generateLearningPath(domainResults: DomainResult[]): string[] {
    const path: string[] = [];
    const sorted = [...domainResults].sort((a, b) => a.averageScore - b.averageScore);

    for (const result of sorted) {
      if (result.averageScore < 3) {
        path.push(`基础巩固：${result.domainName} —— 建议从官方文档和入门教程开始`);
      }
    }
    for (const result of sorted) {
      if (result.averageScore >= 3 && result.averageScore < 4) {
        path.push(`进阶提升：${result.domainName} —— 建议阅读源码和深入实践`);
      }
    }
    for (const result of sorted) {
      if (result.averageScore >= 4) {
        path.push(`高手进阶：${result.domainName} —— 建议关注前沿方案和架构设计`);
      }
    }

    return path;
  }

  // 估算总题数
  private getEstimatedTotal(): number {
    const remainingDomains = DOMAIN_PRIORITY.length - this.domainIndex;
    return this.answers.size + remainingDomains * 3;
  }
}
