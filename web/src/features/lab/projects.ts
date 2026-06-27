// 实战实验室 - 项目列表
// 覆盖项目路线图 Lv1-Lv3 的填空和阅读题目

import type { LabProject } from './types';

export const LAB_PROJECTS: LabProject[] = [
  // ====================================================================
  // Lv1: Go 命令行工具 — Phase 1: Code Reading
  // ====================================================================
  {
    id: 'lv1-reading',
    title: '理解 Cobra CLI 框架',
    phase: 'reading',
    phaseLevel: 1,
    projectLevel: 1,
    domain: 1,
    knowledgeNodeIds: ['1-1', '1-2'],
    description: '阅读并理解 Cobra 命令行框架的基本结构和工作流程',
    files: [
      {
        name: 'main.go',
        readonly: true,
        content: `package main

import (
    "fmt"
    "os"

    "github.com/spf13/cobra"
)

// rootCmd 是 CLI 的根命令
// Cobra 使用树形结构组织命令
// 每个命令是一个 *cobra.Command 对象
var rootCmd = &cobra.Command{
    Use:   "myapp",
    Short: "MyApp 是一个示例 CLI 工具",
    Long: \`MyApp 演示了 Cobra 的基本用法。
支持子命令、标志和配置文件读取。\`,
    // Run 是命令执行时的回调函数
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("欢迎使用 MyApp!")
        fmt.Println("运行 'myapp help' 查看所有命令")
    },
}

// helloCmd 是一个子命令
var helloCmd = &cobra.Command{
    Use:   "hello [name]",
    Short: "输出问候语",
    Args:  cobra.MaximumNArgs(1),
    Run: func(cmd *cobra.Command, args []string) {
        name := "World"
        if len(args) > 0 {
            name = args[0]
        }
        fmt.Printf("Hello, %s!\\n", name)
    },
}

func init() {
    // 将子命令注册到根命令
    rootCmd.AddCommand(helloCmd)
}

func main() {
    // Execute 解析命令行参数并执行对应命令
    if err := rootCmd.Execute(); err != nil {
        fmt.Println(err)
        os.Exit(1)
    }
}
`,
      },
    ],
    tests: '',
    hints: [
      'Cobra 命令通过 AddCommand 形成树形结构',
      'Use 字段是命令的名称，Run 是执行入口',
      'Args 可以限制子命令的参数数量',
      'init() 在 main 之前自动执行，适合注册命令和标志',
    ],
  },

  // ====================================================================
  // Lv1: Go 命令行工具 — Phase 2: Guided Fill
  // ====================================================================
  {
    id: 'lv1-fill',
    title: '实现 Go 命令行工具',
    phase: 'filling',
    phaseLevel: 1,
    projectLevel: 1,
    domain: 1,
    knowledgeNodeIds: ['1-1', '1-2', '1-3'],
    description: '补全代码中的空白，实现一个带子命令和配置文件的 CLI 工具',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "fmt"
    "os"

    "github.com/spf13/cobra"
    "github.com/spf13/viper"
)

var cfgFile string

// rootCmd 是 CLI 的根命令
// 空白1: 补充 Use 字段的值（命令名称）
var rootCmd = &cobra.Command{
    Use:   /* 空白1: 命令名称 */,
    Short: "一个示例命令行工具",
    Long:  \`演示 Cobra 和 Viper 的用法。\`,
    Run: func(cmd *cobra.Command, args []string) {
        // 空白2: 使用 viper 读取配置
        // 读取 key 为 "app.name" 的配置值
        name := /* 空白2: viper.GetString("app.name") */
        fmt.Printf("Hello from %s!\\n", name)
    },
}

var helloCmd = &cobra.Command{
    Use:   "hello [name]",
    Short: "问候指定的人",
    Args:  cobra.MaximumNArgs(1),
    Run: func(cmd *cobra.Command, args []string) {
        name := "World"
        // 空白3: 如果传入了参数，则使用第一个参数
        if /* 空白3: 条件判断 len(args) > 0 */ {
            name = args[0]
        }
        fmt.Printf("Hello, %s!\\n", name)
    },
}

var versionCmd = &cobra.Command{
    Use:   "version",
    Short: "显示版本号",
    // 空白4: Run 字段的类型是 func(cmd *cobra.Command, args []string)
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("myapp version 1.0.0")
    },
}

func init() {
    // 注册子命令
    rootCmd.AddCommand(helloCmd)
    /* 空白5: 注册 versionCmd */
    rootCmd.AddCommand(versionCmd)

    // 持久化标志（可用于所有子命令）
    rootCmd.PersistentFlags().StringVar(
        &cfgFile,          // 绑定的变量指针
        "config",          // 标志名称
        "./config.yaml",   // 默认值
        "配置文件路径",    // 帮助文本
    )

    // 绑定 viper
    viper.BindPFlag("config", rootCmd.PersistentFlags().Lookup("config"))
}

func main() {
    if err := /* 空白6: 执行根命令 */; err != nil {
        fmt.Println(err)
        os.Exit(1)
    }
}
`,
        blanks: [
          {
            id: 'blank-1',
            line: 14,
            hint: 'Use 字段是命令的名称，应该是一个简短的命令名',
            answer: '"myapp"',
            alternatives: ['"myapp"', `"myapp"`, "'myapp'"],
          },
          {
            id: 'blank-2',
            line: 20,
            hint: 'viper.GetString 读取字符串配置值',
            answer: 'viper.GetString("app.name")',
            alternatives: ['viper.GetString("app.name")', `viper.GetString('app.name')`],
          },
          {
            id: 'blank-3',
            line: 30,
            hint: '检查 args 切片是否有至少一个元素',
            answer: 'len(args) > 0',
            alternatives: ['len(args) > 0', 'len(args)>=1', 'len(args)>0'],
          },
          {
            id: 'blank-4',
            line: 37,
            hint: 'Run 是一个函数，接收 cmd *cobra.Command 和 args []string',
            answer: 'func(cmd *cobra.Command, args []string)',
            alternatives: ['func(cmd *cobra.Command, args []string)'],
          },
          {
            id: 'blank-5',
            line: 44,
            hint: '和之前注册子命令的方式一样，用 AddCommand',
            answer: 'rootCmd.AddCommand(versionCmd)',
            alternatives: ['rootCmd.AddCommand(versionCmd)'],
          },
          {
            id: 'blank-6',
            line: 61,
            hint: '调用根命令的 Execute 方法',
            answer: 'rootCmd.Execute()',
            alternatives: ['rootCmd.Execute()', 'rootCmd.Execute'],
          },
        ],
      },
    ],
    tests: '',
    hints: [
      'Use 字段定义命令名称，应使用双引号字符串',
      'viper.GetString 读取字符串类型的配置',
      'len(args) 获取参数数量',
      'AddCommand 将子命令注册到父命令',
      'Execute() 是 cobra.Command 的入口方法',
    ],
  },

  // ====================================================================
  // Lv2: 并发爬虫 — Phase 2: Guided Fill
  // ====================================================================
  {
    id: 'lv2-fill',
    title: '实现并发爬虫框架',
    phase: 'filling',
    phaseLevel: 2,
    projectLevel: 2,
    domain: 2,
    knowledgeNodeIds: ['2-1', '2-2', '2-3', '2-4'],
    description: '补全代码，实现一个带速率限制的并发爬虫框架',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "fmt"
    "net/http"
    "sync"
    "time"
)

// RateLimiter 控制请求速率
type RateLimiter struct {
    tokens chan struct{}
    ticker *time.Ticker
}

func NewRateLimiter(rps int) *RateLimiter {
    rl := &RateLimiter{
        // 空白1: 创建缓冲为 rps 的 channel
        tokens: make(chan struct{}, rps),
        ticker: time.NewTicker(time.Second / time.Duration(rps)),
    }
    // 每秒填充令牌
    go func() {
        for range rl.ticker.C {
            // 空白2: 向 tokens 发送一个空结构体
            rl.tokens <- struct{}{}
        }
    }()
    return rl
}

func (rl *RateLimiter) Wait() {
    // 空白3: 从 tokens 接收一个令牌（阻塞等待）
    <-rl.tokens
}

// CrawlWorker 爬虫工作单元
func CrawlWorker(id int, urls <-chan string, results chan<- string, rl *RateLimiter, wg *sync.WaitGroup) {
    defer /* 空白4: 通知 WaitGroup 完成 */
    for url := range urls {
        rl.Wait() // 限流
        fmt.Printf("[Worker %d] 爬取: %s\\n", id, url)
        // 模拟 HTTP 请求
        resp, err := http.Get(url)
        if err != nil {
            results <- fmt.Sprintf("[%s] 错误: %v", url, err)
            continue
        }
        results <- fmt.Sprintf("[%s] 状态码: %d", url, resp.StatusCode)
        resp.Body.Close()
    }
}

func main() {
    urls := []string{
        "https://example.com",
        "https://golang.org",
        "https://github.com",
        "https://stackoverflow.com",
    }

    numWorkers := 3
    urlChan := make(chan string, len(urls))
    resultChan := make(chan string, len(urls))
    rl := NewRateLimiter(2) // 每秒 2 个请求
    var wg sync.WaitGroup

    // 启动 worker
    for i := 0; i < numWorkers; i++ {
        /* 空白5: wg.Add 增加计数 */
        wg.Add(1)
        go CrawlWorker(i, urlChan, resultChan, rl, &wg)
    }

    // 发送 URL
    for _, url := range urls {
        urlChan <- url
    }
    /* 空白6: 关闭 urlChan 通知 worker 不再有任务 */
    close(urlChan)

    // 等待所有 worker 完成
    wg.Wait()
    close(resultChan)

    // 输出结果
    for result := range resultChan {
        fmt.Println(result)
    }
}
`,
        blanks: [
          {
            id: 'lv2-blank-1',
            line: 15,
            hint: '创建一个缓冲 channel，容量为 rps',
            answer: 'make(chan struct{}, rps)',
            alternatives: ['make(chan struct{}, rps)'],
          },
          {
            id: 'lv2-blank-2',
            line: 22,
            hint: '向 channel 发送一个空结构体作为令牌',
            answer: 'rl.tokens <- struct{}{}',
            alternatives: ['rl.tokens<-struct{}{}', 'rl.tokens <- struct{} {}'],
          },
          {
            id: 'lv2-blank-3',
            line: 28,
            hint: '从 tokens channel 接收，获取令牌',
            answer: '<-rl.tokens',
            alternatives: ['<-rl.tokens'],
          },
          {
            id: 'lv2-blank-4',
            line: 34,
            hint: 'defer wg.Done() 在函数返回时通知完成',
            answer: 'wg.Done()',
            alternatives: ['wg.Done()', 'wg.Done'],
          },
          {
            id: 'lv2-blank-5',
            line: 72,
            hint: '在启动 goroutine 前增加 WaitGroup 计数',
            answer: 'wg.Add(1)',
            alternatives: ['wg.Add(1)'],
          },
          {
            id: 'lv2-blank-6',
            line: 79,
            hint: '发送完所有 URL 后关闭 channel 触发 worker 退出循环',
            answer: 'close(urlChan)',
            alternatives: ['close(urlChan)', 'close(urlChan)'],
          },
        ],
      },
    ],
    tests: '',
    hints: [
      '有缓冲 channel 可以避免发送方阻塞',
      'defer wg.Done() 确保即使 panic 也能通知完成',
      'close(channel) 会让 range 循环自动退出',
      '空结构体 struct{}{} 不占用内存，常用于信号传递',
    ],
  },

  // ====================================================================
  // Lv3: RESTful API 服务 — Phase 2: Guided Fill
  // ====================================================================
  {
    id: 'lv3-fill',
    title: '实现 RESTful API 服务',
    phase: 'filling',
    phaseLevel: 3,
    projectLevel: 3,
    domain: 5,
    knowledgeNodeIds: ['5-1', '1-4'],
    description: '补全代码，实现一个带 JWT 鉴权的 RESTful API',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

// User 用户模型
type User struct {
    ID       int    \`json:"id"\`
    Username string \`json:"username"\`
    Password string \`json:"-"\` // JSON 序列化时忽略
}

// JWT 密钥
var jwtSecret = []byte("my-secret-key")

// loginHandler 处理用户登录
func loginHandler(c *gin.Context) {
    var u User
    // 空白1: 绑定请求 JSON 到 User 结构体
    if err := /* 空白1: c.ShouldBindJSON */; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "无效请求"})
        return
    }

    // 验证用户名密码（简化版）
    if u.Username != "admin" || u.Password != "123456" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
        return
    }

    // 生成 JWT token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "username": u.Username,
        "exp":      /* 空白2: 过期时间：当前时间 + 1 小时 */,
    })

    tokenString, err := /* 空白3: 签名生成 token 字符串 */
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "生成 token 失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

// authMiddleware JWT 鉴权中间件
func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            /* 空白4: 返回 401 未授权 */
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未提供 token"})
            return
        }

        // 验证 token
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })

        if err != nil || !token.Valid {
            /* 空白5: 返回 401 未授权 */
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token 无效"})
            return
        }

        /* 空白6: 继续处理请求 */
        c.Next()
    }
}

func main() {
    r := gin.Default()

    // 公开路由
    r.POST("/api/login", loginHandler)

    // 需要鉴权的路由
    api := r.Group("/api")
    api.Use(authMiddleware())
    {
        api.GET("/users", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{"users": []User{}})
        })
    }

    r.Run(":8080")
}
`,
        blanks: [
          {
            id: 'lv3-blank-1',
            line: 25,
            hint: 'c.ShouldBindJSON 将请求体绑定到结构体',
            answer: 'c.ShouldBindJSON(&u)',
            alternatives: ['c.ShouldBindJSON(&u)', 'c.BindJSON(&u)'],
          },
          {
            id: 'lv3-blank-2',
            line: 38,
            hint: 'time.Now().Add 加一段时间，time.Hour 是一小时',
            answer: 'time.Now().Add(time.Hour).Unix()',
            alternatives: [
              'time.Now().Add(time.Hour).Unix()',
              'time.Now().Add(1*time.Hour).Unix()',
              'jwt.NewNumericDate(time.Now().Add(1*time.Hour))',
            ],
          },
          {
            id: 'lv3-blank-3',
            line: 41,
            hint: 'token.SignedString 用密钥签名生成完整 token',
            answer: 'token.SignedString(jwtSecret)',
            alternatives: ['token.SignedString(jwtSecret)'],
          },
          {
            id: 'lv3-blank-4',
            line: 57,
            hint: 'AbortWithStatusJSON 终止请求并返回 JSON 错误',
            answer: 'c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未提供 token"})',
            alternatives: [
              'c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未提供 token"})',
              'c.JSON(http.StatusUnauthorized, gin.H{"error":"未提供 token"}); c.Abort()',
            ],
          },
          {
            id: 'lv3-blank-5',
            line: 66,
            hint: '同空白4，token 无效时返回 401',
            answer: 'c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token 无效"})',
            alternatives: [
              'c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error":"token 无效"})',
              'c.JSON(http.StatusUnauthorized, gin.H{"error":"token 无效"}); c.Abort()',
            ],
          },
          {
            id: 'lv3-blank-6',
            line: 69,
            hint: '中间件中调用 c.Next() 继续执行后续处理器',
            answer: 'c.Next()',
            alternatives: ['c.Next()', 'c.Next'],
          },
        ],
      },
    ],
    tests: '',
    hints: [
      'c.ShouldBindJSON 需要传入指针参数 &u',
      'JWT Payload 中的 exp 字段是 Unix 时间戳',
      'AbortWithStatusJSON 同时终止请求和返回 JSON',
      'c.Next() 是 Gin 中间件的关键，控制请求流转',
    ],
  },

  // ====================================================================
  // Lv1: Go 命令行工具 — Phase 3: Code Modification
  // ====================================================================
  {
    id: 'lv1-modify',
    title: '扩展 CLI 工具功能',
    phase: 'modification',
    phaseLevel: 1,
    projectLevel: 1,
    domain: 1,
    knowledgeNodeIds: ['1-1', '1-2', '1-3'],
    description: '在现有 CLI 工具上按要求添加新命令和标志',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "fmt"
    "os"

    "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
    Use:   "myapp",
    Short: "示例 CLI 工具",
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("欢迎使用 MyApp!")
    },
}

var helloCmd = &cobra.Command{
    Use:   "hello [name]",
    Short: "问候",
    Run: func(cmd *cobra.Command, args []string) {
        name := "World"
        if len(args) > 0 {
            name = args[0]
        }
        fmt.Printf("Hello, %s!\\n", name)
    },
}

var greetCmd = &cobra.Command{
    Use:   "greet",
    Short: "多语言问候",
    Run: func(cmd *cobra.Command, args []string) {
        name, _ := cmd.Flags().GetString("name")
        lang, _ := cmd.Flags().GetString("lang")

        switch lang {
        case "en":
            fmt.Printf("Hello, %s!\\n", name)
        case "zh":
            fmt.Printf("你好，%s！\\n", name)
        case "ja":
            fmt.Printf("こんにちは、%s！\\n", name)
        default:
            fmt.Printf("Hello, %s!\\n", name)
        }
    },
}

func init() {
    rootCmd.AddCommand(helloCmd)
    rootCmd.AddCommand(greetCmd)

    // greet 命令的标志
    greetCmd.Flags().String("name", "World", "姓名")
    greetCmd.Flags().String("lang", "en", "语言 (en/zh/ja)")
}

func main() {
    if err := rootCmd.Execute(); err != nil {
        fmt.Println(err)
        os.Exit(1)
    }
}`,
      },
    ],
    tests: '',
    hints: [
      '需求1: 添加一个 goodbye 子命令',
      '需求2: 为 greet 添加一个 --formal 标志，加上敬语',
      '需求3: 为 rootCmd 添加一个 --verbose 标志',
    ],
  },

  // ====================================================================
  // Lv2: 并发爬虫 — Phase 3: Code Modification
  // ====================================================================
  {
    id: 'lv2-modify',
    title: '给并发爬虫添加超时和去重',
    phase: 'modification',
    phaseLevel: 2,
    projectLevel: 2,
    domain: 2,
    knowledgeNodeIds: ['2-1', '2-2', '2-5'],
    description: '在已有并发爬虫上添加 context 超时控制、URL 去重和错误重试',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "context"
    "fmt"
    "net/http"
    "sync"
    "time"
)

func fetch(ctx context.Context, url string) error {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return err
    }
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    fmt.Println(url, resp.StatusCode)
    return nil
}

func main() {
    urls := []string{
        "https://example.com",
        "https://example.com",
        "https://golang.org",
    }

    var wg sync.WaitGroup
    for _, url := range urls {
        wg.Add(1)
        go func(url string) {
            defer wg.Done()
            ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
            defer cancel()
            _ = fetch(ctx, url)
        }(url)
    }
    wg.Wait()
}
`,
      },
    ],
    tests: '',
    hints: [
      '需求1: 添加 visited map 和 mutex，避免重复抓取同一 URL',
      '需求2: fetch 失败时重试 2 次，每次间隔 200ms',
      '需求3: 用 context.WithTimeout 控制单次请求超时',
      '需求4: 输出最终成功数和失败数',
    ],
  },

  // ====================================================================
  // Lv3: RESTful API — Phase 3: Code Modification
  // ====================================================================
  {
    id: 'lv3-modify',
    title: '给 REST API 添加限流和缓存',
    phase: 'modification',
    phaseLevel: 3,
    projectLevel: 3,
    domain: 5,
    knowledgeNodeIds: ['5-1', '6-5'],
    description: '在 Gin API 服务上添加限流中间件和 GET 缓存',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

type User struct {
    ID   int    \`json:"id"\`
    Name string \`json:"name"\`
}

func listUsers(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"users": []User{{ID: 1, Name: "Alice"}}})
}

func createUser(c *gin.Context) {
    c.JSON(http.StatusCreated, gin.H{"ok": true})
}

func main() {
    r := gin.Default()
    api := r.Group("/api")
    {
        api.GET("/users", listUsers)
        api.POST("/users", createUser)
    }
    r.Run(":8080")
}
`,
      },
    ],
    tests: '',
    hints: [
      '需求1: 实现 RateLimit 中间件，每秒最多 10 请求',
      '需求2: 超限返回 429 和 JSON 错误',
      '需求3: 给 GET /api/users 添加 30 秒内存缓存',
      '需求4: POST /api/users 成功后清理缓存',
    ],
  },

  // ====================================================================
  // Phase 4: Greenfield Building - 从零构建入口
  // ====================================================================
  {
    id: 'lv4-greenfield',
    title: '从零构建 gRPC 服务',
    phase: 'greenfield',
    phaseLevel: 1,
    projectLevel: 4,
    domain: 5,
    knowledgeNodeIds: ['5-2', '5-3', '5-4'],
    description: '根据需求文档，从零实现一个 gRPC 服务',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `// 从零实现 gRPC 服务
//
// 需求文档:
// 1. 定义 Greeter 服务，包含 SayHello 和 SayGoodbye 两个 RPC
// 2. 实现服务端，监听 :50051
// 3. 客户端通过命令行参数指定要调用的 RPC
//
// 验收标准:
// - SayHello(name) 返回 "Hello, {name}!"
// - SayGoodbye(name) 返回 "Goodbye, {name}!"
// - 服务端优雅退出
//
// 推荐技术栈:
// - google.golang.org/grpc
// - google.golang.org/protobuf
//
// 提示: 先定义 proto 文件，然后用 protoc 生成代码

package main

import (
    "log"
)

func main() {
    log.Println("请实现 gRPC 服务端")
}
`,
      },
    ],
    tests: '',
    hints: [
      '先写 proto 文件定义 Service 和 Message',
      '用 protoc --go_out=. --go-grpc_out=. 生成代码',
      '实现 pb.UnimplementedGreeterServer',
      'grpc.Server 注册服务后调用 Serve()',
    ],
  },

  // ====================================================================
  // Phase 4: Greenfield Building - Lv2 并发爬虫
  // ====================================================================
  {
    id: 'lv2-greenfield',
    title: '从零构建并发爬虫',
    phase: 'greenfield',
    phaseLevel: 1,
    projectLevel: 2,
    domain: 2,
    knowledgeNodeIds: ['2-1', '2-2', '2-3', '2-6'],
    description: '根据需求文档，从零实现一个带限速、去重和优雅退出的并发爬虫',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `// 从零实现并发爬虫
//
// 需求文档:
// 1. 实现 Worker Pool 并发模型（3 个 worker）
// 2. 支持每域名速率限制（5 QPS）
// 3. 已爬取的 URL 自动去重
// 4. Ctrl+C 优雅退出
// 5. 结果写入 results.json
//
// 验收标准:
// - 能爬取 example.com 和 golang.org
// - 不会重复爬取同一个 URL
// - Ctrl+C 时等待当前请求完成
// - 输出结构化的 JSON 结果
//
// 推荐技术栈:
// - net/http
// - golang.org/x/time/rate
// - encoding/json
// - os/signal

package main

import "log"

func main() {
    log.Println("请实现并发爬虫")
}
`,
      },
    ],
    tests: '',
    hints: [
      '用 channel 作为任务队列',
      'sync.WaitGroup 等待 worker 完成',
      'map[string]bool + sync.Mutex 做去重',
      'context.WithCancel 配合 signal.Notify 实现优雅退出',
    ],
  },

  // ====================================================================
  // Phase 4: Greenfield Building - Lv5 分布式任务调度
  // ====================================================================
  {
    id: 'lv5-greenfield',
    title: '从零构建分布式任务调度器',
    phase: 'greenfield',
    phaseLevel: 2,
    projectLevel: 5,
    domain: 7,
    knowledgeNodeIds: ['6-3', '8-3'],
    description: '基于 Redis 实现分布式任务队列，支持延迟任务和失败重试',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `// 分布式任务调度器
//
// 需求文档:
// 1. 实现基于 Redis 的任务队列
// 2. 支持立即执行和延迟执行两种任务
// 3. 任务失败自动重试（最多 3 次）
// 4. 支持任务进度查询
// 5. 提供 HTTP API 提交和查询任务
//
// 验收标准:
// - POST /api/task 提交任务，返回 taskID
// - GET /api/task/:id 查询任务状态和进度
// - 延迟任务在指定时间后执行
// - 失败任务自动重试 3 次
//
// 推荐技术栈:
// - github.com/redis/go-redis/v9
// - github.com/gin-gonic/gin
// - github.com/google/uuid

package main

import "log"

func main() {
    log.Println("请实现分布式任务调度器")
}
`,
      },
    ],
    tests: '',
    hints: [
      'Redis List 做立即任务队列',
      'Redis ZSet 做延迟队列，score 是执行时间戳',
      'Redis Hash 保存任务状态和重试次数',
      'Worker 使用 BRPop 阻塞消费任务',
    ],
  },

  // ====================================================================
  // Phase 4: Greenfield Building - Lv6 缓存中间件
  // ====================================================================
  {
    id: 'lv6-greenfield',
    title: '从零构建高性能缓存中间件',
    phase: 'greenfield',
    phaseLevel: 3,
    projectLevel: 6,
    domain: 6,
    knowledgeNodeIds: ['6-3', '6-5'],
    description: '实现一个本地缓存 + Redis 的两级缓存系统，支持 TTL 和防击穿',
    files: [
      {
        name: 'main.go',
        readonly: false,
        content: `// 两级缓存中间件
//
// 需求文档:
// 1. 实现本地内存缓存，支持 TTL 过期
// 2. 集成 Redis 作为二级缓存
// 3. 实现 Cache Aside 模式
// 4. 使用 singleflight 防止缓存击穿
// 5. 提供 HTTP API 演示缓存命中/未命中
//
// 验收标准:
// - 首次请求回源并写入两级缓存
// - 第二次请求命中本地缓存
// - 本地过期后命中 Redis
// - 多个并发请求同一 key 只回源一次
//
// 推荐技术栈:
// - sync.Map 或 map + RWMutex
// - github.com/redis/go-redis/v9
// - golang.org/x/sync/singleflight

package main

import "log"

func main() {
    log.Println("请实现两级缓存中间件")
}
`,
      },
    ],
    tests: '',
    hints: [
      '一级缓存用 map[string]CacheItem + sync.RWMutex',
      'CacheItem 需要保存 value 和 expireAt',
      'singleflight.Group.Do 合并相同 key 的回源请求',
      '更新数据时先删缓存，再更新 DB，最后延迟双删',
    ],
  },
];

export function getProjectsByLevel(level: number): LabProject[] {
  return LAB_PROJECTS.filter(p => p.projectLevel === level);
}

export function getProjectsByPhase(phase: string): LabProject[] {
  return LAB_PROJECTS.filter(p => p.phase === phase);
}

export function getProjectById(id: string): LabProject | undefined {
  return LAB_PROJECTS.find(p => p.id === id);
}