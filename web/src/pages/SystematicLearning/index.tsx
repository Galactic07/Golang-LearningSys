import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ChevronRight, ChevronLeft, CheckCircle2, Zap, BookMarked,
  Code2,
} from 'lucide-react';
import { LEARNING_SEQUENCE, DOMAIN_INTROS } from '../../data/learningSequence';
import { LEARNING_CONTENT } from '../../data/learningContent';
import { getCompletedTopics, markTopicComplete } from '../../features/learning';

type LearningMode = 'express' | 'ultimate';

export default function SystematicLearning() {
  const [searchParams] = useSearchParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [mode, setMode] = useState<LearningMode>('express');
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompletedTopics().then(set => {
      setCompletedTopics(set);
      setLoading(false);
    });
  }, []);

  // URL navigation support
  const topicFromUrl = searchParams.get('topic');
  const domainFromUrl = searchParams.get('domain');

  useEffect(() => {
    if (topicFromUrl) {
      const idx = LEARNING_SEQUENCE.findIndex(s => s.topic === topicFromUrl);
      if (idx >= 0) {
        setCurrentIdx(idx);
        if (domainFromUrl) setSelectedDomain(Number(domainFromUrl));
      }
    }
  }, [topicFromUrl, domainFromUrl]);

  const filteredSequence = useMemo(() => {
    if (!selectedDomain) return LEARNING_SEQUENCE;
    return LEARNING_SEQUENCE.filter(s => s.domain === selectedDomain);
  }, [selectedDomain]);

  const currentItem = filteredSequence[currentIdx];
  const expressContent = currentItem ? LEARNING_CONTENT[currentItem.topic] : null;
  const isCompleted = currentItem ? completedTopics.has(currentItem.topic) : false;

  const handleMarkComplete = useCallback(async () => {
    if (!currentItem || isCompleted) return;
    await markTopicComplete(currentItem.topic);
    setCompletedTopics(prev => new Set([...prev, currentItem.topic]));
    if (currentIdx < filteredSequence.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentItem, isCompleted, currentIdx, filteredSequence.length]);

  const domainKeys = [...new Set(LEARNING_SEQUENCE.map(s => s.domain))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">系统学习</h1>
          <p className="text-slate-400 mt-1">从基础到深入，构建完整的 Go 知识体系</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex bg-slate-800 rounded-full p-0.5">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute inset-y-0.5 rounded-full bg-emerald-600"
              style={mode === 'express' ? { left: '0.125rem', right: '50%' } : { left: '50%', right: '0.125rem' }}
            />
            <button
              onClick={() => setMode('express')}
              className={`relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mode === 'express' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 极速版
            </button>
            <button
              onClick={() => setMode('ultimate')}
              className={`relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mode === 'ultimate' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" /> 终极版
            </button>
          </div>
        </div>
      </div>

      {/* Domain filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedDomain(null); setCurrentIdx(0); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedDomain ? 'bg-emerald-600/30 text-emerald-300' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          全部领域
        </button>
        {domainKeys.map(dk => {
          const info = DOMAIN_INTROS[dk];
          return (
            <button
              key={dk}
              onClick={() => { setSelectedDomain(dk); setCurrentIdx(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedDomain === dk ? 'bg-emerald-600/30 text-emerald-300' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {info?.name || `领域${dk}`}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Sidebar - Topic list */}
        <div className="w-64 shrink-0 space-y-1">
          {filteredSequence.map((item, idx) => {
            const isActive = idx === currentIdx;
            const done = completedTopics.has(item.topic);
            return (
              <button
                key={item.order}
                onClick={() => setCurrentIdx(idx)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/30'
                    : done
                      ? 'text-slate-400 hover:bg-slate-700'
                      : 'text-slate-500 hover:bg-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
                <span className="truncate">{item.topic}</span>
                <span className="ml-auto text-[10px] text-slate-600">{item.domainName}</span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {currentItem && expressContent ? (
            <motion.div
              key={currentItem.topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Domain intro */}
              {selectedDomain && DOMAIN_INTROS[selectedDomain] && (
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Code2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-slate-100">
                      {DOMAIN_INTROS[selectedDomain].name}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">{DOMAIN_INTROS[selectedDomain].description}</p>
                </div>
              )}

              {/* Topic content */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-100">
                    {currentItem.topic}
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded-full">
                    {currentItem.domainName} · Lv{filteredSequence.findIndex(s => s.domain === currentItem.domain) >= 0 ? 1 : 1}
                  </span>
                </div>

                {/* Concept */}
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">概念</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{expressContent.concept}</p>
                </div>

                {/* Code example */}
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">示例</h3>
                  <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-sm text-slate-300 leading-relaxed font-mono">
                    <code>{expressContent.example}</code>
                  </pre>
                </div>

                {/* Key points */}
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">要点</h3>
                  <ul className="space-y-2">
                    {expressContent.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Complete button */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> 上一节
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-emerald-600/20 text-emerald-400 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? '已完成' : '标记完成'}
                  </button>
                  <button
                    onClick={() => setCurrentIdx(Math.min(filteredSequence.length - 1, currentIdx + 1))}
                    disabled={currentIdx >= filteredSequence.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    下一节 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span>学习进度</span>
                  <span>{filteredSequence.filter(s => completedTopics.has(s.topic)).length} / {filteredSequence.length}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(filteredSequence.filter(s => completedTopics.has(s.topic)).length / filteredSequence.length) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
              <BookOpen className="w-12 h-12 mb-4" />
              {currentItem ? (
                <p>「{currentItem.topic}」的学习内容待补充</p>
              ) : (
                <p>暂无学习内容，请选择一个知识点</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}