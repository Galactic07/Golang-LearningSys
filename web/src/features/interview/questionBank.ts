// 面试题目数据结构
export interface InterviewQuestionData {
  id: string;
  domain: number;
  level: number;
  question: string;
  referenceAnswer: string;
  keywords: string[];
}

// 面试题库
export const INTERVIEW_QUESTIONS: InterviewQuestionData[] = [
  // ========== Domain 1 - Go 语言基础 (6题) ==========
  {
    id: 'i-1-1',
    domain: 1,
    level: 1,
    question: 'Go 语言中指针和 C 语言的指针有什么区别？',
    referenceAnswer: 'Go 指针不支持算术运算，不能进行指针偏移或指针加减，这避免了缓冲区溢出等内存安全问题。Go 指针有 nil 安全保护，访问 nil 指针会触发 panic 而非未定义行为。Go 的指针主要用于传引用和修改原值，不能像 C 那样通过指针操作底层内存布局。',
    keywords: ['指针', '算术运算', 'nil', '安全', 'panic', '引用'],
  },
  {
    id: 'i-1-2',
    domain: 1,
    level: 1,
    question: 'Go 语言中 make 和 new 的区别是什么？各自适用于什么场景？',
    referenceAnswer: 'new 返回指向类型的指针（*T），只分配零值内存，适用于值类型如 struct。make 只用于 slice、map、channel 三种引用类型的初始化，返回的是初始化后的值（非指针），且可以设置初始大小等参数。make 在分配的同时会进行内部数据结构的初始化。',
    keywords: ['make', 'new', '指针', '初始化', 'slice', 'map', 'channel'],
  },
  {
    id: 'i-1-3',
    domain: 1,
    level: 2,
    question: 'Go 的 defer 语句的执行顺序是怎样的？有什么典型应用场景？',
    referenceAnswer: 'defer 采用后进先出（LIFO）的执行顺序，多个 defer 会压入栈中，在函数返回前依次弹出执行。defer 的参数在注册时求值，而非执行时求值。典型场景包括：释放锁、关闭文件句柄、关闭数据库连接、恢复 panic、记录函数执行耗时等。',
    keywords: ['defer', 'LIFO', '后进先出', '资源释放', '栈', '求值时机'],
  },
  {
    id: 'i-1-4',
    domain: 1,
    level: 2,
    question: 'Go 的接口（interface）是如何实现多态的？空接口有什么用途？',
    referenceAnswer: 'Go 的接口采用鸭子类型（duck typing），即类型无需显式声明实现某个接口，只要实现了接口定义的所有方法就自动满足该接口。接口值由动态类型和动态值两部分组成。空接口 interface{} 可以持有任何类型的值，常用于泛型容器、任意类型参数、类型断言等场景。',
    keywords: ['接口', '多态', '鸭子类型', '空接口', '类型断言', '动态类型'],
  },
  {
    id: 'i-1-5',
    domain: 1,
    level: 3,
    question: 'Go 的 slice 底层数据结构是什么？slice 扩容的机制是怎样的？',
    referenceAnswer: 'slice 底层由 runtime 的 slice 结构体表示，包含三个字段：指向底层数组的指针 ptr、长度 len、容量 cap。扩容时，如果新长度不超过原容量，直接扩展 len；否则分配新数组并拷贝数据。扩容策略：容量小于 256 时翻倍，大于 256 时按约 1.25 倍增长，针对不同元素类型有内存对齐优化。',
    keywords: ['slice', '扩容', '底层数组', '指针', 'len', 'cap', '内存对齐'],
  },
  {
    id: 'i-1-6',
    domain: 1,
    level: 4,
    question: 'Go 的 select 语句中，如果多个 case 同时满足条件会怎样？select 的底层实现原理是什么？',
    referenceAnswer: '多个 case 同时满足时，Go 会通过伪随机算法公平选择一个执行，避免饥饿。select 的底层实现主要涉及 runtime.selectgo 函数，它会对所有 case 加锁、遍历轮询、注册到 channel 的收发队列中等待唤醒。select 涉及复杂的调度逻辑，包括按随机顺序轮询 channel、处理 default 分支、阻塞与唤醒 goroutine 等。',
    keywords: ['select', '随机', 'channel', 'runtime', '调度', 'goroutine', '加锁'],
  },

  // ========== Domain 2 - 并发编程 (6题) ==========
  {
    id: 'i-2-1',
    domain: 2,
    level: 1,
    question: 'goroutine 和操作系统线程有什么区别？为什么 goroutine 更轻量？',
    referenceAnswer: 'goroutine 是 Go 运行时管理的用户态协程，初始栈只有 2-4KB，而线程的栈通常为 1MB。goroutine 的创建和切换由 Go 运行时调度，不涉及系统调用，切换成本极低。goroutine 通过 GMP 模型实现 M:N 调度，将大量 goroutine 映射到少量 OS 线程上执行。',
    keywords: ['goroutine', '线程', '轻量', 'GMP', '调度', '协程', '栈'],
  },
  {
    id: 'i-2-2',
    domain: 2,
    level: 1,
    question: 'Go 的 channel 有无缓冲和有缓冲有什么区别？使用上有什么注意事项？',
    referenceAnswer: '无缓冲 channel 要求发送和接收同时准备好，否则阻塞，用于同步通信。有缓冲 channel 在缓冲区满之前发送不阻塞，在缓冲区空之前接收不阻塞。注意事项：channel 关闭后不能再发送数据，但可以继续接收剩余数据；向已关闭的 channel 发送会 panic；channel 需要由发送方关闭。',
    keywords: ['channel', '无缓冲', '有缓冲', '阻塞', '同步', '关闭', 'panic'],
  },
  {
    id: 'i-2-3',
    domain: 2,
    level: 2,
    question: 'Go 的 sync.WaitGroup 是如何工作的？使用时有哪些常见陷阱？',
    referenceAnswer: 'WaitGroup 维护一个内部计数器，Add 方法增加计数，Done 方法减少计数（等价于 Add(-1)），Wait 方法阻塞直到计数器归零。常见陷阱：Add 调用位置错误（应该在 goroutine 外部调用而非内部）；在 goroutine 中调用 Add 可能造成竞态条件；Done 调用不足导致死锁；Done 调用过多导致负数 panic。',
    keywords: ['WaitGroup', '计数器', 'Add', 'Done', 'Wait', '阻塞', '竞态'],
  },
  {
    id: 'i-2-4',
    domain: 2,
    level: 2,
    question: 'Go 中如何优雅地取消多个正在运行的 goroutine？请列出至少两种方式。',
    referenceAnswer: '方式一：使用 context.WithCancel，通过调用 cancel 函数广播取消信号，goroutine 监听 ctx.Done() 来退出。方式二：使用关闭 channel 广播，关闭的 channel 会立即返回零值，所有监听该 channel 的 goroutine 可同时收到退出信号。推荐使用 context 方式，因为它支持层级取消和超时控制。',
    keywords: ['context', '取消', 'goroutine', 'channel', 'ctx.Done', 'cancel', '广播'],
  },
  {
    id: 'i-2-5',
    domain: 2,
    level: 3,
    question: 'Go 的 sync.Map 相比加锁的 map 有什么优势和劣势？适用于什么场景？',
    referenceAnswer: 'sync.Map 适合读多写少的场景，通过读写分离和双 map 设计（read map + dirty map）减少锁竞争。读操作优先从 read map 无锁读取，miss 多次后会将 dirty map 提升为 read map。劣势：写多场景性能反而不如 map+sync.RWMutex；类型不安全需使用 interface{}；没有 len 和 range 等内置操作。',
    keywords: ['sync.Map', '读写分离', 'read map', 'dirty map', '无锁', '性能'],
  },
  {
    id: 'i-2-6',
    domain: 2,
    level: 4,
    question: 'Go 的 GMP 调度模型中 G、M、P 各自的作用是什么？工作窃取（work stealing）是如何实现的？',
    referenceAnswer: 'G 代表 goroutine，包含栈、上下文等信息。M 代表机器线程（machine），负责执行 G。P 代表逻辑处理器（processor），是 G 和 M 之间的调度上下文。每个 P 维护一个本地 runqueue。工作窃取：当某个 P 的本地队列为空时，它会随机从其他 P 的本地队列尾部窃取一半 G，实现负载均衡。全局队列用于存放长时间未调度的 G。',
    keywords: ['GMP', 'goroutine', '处理器', '线程', '工作窃取', '调度', 'runqueue'],
  },

  // ========== Domain 3 - 运行时与性能 (4题) ==========
  {
    id: 'i-3-1',
    domain: 3,
    level: 1,
    question: 'Go 的垃圾回收（GC）是什么？Go 使用了哪种 GC 算法？',
    referenceAnswer: 'Go 使用并发的三色标记-清除（tricolor mark-sweep）GC 算法，采用写屏障（write barrier）来实现并发标记。GC 分为四个阶段：标记准备、并发标记、标记终止、并发清除。Go 1.5 之后 GC 延迟大幅降低，通常在毫秒级别。',
    keywords: ['GC', '垃圾回收', '三色标记', '写屏障', '并发', '延迟'],
  },
  {
    id: 'i-3-2',
    domain: 3,
    level: 2,
    question: 'Go 中如何检测和定位数据竞态（data race）？有哪些预防手段？',
    referenceAnswer: '使用 go run -race 或 go build -race 开启竞态检测器，运行时会监控对共享内存的并发访问。预防手段：使用 channel 进行通信而非共享内存；使用 sync.Mutex 或 sync.RWMutex 保护临界区；使用 atomic 原子操作；尽量减少共享可变状态；使用 immutable 数据模式。',
    keywords: ['data race', '竞态', '-race', 'mutex', 'atomic', 'channel', '检测'],
  },
  {
    id: 'i-3-3',
    domain: 3,
    level: 2,
    question: 'Go 的逃逸分析（escape analysis）是什么？逃逸到堆上会有什么影响？',
    referenceAnswer: '逃逸分析是 Go 编译器在编译阶段确定变量分配位置（栈或堆）的优化技术。如果变量在函数返回后仍被引用（如返回指针、闭包捕获），则逃逸到堆上。堆分配会增加 GC 压力，影响性能。常见的逃逸场景：返回局部变量指针、将变量存入 interface{}、闭包引用外部变量、发送指针到 channel。',
    keywords: ['逃逸分析', '栈', '堆', 'GC', '编译器', '优化'],
  },
  {
    id: 'i-3-4',
    domain: 3,
    level: 3,
    question: 'Go 的性能调优工具有哪些？分别适用于什么场景？',
    referenceAnswer: 'pprof：CPU 分析、内存分析、阻塞分析、互斥锁分析，通过 import _ "net/http/pprof" 或测试工具启用。trace：追踪 goroutine 调度、GC 事件、网络轮询等，使用 go tool trace 查看。benchmark：使用 testing.B 进行基准测试，go test -bench 运行。此外还有 GC 日志（GODEBUG=gctrace=1）和 flamegraph 火焰图可视化。',
    keywords: ['pprof', 'trace', 'benchmark', '火焰图', '性能调优', 'CPU', '内存'],
  },

  // ========== Domain 4 - 工程实践 (4题) ==========
  {
    id: 'i-4-1',
    domain: 4,
    level: 1,
    question: 'Go 中的包管理机制是怎样的？Go module 是如何解决依赖问题的？',
    referenceAnswer: 'Go module 从 1.11 版本引入，是官方依赖管理方案。通过 go.mod 文件声明模块路径和依赖版本，使用语义化版本（semver）管理依赖。go.sum 文件记录依赖的哈希值确保安全性。常用命令：go mod init 初始化、go mod tidy 整理依赖、go mod vendor 生成 vendor 目录、go get 添加更新依赖。',
    keywords: ['module', 'go.mod', '依赖管理', 'semver', 'go.sum', 'vendor'],
  },
  {
    id: 'i-4-2',
    domain: 4,
    level: 2,
    question: 'Go 的测试体系包括哪些层次？如何编写表驱动测试（table-driven test）？',
    referenceAnswer: 'Go 测试体系包括：单元测试（testing.T）、基准测试（testing.B）、示例测试（Example）、模糊测试（testing.F）。表驱动测试是 Go 的惯用模式，定义测试用例结构体切片，遍历执行各个用例。每个用例包含输入、期望输出和可选的名称，配合 t.Run 子测试可单独运行用例。',
    keywords: ['测试', '表驱动', 'testing', '单元测试', '基准测试', '子测试'],
  },
  {
    id: 'i-4-3',
    domain: 4,
    level: 2,
    question: 'Go 中错误处理的最佳实践是什么？如何处理和区分不同类型的错误？',
    referenceAnswer: 'Go 通过返回 error 类型处理错误，不使用异常机制。最佳实践：错误应尽早检查处理；使用 errors.Is 和 errors.As 进行错误链判断和类型断言；使用 fmt.Errorf + %w 包装错误以保留上下文；定义哨兵错误（sentinel error）用 var 声明；区分业务错误和系统错误，对调用方透明。避免滥用 panic/recover，仅在真正异常时使用。',
    keywords: ['error', '错误处理', 'errors.Is', 'errors.As', '哨兵错误', 'panic'],
  },
  {
    id: 'i-4-4',
    domain: 4,
    level: 3,
    question: 'Go 项目中如何设计合理的分层架构？常用的项目布局模式有哪些？',
    referenceAnswer: '常见分层：handler（HTTP 处理器）→ service（业务逻辑）→ repository（数据访问）。常用布局：标准项目布局（cmd/internal/pkg），六边形架构（端口适配器），DDD 分层架构。核心原则是依赖反转，上层依赖接口而非具体实现。避免循环依赖，通过接口隔离和依赖注入解耦。',
    keywords: ['分层架构', '依赖注入', '接口', '六边形架构', 'DDD', '解耦'],
  },

  // ========== Domain 5 - 微服务与 RPC (4题) ==========
  {
    id: 'i-5-1',
    domain: 5,
    level: 1,
    question: 'Go 中常用的微服务框架有哪些？它们各自的优缺点是什么？',
    referenceAnswer: 'Go 生态常见微服务框架：Go Kit（偏重架构设计，支持多种协议和中间件）、Micro（完整的微服务平台，含服务发现、API 网关）、Kratos（B站开源，面向云原生）、Hertz（字节跳动，高性能 HTTP 框架）。Go Kit 优点灵活可插拔，缺点学习曲线陡。Kratos 中文文档丰富，开箱即用。',
    keywords: ['微服务', 'Go Kit', 'Kratos', 'Micro', 'Hertz', '框架'],
  },
  {
    id: 'i-5-2',
    domain: 5,
    level: 2,
    question: 'gRPC 的工作原理是什么？protobuf 相比 JSON 有什么优势？',
    referenceAnswer: 'gRPC 基于 HTTP/2 协议，使用 protobuf 序列化。HTTP/2 支持多路复用、头部压缩、服务端推送。protobuf 优势：二进制编码体积小（约 JSON 的 1/10）、解析速度快、强类型约束、向后兼容好、自动生成代码。gRPC 支持四种通信模式：一元调用、服务端流式、客户端流式、双向流式。',
    keywords: ['gRPC', 'HTTP/2', 'protobuf', '序列化', '流式', 'IDL'],
  },
  {
    id: 'i-5-3',
    domain: 5,
    level: 2,
    question: '微服务架构中服务发现有哪些实现方式？Go 中如何集成？',
    referenceAnswer: '服务发现方式：客户端发现（Client-Side Discovery）和服务端发现（Server-Side Discovery）。注册中心方案包括 Consul、etcd、ZooKeeper、Eureka。Go 中可用 go-micro 的 registry 组件、Consul API 客户端直接操作、Kratos 内置的 discovery 模块。核心操作包括服务注册、健康检查、服务查询、监听变更。',
    keywords: ['服务发现', 'Consul', 'etcd', '注册中心', '健康检查', 'go-micro'],
  },
  {
    id: 'i-5-4',
    domain: 5,
    level: 3,
    question: '如何在 Go 中实现分布式链路追踪？OpenTelemetry 的基本用法是什么？',
    referenceAnswer: 'OpenTelemetry 是 CNCF 的可观测性标准。在 Go 中使用：安装 otel SDK 和 exporter，初始化 tracer provider，在请求入口创建 span，在跨服务调用时透传 context 和 trace header。常见 exporter：Jaeger、Zipkin、Prometheus。关键概念：Trace（完整调用链）、Span（单个操作单元）、SpanContext（传播上下文）。',
    keywords: ['链路追踪', 'OpenTelemetry', 'Trace', 'Span', 'Jaeger', '可观测性'],
  },

  // ========== Domain 6 - 数据与存储 (3题) ==========
  {
    id: 'i-6-1',
    domain: 6,
    level: 1,
    question: 'Go 中 database/sql 标准库如何使用？连接池是如何管理的？',
    referenceAnswer: '使用 sql.Open 创建数据库连接，指定驱动名和数据源。通过 db.Query 查询、db.Exec 执行增删改。连接池由 sql.DB 管理，提供了 SetMaxOpenConns（最大打开连接数）、SetMaxIdleConns（最大空闲连接数）、SetConnMaxLifetime（连接最大存活时间）三个配置方法。合理的连接池配置能有效提升数据库访问性能。',
    keywords: ['database/sql', '连接池', 'sql.Open', 'Query', 'Exec', 'MaxOpenConns'],
  },
  {
    id: 'i-6-2',
    domain: 6,
    level: 2,
    question: 'Go 中如何实现数据库迁移（migration）？常用的迁移工具是什么？',
    referenceAnswer: '数据库迁移用于版本化管理数据库 schema 变更。常用工具：golang-migrate/migrate（支持多种数据库、CLI 和代码两种方式）、goose（基于时间戳的迁移）、ent（代码生成 ORM 自带迁移）。迁移文件包含 up（升级）和 down（回滚）脚本，通过顺序版本号或时间戳保证执行顺序。',
    keywords: ['迁移', 'migration', 'golang-migrate', 'goose', 'ent', 'schema'],
  },
  {
    id: 'i-6-3',
    domain: 6,
    level: 3,
    question: '在 Go 中如何设计一个缓存系统？如何解决缓存穿透、缓存击穿、缓存雪崩问题？',
    referenceAnswer: '缓存系统设计要点：选择合适的缓存策略（LRU、LFU、TTL）、设置合理的过期时间、使用分布式缓存（Redis/Memcached）。缓存穿透：布隆过滤器或缓存空值。缓存击穿：互斥锁或 singleflight 机制。缓存雪崩：过期时间加随机偏移、多级缓存、限流降级。Go 中可用 singleflight 包防止缓存击穿。',
    keywords: ['缓存', '穿透', '击穿', '雪崩', 'singleflight', '布隆过滤器', 'Redis'],
  },

  // ========== Domain 7 - 云原生 (3题) ==========
  {
    id: 'i-7-1',
    domain: 7,
    level: 1,
    question: 'Docker 容器和虚拟机有什么区别？Go 应用容器化需要注意什么？',
    referenceAnswer: 'Docker 容器共享宿主机内核，通过 namespace 实现隔离，通过 cgroup 限制资源，启动快（毫秒级），体积小（MB 级）。虚拟机包含完整操作系统，由 Hypervisor 管理，启动慢（分钟级），体积大（GB 级）。Go 应用容器化最佳实践：使用多阶段构建减小镜像体积、选择 scratch 或 alpine 基础镜像、设置 CGO_ENABLED=0 以静态编译。',
    keywords: ['Docker', '容器', '虚拟机', '多阶段构建', 'scratch', 'alpine', 'CGO'],
  },
  {
    id: 'i-7-2',
    domain: 7,
    level: 2,
    question: 'Kubernetes 中 Pod、Service、Deployment 三者的关系是什么？',
    referenceAnswer: 'Pod 是最小调度单元，包含一个或多个容器，共享网络和存储。Deployment 负责声明式更新和扩缩容 Pod，支持滚动更新和回滚。Service 提供稳定的网络端点，通过标签选择器关联 Pod，实现负载均衡和服务发现。三者关系：Deployment 管理 Pod 的生命周期，Service 为 Pod 提供稳定的访问入口。',
    keywords: ['Pod', 'Service', 'Deployment', 'Kubernetes', '滚动更新', '负载均衡'],
  },
  {
    id: 'i-7-3',
    domain: 7,
    level: 3,
    question: '如何在 Kubernetes 上部署 Go 微服务？需要配置哪些关键资源？',
    referenceAnswer: '关键资源包括：Dockerfile（多阶段构建）、Deployment（副本数、资源限制、探针）、Service（ClusterIP/NodePort/LoadBalancer）、ConfigMap 和 Secret（配置管理）、Ingress（路由和 TLS）、HPA（水平自动扩缩容）。探针配置：livenessProbe（存活检查）、readinessProbe（就绪检查）、startupProbe（启动检查）。HPA 基于 CPU/内存或自定义指标自动扩缩。',
    keywords: ['Kubernetes', 'Deployment', 'Service', '探针', 'HPA', 'ConfigMap'],
  },

  // ========== Domain 8 - 系统设计 (3题) ==========
  {
    id: 'i-8-1',
    domain: 8,
    level: 2,
    question: '如何设计一个高性能的 HTTP API 网关？需要考虑哪些关键点？',
    referenceAnswer: '关键设计点：路由转发（前缀匹配、正则匹配）、请求限流（令牌桶、漏桶算法）、熔断降级（熔断器模式）、认证鉴权（JWT/OAuth2）、请求响应转换、协议转换（HTTP/gRPC）、负载均衡、日志和监控。Go 中可用 go-zero 的网关组件或基于 Gin/HTTP 中间件链实现。高可用方案需支持无状态水平扩展。',
    keywords: ['API 网关', '限流', '熔断', '路由', '中间件', '高可用'],
  },
  {
    id: 'i-8-2',
    domain: 8,
    level: 3,
    question: '设计一个支持百万连接的即时通讯（IM）系统，Go 如何实现？',
    referenceAnswer: '架构分层：接入层（WebSocket/TCP 长连接管理）、逻辑层（消息路由、离线存储）、存储层（消息持久化）。Go 实现要点：每个连接使用 goroutine 管理，利用 channel 做消息分发；使用 epoll/kqueue 实现 I/O 多路复用；Redis Pub/Sub 做水平扩展消息广播；分库分表存储历史消息。心跳检测处理断连和重连。',
    keywords: ['IM', 'WebSocket', '长连接', 'goroutine', 'epoll', '消息队列', 'Redis'],
  },
  {
    id: 'i-8-3',
    domain: 8,
    level: 4,
    question: '设计一个分布式任务调度系统，如何处理任务依赖、失败重试和幂等性？',
    referenceAnswer: '核心组件：调度器（cron 表达式 + DAG 依赖图）、执行器（worker 池）、存储（任务元数据、执行记录）。任务依赖通过 DAG 拓扑排序确定执行顺序。失败重试：指数退避策略、最大重试次数、死信队列。幂等性：全局唯一任务 ID、记录执行状态（待执行/执行中/成功/失败）、乐观锁防重复执行。Go 中可用 asynq 或 machinery 库作为基础。',
    keywords: ['任务调度', 'DAG', '幂等', '重试', '指数退避', 'asynq', '分布式'],
  },
];