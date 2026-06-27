// 系统学习 - 学习序列
// 按领域递进排列所有知识点

import { DOMAIN_NAMES } from '../features/interview/types';

export interface SequenceItem {
  domain: number;
  domainName: string;
  topic: string;
  order: number;
}

export const LEARNING_SEQUENCE: SequenceItem[] = [
  // ===== Domain 1: Go 语言基础 =====
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '基本语法', order: 1 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '复合类型', order: 2 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '接口', order: 3 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '错误处理', order: 4 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '泛型', order: 5 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: '反射', order: 6 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: 'unsafe/cgo', order: 7 },
  { domain: 1, domainName: DOMAIN_NAMES[1], topic: 'embed/指令', order: 8 },

  // ===== Domain 2: 并发编程 =====
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: 'goroutine', order: 9 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: 'channel', order: 10 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: 'select', order: 11 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: 'context', order: 12 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: 'sync包', order: 13 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: '并发模式', order: 14 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: '原子操作', order: 15 },
  { domain: 2, domainName: DOMAIN_NAMES[2], topic: '调度器原理', order: 16 },

  // ===== Domain 3: 运行时与性能 =====
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: 'GC基础', order: 17 },
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: '三色标记', order: 18 },
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: '内存分配', order: 19 },
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: 'pprof', order: 20 },
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: 'GMP调度', order: 21 },
  { domain: 3, domainName: DOMAIN_NAMES[3], topic: '性能调优', order: 22 },

  // ===== Domain 4: 工程实践 =====
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: '项目结构', order: 23 },
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: '单元测试', order: 24 },
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: 'mock/bench', order: 25 },
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: 'CI/CD', order: 26 },
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: '代码审查', order: 27 },
  { domain: 4, domainName: DOMAIN_NAMES[4], topic: 'monorepo', order: 28 },

  // ===== Domain 5: 微服务与 RPC =====
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: 'HTTP服务', order: 29 },
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: 'gRPC基础', order: 30 },
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: '流式RPC', order: 31 },
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: '服务发现', order: 32 },
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: '链路追踪', order: 33 },
  { domain: 5, domainName: DOMAIN_NAMES[5], topic: '服务网格', order: 34 },

  // ===== Domain 6: 数据与存储 =====
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: 'database/sql', order: 35 },
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: 'ORM', order: 36 },
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: 'Redis', order: 37 },
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: '分库分表', order: 38 },
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: '缓存策略', order: 39 },
  { domain: 6, domainName: DOMAIN_NAMES[6], topic: '新SQL', order: 40 },

  // ===== Domain 7: 云原生 =====
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: 'Docker', order: 41 },
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: 'K8s核心', order: 42 },
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: 'Helm', order: 43 },
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: 'Operator', order: 44 },
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: 'Terraform', order: 45 },
  { domain: 7, domainName: DOMAIN_NAMES[7], topic: '可观测性', order: 46 },

  // ===== Domain 8: 系统设计 =====
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '分布式理论', order: 47 },
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '一致性算法', order: 48 },
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '消息队列', order: 49 },
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '分布式事务', order: 50 },
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '高可用设计', order: 51 },
  { domain: 8, domainName: DOMAIN_NAMES[8], topic: '设计模式', order: 52 },
];

// 领域信息摘要
export const DOMAIN_INTROS: Record<number, { name: string; description: string; color: string }> = {
  1: { name: 'Go 语言基础', description: '语法、类型系统、接口、泛型、错误处理', color: '#3b82f6' },
  2: { name: '并发编程', description: 'goroutine、channel、sync、context 并发模型', color: '#8b5cf6' },
  3: { name: '运行时与性能', description: 'GC、调度、pprof、内存分配与性能调优', color: '#ef4444' },
  4: { name: '工程实践', description: '项目结构、测试、CI/CD、代码审查', color: '#f59e0b' },
  5: { name: '微服务与 RPC', description: 'HTTP/gRPC 服务、服务发现、链路追踪', color: '#10b981' },
  6: { name: '数据与存储', description: '数据库、缓存、分库分表、分布式存储', color: '#06b6d4' },
  7: { name: '云原生', description: 'Docker、K8s、Helm、Operator、可观测性', color: '#ec4899' },
  8: { name: '系统设计', description: '分布式理论、一致性、消息队列、高可用', color: '#14b8a6' },
};
