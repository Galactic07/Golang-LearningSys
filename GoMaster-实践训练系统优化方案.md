# GoMaster 实战训练系统优化方案

> 文档版本：v1.0  
> 适用项目：GoMaster  
> 目标模块：实战实验室 / 项目路线图 / 技能评估 / 查漏补缺 / 模拟面试  
> 核心目标：将 GoMaster 从“知识学习与刷题系统”升级为“真实工程能力训练系统”

---

## 1. 背景与问题定义

GoMaster 当前已经具备较完整的 Go 学习基础能力：

- 知识图谱
- 系统学习
- 题库刷题
- 间隔复习
- 查漏补缺
- 技能评估
- 项目路线图
- 模拟面试
- 实战实验室雏形

其中，实战实验室已经初步实现了四阶段训练模式：

```text
代码研读 → 填空实战 → 代码改造 → 从零构建
```

该方向是正确的，因为它解决了传统学习系统中的核心断层：

```text
会看知识点 ≠ 会写代码
会刷题 ≠ 会做项目
会背概念 ≠ 会在工作中改项目
```

然而，当前实战实验室仍处于 MVP 原型阶段，更多是“代码展示 + 填空 + 运行”的练习系统，距离真正培养项目开发能力还有明显差距。

本方案旨在将当前四阶段实战流水线升级为一个系统化、可评估、可持续扩展的真实工程训练平台。

---

## 2. 当前实战流水线现状分析

### 2.1 已实现能力

当前 GoMaster 已实现以下基础能力：

| 模块 | 当前状态 |
|---|---|
| 实战实验室页面 | 已实现 |
| 四阶段筛选 | 已实现 |
| 代码研读题目 | 已有初版 |
| 填空题目 | 已有 CLI、并发、API 案例 |
| 代码改造题目 | 已有基础题目 |
| 从零构建题目 | 已有 PRD 型题目 |
| 后端 Go 编译运行接口 | 已实现 `/api/compile` |
| 路由与导航入口 | 已接入 |

当前四阶段内容示例：

| 阶段 | 示例题目 |
|---|---|
| Phase 1 代码研读 | 理解 Cobra CLI 框架 |
| Phase 2 填空实战 | 实现 Go 命令行工具、并发爬虫、REST API |
| Phase 3 代码改造 | 扩展 CLI、给爬虫添加去重、给 API 添加缓存 |
| Phase 4 从零构建 | gRPC 服务、并发爬虫、任务调度器、缓存中间件 |

### 2.2 当前核心不足

当前系统的主要问题并不是方向错误，而是训练闭环不完整。

#### 2.2.1 缺少测试驱动验收

当前用户可以运行代码，但系统无法判断：

- 功能是否真的满足需求
- 边界情况是否正确
- 并发逻辑是否安全
- API 行为是否符合约定
- 项目是否达到了交付标准

也就是说，目前只有：

```text
代码能否运行
```

还没有：

```text
代码是否正确
代码是否稳定
代码是否符合工程要求
```

#### 2.2.2 填空模式仍偏“唯一答案”

当前填空题主要依赖标准答案和替代答案匹配。这适合语法学习，但不适合工程实践。

真实项目中，一个需求可能有多种正确实现方式。例如限流中间件可以通过：

- token bucket
- leaky bucket
- channel + ticker
- atomic counter
- Redis 分布式限流
- nginx / gateway 前置限流

因此，填空题适合作为“过渡训练”，但不能作为实战能力的最终判断方式。

#### 2.2.3 代码编辑体验不足

当前代码区主要是自定义展示组件，缺少真实编辑器能力：

- 无语法高亮
- 无多文件编辑
- 无错误定位
- 无快捷键
- 无代码折叠
- 无搜索替换
- 无文件树

这会限制用户在 Phase 3 和 Phase 4 中进行真实项目开发。

#### 2.2.4 多文件项目能力不足

虽然类型结构支持多个文件，但当前 UI 和运行流程基本只围绕 `main.go` 展开。

真实 Go 项目通常包含：

```text
cmd/
internal/
pkg/
api/
config/
tests/
go.mod
README.md
```

如果没有多文件项目能力，Phase 4 从零构建会停留在“单文件练习”，无法模拟真实工作场景。

#### 2.2.5 后端执行环境缺少安全隔离

当前 `/api/compile` 直接在本机临时目录中：

```text
go mod tidy
go build
运行二进制
```

这适合作为本地学习原型，但存在潜在风险：

- 用户代码可访问本机文件
- 用户代码可发起网络请求
- 用户代码可能占用大量 CPU / 内存
- `go mod tidy` 可下载任意依赖
- 无容器隔离
- 无进程组清理
- 超时控制较基础

如果系统后续支持多人使用，必须引入沙箱执行环境。

#### 2.2.6 与现有学习系统联动不足

GoMaster 已有多个学习模块，但实战实验室尚未充分联动：

| 模块 | 当前问题 |
|---|---|
| 知识图谱 | `knowledgeNodeIds` 有字段，但未驱动图谱状态 |
| 查漏补缺 | 实战失败没有反哺薄弱点分析 |
| 技能评估 | 实战能力未进入雷达图 |
| 项目路线图 | 实验室题目未作为项目路线图任务链 |
| 模拟面试 | 完成项目后没有生成项目经验素材 |

因此，当前实战实验室更像独立页面，而不是贯穿整个学习系统的核心引擎。

---

## 3. 设计目标

优化后的实战训练系统应达成以下目标。

### 3.1 从知识掌握转向工程能力

系统不应只评估用户是否知道某个概念，而应评估用户是否具备以下能力：

```text
读懂代码
补全代码
修改代码
调试代码
测试代码
设计项目
交付项目
表达项目经验
```

### 3.2 从题目系统升级为任务系统

当前题目更像练习题，后续应转为真实工作任务：

```text
背景 → 需求 → 初始代码 → 修改任务 → 测试验收 → 反馈 → 复盘
```

每个任务应该有明确的：

- 场景背景
- 用户角色
- 目标需求
- 输入文件
- 交付标准
- 测试用例
- 评分规则

### 3.3 从运行代码升级为测试验收

核心判断标准应从：

```text
代码能运行
```

升级为：

```text
测试是否通过
需求是否满足
边界是否覆盖
结构是否合理
```

### 3.4 从孤立页面升级为学习闭环

实战结果应反向驱动：

- 技能评估
- 查漏补缺
- 复习计划
- 项目路线图进度
- 模拟面试素材

形成完整闭环：

```text
学习 → 练习 → 实战 → 测试 → 评估 → 查漏 → 复习 → 再实战
```

---

## 4. 推荐方案：五层实战训练系统

当前四阶段方案是：

```text
代码研读 → 填空实战 → 代码改造 → 从零构建
```

建议升级为五层训练系统：

```text
代码研读 → 架构填空 → 需求改造 → 测试调试 → 从零构建
```

即：

| 阶段 | 名称 | 目标能力 |
|---|---|---|
| Phase 1 | Code Reading 代码研读 | 读懂别人写的代码 |
| Phase 2 | Guided Filling 架构填空 | 在给定结构中补全关键逻辑 |
| Phase 3 | Code Modification 需求改造 | 根据需求修改已有项目 |
| Phase 4 | Test & Debug 测试调试 | 根据失败测试定位并修复问题 |
| Phase 5 | Greenfield Build 从零构建 | 根据 PRD 独立完成项目 |

### 4.1 Phase 1：代码研读

#### 目标

训练用户阅读真实项目代码的能力。

#### 训练方式

用户需要完成：

1. 阅读带注释代码
2. 标记关键执行路径
3. 预测输出结果
4. 运行代码验证
5. 回答理解题
6. 总结代码结构

#### 示例任务

```text
任务：理解 Cobra CLI 的命令注册机制

要求：
1. 找出根命令定义位置
2. 找出子命令注册位置
3. 判断 rootCmd.Execute() 的作用
4. 预测执行 myapp hello Tom 的输出
5. 回答 AddCommand 的调用时机
```

#### 评分方式

| 评分项 | 权重 |
|---|---:|
| 理解题正确率 | 40% |
| 执行路径标注 | 30% |
| 输出预测 | 20% |
| 阅读完成度 | 10% |

---

### 4.2 Phase 2：架构填空

#### 目标

解决“看得懂但写不出”的问题。

#### 训练方式

系统提供完整项目架构，用户补全关键逻辑。

适合训练：

- API handler
- 中间件
- 并发控制
- channel 通信
- 数据库 CRUD
- 配置加载
- 错误处理
- 单元测试骨架

#### 改进建议

当前填空标记建议从注释形式：

```go
/* 空白1: xxx */
```

升级为稳定 token：

```go
__BLANK_cli_use__
__BLANK_worker_done__
__BLANK_jwt_sign__
```

这样可以通过 ID 精确替换，避免依赖正则顺序。

#### 数据结构建议

```typescript
interface FillBlank {
  id: string;
  token: string;
  hint: string;
  answer: string;
  alternatives: string[];
  explanation: string;
  knowledgeNodeIds: string[];
}
```

#### 评分方式

| 评分项 | 权重 |
|---|---:|
| 填空正确率 | 50% |
| 编译通过 | 20% |
| 测试通过 | 20% |
| 尝试次数 | 10% |

---

### 4.3 Phase 3：需求改造

#### 目标

训练真实工作中最常见的能力：在已有项目中按需求修改代码。

#### 训练方式

系统提供：

- 已有代码项目
- 需求变更说明
- 约束条件
- 测试用例

用户需要修改代码，使测试通过。

#### 示例任务

```text
任务：给 REST API 添加限流和缓存

已有代码：
- Gin API 服务
- GET /api/users
- POST /api/users

需求：
1. 添加 RateLimit 中间件，每秒最多 10 请求
2. 超限返回 429
3. GET /api/users 添加 30 秒缓存
4. POST /api/users 后清理缓存

验收：
1. 正常请求返回 200
2. 超限请求返回 429
3. 第二次 GET 命中缓存
4. POST 后缓存失效
```

#### 评分方式

| 评分项 | 权重 |
|---|---:|
| 编译通过 | 15% |
| 功能测试通过 | 50% |
| 边界测试通过 | 20% |
| 代码结构 | 10% |
| 错误处理 | 5% |

---

### 4.4 Phase 4：测试调试

#### 目标

训练用户定位问题、理解报错、修复 bug 的能力。

这是当前四阶段方案中最缺失、但最接近真实工作的部分。

#### 训练方式

系统提供一个“有 bug 的项目”，并附带失败测试。

用户需要：

1. 运行测试
2. 阅读失败信息
3. 定位 bug
4. 修改代码
5. 再次运行测试
6. 写出 bug 原因总结

#### 示例任务

```text
任务：修复并发 map 写入 panic

现象：
运行爬虫时偶发 fatal error: concurrent map writes

要求：
1. 复现问题
2. 找出并发写 map 的位置
3. 使用 mutex 或 sync.Map 修复
4. 保证所有测试通过
5. 解释为什么会发生该 panic
```

#### 评分方式

| 评分项 | 权重 |
|---|---:|
| 是否复现问题 | 20% |
| 是否定位根因 | 30% |
| 是否修复测试 | 30% |
| 是否解释清楚 | 20% |

---

### 4.5 Phase 5：从零构建

#### 目标

训练完整项目开发能力。

#### 训练方式

系统只提供：

- PRD
- 验收标准
- 推荐技术栈
- 架构提示
- 测试套件

用户需要从零完成项目。

#### 项目示例

| 等级 | 项目 |
|---|---|
| Lv1 | CLI 工具 |
| Lv2 | 并发爬虫 |
| Lv3 | RESTful API 服务 |
| Lv4 | gRPC 微服务 |
| Lv5 | 分布式任务调度器 |
| Lv6 | 两级缓存系统 |
| Lv7 | 可观测性系统 |
| Lv8 | 高并发系统设计 |

#### 评分方式

| 评分项 | 权重 |
|---|---:|
| 项目结构 | 15% |
| 功能测试 | 35% |
| 边界测试 | 15% |
| 并发/性能测试 | 15% |
| 可维护性 | 10% |
| 项目复盘 | 10% |

---

## 5. 技术架构设计

### 5.1 前端架构

推荐将实战实验室改造成类 IDE 布局：

```text
┌──────────────────────────────────────────────────────────┐
│ 顶部：任务标题 / 阶段 / 运行 / 测试 / 提交                │
├───────────────┬──────────────────────────────┬───────────┤
│ 左侧文件树     │ 中间 Monaco Editor            │ 右侧任务栏 │
│               │                              │           │
│ main.go       │ 代码编辑区                     │ 需求说明   │
│ handler.go    │                              │ 提示       │
│ service.go    │                              │ 测试结果   │
│ main_test.go  │                              │ 评分       │
├───────────────┴──────────────────────────────┴───────────┤
│ 底部终端：编译输出 / 测试输出 / 错误信息                   │
└──────────────────────────────────────────────────────────┘
```

#### 推荐依赖

```text
@monaco-editor/react
zustand
idb-keyval
```

#### 前端核心模块

```text
features/lab/
├── types.ts
├── projects.ts
├── labStore.ts
├── labRunner.ts
├── scoring.ts
├── blankResolver.ts
└── progress.ts

pages/Lab/
├── index.tsx
├── components/
│   ├── FileTree.tsx
│   ├── CodeEditor.tsx
│   ├── TaskPanel.tsx
│   ├── TestResultPanel.tsx
│   └── TerminalPanel.tsx
```

---

### 5.2 后端架构

当前只有 `/api/compile`，建议升级为：

```text
POST /api/lab/run
POST /api/lab/test
POST /api/lab/submit
GET  /api/lab/health
```

#### 接口设计

##### 运行代码

```http
POST /api/lab/run
```

```json
{
  "projectId": "lv3-api-cache",
  "files": [
    {
      "name": "main.go",
      "content": "package main..."
    }
  ]
}
```

##### 运行测试

```http
POST /api/lab/test
```

```json
{
  "projectId": "lv3-api-cache",
  "files": [],
  "testMode": "unit"
}
```

##### 返回结果

```json
{
  "success": true,
  "compilePassed": true,
  "testsPassed": 4,
  "testsFailed": 1,
  "duration": 1234,
  "output": "...",
  "errors": "...",
  "score": 82,
  "feedback": [
    "限流测试通过",
    "缓存失效测试失败，请检查 POST 后是否删除缓存"
  ]
}
```

---

### 5.3 执行沙箱设计

#### 本地模式

适合单机学习：

```text
临时目录 → go mod tidy → go test → go run
```

#### 安全模式

适合多人和线上部署：

```text
Docker 容器执行
```

示例：

```text
docker run --rm \
  --network none \
  --memory 256m \
  --cpus 0.5 \
  --read-only \
  -v temp:/workspace \
  golang:1.23 \
  go test ./...
```

#### 安全限制

| 限制项 | 建议 |
|---|---|
| CPU | 0.5 core |
| 内存 | 256MB |
| 执行时间 | 5-10 秒 |
| 网络 | 默认关闭 |
| 文件系统 | 临时目录，只读基础镜像 |
| 依赖下载 | 白名单或预置依赖 |

---

## 6. 数据模型设计

### 6.1 LabProject

```typescript
export type LabPhase =
  | 'reading'
  | 'filling'
  | 'modification'
  | 'debugging'
  | 'greenfield';

export interface LabProject {
  id: string;
  title: string;
  phase: LabPhase;
  level: number;

  domain: number;
  knowledgeNodeIds: string[];
  projectRoadmapId?: string;

  scenario: LabScenario;
  files: LabFile[];
  tasks: LabTask[];
  tests: LabTest[];
  scoring: LabScoringRule;

  hints: string[];
  references?: string[];
  unlocks?: string[];
}
```

### 6.2 LabScenario

```typescript
export interface LabScenario {
  background: string;
  role: string;
  goal: string;
  constraints: string[];
}
```

### 6.3 LabFile

```typescript
export interface LabFile {
  name: string;
  path: string;
  content: string;
  readonly: boolean;
  language: 'go' | 'mod' | 'json' | 'yaml' | 'md';
  blanks?: FillBlank[];
}
```

### 6.4 LabTask

```typescript
export interface LabTask {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  relatedFiles: string[];
  knowledgeNodeIds: string[];
}
```

### 6.5 LabTest

```typescript
export interface LabTest {
  id: string;
  name: string;
  type: 'unit' | 'api' | 'integration' | 'performance';
  command: string;
  weight: number;
  hidden: boolean;
  feedbackOnFail: string;
}
```

### 6.6 LabProgress

```typescript
export interface LabProgress {
  projectId: string;
  phase: LabPhase;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed';
  files: Record<string, string>;
  attempts: number;
  bestScore: number;
  lastScore: number;
  passedTests: string[];
  failedTests: string[];
  updatedAt: string;
}
```

---

## 7. 与现有模块联动方案

### 7.1 与知识图谱联动

每个实战任务绑定知识点：

```typescript
knowledgeNodeIds: ['2-1', '2-2', '5-1']
```

用户完成任务后：

```text
相关知识点熟练度 +N
失败知识点标记为薄弱点
```

### 7.2 与查漏补缺联动

当用户在某类任务中失败时，自动产生薄弱项：

| 失败场景 | 对应薄弱项 |
|---|---|
| channel 死锁 | 并发通信 |
| race condition | 共享内存并发 |
| JWT 校验失败 | Web 鉴权 |
| 缓存失效失败 | 缓存一致性 |
| API 测试失败 | HTTP 服务设计 |

### 7.3 与技能评估联动

新增实战能力维度：

```text
代码阅读力
代码补全力
需求改造力
测试调试力
项目构建力
```

技能评估雷达图可扩展为：

```text
理论掌握 + 实战能力
```

### 7.4 与项目路线图联动

项目路线图不再只是展示路线，而是每个项目包含完整训练链：

```text
Lv1 CLI 工具
├── Phase 1 读代码
├── Phase 2 填空
├── Phase 3 改需求
├── Phase 4 修 Bug
└── Phase 5 从零构建
```

完成所有阶段后，项目路线图对应项目标记为完成。

### 7.5 与模拟面试联动

用户完成 Phase 5 后，系统生成项目经验素材：

```text
项目背景
技术选型
核心难点
解决方案
踩坑复盘
性能优化
可扩展设计
```

模拟面试可以基于这些素材追问：

```text
你为什么选择这种缓存策略？
如果 Redis 挂了怎么办？
如何解决缓存击穿？
如何做限流？
如何压测？
```

---

## 8. 实施路线图

### P0：基础修复与测试能力

目标：把“能运行”升级为“能测试”。

任务：

1. 清理后端编译处理器未使用导入
2. `/api/compile` 升级为 `/api/lab/run`
3. 新增 `/api/lab/test`
4. 支持多文件写入
5. 支持 `go test ./...`
6. 空白 token 改为稳定 ID
7. 前端显示测试结果

交付标准：

```text
用户可以提交代码，系统运行内置测试并返回通过/失败详情。
```

---

### P1：Phase 3 测试驱动改造

目标：把代码改造题变成真实工作任务。

优先题目：

```text
REST API 限流 + 缓存
```

需要补齐：

- 初始代码
- 需求说明
- `main_test.go`
- API 测试
- 缓存测试
- 限流测试
- 评分规则

交付标准：

```text
用户只有通过测试，才能完成 Phase 3 任务。
```

---

### P2：Monaco Editor 与多文件项目

目标：让实战实验室具备真实 IDE 体验。

任务：

1. 接入 Monaco Editor
2. 增加文件树
3. 支持多文件编辑
4. 支持只读文件
5. 支持当前文件切换
6. 支持终端输出面板

交付标准：

```text
用户可以在浏览器中编辑一个完整 Go 项目。
```

---

### P3：实战进度持久化

目标：保存用户训练过程。

任务：

1. 新增 `labStore`
2. 使用 Zustand + persist 或 IndexedDB
3. 保存文件内容
4. 保存测试结果
5. 保存最佳分数
6. 保存完成状态

交付标准：

```text
刷新页面后，用户代码、进度、分数不会丢失。
```

---

### P4：能力画像联动

目标：让实战结果进入技能评估。

任务：

1. 新增实战能力指标
2. 每次提交后更新能力分
3. 技能评估页面展示实战雷达图
4. 查漏补缺页面展示实战薄弱点
5. 项目路线图展示阶段完成度

交付标准：

```text
实战表现能够驱动整个学习系统的个性化推荐。
```

---

### P5：沙箱执行环境

目标：提高执行安全性。

任务：

1. Docker 执行器
2. CPU/内存限制
3. 网络隔离
4. 超时控制
5. 临时目录隔离
6. 依赖白名单或预置依赖缓存

交付标准：

```text
用户代码不会影响宿主机安全。
```

---

## 9. 推荐优先级

如果资源有限，建议优先做以下三件事：

### 第一优先级：测试驱动验收

这是最重要的，因为它决定系统是否真的能训练工程能力。

```text
运行代码 → 运行测试 → 测试报告 → 评分反馈
```

### 第二优先级：多文件编辑器

没有多文件编辑器，Phase 4 无法成为真实项目训练。

### 第三优先级：能力画像联动

实战系统必须反哺 GoMaster 原有学习系统，否则它只是孤立页面。

---

## 10. 最终目标形态

GoMaster 最终的实战训练系统应呈现为：

```text
实战实验室
├── 项目路线
│   ├── Lv1 CLI 工具
│   │   ├── 代码研读
│   │   ├── 架构填空
│   │   ├── 需求改造
│   │   ├── 测试调试
│   │   └── 从零构建
│   ├── Lv2 并发爬虫
│   ├── Lv3 REST API
│   ├── Lv4 gRPC 微服务
│   ├── Lv5 任务调度器
│   ├── Lv6 缓存系统
│   ├── Lv7 可观测系统
│   └── Lv8 高并发系统设计
│
├── 在线 IDE
│   ├── 文件树
│   ├── Monaco Editor
│   ├── 终端输出
│   ├── 测试报告
│   └── AI 提示
│
├── 验收系统
│   ├── go test
│   ├── API 测试
│   ├── 并发测试
│   ├── 性能测试
│   └── 架构检查
│
└── 能力画像
    ├── 阅读力
    ├── 补全力
    ├── 改造力
    ├── 调试力
    └── 构建力
```

---

## 11. 结论

当前 GoMaster 的四阶段实战流水线方向非常正确，但还不完善。

它现在解决了：

```text
让用户开始动手写代码
```

但还没有完全解决：

```text
如何判断用户真的具备工程能力
```

因此，下一阶段的关键不是继续增加更多填空题，而是补齐实战闭环：

```text
任务场景 → 编码实现 → 自动测试 → 失败反馈 → 能力评估 → 查漏补缺 → 项目沉淀
```

最终，GoMaster 不应该只是 Go 知识学习工具，而应该成为一个面向真实工作的 Go 工程能力训练平台。
