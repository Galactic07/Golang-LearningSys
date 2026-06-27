import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Mic,
  Route,
  Briefcase,
  Stethoscope,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Code2,
  GraduationCap,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  FolderKanban,
  FlaskConical,
} from 'lucide-react';
import { ROUTES } from './routes';

// 导航菜单项配置
const navItems = [
  { path: ROUTES.DASHBOARD, label: '仪表盘', icon: LayoutDashboard },
  { path: ROUTES.KNOWLEDGE_GRAPH, label: '知识图谱', icon: Network },
  { path: ROUTES.SYSTEMATIC_LEARNING, label: '系统学习', icon: GraduationCap },
  { path: ROUTES.QUIZ, label: '刷题', icon: BookOpen },
  { path: ROUTES.REVIEW, label: '复习', icon: RefreshCw },
  { path: ROUTES.GAP_ANALYSIS, label: '查漏补缺', icon: AlertTriangle },
  { path: ROUTES.PROJECT_ROADMAP, label: '项目路线', icon: FolderKanban },
  { path: ROUTES.LAB, label: '实战实验室', icon: FlaskConical },
  { path: ROUTES.SKILL_ASSESSMENT, label: '能力评估', icon: TrendingUp },
  { path: ROUTES.INTERVIEW, label: '模拟面试', icon: Mic },
  { path: ROUTES.LEARNING_PATH, label: '学习路径', icon: Route },
  { path: ROUTES.JOB_SYNC, label: '招聘联动', icon: Briefcase },
  { path: ROUTES.DIAGNOSIS, label: '智能诊断', icon: Stethoscope },
  { path: ROUTES.SETTINGS, label: '设置', icon: Settings },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 侧边栏宽度
  const sidebarWidth = collapsed ? 64 : 240;

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0f172a' }}>
      {/* 侧边栏 */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-50"
        style={{
          width: sidebarWidth,
          backgroundColor: '#1e293b',
        }}
      >
        {/* Logo 区域 */}
        <div className="flex items-center h-16 px-4 border-b border-slate-700">
          <Code2 className="w-7 h-7 text-emerald-400 shrink-0" />
          {!collapsed && (
            <span className="ml-3 text-lg font-bold text-slate-100 whitespace-nowrap">
              GoMaster
            </span>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center rounded-lg transition-colors duration-150 ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                    } ${
                      active
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 text-sm whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 折叠按钮 */}
        <div className="border-t border-slate-700 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main
        className="flex-1 transition-all duration-300 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
