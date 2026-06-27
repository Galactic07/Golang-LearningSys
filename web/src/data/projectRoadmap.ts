// 项目路线图 - 实战项目列表

export interface Project {
  level: number;
  title: string;
  domain: number;
  description: string;
  deliverable: string;
  tech: string[];
  features: string[];
  duration: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export const PROJECT_ROADMAP: Project[] = [
  {
    level: 1,
    title: 'Go 命令行工具',
    domain: 1,
    description: '实现一个完整的 CLI 工具，掌握 cobra、flag 解析、配置文件读写与日志输出。',
    deliverable: '交付：带子命令、配置文件、日志输出的 CLI 工具',
    tech: ['Go', 'cobra', 'viper', 'logrus'],
    features: ['子命令注册', '配置文件解析', '日志分级输出', '单元测试覆盖'],
    duration: '1-2周',
    status: 'completed',
  },
  {
    level: 2,
    title: '并发爬虫框架',
    domain: 2,
    description: '用 goroutine + channel 实现可配置的爬虫框架，掌握并发模式和速率限制。',
    deliverable: '交付：支持速率限制、结果合并、优雅退出的爬虫',
    tech: ['Go', 'goroutine', 'channel', 'sync', 'rate'],
    features: ['Worker Pool', '速率限制', '结果聚合', '优雅退出'],
    duration: '1-2周',
    status: 'in_progress',
  },
  {
    level: 3,
    title: 'RESTful API 服务',
    domain: 5,
    description: '用 Gin 搭建完整 API 服务，含 JWT 鉴权、GORM 持久化与中间件链。',
    deliverable: '交付：带用户认证的可部署 HTTP API 服务',
    tech: ['Go', 'Gin', 'GORM', 'MySQL', 'JWT'],
    features: ['RESTful 路由', 'JWT 鉴权', 'CRUD 操作', '请求校验', 'Swagger 文档'],
    duration: '2-3周',
    status: 'planned',
  },
  {
    level: 4,
    title: 'gRPC 微服务通信',
    domain: 5,
    description: '用 gRPC + Protocol Buffers 实现跨服务 RPC 通信，含服务注册与发现。',
    deliverable: '交付：基于 gRPC 的双服务通信系统',
    tech: ['Go', 'gRPC', 'Protobuf', 'etcd', 'Docker'],
    features: ['Protobuf 定义', '一元/流式 RPC', '服务注册', '健康检查'],
    duration: '2-3周',
    status: 'planned',
  },
  {
    level: 5,
    title: '分布式任务调度',
    domain: 7,
    description: '基于 Redis 实现分布式任务队列，支持延迟任务、重试、超时与进度追踪。',
    deliverable: '交付：可水平扩展的分布式定时任务系统',
    tech: ['Go', 'Redis', 'Docker', 'K8s'],
    features: ['任务队列', '延迟调度', '失败重试', '进度追踪', '水平扩展'],
    duration: '3-4周',
    status: 'planned',
  },
  {
    level: 6,
    title: '高性能缓存中间件',
    domain: 6,
    description: '实现分布式缓存中间件，支持 LRU 淘汰、TTL、持久化与一致性哈希。',
    deliverable: '交付：带 REST API 的分布式缓存服务',
    tech: ['Go', 'Redis', '一致性哈希', 'RocksDB'],
    features: ['LRU 淘汰', 'TTL 过期', 'RDB/AOF 持久化', '一致性哈希集群'],
    duration: '3-4周',
    status: 'planned',
  },
  {
    level: 7,
    title: '可观测性平台',
    domain: 3,
    description: '集成 Metrics + Tracing + Logging，构建完整的可观测性平台。',
    deliverable: '交付：集成 Prometheus + Jaeger + ELK 的可观测性 demo',
    tech: ['Go', 'Prometheus', 'OpenTelemetry', 'Jaeger', 'Grafana'],
    features: ['自定义 Metrics', '分布式追踪', '结构化日志', 'Grafana 仪表盘'],
    duration: '3-4周',
    status: 'planned',
  },
  {
    level: 8,
    title: '系统设计实战',
    domain: 8,
    description: '综合运用所学，设计并实现一个高并发短链接服务或即时通讯系统。',
    deliverable: '交付：完整架构文档 + 可运行的高并发系统',
    tech: ['Go', 'K8s', 'MySQL', 'Redis', 'Kafka', 'gRPC'],
    features: ['架构设计文档', '高并发处理', '数据分片', '容灾与降级', '压测报告'],
    duration: '4-6周',
    status: 'planned',
  },
];