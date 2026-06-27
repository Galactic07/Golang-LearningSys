import { Briefcase } from 'lucide-react';

// 招聘联动占位页面
export default function JobSync() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Briefcase className="w-16 h-16 text-slate-600 mb-4" />
      <h1 className="text-2xl font-bold text-slate-200 mb-2">招聘联动</h1>
      <p className="text-slate-400">开发中，敬请期待...</p>
    </div>
  );
}
