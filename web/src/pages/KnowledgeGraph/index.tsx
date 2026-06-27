import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  ArrowLeft,
  Search,
  Code2,
  Zap,
  Cpu,
  Wrench,
  Globe,
  Database,
  Cloud,
  Layout,
  Filter,
  X,
  CheckCircle2,
} from 'lucide-react';
import { DOMAINS } from '../../data/domains';
import {
  getNodesByDomain,
  getEdgesByDomain,
} from '../../features/knowledge/goKnowledge';

const ICON_MAP: Record<string, React.ElementType> = {
  Code2, Zap, Cpu, Wrench, Globe, Database, Cloud, Layout,
};

const NODE_WIDTH = 170;
const NODE_HEIGHT = 90;

const DOMAIN_QUESTION_COUNTS: Record<number, number> = {
  1: 12, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 12, 8: 12,
};

const MASTERY_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'weak', label: '薄弱' },
  { value: 'learning', label: '学习中' },
  { value: 'mastered', label: '已掌握' },
] as const;

const LEVEL_OPTIONS = [
  { value: 0, label: '全部难度' },
  { value: 1, label: 'L1' },
  { value: 2, label: 'L2' },
  { value: 3, label: 'L3' },
  { value: 4, label: 'L4' },
];

interface CustomNodeData {
  label: string;
  description: string;
  domain: number;
  level: number;
  mastery: number;
  importance: number;
  color: string;
  highlighted: boolean;
  dimmed: boolean;
  [key: string]: unknown;
}

type CustomNodeType = Node<CustomNodeData, 'custom'>;

function CustomNode({ data }: NodeProps<CustomNodeType>) {
  const { label, mastery, level, importance, highlighted, dimmed } = data;

  const masteryColor = mastery >= 80 ? '#22c55e' : mastery >= 30 ? '#eab308' : '#ef4444';
  const nodeOpacity = dimmed ? 0.25 : 1;
  const nodeScale = highlighted ? 1.05 : 1;

  return (
    <div
      className="rounded-xl shadow-lg border-2 transition-all duration-200"
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderColor: highlighted ? '#22d3ee' : masteryColor,
        opacity: nodeOpacity,
        transform: `scale(${nodeScale})`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: masteryColor, width: 8, height: 8, border: '2px solid #0f172a' }} />

      <div className="flex flex-col h-full p-2.5 justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-100 truncate mr-1">
            {label}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 text-white"
            style={{ backgroundColor: masteryColor }}
          >
            L{level}
          </span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${mastery}%`, backgroundColor: masteryColor }}
          />
        </div>

        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[10px] text-slate-400">{mastery}%</span>
          <span className="text-[10px] text-slate-500">
            {'★'.repeat(importance)}{'☆'.repeat(5 - importance)}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: masteryColor, width: 8, height: 8, border: '2px solid #0f172a' }} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode } as const;

function getDomainLayout(domain: number): { nodes: CustomNodeType[]; edges: Edge[] } {
  const knowledgeNodes = getNodesByDomain(domain);
  const knowledgeEdges = getEdgesByDomain(domain);
  const domainColor = DOMAINS.find((d) => d.id === domain)?.color || '#64748b';

  const nodes: CustomNodeType[] = knowledgeNodes.map((kn) => ({
    id: kn.id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      label: kn.label,
      description: kn.description,
      domain: kn.domain,
      level: kn.level,
      mastery: kn.mastery,
      importance: kn.importance,
      color: domainColor,
      highlighted: true,
      dimmed: false,
    },
  }));

  const edges: Edge[] = knowledgeEdges.map((e, index) => ({
    id: `edge-${domain}-${index}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    style: { strokeWidth: 2, stroke: '#475569' },
    labelStyle: { fontSize: 11, fill: '#94a3b8' },
  }));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 100, marginx: 40, marginy: 40 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const laidOutNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });

  return { nodes: laidOutNodes, edges };
}

function getDomainStats(domain: number) {
  const nodes = getNodesByDomain(domain);
  const totalQ = DOMAIN_QUESTION_COUNTS[domain] || 0;
  const avgMastery = nodes.reduce((s, n) => s + n.mastery, 0) / nodes.length;
  const completedQ = Math.round((avgMastery / 100) * totalQ);
  return { totalQ, completedQ, avgMastery, nodeCount: nodes.length };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function KnowledgeGraph() {
  const navigate = useNavigate();

  const [view, setView] = useState<'overview' | 'detail'>('overview');
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleDomainClick = useCallback((domainId: number) => {
    setSelectedDomain(domainId);
    setView('detail');
    setSearchQuery('');
    setMasteryFilter('all');
    setLevelFilter(0);
  }, []);

  const handleBack = useCallback(() => {
    setView('overview');
    setSelectedDomain(null);
    setSearchQuery('');
    setMasteryFilter('all');
    setLevelFilter(0);
  }, []);

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/quiz?domain=${node.data.domain}`);
    },
    [navigate],
  );

  const layoutResult = useMemo(() => {
    if (selectedDomain === null) return { nodes: [], edges: [] };
    return getDomainLayout(selectedDomain);
  }, [selectedDomain]);

  const filteredNodes = useMemo(() => {
    if (!layoutResult.nodes.length) return [];
    return layoutResult.nodes.map((node) => {
      const matchesSearch = !searchQuery || node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === 0 || node.data.level === levelFilter;
      let matchesMastery = true;
      if (masteryFilter === 'weak') matchesMastery = node.data.mastery < 30;
      else if (masteryFilter === 'learning') matchesMastery = node.data.mastery >= 30 && node.data.mastery < 80;
      else if (masteryFilter === 'mastered') matchesMastery = node.data.mastery >= 80;

      const active = matchesSearch && matchesLevel && matchesMastery;
      const highlighted = !!searchQuery && matchesSearch;

      return {
        ...node,
        data: {
          ...node.data,
          highlighted,
          dimmed: !active,
        },
      };
    });
  }, [layoutResult.nodes, searchQuery, masteryFilter, levelFilter]);

  const filteredEdges = useMemo(() => {
    if (!layoutResult.edges.length) return [];
    const activeNodeIds = new Set(
      filteredNodes.filter((n) => !n.data.dimmed).map((n) => n.id),
    );
    return layoutResult.edges.filter(
      (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target),
    );
  }, [filteredNodes, layoutResult.edges]);

  const selectedDomainInfo = selectedDomain
    ? DOMAINS.find((d) => d.id === selectedDomain)
    : null;

  const domainStats = selectedDomain ? getDomainStats(selectedDomain) : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] text-slate-200">
      {/* 顶部区域 */}
      <div className="flex flex-col gap-4 mb-6">
        {/* 标题行 */}
        <div className="flex items-center gap-3">
          {view === 'detail' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </motion.button>
          )}
          <BrainCircuit className="w-7 h-7 text-emerald-400" />
          <h1 className="text-xl font-bold text-slate-100">Go 知识图谱</h1>
          {selectedDomainInfo && view === 'detail' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">/</span>
              <span
                className="flex items-center gap-1.5 text-base font-semibold"
                style={{ color: selectedDomainInfo.color }}
              >
                {(() => {
                  const Icon = ICON_MAP[selectedDomainInfo.icon];
                  return Icon ? <Icon className="w-4 h-4" /> : null;
                })()}
                {selectedDomainInfo.name}
              </span>
            </div>
          )}
        </div>

        {/* 搜索与筛选行 */}
        {view === 'detail' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索知识点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 w-full overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">掌握度：</span>
                    <div className="flex gap-1">
                      {MASTERY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setMasteryFilter(opt.value)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            masteryFilter === opt.value
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">难度：</span>
                    <div className="flex gap-1">
                      {LEVEL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLevelFilter(opt.value)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            levelFilter === opt.value
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 主内容区 */}
      <AnimatePresence mode="wait">
        {view === 'overview' ? (
          <motion.div
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {DOMAINS.map((domain) => {
              const stats = getDomainStats(domain.id);
              const Icon = ICON_MAP[domain.icon] || BrainCircuit;
              const masteryColor =
                stats.avgMastery >= 80
                  ? '#22c55e'
                  : stats.avgMastery >= 30
                    ? '#eab308'
                    : '#ef4444';

              return (
                <motion.button
                  key={domain.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDomainClick(domain.id)}
                  className="relative text-left rounded-xl border border-slate-700/50 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/50 overflow-hidden group"
                  style={{ backgroundColor: '#1e293b' }}
                >
                  {/* 顶部色条 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: domain.color }}
                  />

                  <div className="flex items-start gap-4 mt-1">
                    <div
                      className="p-2.5 rounded-lg shrink-0"
                      style={{ backgroundColor: `${domain.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: domain.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-100 mb-1">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {domain.description}
                      </p>

                      {/* 掌握度进度条 */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>掌握度</span>
                          <span style={{ color: masteryColor }}>
                            {Math.round(stats.avgMastery)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stats.avgMastery}%`,
                              backgroundColor: masteryColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* 题目完成数 */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          已完成 {stats.completedQ}/{stats.totalQ} 题
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 rounded-xl border border-slate-700/50 overflow-hidden"
            style={{ height: 'calc(100vh - 18rem)', minHeight: 500, backgroundColor: '#0f172a' }}
          >
            {selectedDomainInfo && domainStats && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">领域掌握度：</span>
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        domainStats.avgMastery >= 80
                          ? '#22c55e'
                          : domainStats.avgMastery >= 30
                            ? '#eab308'
                            : '#ef4444',
                    }}
                  >
                    {Math.round(domainStats.avgMastery)}%
                  </span>
                </div>
                <div className="w-24 bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${domainStats.avgMastery}%`,
                      backgroundColor:
                        domainStats.avgMastery >= 80
                          ? '#22c55e'
                          : domainStats.avgMastery >= 30
                            ? '#eab308'
                            : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {domainStats.nodeCount} 个知识点 · 共 {domainStats.totalQ} 题
                </span>
                {filteredNodes.some((n) => n.data.dimmed) && (
                  <span className="text-xs text-slate-500 ml-auto">
                    显示 {filteredNodes.filter((n) => !n.data.dimmed).length}/{layoutResult.nodes.length} 个节点
                  </span>
                )}
              </div>
            )}

            <ReactFlow
              nodes={filteredNodes}
              edges={filteredEdges}
              nodeTypes={nodeTypes}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              minZoom={0.3}
              maxZoom={2}
              attributionPosition="bottom-left"
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { strokeWidth: 2, stroke: '#475569' },
              }}
            >
              <Background color="#1e293b" gap={20} size={1} />
              <Controls
                className="bg-slate-800 border-slate-700 [&_button]:text-slate-400 [&_button]:border-slate-700 [&_button:hover]:bg-slate-700"
              />
              <MiniMap
                nodeColor={(node) => {
                  const d = node.data as CustomNodeData;
                  if (d.dimmed) return '#1e293b';
                  return d.mastery >= 80 ? '#22c55e' : d.mastery >= 30 ? '#eab308' : '#ef4444';
                }}
                maskColor="rgba(15, 23, 42, 0.8)"
                style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
            </ReactFlow>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}