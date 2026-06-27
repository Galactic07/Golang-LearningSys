// 面试模式：text 文本面试 / voice 语音面试 / jd 基于职位描述的面试
export type InterviewMode = 'text' | 'voice' | 'jd';

// 面试阶段
export type InterviewPhase = 'idle' | 'intro' | 'asking' | 'scoring' | 'followup' | 'done';

// 面试题目
export interface InterviewQuestion {
  id: string;
  domain: number;
  domainName: string;
  level: number;
  question: string;
  referenceAnswer?: string;
}

// 追问记录
export interface FollowUpRecord {
  question: string;
  userAnswer: string;
  score: number;
}

// 评分详情
export interface ScoreDetail {
  accuracy: number;
  completeness: number;
  depth: number;
  engineering: number;
  expression: number;
}

// 面试回答
export interface InterviewAnswer {
  questionId: string;
  domain: number;
  level: number;
  userAnswer: string;
  score: number;
  scoreDetail: ScoreDetail;
  followUps: FollowUpRecord[];
  answeredAt: string;
}

// 领域评估结果
export interface DomainResult {
  domain: number;
  domainName: string;
  assessedLevel: number;
  answers: InterviewAnswer[];
  averageScore: number;
}

// 面试报告
export interface InterviewReport {
  overallScore: number;
  domainResults: DomainResult[];
  weaknesses: string[];
  improvements: string[];
  recommendedPath: string[];
  totalQuestions: number;
  duration: number;
}

// 领域优先级探测顺序（从高到低）
export const DOMAIN_PRIORITY: number[] = [2, 1, 5, 3, 4, 7, 6, 8];

// 领域名称映射
export const DOMAIN_NAMES: Record<number, string> = {
  1: 'Go 语言基础',
  2: '并发编程',
  3: '运行时与性能',
  4: '工程实践',
  5: '微服务与 RPC',
  6: '数据与存储',
  7: '云原生',
  8: '系统设计',
};
