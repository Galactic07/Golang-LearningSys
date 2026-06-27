// 学习引擎 - 管理学习进度和状态

import { progressCache } from '../../lib/storage';

export interface CompletedTopic {
  topic: string;
  completedAt: string;
}

/** 获取已完成的 topics */
export async function getCompletedTopics(): Promise<Set<string>> {
  const completed = await progressCache.get('learningCompleted') as CompletedTopic[] || [];
  return new Set(completed.map(c => c.topic));
}

/** 标记某个 topic 为已完成 */
export async function markTopicComplete(topic: string): Promise<void> {
  const completed = await progressCache.get('learningCompleted') as CompletedTopic[] || [];
  if (!completed.find(c => c.topic === topic)) {
    completed.push({ topic, completedAt: new Date().toISOString().slice(0, 10) });
    await progressCache.set('learningCompleted', completed);
  }
}

/** 获取今日完成数 */
export async function getTodayCompletedCount(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const completed = await progressCache.get('learningCompleted') as CompletedTopic[] || [];
  return completed.filter(c => c.completedAt === today).length;
}

/** 获取总完成数 */
export async function getTotalCompletedCount(): Promise<number> {
  const completed = await progressCache.get('learningCompleted') as CompletedTopic[] || [];
  return completed.length;
}
