import {
  Network,
  BookOpen,
  Mic,
  Route,
  Briefcase,
  Stethoscope,
  Code2,
  Database,
  Clock,
  Target,
  Flame,
  CalendarClock,
} from 'lucide-react';

// 领域数据类型
interface DomainCard {
  id: string;
  name: string;
  icon: React.ElementType;
  mastery: number; // 掌握度 0-100
  completed: number; // 已完成题目数
  total: number; // 总题目数
}

// 面试记录类型
interface InterviewRecord {
  id: string;
  date: string;
  score: number;
  duration: string;
  topics: string[];
}

// Mock 领域数据
const domains: DomainCard[] = [
  { id: 'syntax', name: '语法基础', icon: Code2, mastery: 85, completed: 128, total: 150 },
  { id: 'concurrency', name: '并发编程', icon: Network, mastery: 62, completed: 78, total: 120 },
  { id: 'runtime', name: '运行时机制', icon: Database, mastery: 45, completed: 36, total: 80 },
  { id: 'patterns', name: '设计模式', icon: Route, mastery: 73, completed: 55, total: 75 },
  { id: 'testing', name: '测试工程', icon: Target, mastery: 28, completed: 14, total: 50 },
  { id: 'perf', name: '性能调优', icon: Stethoscope, mastery: 15, completed: 8, total: 55 },
  { id: 'microservices', name: '微服务架构', icon: Briefcase, mastery: 50, completed: 30, total: 60 },
  { id: 'interview', name: '面试实战', icon: Mic, mastery: 90, completed: 45, total: 50 },
];

// Mock 面试记录
const interviewRecords: InterviewRecord[] = [
  { id: '1', date: '2024-01-15', score: 82, duration: '45分钟', topics: ['并发', 'runtime'] },
  { id: '2', date: '2024-01-12', score: 75, duration: '38分钟', topics: ['语法', '设计模式'] },
  { id: '3', date: '2024-01-10', score: 68, duration: '42分钟', topics: ['微服务', '性能'] },
];

// 根据掌握度获取颜色
function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'bg-emerald-500';
  if (mastery >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

// 根据掌握度获取文字颜色
function getMasteryTextColor(mastery: number): string {
  if (mastery >= 80) return 'text-emerald-400';
  if (mastery >= 30) return 'text-amber-400';
  return 'text-red-400';
}

// 根据掌握度获取进度条背景色
function getMasteryBarBg(mastery: number): string {
  if (mastery >= 80) return 'bg-emerald-500/20';
  if (mastery >= 30) return 'bg-amber-500/20';
  return 'bg-red-500/20';
}

export default function Dashboard() {
  // Mock 统计数据
  const stats = {
    totalQuestions: 394,
    correctRate: 76,
    streakDays: 12,
    todayReview: 8,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">仪表盘</h1>
        <p className="text-slate-400 mt-1">Go 语言学习进度总览</p>
      </div>

      {/* 上半部分：领域卡片 + 统计面板 */}
      <div className="flex gap-6">
        {/* 领域掌握度卡片网格 */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">领域掌握度</h2>
          <div className="grid grid-cols-3 gap-4">
            {domains.map((domain) => {
              const Icon = domain.icon;
              const masteryColor = getMasteryColor(domain.mastery);
              const textColor = getMasteryTextColor(domain.mastery);
              const barBg = getMasteryBarBg(domain.mastery);

              return (
                <div
                  key={domain.id}
                  className="rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  style={{ backgroundColor: '#1e293b' }}
                >
                  {/* 领域头部 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${barBg}`}>
                      <Icon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      {domain.name}
                    </span>
                  </div>

                  {/* 掌握度进度条 */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-2xl font-bold ${textColor}`}>
                        {domain.mastery}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${barBg}`}>
                      <div
                        className={`h-full rounded-full ${masteryColor} transition-all duration-500`}
                        style={{ width: `${domain.mastery}%` }}
                      />
                    </div>
                  </div>

                  {/* 题目完成数 */}
                  <div className="text-xs text-slate-400">
                    已完成 {domain.completed}/{domain.total} 题
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧统计面板 */}
        <div className="w-72 space-y-4 shrink-0">
          {/* 今日待复习 */}
          <div
            className="rounded-xl p-5 border border-slate-700"
            style={{ backgroundColor: '#1e293b' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <CalendarClock className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">今日待复习</span>
            </div>
            <div className="text-4xl font-bold text-indigo-400">
              {stats.todayReview}
            </div>
            <p className="text-xs text-slate-400 mt-1">题目标记为待复习</p>
          </div>

          {/* 刷题统计 */}
          <div
            className="rounded-xl p-5 border border-slate-700"
            style={{ backgroundColor: '#1e293b' }}
          >
            <h3 className="text-sm font-medium text-slate-300 mb-4">刷题统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">总题数</span>
                </div>
                <span className="text-lg font-semibold text-slate-200">
                  {stats.totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">正确率</span>
                </div>
                <span className="text-lg font-semibold text-emerald-400">
                  {stats.correctRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-400">连续天数</span>
                </div>
                <span className="text-lg font-semibold text-orange-400">
                  {stats.streakDays}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近面试记录 */}
      <div
        className="rounded-xl border border-slate-700 p-5"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">最近面试记录</h2>
        </div>
        <div className="space-y-3">
          {interviewRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">{record.date}</span>
                <div className="flex gap-2">
                  {record.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-slate-400">{record.duration}</span>
                <span
                  className={`text-sm font-semibold ${
                    record.score >= 80
                      ? 'text-emerald-400'
                      : record.score >= 60
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {record.score}分
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
