import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, Zap, Clock,
  Code2, Server, Cloud, Database, Cpu, Layout, Wrench,
} from 'lucide-react';
import { PROJECT_ROADMAP } from '../../data/projectRoadmap';
import { DOMAIN_NAMES } from '../../features/interview/types';
import { progressCache } from '../../lib/storage';

// Domain icon map
const DOMAIN_ICONS: Record<number, React.ElementType> = {
  1: Code2,
  2: Zap,
  3: Cpu,
  4: Wrench,
  5: Server,
  6: Database,
  7: Cloud,
  8: Layout,
};

type StatusType = 'planned' | 'in_progress' | 'completed';

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planned: { label: '待开始', color: 'text-slate-400', bg: 'bg-slate-700', icon: Circle },
  in_progress: { label: '进行中', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: Zap },
  completed: { label: '已完成', color: 'text-blue-400', bg: 'bg-blue-600/20', icon: CheckCircle2 },
};

export default function ProjectRoadmap() {
  const [statuses, setStatuses] = useState<StatusType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressCache.get('projectStatuses').then(stored => {
      if (stored && Array.isArray(stored)) {
        setStatuses(stored as StatusType[]);
      } else {
        setStatuses(PROJECT_ROADMAP.map(p => p.status as StatusType));
      }
      setLoading(false);
    });
  }, []);

  const updateStatus = useCallback((idx: number, newStatus: StatusType) => {
    const updated = [...statuses];
    updated[idx] = newStatus;
    setStatuses(updated);
    progressCache.set('projectStatuses', updated);
  }, [statuses]);

  const stats = useMemo(() => {
    const total = PROJECT_ROADMAP.length;
    const completed = statuses.filter(s => s === 'completed').length;
    const inProgress = statuses.filter(s => s === 'in_progress').length;
    return { total, completed, inProgress, progress: Math.round((completed / total) * 100) };
  }, [statuses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">项目路线图</h1>
          <p className="text-slate-400 mt-1">从 CLI 工具到高并发系统，一步步提升工程能力</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-slate-400">
            总进度 <span className="text-emerald-400 font-bold">{stats.progress}%</span>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4 text-sm">
            <span className="text-blue-400">已完成 {stats.completed}</span>
            <span className="text-emerald-400">进行中 {stats.inProgress}</span>
            <span className="text-slate-400">待开始 {stats.total - stats.completed - stats.inProgress}</span>
          </div>
          <span className="text-slate-400 text-sm">{stats.completed}/{stats.total}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Project cards */}
      <div className="relative space-y-8">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-700" />

        {PROJECT_ROADMAP.map((project, idx) => {
          const status = statuses[idx] || project.status;
          const statusCfg = STATUS_CONFIG[status as StatusType];
          const StatusIcon = statusCfg.icon;
          const DomainIcon = DOMAIN_ICONS[project.domain] || Code2;

          return (
            <motion.div
              key={project.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className={`absolute left-6 w-5 h-5 rounded-full border-2 border-slate-700 -translate-x-1/2 mt-6 flex items-center justify-center ${
                status === 'completed' ? 'bg-blue-600' : status === 'in_progress' ? 'bg-emerald-600' : 'bg-slate-800'
              }`}>
                <StatusIcon className="w-3 h-3 text-white" />
              </div>

              {/* Card */}
              <div className={`ml-16 bg-slate-800 rounded-2xl p-6 border transition-colors ${
                status === 'completed' ? 'border-blue-600/30' : status === 'in_progress' ? 'border-emerald-600/30' : 'border-slate-700'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Level badge */}
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                    status === 'completed' ? 'bg-blue-600/20' : 'bg-slate-700'
                  }`}>
                    <span className="text-xs text-slate-400">Lv</span>
                    <span className="text-xl font-bold text-slate-200">{project.level}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-slate-100">{project.title}</h2>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <DomainIcon className="w-3 h-3" />
                        {DOMAIN_NAMES[project.domain] || ''}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {project.duration}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-3">{project.description}</p>

                    {project.deliverable && (
                      <p className="text-xs text-slate-500 mb-3">{project.deliverable}</p>
                    )}

                    {/* Tech stack */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map(t => (
                          <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.features.map(f => (
                        <span key={f} className={`text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          status === 'completed'
                            ? 'bg-blue-600/20 text-blue-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          <CheckCircle2 className={`w-3 h-3 ${status === 'completed' ? 'text-blue-400' : 'text-slate-500'}`} />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="shrink-0">
                    <select
                      value={status}
                      onChange={e => updateStatus(idx, e.target.value as StatusType)}
                      className={`text-xs px-3 py-1.5 rounded-lg border appearance-none cursor-pointer transition-colors ${
                        statusCfg.bg
                      } ${
                        statusCfg.color
                      } border-slate-600 focus:outline-none focus:border-emerald-500`}
                    >
                      <option value="planned">待开始</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}