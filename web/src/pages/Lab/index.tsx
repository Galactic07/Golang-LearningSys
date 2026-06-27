import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Play, RotateCcw, CheckCircle2, XCircle,
  ChevronRight, Eye, EyeOff, Lightbulb, Terminal, BookOpen,
  PenTool, Cpu, Layers,
} from 'lucide-react';
import { LAB_PROJECTS, getProjectById } from '../../features/lab/projects';
import type { LabPhase, CompileResult, FillBlank } from '../../features/lab/types';

const PHASE_INFO: Record<LabPhase, { label: string; icon: React.ElementType; color: string }> = {
  reading: { label: '代码研读', icon: BookOpen, color: '#3b82f6' },
  filling: { label: '填空实战', icon: PenTool, color: '#10b981' },
  modification: { label: '代码改造', icon: Cpu, color: '#f59e0b' },
  greenfield: { label: '从零构建', icon: Layers, color: '#8b5cf6' },
};

export default function Lab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'projects' | 'editor'>('projects');
  const [phaseFilter, setPhaseFilter] = useState<LabPhase | 'all'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<CompileResult[]>([]);

  const project = selectedId ? getProjectById(selectedId) : null;

  const resetAnswers = useCallback(() => {
    setUserAnswers({});
    setShowAnswers(false);
    setResults([]);
  }, []);

  const handleAnswerChange = useCallback((blankId: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [blankId]: value }));
  }, []);

  const checkAllCorrect = useCallback(() => {
    if (!project) return false;
    const blanks = project.files.flatMap(f => f.blanks || []);
    return blanks.every(b => {
      const answer = (userAnswers[b.id] || '').trim();
      return answer === b.answer || b.alternatives.includes(answer);
    });
  }, [project, userAnswers]);

  const runCode = useCallback(async () => {
    if (!project) return;
    setIsRunning(true);

    // Build the code with filled answers
    const code = project.files[0].content;
    let filledCode = code;
    const blanks = project.files.flatMap(f => f.blanks || []);
    
    let blankIndex = 0;
    filledCode = filledCode.replace(/\/\*\s*空白\d+:[\s\S]*?\*\//g, () => {
      const blank = blanks[blankIndex++];
      return blank ? (userAnswers[blank.id] || blank.answer) : '';
    });

    try {
      const resp = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ name: 'main.go', content: filledCode }],
        }),
      });
      const result = await resp.json();
      setResults(prev => [...prev, result]);
    } catch (err) {
      setResults(prev => [...prev, {
        success: false,
        output: '',
        errors: `请求失败: ${err}`,
        duration: 0,
      }]);
    }
    setIsRunning(false);
  }, [project, userAnswers]);

  if (tab === 'editor' && project) {
    const blankCount = project.files.flatMap(f => f.blanks || []).length;
    const filledCount = Object.keys(userAnswers).length;
    const allCorrect = checkAllCorrect();

    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setTab('projects'); resetAnswers(); }}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← 返回
            </button>
            <div className="w-px h-5 bg-slate-700" />
            <span className="text-lg font-semibold text-slate-100">{project.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              project.phase === 'reading' ? 'bg-blue-600/20 text-blue-300' :
              project.phase === 'filling' ? 'bg-emerald-600/20 text-emerald-300' :
              project.phase === 'modification' ? 'bg-amber-600/20 text-amber-300' :
              'bg-purple-600/20 text-purple-300'
            }`}>
              {PHASE_INFO[project.phase].label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {blankCount > 0 && (
              <span className="text-sm text-slate-400">
                {filledCount}/{blankCount} 已填
              </span>
            )}
            {blankCount > 0 && (
              <button onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:bg-slate-700 transition-colors">
                <Lightbulb className="w-3.5 h-3.5" /> 提示
              </button>
            )}
            {blankCount > 0 && (
              <button onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:bg-slate-700 transition-colors">
                {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showAnswers ? '隐藏' : '答案'}
              </button>
            )}
            <button onClick={resetAnswers}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:bg-slate-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> 重置
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Code editor */}
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <Code2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">{project.files[0].name}</span>
              <span className="ml-auto text-xs text-slate-600">
                {project.phase === 'reading' ? '只读' : '可编辑'}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-0">
              <CodeEditor
                content={project.files[0].content}
                blanks={project.files[0].blanks || []}
                userAnswers={userAnswers}
                showAnswers={showAnswers}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="w-80 flex flex-col gap-3">
            {/* Actions */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? '运行中...' : '运行代码'}
              </button>

              {blankCount > 0 && (
                <div className="text-center">
                  {allCorrect ? (
                    <div className="flex items-center justify-center gap-1 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> 全部正确！
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">
                      已完成 {filledCount}/{blankCount}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fill blanks panel */}
            {blankCount > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1">
                  <PenTool className="w-4 h-4 text-emerald-400" /> 填空列表
                </h3>
                {project.files.flatMap(f => f.blanks || []).map(blank => (
                  <BlankInput
                    key={blank.id}
                    blank={blank}
                    userAnswer={userAnswers[blank.id] || ''}
                    showAnswer={showAnswers}
                    onChange={val => handleAnswerChange(blank.id, val)}
                  />
                ))}
              </div>
            )}

            {/* Hints */}
            {showHints && project.hints.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> 提示
                </h3>
                <ul className="space-y-1.5">
                  {project.hints.map((hint, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> 输出
                  </span>
                  <button onClick={() => setResults([])}
                    className="text-xs text-slate-500 hover:text-slate-300">
                    清除
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-3 font-mono text-xs space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className={`p-2 rounded-lg ${r.success ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        {r.success ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                        <span className={r.success ? 'text-emerald-400' : 'text-red-400'}>
                          {r.success ? '运行成功' : '运行失败'}
                        </span>
                        <span className="ml-auto text-slate-600">{r.duration}ms</span>
                      </div>
                      {r.output && <pre className="text-slate-300 whitespace-pre-wrap">{r.output}</pre>}
                      {r.errors && <pre className="text-red-300 whitespace-pre-wrap mt-1">{r.errors}</pre>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Project list view
  const filteredProjects = phaseFilter === 'all'
    ? LAB_PROJECTS
    : LAB_PROJECTS.filter(p => p.phase === phaseFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">实战实验室</h1>
          <p className="text-slate-400 mt-1">四阶段进阶，从读代码到造代码</p>
        </div>
      </div>

      {/* Phase filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: '全部', color: '' },
          { value: 'reading', label: '📖 代码研读', color: '#3b82f6' },
          { value: 'filling', label: '✏️ 填空实战', color: '#10b981' },
          { value: 'modification', label: '🔧 代码改造', color: '#f59e0b' },
          { value: 'greenfield', label: '🏗️ 从零构建', color: '#8b5cf6' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setPhaseFilter(f.value as LabPhase | 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              phaseFilter === f.value
                ? 'bg-emerald-600/30 text-emerald-300'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(p => {
          const info = PHASE_INFO[p.phase];
          const Icon = info.icon;
          return (
            <motion.button
              key={p.id}
              layout
              onClick={() => { setSelectedId(p.id); setTab('editor'); resetAnswers(); }}
              className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 text-left transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: info.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                      Lv{p.projectLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                      {info.label}
                    </span>
                    {p.files[0]?.blanks && (
                      <span className="text-[10px] text-slate-500">
                        {p.files[0].blanks.length} 个空白
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-2 group-hover:text-slate-300 transition-colors" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Code editor component with inline blanks
function CodeEditor({
  content,
  blanks,
  userAnswers,
  showAnswers,
  onAnswerChange,
}: {
  content: string;
  blanks: FillBlank[];
  userAnswers: Record<string, string>;
  showAnswers: boolean;
  onAnswerChange: (blankId: string, value: string) => void;
}) {
  const lines = content.split('\n');
  const blankMap = new Map(blanks.map(b => [b.line, b]));

  return (
    <div className="p-0">
      {lines.map((line, lineIdx) => {
        const lineNum = lineIdx + 1;
        const blank = blankMap.get(lineNum);
        const isBlankLine = line.includes('/* 空白') || line.includes('__');

        // Check if this line is purely a blank (just a comment)
        const trimmed = line.trim();
        const isCommentBlank = /^\/\*\s*空白\d/.test(trimmed);

        return (
          <div key={lineNum} className="flex hover:bg-slate-800/50 min-h-[1.5rem]">
            <div className="w-12 shrink-0 text-right pr-3 text-xs text-slate-600 select-none py-0.5 leading-5">
              {lineNum}
            </div>
            <div className="flex-1 py-0.5 leading-5">
              {isCommentBlank && blank ? (
                <BlankInput
                  blank={blank}
                  userAnswer={userAnswers[blank.id] || ''}
                  showAnswer={showAnswers}
                  onChange={val => onAnswerChange(blank.id, val)}
                />
              ) : isBlankLine && blank ? (
                <span className="text-slate-400">{line}</span>
              ) : (
                <code className="text-sm font-mono whitespace-pre text-slate-300">{line}</code>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlankInput({
  blank,
  userAnswer,
  showAnswer,
  onChange,
}: {
  blank: FillBlank;
  userAnswer: string;
  showAnswer: boolean;
  onChange: (val: string) => void;
}) {
  const isCorrect = userAnswer.trim() === blank.answer || blank.alternatives.includes(userAnswer.trim());
  const showCorrectness = userAnswer.trim() !== '';

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-sm text-slate-500 font-mono">{blank.hint}</span>
      <input
        type="text"
        value={userAnswer}
        onChange={e => onChange(e.target.value)}
        placeholder="在此输入..."
        className={`flex-1 bg-slate-900 border rounded px-2 py-0.5 text-sm font-mono focus:outline-none ${
          showCorrectness && isCorrect
            ? 'border-emerald-500 text-emerald-300'
            : showCorrectness
              ? 'border-red-500 text-red-300'
              : 'border-slate-600 text-slate-200 focus:border-emerald-500'
        }`}
      />
      {showAnswer && (
        <span className="text-xs text-emerald-400 font-mono whitespace-nowrap">
          → {blank.answer}
        </span>
      )}
    </div>
  );
}
