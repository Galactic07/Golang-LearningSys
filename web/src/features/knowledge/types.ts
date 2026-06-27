// 知识点节点
export interface KnowledgeNode {
  id: string;
  label: string;
  domain: number;
  level: number;
  mastery: number;
  description: string;
  importance: number;
}

// 知识点依赖边
export interface KnowledgeEdge {
  source: string;
  target: string;
  label?: string;
}

// 领域信息
export interface DomainInfo {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// 学习步骤
export interface LearningStep {
  domain: number;
  domainName: string;
  fromLevel: number;
  toLevel: number;
  topics: string[];
  estimatedQuestions: number;
}
