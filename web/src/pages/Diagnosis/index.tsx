import { Stethoscope } from 'lucide-react';

// 智能诊断占位页面
export default function Diagnosis() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Stethoscope className="w-16 h-16 text-slate-600 mb-4" />
      <h1 className="text-2xl font-bold text-slate-200 mb-2">智能诊断</h1>
      <p className="text-slate-400">开发中，敬请期待...</p>
    </div>
  );
}
