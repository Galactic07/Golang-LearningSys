// 系统学习 - 极速版知识点讲解

export interface LearnContent {
  concept: string;
  example: string;
  points: string[];
}

// 极速版学习内容
export const LEARNING_CONTENT: Record<string, LearnContent> = {
  // ===== Domain 1: Go 语言基础 =====
  '基本语法': {
    concept: 'Go 语言中，make 和 new 都是内建的内存分配函数。make 用于创建 slice、map 和 channel，返回初始化后的引用类型值。new 分配零值内存，返回指向类型的指针。',
    example: '// make 示例\ns := make([]int, 0, 10)  // slice，len=0, cap=10\nm := make(map[string]int)  // map\nc := make(chan int, 5)     // channel，缓冲大小为5\n\n// new 示例\np := new(int)    // *int，指向 0\n// 等价于 var x int; p := &x\n\nt := new(struct{ Name string }) // *struct{ Name string }',
    points: [
      'make 只能用于 slice/map/channel 三种引用类型',
      'new 可用于任何类型，返回指针 (*T)',
      'make 返回初始化后的值（非零值），new 返回零值指针',
      'defer 按后进先出 (LIFO) 顺序执行',
      'defer 参数在声明时求值，而非执行时',
      'defer 常用于资源释放、锁释放、recover 等场景',
    ],
  },
  '复合类型': {
    concept: 'Go 的复合类型包括数组、切片、映射和结构体。数组是固定长度的值类型，切片是动态长度的引用类型。',
    example: '// 数组 - 值类型\nvar arr [3]int = [3]int{1,2,3}\narr2 := [...]int{1,2,3}  // 编译器推导长度\n\n// 切片 - 引用类型\ns := []int{1,2,3}\ns = append(s, 4)\n// 切片底层结构：ptr + len + cap\n\n// 映射\nm := map[string]int{"a": 1}\nv, ok := m["b"]  // ok 判断键是否存在\n\n// 结构体\ntype User struct {\n    Name string\n    Age  int\n}',
    points: [
      '数组是值类型，赋值或传参会拷贝整个数组',
      '切片是引用类型，共享底层数组',
      '切片的零值是 nil，nil slice 的 len=0, cap=0',
      'map 的键必须是可比较类型（不可用 slice/map/function 作 key）',
      '结构体字段的零值取决于字段类型',
    ],
  },
  '接口': {
    concept: 'Go 接口是一组方法签名集合，采用隐式实现——类型只需实现接口的方法即可。接口底层实现分为 iface（带方法）和 eface（空接口）两种。',
    example: 'type Writer interface {\n    Write(p []byte) (n int, err error)\n}\n\n// 隐式实现：类型自动满足接口\ntype File struct{}\nfunc (f *File) Write(p []byte) (int, error) {\n    return len(p), nil\n}\n\nvar w Writer = &File{}  // 隐式转换\n\n// 空接口可以持有任何类型\nvar any interface{} = 42',
    points: [
      'Go 接口采用隐式实现（duck typing），无需 implements 关键字',
      'eface = type + data 指针，iface = itab + data 指针',
      'itab 缓存了接口类型与具体类型的映射关系',
      '类型断言：v, ok := x.(SomeType)',
      'type switch：switch v := x.(type)',
    ],
  },
  '错误处理': {
    concept: 'Go 通过多返回值返回错误。error 是一个内建接口，panic/recover 用于不可恢复的错误。Go 1.13 引入了错误链 (errors.Is/As)。',
    example: '// 标准错误模式\nfunc divide(a, b int) (int, error) {\n    if b == 0 {\n        return 0, errors.New("除数不能为0")\n    }\n    return a / b, nil\n}\n\n// 错误包装 (Go 1.13+)\nif err != nil {\n    return fmt.Errorf("执行失败: %w", err)\n}\n\n// 错误链检查\nif errors.Is(err, os.ErrNotExist) { ... }\n\n// 类型判断\nvar netErr net.Error\nif errors.As(err, &netErr) { ... }\n\n// panic/recover\nfunc safe() {\n    defer func() {\n        if r := recover(); r != nil {\n            log.Printf("recovered: %v", r)\n        }\n    }()\n    panic("something wrong")\n}',
    points: [
      'errors.Is 检查错误链中是否包含特定错误',
      'errors.As 将错误链中的错误转换为特定类型',
      'fmt.Errorf 中用 %w 创建包装错误',
      'panic 只在真正不可恢复时使用（如初始化失败）',
      'recover 只有 defer 中调用才有效',
    ],
  },
  '泛型': {
    concept: 'Go 1.18 引入泛型。支持类型参数、类型约束和类型推断。常用于容器类型、集合操作和通用算法。',
    example: '// 泛型函数\nfunc Map[T any, U any](s []T, f func(T) U) []U {\n    result := make([]U, len(s))\n    for i, v := range s {\n        result[i] = f(v)\n    }\n    return result\n}\n\n// 泛型类型\ntype Stack[T any] struct {\n    items []T\n}\n\nfunc (s *Stack[T]) Push(item T) {\n    s.items = append(s.items, item)\n}\n\n// 类型约束\ntype Comparable interface {\n    ~int | ~string | float64\n    // 或使用 constraints.Ordered\n}',
    points: [
      '类型参数用方括号声明：func F[T any](t T)',
      'any 是 interface{} 的别名',
      'constraints 包提供常用约束（Ordered 等）',
      '泛型不会影响运行时性能（单态化）',
      '方法不能有额外的类型参数',
    ],
  },
  '反射': {
    concept: 'reflect 包提供了运行时检查类型和值的能力。核心 API 是 reflect.TypeOf 和 reflect.ValueOf。',
    example: 'import "reflect"\n\nfunc inspect(v any) {\n    t := reflect.TypeOf(v)    // 获取类型\n    val := reflect.ValueOf(v) // 获取值\n    \n    fmt.Println(t.Name(), t.Kind())\n    \n    // 修改值（需要传入指针）\n    if val.Kind() == reflect.Ptr {\n        val.Elem().SetInt(42)\n    }\n}',
    points: [
      'reflect.TypeOf 返回静态类型信息',
      'reflect.ValueOf 返回运行时值',
      'Kind() 返回底层类型（int/slice/struct 等）',
      '使用反射可以动态调用方法、读写结构体字段',
      '反射有运行时性能开销，非必要不使用',
    ],
  },
  'unsafe/cgo': {
    concept: 'unsafe 包提供绕过 Go 类型安全的操作，cgo 允许 Go 调用 C 代码。两者都是高级特性，仅在必要时使用。',
    example: 'import "unsafe"\n\n// 指针运算\narr := [4]int{1,2,3,4}\np := unsafe.Pointer(&arr[0])\n// 将指针偏移到下一个元素\nnext := (*int)(unsafe.Pointer(uintptr(p) + unsafe.Sizeof(arr[0])))\n\n// cgo 示例\n/*\n#include <stdlib.h>\n*/\nimport "C"\n\nfunc main() {\n    cstr := C.CString("hello")\n    defer C.free(unsafe.Pointer(cstr))\n}',
    points: [
      'unsafe.Pointer 是通用指针类型，类似 C 的 void*',
      'uintptr 是整数类型，GC 不追踪',
      'cgo 调用有性能开销，批量调用时注意',
      'cgo 需要安装交叉编译工具链',
      '不推荐在日常业务代码中使用 unsafe',
    ],
  },
  'embed/指令': {
    concept: '//go:embed 指令在编译时将文件嵌入到二进制中。编译器指令如 //go:noinline 控制编译器行为。',
    example: 'import (\n    _ "embed"\n)\n\n//go:embed config.yaml\nvar configData []byte\n\n//go:embed templates/*\nvar templateFS embed.FS\n\n//go:embed static/*.html\nvar staticHTML embed.FS\n\n// 编译器指令\n//go:noinline\nfunc slowFunc() {}',
    points: [
      '//go:embed 在编译时嵌入，运行时文件必须存在',
      '支持 []byte、string、embed.FS 三种类型',
      '//go:noinline 阻止函数内联优化',
      '//go:nosplit 禁用栈溢出检测',
    ],
  },

  // ===== Domain 2: 并发编程 =====
  'goroutine': {
    concept: 'goroutine 是 Go 的轻量级线程，由 Go 运行时管理。创建开销极小（约 4KB 栈），可轻松创建数十万 goroutine。',
    example: '// 启动 goroutine\ngo func() {\n    fmt.Println("hello from goroutine")\n}()\n\n// 等待完成\nvar wg sync.WaitGroup\nfor i := 0; i < 10; i++ {\n    wg.Add(1)\n    go func(id int) {\n        defer wg.Done()\n        fmt.Println(id)\n    }(i)\n}\nwg.Wait()',
    points: [
      'goroutine 初始栈约 4KB，可动态扩缩',
      '由 GMP 调度器管理，M 对 OS 线程',
      '不要用 unsafe 或反射操作 goroutine 栈',
      'goroutine 泄漏是常见的并发 bug',
    ],
  },
  'channel': {
    concept: 'channel 是 goroutine 之间的通信管道，遵循 CSP 模型。有缓冲和无缓冲两种模式。',
    example: '// 无缓冲 channel\nch := make(chan int)\n\ngo func() {\n    ch <- 42  // 发送，阻塞直到接收方就绪\n}()\n\nval := <-ch  // 接收，阻塞直到有数据发送\n\n// 缓冲 channel\nbufCh := make(chan string, 3)\nbufCh <- "a"\nbufCh <- "b"  // 缓冲未满时不阻塞\n\n// 关闭 channel\nclose(ch)\n// 使用 range 遍历\nfor v := range ch {\n    fmt.Println(v)\n}',
    points: [
      '无缓冲 channel 同步通信，发/收双方必须同时就绪',
      '缓冲 channel 在缓冲不满时不阻塞发送',
      '关闭后的 channel 可继续读取剩余数据',
      '向已关闭的 channel 发送会 panic',
      'nil channel 永远阻塞',
    ],
  },
  'select': {
    concept: 'select 同时监听多个 channel 操作，类似于 switch，用于实现超时控制和多路复用。',
    example: 'select {\ncase v := <-ch1:\n    fmt.Println("ch1:", v)\ncase v := <-ch2:\n    fmt.Println("ch2:", v)\ncase <-time.After(1 * time.Second):\n    fmt.Println("超时")\ndefault:\n    fmt.Println("无 channel 就绪")\n}',
    points: [
      'select 随机选择就绪的 case（多个同时就绪时）',
      '所有 channel 都不就绪时，有 default 就走 default',
      '无 default 且所有 channel 阻塞时，select 也阻塞',
      'nil channel 在 select 中永远不会被选中',
    ],
  },
  'context': {
    concept: 'context 包管理 goroutine 生命周期，支持取消传播、超时控制、传值等。父 context 取消时，所有子 context 也被取消。',
    example: '// 超时控制\nctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)\ndefer cancel()\n\n// 取消传播\nctx, cancel := context.WithCancel(parentCtx)\n\n// 传值\nctx := context.WithValue(parentCtx, "key", "value")\n\n// 在 goroutine 中检查\nselect {\ncase <-ctx.Done():\n    return ctx.Err()\ncase result := <-doWork():\n    return result\n}',
    points: [
      'context.Background() 用于根 context，通常在 main 和初始化使用',
      'context.TODO() 表示不确定用什么 context',
      'WithCancel/WithTimeout/WithDeadline 返回派生 context',
      'context 不可变，每次 WithValue 返回新 context',
      '一定要调用 cancel() 释放资源',
    ],
  },
  'sync包': {
    concept: 'sync 包提供基本同步原语：Mutex、RWMutex、WaitGroup、Once、Pool、Cond。',
    example: '// Mutex\nvar mu sync.Mutex\nmu.Lock()\n// critical section\nmu.Unlock()\n\n// RWMutex\nvar rw sync.RWMutex\nrw.RLock()   // 读锁，可多个同时读\nrw.RUnlock()\nrw.Lock()    // 写锁，独占\nrw.Unlock()\n\n// Once\nvar once sync.Once\nonce.Do(func() { fmt.Println("只执行一次") })\n\n// Pool\nvar pool = sync.Pool{\n    New: func() any { return make([]byte, 1024) },\n}\nb := pool.Get().([]byte)\ndefer pool.Put(b)',
    points: [
      'Mutex 不可重入，加锁后不能再加锁（会死锁）',
      'RWMutex 适合读多写少的场景',
      'Once 保证函数只执行一次，用于单例/初始化',
      'Pool 用于缓存临时对象，减少 GC 压力',
      'Mutex 零值可用，无需初始化',
    ],
  },
  '并发模式': {
    concept: '常见的 Go 并发模式包括扇出/扇入、Pipeline、Worker Pool 和 Pipeline 模式。',
    example: '// Fan-out: 一个输入分发到多个 goroutine\nfunc fanOut(input <-chan int, workers int) []<-chan int {\n    channels := make([]<-chan int, workers)\n    for i := 0; i < workers; i++ {\n        channels[i] = worker(input)\n    }\n    return channels\n}\n\n// Fan-in: 多个输入合并到一个输出\nfunc fanIn(channels ...<-chan int) <-chan int {\n    out := make(chan int)\n    var wg sync.WaitGroup\n    for _, c := range channels {\n        wg.Add(1)\n        go func(ch <-chan int) {\n            defer wg.Done()\n            for v := range ch {\n                out <- v\n            }\n        }(c)\n    }\n    go func() {\n        wg.Wait()\n        close(out)\n    }()\n    return out\n}\n\n// Pipeline 模式\n// generator -> stage1 -> stage2 -> sink',
    points: [
      '扇出 (fan-out)：一个生产者，多个消费者',
      '扇入 (fan-in)：多个生产者，一个消费者',
      'Pipeline：数据经过多阶段处理',
      'Worker Pool：固定数量的 goroutine 处理任务',
    ],
  },
  '原子操作': {
    concept: 'sync/atomic 包提供底层原子内存操作，比 Mutex 更轻量，适用于简单的计数器或标志位。',
    example: 'var counter atomic.Int64\n\n// 原子累加\ncounter.Add(1)\n\n// 原子比较并交换 (CAS)\nloaded := counter.Load()\ncounter.CompareAndSwap(loaded, loaded+1)\n\n// 原子存储/加载\ncounter.Store(42)\nval := counter.Load()\n\n// 原子交换\nold := counter.Swap(100)',
    points: [
      'atomic 操作比 Mutex 快数倍，适合简单场景',
      'atomic.Int64 等类型在 Go 1.19 引入',
      'CAS (Compare And Swap) 是实现无锁算法的核心',
      'atomic 不能保护复杂的数据结构一致性',
    ],
  },
  '调度器原理': {
    concept: 'GMP 模型：G (Goroutine)、M (Machine/线程)、P (Processor/调度上下文)。M 必须绑定 P 才能运行 G。',
    example: 'GMP 调度流程：\n1. 全局队列中有就绪的 G\n2. P 从全局队列取一批 G 到本地队列\n3. M 从 P 的本地队列取 G 执行\n4. G 阻塞时，M 去找新的 G 执行\n5. 系统调用阻塞 M 时，P 去找新的 M\n\nGOMAXPROCS 控制 P 的数量\nruntime.GOMAXPROCS(4)  // 设置 4 个 P\nruntime.NumGoroutine() // 查看 goroutine 数量',
    points: [
      'GOMAXPROCS 默认为 CPU 核心数',
      '本地队列容量 256，存满后放入全局队列',
      'P 定期检查其他 P 的本地队列（work stealing）',
      '系统调用阻塞 M 时，P 会绑定新 M（hand off）',
    ],
  },

  // ===== Domain 3: 运行时与性能 =====
  'GC基础': {
    concept: 'Go 使用并发三色标记清除 (CMS) GC。Go 1.5 以来不断改进，STW 时间已降至毫秒级。',
    example: '// GC 调优\n// GOGC=off  // 禁用 GC\n// GOGC=100  // 默认值，堆增长 100% 触发 GC\n\nruntime.GC()       // 手动触发 GC\nruntime.ReadMemStats(&m)  // 读取内存统计\n\n// debug.FreeOSMemory()  // 强制归还内存给 OS',
    points: [
      'Go GC 是非分代、非紧缩的并发 GC',
      'GOGC 控制 GC 触发频率（默认 100）',
      '并发 GC 的 STW 主要包括写屏障开启/关闭',
      '典型 STW < 500μs',
    ],
  },
  '三色标记': {
    concept: '三色标记清除算法：白色（未访问）、灰色（待扫描）、黑色（已扫描）。并发标记时通过写屏障保证正确性。',
    example: '三色标记流程：\n1. 根对象着灰色\n2. 从灰色对象扫描可达对象\n3. 可达的新对象着灰色，当前对象着黑色\n4. 重复直到无灰色对象\n5. 剩余的白色对象即为垃圾\n\n// 写屏障（插入屏障）\n// 当黑色对象引用白色对象时\n// 将白色对象标记为灰色（防止漏标）',
    points: [
      'Go 1.8+ 使用混合写屏障（插入 + 删除屏障）',
      '删除屏障：被删除引用的对象标记为灰色',
      '插入屏障：新引用的对象标记为灰色',
      '写屏障只在 GC 标记阶段开启',
    ],
  },
  '内存分配': {
    concept: 'Go 内存分配器采用 TCMalloc 风格，分三级缓存：mcache (per-P) → mcentral → mheap。',
    example: '// 内存分配层级\n// mcache: 每个 P 的本地缓存，无锁分配\n//   → 小对象 (<32KB) 从 mcache 分配\n//   → 大对象 (>=32KB) 直接从 mheap 分配\n// mcentral: 全局中心缓存\n// mheap: 从 OS 申请内存\n\ntype sizeClass struct {\n    size  uint16  // 对象大小\n    count uint8   // 每个 span 的对象数\n}\n\n// 逃逸分析决定对象分配在栈还是堆',
    points: [
      '小对象 (<=32KB) 从 mcache 分配，无锁',
      '大对象直接从 mheap 分配，全局锁',
      '逃逸分析将不逃逸的对象分配在栈上',
      '-gcflags="-m" 查看逃逸分析结果',
    ],
  },
  'pprof': {
    concept: 'pprof 是 Go 内置的性能剖析工具，支持 CPU、内存、goroutine、阻塞、互斥等分析。',
    example: '// 引入 pprof\nimport _ "net/http/pprof"\n\n// 访问分析端点\n// http://localhost:6060/debug/pprof/\n// http://localhost:6060/debug/pprof/profile\n// http://localhost:6060/debug/pprof/heap\n\n// 命令行分析\n// go tool pprof http://localhost:6060/debug/pprof/heap\n// (pprof) top -10\n// (pprof) list main.func\n// (pprof) web\n\n// 测试基准\n// go test -bench=. -benchmem -cpuprofile=cpu.prof',
    points: [
      'pprof 采样频率：CPU 100次/秒，内存按分配比例',
      'go tool pprof 支持交互式和 web 模式',
      '-base 参数可用于对比两次 profile diff',
      '典型调优顺序：CPU → 内存 → goroutine → 阻塞',
    ],
  },
  'GMP调度': {
    concept: 'Go 运行时调度器负责将 goroutine 分配到 OS 线程执行。GMP 是 Go 调度器的核心架构。',
    example: '// GMP 协作流程\n// 1. G 创建 → 放入 P 本地队列或全局队列\n// 2. M 从 P 本地队列获取 G 执行\n// 3. G 执行系统调用阻塞 → M 被 P 解绑 → P 找新 M\n// 4. G 主动让出 (runtime.Gosched()) → 放回队列\n\nruntime.GOMAXPROCS(8)     // 设置 P 数量\nruntime.Gosched()         // 主动让出 CPU\nruntime.Goexit()          // 终止当前 goroutine\nruntime.LockOSThread()    // 当前 G 锁定到当前 M',
    points: [
      'M = OS 线程，P = 调度上下文，G = goroutine',
      'M 必须绑定 P 才能运行 G',
      '协作式调度：G 在函数调用时可能被抢占',
      'Go 1.14+ 实现了基于信号的非协作式抢占',
    ],
  },
  '性能调优': {
    concept: 'Go 性能调优包括基准测试、逃逸分析、边界检查消除和编译器优化。',
    example: '// 基准测试\nfunc BenchmarkXxx(b *testing.B) {\n    for i := 0; i < b.N; i++ {\n        myFunction()\n    }\n}\n\n// 运行基准测试\n// go test -bench=. -benchmem\n\n// 边界检查消除\n// -gcflags="-B" 禁用边界检查（调试用）\n// -gcflags="-d=ssa/check_bce/debug=1" 查看 BCE\n\n// 编译器优化标志\n// go build -ldflags="-s -w"  // 去掉符号表/DWARF',
    points: [
      'benchstat 分析基准测试结果，计算统计显著性',
      '逃逸分析和内联是 Go 编译器最重要的优化',
      '使用 strconv 而非 fmt.Sprintf 进行数字转换',
      '预分配 slice/map 容量可显著减少内存分配',
      'sync.Pool 复用临时对象减少 GC 压力',
    ],
  },

  // ===== Domain 4-8 省略（篇幅控制）=====
  // 在实际应用中，应根据完整知识图谱填充
  'HTTP服务': {
    concept: 'net/http 是 Go 标准库 HTTP 实现。支持路由、中间件、静态文件服务等，Gin/echo 等框架在此之上封装。',
    example: '// 标准 net/http\nhttp.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintf(w, "Hello, %s", r.URL.Query().Get("name"))\n})\nhttp.ListenAndServe(":8080", nil)\n\n// Gin\nr := gin.Default()\nr.GET("/ping", func(c *gin.Context) {\n    c.JSON(200, gin.H{"message": "pong"})\n})\nr.Run()',
    points: [
      'Go 1.22 增强了 net/http 路由（支持模式匹配）',
      '中间件模式：handler 链式调用',
      'context 在 HTTP 处理中用于请求上下文',
      '使用 httptest 进行 HTTP 测试',
    ],
  },
  'Docker': {
    concept: 'Docker 容器化是云原生应用的基石。Go 是构建容器工具的首选语言（Docker 本身用 Go 编写）。',
    example: '# Dockerfile 多阶段构建\nFROM golang:1.22 AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -o server\n\nFROM alpine:3.19\nRUN apk --no-cache add ca-certificates\nCOPY --from=builder /app/server /server\nEXPOSE 8080\nCMD ["/server"]',
    points: [
      '多阶段构建减少镜像体积',
      'CGO_ENABLED=0 实现纯静态编译',
      '使用 scratch 或 alpine 作为基础镜像',
      '.dockerignore 忽略不需要的文件',
    ],
  },

  // ===== Domain 4: 工程实践 =====
  '项目结构': {
    concept: 'Go 项目推荐按职责分层组织：cmd/（入口）、internal/（私有包）、pkg/（公共库）。internal 包外部无法引用，是强制性的访问控制。',
    example: 'myapp/\n├── cmd/\n│   └── server/\n│       └── main.go\n├── internal/\n│   ├── handler/\n│   ├── service/\n│   └── repository/\n├── pkg/\n│   └── validator/\n├── go.mod\n└── go.sum',
    points: [
      'internal 目录的包只能被父目录引用',
      'cmd 下每个子目录是一个可执行文件入口',
      'pkg 存放可被外部项目引用的公共库',
      '避免循环导入是 Go 项目组织的基本要求',
    ],
  },
  '单元测试': {
    concept: 'Go 内置 testing 包支持单元测试、表格驱动测试和子测试。表格驱动测试将测试用例与测试逻辑分离，是 Go 社区推荐的做法。',
    example: 'func TestAdd(t *testing.T) {\n    tests := []struct {\n        a, b, want int\n    }{\n        {1, 2, 3},\n        {0, 0, 0},\n        {-1, 1, 0},\n    }\n    for _, tt := range tests {\n        t.Run(fmt.Sprintf("%d+%d", tt.a, tt.b), func(t *testing.T) {\n            if got := Add(tt.a, tt.b); got != tt.want {\n                t.Errorf("got %d, want %d", got, tt.want)\n            }\n        })\n    }\n}',
    points: [
      '测试文件以 _test.go 结尾，与被测文件同包',
      '表格驱动测试让添加新用例无需复制代码',
      't.Run 子测试可单独运行和过滤',
      't.Helper() 标记辅助函数，出错时显示调用者行号',
    ],
  },
  'mock/bench': {
    concept: 'Go 通过接口实现 mock 测试。gomock 自动生成 mock 代码，testify/mock 提供断言式 mock。基准测试通过 testing.B 测量性能。',
    example: '// gomock 使用\nctrl := gomock.NewController(t)\nmockRepo := NewMockRepository(ctrl)\nmockRepo.EXPECT().GetUser(1).Return(&User{Name: "Alice"}, nil)\n\n// 基准测试\nfunc BenchmarkSum(b *testing.B) {\n    for i := 0; i < b.N; i++ {\n        Sum(1, 2)\n    }\n}',
    points: [
      'Go 接口的隐式实现让 mock 非常自然',
      'gomock 通过 EXPECT().Return() 声明预期调用',
      '基准测试用 b.N 由框架自动调整样本数',
      'go test -bench=. -benchmem 查看内存分配',
    ],
  },
  'CI/CD': {
    concept: 'CI/CD 自动化代码检查、测试和部署。Go 项目常用的 CI 流水线包括代码格式化检查、静态分析、测试和构建。',
    example: '# GitHub Actions Go 工作流\nname: Go CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-go@v5\n        with: { go-version: "1.22" }\n      - run: go fmt ./...\n      - run: go vet ./...\n      - run: go test -race -cover ./...',
    points: [
      'go fmt 确保代码风格统一',
      'go vet 检测可疑构造（无误报）',
      'go test -race 检测数据竞争',
      'golangci-lint 聚合多种 linter 做全面检查',
    ],
  },
  '代码审查': {
    concept: 'Code Review 是保证代码质量的关键环节。Go 代码审查关注点包括错误处理、并发安全、接口设计和测试覆盖。',
    example: '// 反例：忽略错误\nresp, _ := http.Get(url)\n\n// 正例：正确处理\nresp, err := http.Get(url)\nif err != nil {\n    return fmt.Errorf("请求失败: %w", err)\n}\ndefer resp.Body.Close()',
    points: [
      '永远不要忽略错误（不要用 _ 吞没错误）',
      '避免嵌套超过 3 层，使用 guard clause 提前返回',
      '小接口优于大接口（接口应只包含 1-3 个方法）',
      '并发访问必须用 channel 或互斥锁保护',
    ],
  },
  'monorepo': {
    concept: 'Go 1.18 引入 go.work workspace 模式支持多模块 monorepo。多个模块可在同一仓库内相互引用，统一版本管理。',
    example: '// go.work\ngo 1.22\n\nuse (\n    ./services/auth\n    ./services/api\n    ./libs/common\n)\n\n// 替代方案：replace 指令\nreplace github.com/myapp/common => ../libs/common',
    points: [
      'go.work 只在本地开发使用，不应提交到仓库',
      'CI 中不需要 go.work，每个模块独立构建',
      'monorepo 优势：原子提交、统一版本、共享 CI',
      '多模块增加构建时间，需缓存策略优化',
    ],
  },

  // ===== Domain 5: 微服务与 RPC =====
  'gRPC基础': {
    concept: 'gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers。Go 是 gRPC 的一等公民语言。',
    example: '// proto 定义\nservice Greeter {\n  rpc SayHello (HelloRequest) returns (HelloReply);\n}\nmessage HelloRequest {\n  string name = 1;\n}\n\n// 服务端实现\ntype server struct {\n    pb.UnimplementedGreeterServer\n}\nfunc (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {\n    return &pb.HelloReply{Message: "Hello " + req.Name}, nil\n}',
    points: [
      'gRPC 使用 HTTP/2 多路复用，支持流式通信',
      'Protobuf 编码体积小、速度快',
      'gRPC-Go 是 Go 官方的 gRPC 实现',
      '一元 RPC 和流式 RPC 的拦截器不同',
    ],
  },
  '流式RPC': {
    concept: 'gRPC 流式 RPC 支持服务器流、客户端流和双向流三种模式，基于 HTTP/2 的流帧实现背压控制。',
    example: '// 服务器流：服务端返回流式数据\nrpc ListFeatures(Rectangle) returns (stream Feature);\n\n// 双向流：双方同时收发\nrpc RouteChat(stream RouteNote) returns (stream RouteNote);\n\n// 服务端实现\nfunc (s *server) ListFeatures(req *pb.Rectangle, stream pb.Greeter_ListFeaturesServer) error {\n    for _, f := range features {\n        if err := stream.Send(f); err != nil { return err }\n    }\n    return nil\n}',
    points: [
      '服务器流：客户端单请求，服务端多响应',
      '客户端流：客户端多请求，服务端单响应',
      '双向流：双方独立流并发通信',
      'HTTP/2 的 WINDOW_UPDATE 实现背压控制',
    ],
  },
  '服务发现': {
    concept: '服务发现让服务动态找到彼此的地址。etcd 和 Consul 是 Go 生态中最常用的服务发现组件。',
    example: '// etcd 服务注册\ncli, _ := clientv3.New(clientv3.Config{Endpoints: []string{"localhost:2379"}})\ncli.Put(ctx, "/services/myapp/instance1", "192.168.1.1:8080")\n\n// 服务发现（watch 监听变更）\ncli.Watch(ctx, "/services/myapp/",\n    clientv3.WithPrefix(),\n    clientv3.WithKeysOnly())',
    points: [
      'etcd 基于 Raft 保证强一致性',
      'Consul 内建健康检查和 DNS 接口',
      '服务注册写入 KV 存储，TTL 自动过期',
      'Watch 机制实时感知服务变更',
    ],
  },
  '链路追踪': {
    concept: 'OpenTelemetry 是 CNCF 的分布式追踪标准。Go SDK 通过 otelhttp 中间件自动追踪 HTTP 请求，传播 Trace Context。',
    example: '// 初始化 TracerProvider\ntp, _ := otel.SetTracerProvider(\n    sdktrace.NewTracerProvider(\n        sdktrace.WithBatcher(exporter),\n    ),\n)\n\n// HTTP 中间件自动追踪\nhandler := otelhttp.NewHandler(\n    mux,\n    "server",\n    otelhttp.WithPublicEndpoint(),\n)\n\n// 手动创建 Span\nctx, span := tracer.Start(ctx, "process")\ndefer span.End()',
    points: [
      'Trace 包含 TraceID（全局）和 SpanID（局部）',
      'W3C TraceContext 是 Trace 传播的标准格式',
      'otelhttp 中间件自动处理 Context 传播',
      'Tail-based 采样根据结果决定是否采样',
    ],
  },
  '服务网格': {
    concept: 'Service Mesh 通过 sidecar 代理（如 Envoy）将服务间通信从应用中剥离。Istio 是主流的服务网格实现。',
    example: 'Istio 架构：\n控制平面 (istiod)\n  ├── Pilot: 配置下发 (xDS)\n  ├── Citadel: 证书管理 (mTLS)\n  └── Galley: 配置验证\n数据平面 (Envoy sidecar)\n  ├── 拦截所有进出流量\n  ├── 实现重试/熔断/限流\n  └── mTLS 双向认证',
    points: [
      'Sidecar 模式对应用代码透明',
      'Envoy 通过 xDS 协议获取动态配置',
      'mTLS 实现服务间双向认证和加密',
      '引入 Mesh 会增加约 2-5ms 延迟',
    ],
  },

  // ===== Domain 6: 数据与存储 =====
  'database/sql': {
    concept: 'Go 标准库 database/sql 提供统一的 SQL 数据库接口。通过驱动注册实现 MySQL、PostgreSQL 等不同数据库的支持。',
    example: 'db, _ := sql.Open("mysql", "user:pass@tcp(127.0.0.1:3306)/dbname")\ndb.SetMaxOpenConns(25)\ndb.SetMaxIdleConns(10)\ndb.SetConnMaxLifetime(5 * time.Minute)\n\n// 查询\nrow := db.QueryRow("SELECT id, name FROM users WHERE id = ?", 1)\nvar u User\nerr := row.Scan(&u.ID, &u.Name)',
    points: [
      'sql.Open 不实际连接数据库，仅初始化连接池',
      '连接池参数由 SetMaxOpenConns/SetMaxIdleConns 控制',
      '使用 ? 占位符防止 SQL 注入（非 %s）',
      'Row.Scan 按 SELECT 列顺序扫描',
    ],
  },
  'ORM': {
    concept: 'GORM 是 Go 最流行的 ORM 框架。支持自动迁移、关联查询、钩子方法。链式调用需注意 Session 模式避免条件污染。',
    example: 'type User struct {\n    gorm.Model\n    Name  string\n    Posts []Post `gorm:"foreignKey:UserID"`\n}\n\n// 链式调用（需要新 Session）\ndb.Where("age > ?", 18).Session(&gorm.Session{}).Order("name").Find(&users)\n\n// 预加载关联\ndb.Preload("Posts").Find(&users)',
    points: [
      'AutoMigrate 只增不删，生产环境用原生迁移',
      '链式调用共享同一个 Session，条件会累积',
      'Preload 预加载避免 N+1 查询问题',
      '钩子（BeforeCreate/AfterUpdate 等）在操作前后执行',
    ],
  },
  'Redis': {
    concept: 'go-redis 库提供 Go 的 Redis 客户端。Redis 支持丰富的数据结构：String、Hash、List、Set、Sorted Set、HyperLogLog。',
    example: 'rdb := redis.NewClient(&redis.Options{\n    Addr: "localhost:6379",\n    Password: "",\n    DB: 0,\n})\n\n// 使用示例\nrdb.Set(ctx, "key", "value", 10*time.Minute)\nrdb.HSet(ctx, "user:1", "name", "Alice")\nrdb.LPush(ctx, "queue", "task1")\nrdb.ZAdd(ctx, "ranking", redis.Z{Score: 100, Member: "Alice"})',
    points: [
      'Pipeline 批量发送命令减少网络往返',
      'TxPipeline 在 Redis 事务中执行批量命令',
      'Redis 分布式锁通过 SET NX EX 或 Redlock 实现',
      'LRU/LFU 淘汰策略管理内存',
    ],
  },
  '分库分表': {
    concept: '数据库分片解决单库容量和性能瓶颈。水平分片按 ID hash 分配到不同库/表，垂直分片按业务模块拆分。',
    example: '// 分片策略：用户 ID hash\nfunc shardDB(userID int64) string {\n    shard := userID % 16\n    return fmt.Sprintf("user_shard_%d", shard)\n}\n\n// 全局主键（雪花算法）\nflake := sonyflake.NewSonyflake(sonyflake.Settings{})\nid, _ := flake.NextID()',
    points: [
      '水平分片按 ID 范围或 hash 均匀分布数据',
      '垂直分片按业务模块拆分到不同数据库',
      '跨分片查询需要中间层聚合',
      '分片后全局主键需用雪花算法等分布式 ID 方案',
    ],
  },
  '缓存策略': {
    concept: '缓存是提升系统性能的关键手段。Go 生态常用 freecache/bigcache（本地缓存）和 Redis（分布式缓存）。两级缓存策略兼顾速度和容量。',
    example: '// freecache 本地缓存\ncache := freecache.NewCache(100 * 1024 * 1024) // 100MB\ncache.Set([]byte("key"), []byte("value"), 60)\n\n// Cache Aside 模式\nfunc GetUser(id int) *User {\n    key := fmt.Sprintf("user:%d", id)\n    if val, ok := localCache.Get(key); ok {\n        return val.(*User)\n    }\n    // 回源 DB\n    user := db.GetUser(id)\n    localCache.Set(key, user, 300)\n    return user\n}',
    points: [
      'Cache Aside：读缓存→未命中回源 DB→回写缓存',
      '延迟双删：先删缓存→更新 DB→延迟再删一次',
      '拦截穿透用布隆过滤器，击穿用互斥锁',
      '雪崩防护：过期时间加随机值、本地缓存兜底',
    ],
  },
  '新SQL': {
    concept: 'NewSQL 数据库（如 TiDB、CockroachDB）兼具 NoSQL 的扩展性和传统 SQL 的 ACID 事务。TiDB 兼容 MySQL 协议。',
    example: 'TiDB 架构：\nTiDB Server（SQL 层）\n  └── 解析 SQL、生成执行计划\nTiKV（存储层）\n  └── 分布式 KV 存储，Raft 复制\nPD（调度层）\n  └── 元数据管理、负载调度\nTiFlash（列存）\n  └── 实时同步 TiKV，支持 HTAP',
    points: [
      'TiDB 计算存储分离，可独立扩展',
      'TiKV 使用 Raft 保证强一致性',
      'TiFlash 以 Raft Learner 实时同步数据',
      'Go 应用通过标准 MySQL 驱动连接 TiDB',
    ],
  },

  // ===== Domain 7: 云原生 =====
  'K8s核心': {
    concept: 'Kubernetes 是容器编排的事实标准。Pod 是最小部署单元，Deployment 管理 Pod 的声明式更新，Service 提供稳定网络入口。',
    example: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: go-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: go-app\n  template:\n    spec:\n      containers:\n      - name: app\n        image: myapp:latest\n        ports:\n        - containerPort: 8080\n        livenessProbe:\n          httpGet: { path: /healthz, port: 8080 }',
    points: [
      'Pod 共享网络和存储，一个 Pod 可包含多容器',
      'Deployment 支持滚动更新和回滚',
      'Service 通过 Label Selector 找到 Pod',
      'Probe 探针：liveness（存活）、readiness（就绪）、startup（启动）',
    ],
  },
  'Helm': {
    concept: 'Helm 是 Kubernetes 的包管理器。Chart 将 K8s 资源模板化为可配置的包，values.yaml 提供默认配置。',
    example: '# Chart 目录结构\nmychart/\n├── Chart.yaml\n├── values.yaml\n├── templates/\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   └── _helpers.tpl\n\n# 模板中使用 values\ndeployment.yaml:\napiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: {{ .Values.replicaCount }}',
    points: [
      'helm template 本地渲染模板用于调试',
      'helm upgrade --atomic 失败时自动回滚',
      '.Values 引用 values.yaml 配置',
      'Helm hook（pre-install/post-upgrade）在特定阶段执行 Job',
    ],
  },
  'Operator': {
    concept: 'Operator 使用 CRD 扩展 K8s API，Controller 通过 Reconcile 循环将资源调谐到期望状态。Go 常用 controller-runtime 实现。',
    example: '// Reconcile 循环\nfunc (r *MyReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {\n    // 1. 获取 CR 实例\n    var myApp MyApp\n    if err := r.Get(ctx, req.NamespacedName, &myApp); err != nil { return ctrl.Result{}, err }\n\n    // 2. 调谐到期望状态\n    // 创建/更新 Deployment、Service 等子资源\n\n    // 3. 更新状态\n    myApp.Status.Ready = true\n    r.Status().Update(ctx, &myApp)\n\n    return ctrl.Result{}, nil\n}',
    points: [
      'CRD 定义自定义资源 Schema',
      'Controller Watch 资源变化触发 Reconcile',
      'Finalizer 处理资源删除前的清理逻辑',
      'controller-runtime 提供 Manager 管理 Controller 生命周期',
    ],
  },
  'Terraform': {
    concept: 'Terraform 是 HashiCorp 的 IaC 工具，用 HCL 声明云资源。核心流程：init → plan → apply → destroy。',
    example: 'provider "aws" {\n  region = "us-west-2"\n}\n\nresource "aws_instance" "go_server" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.medium"\n\n  tags = {\n    Name = "GoMasterServer"\n  }\n}\n\noutput "public_ip" {\n  value = aws_instance.go_server.public_ip\n}',
    points: [
      'State 文件记录已管理资源的状态',
      'Plan 预览变更，Apply 执行变更',
      'Module 封装可复用的基础设施组件',
      'Go 可通过 terraform-plugin-sdk 编写自定义 Provider',
    ],
  },
  '可观测性': {
    concept: '可观测性三大支柱：Metrics（指标）、Tracing（追踪）、Logging（日志）。Go 中 Prometheus + OpenTelemetry + 结构化日志是标准方案。',
    example: '// Prometheus 指标\nhttpRequestsTotal := promauto.NewCounterVec(\n    prometheus.CounterOpts{Name: "http_requests_total"},\n    []string{"method", "path", "status"},\n)\n\n// 中间件记录指标\nfunc MetricsMiddleware(next http.Handler) http.Handler {\n    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n        httpRequestsTotal.WithLabelValues(\n            r.Method, r.URL.Path, "200",\n        ).Inc()\n        next.ServeHTTP(w, r)\n    })\n}',
    points: [
      'Counter（递增）、Gauge（可增可减）、Histogram（分布）',
      'USE 方法监控基础设施：利用率、饱和度、错误',
      'RED 方法监控服务：速率、错误、延迟',
      'Grafana 仪表盘聚合展示指标数据',
    ],
  },

  // ===== Domain 8: 系统设计 =====
  '分布式理论': {
    concept: 'CAP 定理在 P（分区容忍）必选的前提下，在 C（一致性）和 A（可用性）之间权衡。BASE 理论追求最终一致性。',
    example: 'CAP 选择策略：\nCP 系统：ZooKeeper、etcd（强一致，可用性降低）\nAP 系统：Cassandra、DynamoDB（高可用，最终一致）\nCA 系统：单机数据库（无法分区）\n\nBASE:\n- Basically Available：降级保证基本可用\n- Soft State：允许中间状态\n- Eventual Consistency：最终达到一致',
    points: [
      '网络分区必然发生，所以 P 是必选项',
      '最终一致性通常可在毫秒级达成',
      'PACELC 扩展：正常时在延迟和一致性间权衡',
      '分布式系统设计本质是 trade-off',
    ],
  },
  '一致性算法': {
    concept: 'Raft 是易于理解的分布式共识算法。通过 Leader 选举和日志复制保证集群中数据的一致性。',
    example: 'Raft 核心流程：\n1. Leader 选举：Follower 超时 → Candidate → 获得多数票 → Leader\n2. 日志复制：Leader 接收客户端请求 → 写入日志 → 并行复制到 Follower → 多数确认后提交\n3. 安全性：只有日志最新的节点才能当选 Leader\n\n// Go 中使用 etcd/raft\nstorage := raft.NewMemoryStorage()\nconfig := raft.Config{ID: 1, ElectionTick: 10, HeartbeatTick: 1}\nnode, _ := raft.NewNode(config, []uint64{1, 2, 3})',
    points: [
      'Raft 将共识分解为 Leader 选举、日志复制、安全性',
      'Term（任期）单调递增标识 Leader 周期',
      '多数派（Quorum）提交保证一致性',
      'etcd/raft 是 Go 最流行的 Raft 实现',
    ],
  },
  '消息队列': {
    concept: '消息队列实现异步解耦和削峰填谷。Kafka 适合高吞吐事件流，RabbitMQ 适合灵活路由，NSQ 是 Go 原生的轻量级 MQ。',
    example: '// sarama (Kafka Go 客户端)\nconfig := sarama.NewConfig()\nconsumer, _ := sarama.NewConsumer([]string{"localhost:9092"}, config)\npc, _ := consumer.ConsumePartition("my-topic", 0, sarama.OffsetNewest)\nfor msg := range pc.Messages() {\n    processMessage(msg)\n}\n\n// 生产者\nproducer, _ := sarama.NewSyncProducer([]string{"localhost:9092"}, config)\nproducer.SendMessage(&sarama.ProducerMessage{\n    Topic: "my-topic",\n    Value: sarama.StringEncoder("hello"),\n})',
    points: [
      'Kafka 分区并行消费，保证分区内有序',
      'RabbitMQ 交换器支持 topic/direct/fanout 路由',
      'NSQ 去中心化架构，无单点故障',
      '消息幂等消费是保证一致性的关键',
    ],
  },
  '分布式事务': {
    concept: '分布式事务保证跨服务的数据一致性。Saga 模式通过本地事务+补偿实现最终一致性，TCC 通过三个阶段预留和执行资源。',
    example: 'Saga 编排模式:\nOrder Service → 创建订单\n  → Payment Service → 扣款（成功）/ 退款（失败）\n    → Inventory Service → 减库存（成功）/ 加库存（补偿）\n      → Delivery Service → 发物流',
    points: [
      'Saga 分 Choreography（事件驱动）和 Orchestration（协调器）',
      'TCC：Try 预留 → Confirm 确认 → Cancel 补偿',
      '补偿操作必须幂等',
      'dtm（Go 分布式事务管理器）支持 Saga 和 TCC',
    ],
  },
  '高可用设计': {
    concept: '高可用架构通过冗余、故障转移和优雅降级保障服务可用性。限流、熔断、降级是常用的稳定性三板斧。',
    example: '// gobreaker 熔断器\nvar cb *gobreaker.CircuitBreaker\ncb = gobreaker.NewCircuitBreaker(gobreaker.Settings{\n    Name:        "http-client",\n    MaxRequests: 3,          // 半开状态最大请求数\n    Interval:    60 * time.Second,\n    Timeout:     30 * time.Second,  // 熔断到半开的时间\n})\n\n// 执行请求\nresp, err := cb.Execute(func() (interface{}, error) {\n    return httpClient.Get("http://backend/api")\n})',
    points: [
      '限流：令牌桶（time/rate）保护自身不被冲垮',
      '熔断：连续失败后快速失败，保护下游不被压垮',
      '降级：熔断时返回缓存或默认值，提供有损服务',
      '多活架构：单元化部署 + 全局负载均衡实现跨机房高可用',
    ],
  },
  '设计模式': {
    concept: 'Go 的设计模式因缺少继承而更简洁。常用模式：Functional Options、Pipeline、Singleflight 等体现了 Go 的编程哲学。',
    example: '// Functional Options 模式\ntype ServerOption func(*Server)\n\nfunc WithPort(port int) ServerOption {\n    return func(s *Server) { s.port = port }\n}\nfunc WithTimeout(t time.Duration) ServerOption {\n    return func(s *Server) { s.timeout = t }\n}\n\nfunc NewServer(opts ...ServerOption) *Server {\n    s := &Server{port: 8080, timeout: 30 * time.Second}\n    for _, opt := range opts {\n        opt(s)\n    }\n    return s\n}\n\n// 使用\nsrv := NewServer(WithPort(9090), WithTimeout(time.Minute))',
    points: [
      'Functional Options 提供灵活的构造函数，避免大参数列表',
      'Pipeline 模式：channel 连接多阶段处理',
      'Singleflight 合并重复请求，防止缓存击穿',
      '选项模式是 Go 生态中最广泛使用的设计模式',
    ],
  },
};