import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { KnowledgeNode, KnowledgeEdge } from './types';

// 节点尺寸常量
const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;

// 领域颜色映射
const DOMAIN_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#10b981',
  3: '#f59e0b',
  4: '#8b5cf6',
  5: '#ef4444',
  6: '#06b6d4',
  7: '#ec4899',
  8: '#14b8a6',
};

/**
 * 根据掌握度返回节点透明度（0~1）
 * mastery 为 0 表示未学习，完全不透明用于显示
 */
function getMasteryOpacity(mastery: number): number {
  if (mastery <= 0) return 1;
  return Math.max(0.4, 1 - mastery / 100);
}

/**
 * 将知识节点转换为 React Flow 节点
 * @param knowledgeNodes 知识节点列表
 * @param masteryMap 掌握度映射 { nodeId: mastery }
 */
export function buildFlowNodes(
  knowledgeNodes: KnowledgeNode[],
  masteryMap: Map<string, number> = new Map(),
): Node[] {
  return knowledgeNodes.map((kn) => {
    const mastery = masteryMap.get(kn.id) ?? kn.mastery;
    const color = DOMAIN_COLORS[kn.domain] || '#64748b';
    const opacity = getMasteryOpacity(mastery);

    return {
      id: kn.id,
      type: 'default',
      position: { x: 0, y: 0 },
      data: {
        label: kn.label,
        description: kn.description,
        domain: kn.domain,
        level: kn.level,
        mastery,
        importance: kn.importance,
        color,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: color,
        opacity,
        borderRadius: 8,
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  });
}

/**
 * 将知识边转换为 React Flow 边
 */
export function buildFlowEdges(edges: KnowledgeEdge[]): Edge[] {
  return edges.map((e, index) => ({
    id: `edge-${index}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    style: {
      strokeWidth: 2,
      stroke: '#475569',
    },
    labelStyle: {
      fontSize: 11,
      fill: '#94a3b8',
    },
  }));
}

// 布局缓存
const layoutCache = new Map<number, { nodes: Node[]; edges: Edge[] }>();

/**
 * 使用 dagre 自动布局
 * @param nodes React Flow 节点（无需 position）
 * @param edges React Flow 边
 * @param direction 布局方向：'TB' 从上到下，'LR' 从左到右
 */
export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  // 添加节点
  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // 添加边
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // 执行布局计算
  dagre.layout(g);

  // 提取计算后的位置
  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

/**
 * 获取指定领域的布局结果（带缓存）
 */
export function getLayout(
  domain: number,
  knowledgeNodes: KnowledgeNode[],
  knowledgeEdges: KnowledgeEdge[],
  masteryMap?: Map<string, number>,
  direction?: 'TB' | 'LR',
): { nodes: Node[]; edges: Edge[] } {
  const cacheKey = domain;
  const cached = layoutCache.get(cacheKey);

  // 如果缓存存在且没有传入掌握度映射，直接返回缓存
  if (cached && !masteryMap) {
    return cached;
  }

  const nodes = buildFlowNodes(knowledgeNodes, masteryMap);
  const edges = buildFlowEdges(knowledgeEdges);
  const laidOutNodes = layoutGraph(nodes, edges, direction);

  const result = { nodes: laidOutNodes, edges };

  // 仅在没有传入掌握度映射时缓存（掌握度频繁变化，不适合缓存）
  if (!masteryMap) {
    layoutCache.set(cacheKey, result);
  }

  return result;
}

/**
 * 清除所有布局缓存
 */
export function clearLayoutCache(): void {
  layoutCache.clear();
}