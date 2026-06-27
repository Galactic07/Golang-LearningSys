export interface DomainCategory {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  levels: { level: number; name: string; description: string }[];
}

export const DOMAINS: DomainCategory[] = [
  {
    id: 1,
    name: "Go 语言基础",
    icon: "Code2",
    description: "语法、类型系统、接口、泛型、错误处理",
    color: "#3b82f6",
    levels: [
      { level: 1, name: "入门", description: "基本语法和类型" },
      { level: 2, name: "进阶", description: "接口/错误/泛型" },
      { level: 3, name: "深入", description: "反射/unsafe/cgo" },
      { level: 4, name: "精通", description: "编译器指令/内部机制" },
    ],
  },
  {
    id: 2,
    name: "并发编程",
    icon: "Zap",
    description: "goroutine、channel、sync、context",
    color: "#8b5cf6",
    levels: [
      { level: 1, name: "入门", description: "goroutine/channel" },
      { level: 2, name: "进阶", description: "select/context/sync" },
      { level: 3, name: "深入", description: "并发模式/原子操作" },
      { level: 4, name: "精通", description: "GMP调度器/数据竞争" },
    ],
  },
  {
    id: 3,
    name: "运行时与性能",
    icon: "Cpu",
    description: "GC、调度、pprof、内存分配",
    color: "#ef4444",
    levels: [
      { level: 1, name: "入门", description: "GC概念/pprof入门" },
      { level: 2, name: "进阶", description: "三色标记/内存分配" },
      { level: 3, name: "深入", description: "GMP调度/逃逸分析" },
      { level: 4, name: "精通", description: "运行时源码/调优" },
    ],
  },
  {
    id: 4,
    name: "工程实践",
    icon: "Wrench",
    description: "测试、CI/CD、项目结构、代码审查",
    color: "#f59e0b",
    levels: [
      { level: 1, name: "入门", description: "项目结构/mod/基础测试" },
      { level: 2, name: "进阶", description: "表驱动/mock/benchmark" },
      { level: 3, name: "深入", description: "代码审查/lint" },
      { level: 4, name: "精通", description: "大型工程化/monorepo" },
    ],
  },
  {
    id: 5,
    name: "微服务与 RPC",
    icon: "Globe",
    description: "gRPC、服务发现、链路追踪、中间件",
    color: "#06b6d4",
    levels: [
      { level: 1, name: "入门", description: "HTTP服务/gin" },
      { level: 2, name: "进阶", description: "gRPC/Protobuf/中间件" },
      { level: 3, name: "深入", description: "服务发现/链路追踪" },
      { level: 4, name: "精通", description: "服务网格/灰度发布" },
    ],
  },
  {
    id: 6,
    name: "数据与存储",
    icon: "Database",
    description: "SQL、Redis、ORM、缓存策略",
    color: "#10b981",
    levels: [
      { level: 1, name: "入门", description: "database/sql/Redis" },
      { level: 2, name: "进阶", description: "GORM/sqlx/连接池" },
      { level: 3, name: "深入", description: "分库分表/缓存策略" },
      { level: 4, name: "精通", description: "时序数据库/新SQL" },
    ],
  },
  {
    id: 7,
    name: "云原生",
    icon: "Cloud",
    description: "Docker、K8s、Helm、Terraform",
    color: "#0ea5e9",
    levels: [
      { level: 1, name: "入门", description: "Docker基础/多阶段构建" },
      { level: 2, name: "进阶", description: "K8s核心资源/部署" },
      { level: 3, name: "深入", description: "Helm/Operator/Terraform" },
      { level: 4, name: "精通", description: "平台工程/IDP" },
    ],
  },
  {
    id: 8,
    name: "系统设计",
    icon: "Layout",
    description: "分布式、MQ、高可用、架构模式",
    color: "#ec4899",
    levels: [
      { level: 1, name: "入门", description: "设计模式/RESTful" },
      { level: 2, name: "进阶", description: "分布式基础/CAP" },
      { level: 3, name: "深入", description: "MQ/事件驱动/CQRS" },
      { level: 4, name: "精通", description: "高可用/限流降级" },
    ],
  },
];
