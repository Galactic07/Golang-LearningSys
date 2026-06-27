export interface LLMConfig {
  provider: 'openai' | 'deepseek' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ScoreRequest {
  question: string;
  referenceAnswer: string;
  userAnswer: string;
}

export interface ScoreResult {
  accuracy: { score: number; feedback: string };
  completeness: { score: number; feedback: string };
  depth: { score: number; feedback: string };
  engineering: { score: number; feedback: string };
  expression: { score: number; feedback: string };
  overall: number;
  improvement: string;
}

export interface GenerateRequest {
  domain: number;
  level: number;
  topic: string;
  jdKeywords?: string[];
}

export interface GeneratedQuestion {
  question: string;
  referenceAnswer: string;
  keywords: string[];
  hints: string[];
}

export interface FollowUpRequest {
  question: string;
  userAnswer: string;
  score: number;
}

export interface FollowUpResult {
  followUp: string;
}

// LLM 评分（通过后端代理）
export async function scoreAnswer(request: ScoreRequest): Promise<ScoreResult> {
  const response = await fetch('/api/llm/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('评分失败');
  return response.json();
}

// LLM 生成题目（通过后端代理）
export async function generateQuestion(request: GenerateRequest): Promise<GeneratedQuestion> {
  const response = await fetch('/api/llm/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('题目生成失败');
  return response.json();
}

// LLM 追问（通过后端代理）
export async function getFollowUp(request: FollowUpRequest): Promise<FollowUpResult> {
  const response = await fetch('/api/llm/followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('追问失败');
  return response.json();
}

// 测试 LLM 连接
export async function testConnection(config: LLMConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/llm/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ config }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// 优雅降级：LLM 优先 → 规则兜底
export async function scoreWithFallback(
  request: ScoreRequest,
  useLLM: boolean
): Promise<ScoreResult | null> {
  if (useLLM) {
    try {
      return await scoreAnswer(request);
    } catch (error) {
      console.warn('LLM 评分失败，降级到规则评分:', error);
      return null;
    }
  }
  return null;
}
