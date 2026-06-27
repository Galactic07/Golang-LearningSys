import { get, set, del, keys, clear, createStore } from 'idb-keyval';

const quizStore = createStore('gomaster-quiz', 'progress');
const syncStore = createStore('gomaster-sync', 'queue');

// 刷题进度缓存
export const progressCache = {
  async get(key: string) { return get(key, quizStore); },
  async set(key: string, value: any) { return set(key, value, quizStore); },
  async delete(key: string) { return del(key, quizStore); },
  async keys() { return keys(quizStore); },
  async clear() { return clear(quizStore); },
};

// 同步队列
export interface SyncAction {
  id: string;
  type: 'update-progress' | 'create-interview' | 'update-config';
  payload: any;
  createdAt: string;
  retryCount: number;
}

export const syncQueue = {
  async push(action: Omit<SyncAction, 'id' | 'createdAt' | 'retryCount'>) {
    const all = await this.getAll();
    const newAction: SyncAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    all.push(newAction);
    await set('queue', all, syncStore);
    return newAction;
  },

  async getAll(): Promise<SyncAction[]> {
    return (await get('queue', syncStore)) || [];
  },

  async remove(id: string) {
    const all = await this.getAll();
    await set('queue', all.filter(a => a.id !== id), syncStore);
  },

  async clear() { return clear(syncStore); },

  async incrementRetry(id: string) {
    const all = await this.getAll();
    const item = all.find(a => a.id === id);
    if (item) {
      item.retryCount++;
      await set('queue', all, syncStore);
    }
  },

  async size(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  },
};

// 检测在线状态
export function isOnline(): boolean {
  return navigator.onLine;
}

// 监听在线状态变化
export function onOnlineChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
