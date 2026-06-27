import { Route } from 'lucide-react';

// 学习路径占位页面
export default function LearningPath() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Route className="w-16 h-16 text-slate-600 mb-4" />
      <h1 className="text-2xl font-bold text-slate-200 mb-2">学习路径</h1>
      <p className="text-slate-400">开发中，敬请期待...</p>
    </div>
  );
}
