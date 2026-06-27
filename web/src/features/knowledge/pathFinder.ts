import type { LearningStep } from './types';
import { KNOWLEDGE_NODES } from './goKnowledge';

// 领域名称映射
const DOMAIN_NAMES: Record<number, string> = {
  1: 'Go 语言基础',
  2: '并发编程',
  3: '运行时与性能',
  4: '工程实践',
  5: '微服务与 RPC',
  6: '数据与存储',
  7: '云原生',
  8: '系统设计',
};

/**
 * 计算最短学习路径
 * @param currentLevels 当前各领域的掌握级别 { domain: level }
 * @param targetLevels  目标各领域的掌握级别 { domain: level }
 * @returns 按差距降序排列的学习步骤
 */
export function findShortestPath(
  currentLevels: Map<number, number>,
  targetLevels: Map<number, number>,
): LearningStep[] {
  const steps: LearningStep[] = [];

  for (const [domain, current] of currentLevels) {
    const target = targetLevels.get(domain) ?? current;
    if (target > current) {
      // 获取该领域需要学习的具体知识点
      const topics = KNOWLEDGE_NODES.filter(
        (n) => n.domain === domain && n.level > current && n.level <= target,
      ).map((n) => n.label);

      steps.push({
        domain,
        domainName: DOMAIN_NAMES[domain] || '',
        fromLevel: current,
        toLevel: target,
        topics,
        estimatedQuestions: (target - current) * 15,
      });
    }
  }

  // 按差距从大到小排序
  return steps.sort(
    (a, b) => b.toLevel - b.fromLevel - (a.toLevel - a.fromLevel),
  );
}

/**
 * 计算掌握度总评分（0~100）
 * @param masteryMap 掌握度映射 { nodeId: mastery }
 */
export function calculateMasteryScore(
  masteryMap: Map<string, number>,
): number {
  const nodes = KNOWLEDGE_NODES;
  if (nodes.length === 0) return 0;

  const total = nodes.reduce(
    (sum, node) => sum + (masteryMap.get(node.id) ?? node.mastery) * node.importance,
    0,
  );
  const max = nodes.reduce((sum, node) => sum + 100 * node.importance, 0);

  return Math.round((total / max) * 100);
}

/**
 * 获取需要复习的知识点（掌握度低于阈值的节点）
 * @param masteryMap 掌握度映射
 * @param threshold 掌握度阈值，低于此值的节点将被返回
 */
export function getReviewNodes(
  masteryMap: Map<string, number>,
  threshold: number = 30,
): string[] {
  return KNOWLEDGE_NODES.filter(
    (node) => (masteryMap.get(node.id) ?? node.mastery) < threshold,
  ).map((n) => n.id);
}