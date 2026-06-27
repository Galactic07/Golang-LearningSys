// 实战实验室 - 类型定义

export type LabPhase = 'reading' | 'filling' | 'modification' | 'greenfield';

export interface FillBlank {
  id: string;
  line: number;
  hint: string;
  answer: string;
  alternatives: string[];
}

export interface LabFile {
  name: string;
  content: string;
  readonly: boolean;
  blanks?: FillBlank[];
}

export interface LabProject {
  id: string;
  title: string;
  phase: LabPhase;
  phaseLevel: number;
  projectLevel: number;
  domain: number;
  knowledgeNodeIds: string[];
  description: string;
  files: LabFile[];
  tests: string;
  hints: string[];
  requirements?: {
    prd: string;
    acceptanceCriteria: string[];
    recommendedTech: string[];
  };
}

export interface CompileResult {
  success: boolean;
  output: string;
  errors: string;
  duration: number;
}

export interface LabProgress {
  projectId: string;
  phase: LabPhase;
  completed: boolean;
  filledBlanks: Record<string, string>;
  modificationScore?: number;
  lastCompileResult?: CompileResult;
}