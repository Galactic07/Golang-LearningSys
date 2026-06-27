# GoMaster — Go 应用开发工程师智能学习与面试准备平台

## 产品需求文档 (PRD)

> 版本：v1.0 | 日期：2026-06-24

---

## 一、产品概述

### 1.1 产品定位

GoMaster 是一款面向 **Go 语言应用开发工程师**的智能学习与面试准备平台。通过知识图谱导航、自适应刷题、AI 模拟面试、招聘平台联动四大核心能力，帮助 Go 工程师从"会用 Go"进阶到"精通 Go"，并高效通过技术面试。

### 1.2 目标用户

| 用户画像 | 特征 | 核心诉求 |
|----------|------|----------|
| **Go 初转工程师** | 从 Python/Java/PHP 转向 Go，1-2 年经验 | 快速建立 Go 知识体系，补齐语言特性短板 |
| **Go 中级工程师** | 2-4 年 Go 经验，熟悉主流框架 | 突破瓶颈期，深入 runtime/并发/微服务底层 |
| **Go 高级工程师** | 5+ 年经验，架构设计方向 | 面试准备 + 系统设计 + 技术影响力建设 |
| **求职期工程师** | 任何级别，正在或即将面试 | 针对性刷题 + 模拟面试 + JD 匹配分析 |

### 1.3 核心价值主张

```
传统学习：看书 → 忘记 → 再看 → 面试还是不会
GoMaster：  诊断 → 精准学习 → 间隔复习 → 模拟验证 → 持续追踪
```

### 1.4 与 Coolearn 的演进对比

| 维度 | Coolearn（AI 应用方向） | GoMaster（Go 应用方向） | 改进点 |
|------|------------------------|------------------------|--------|
| 知识领域 | Agent/RAG/LLM 等 AI 领域 | Go 语言/并发/微服务等后端领域 | 领域重塑 |
| 面试引擎 | 规则引擎为主，LLM 未真正接入 | LLM 深度集成 + 规则兜底 | 修复 LLM 调用链路 |
| 数据存储 | localStorage + JSON 文件 | IndexedDB + MySQL | 解决容量、并发和持久化问题 |
| 通信方式 | 3 秒轮询 | WebSocket 实时推送 | 消除无效请求 |
| 类型安全 | 纯 JavaScript | TypeScript 全栈 | 编译期类型保障 |
| 组件架构 | 单文件 1600+ 行 | 模块化 + 策略模式 | 可维护性提升 |
| 评分算法 | 关键词计数 + 长度 | LLM 多维度评分 + 规则辅助 | 评分质量飞跃 |
| 测试覆盖 | 0% | 核心逻辑 80%+ | 重构安全网 |

---

## 二、功能架构

### 2.1 功能全景图

```
GoMaster
├── 🎯 智能诊断
│   ├── 技能雷达图（自评 + 实测）
│   ├── 简历解析 & 技能提取
│   └── 差距分析报告
├── 📚 知识图谱
│   ├── Go 全景知识地图
│   ├── 领域详情 & 学习路径
│   ├── 节点掌握度追踪
│   └── 依赖关系可视化
├── ✍️ 自适应刷题
│   ├── 练习模式（AI 评分）
│   ├── 快速模式（自测）
│   ├── 间隔重复调度
│   ├── 语音 & 文本输入
│   └── 错题本 & 薄弱点聚焦
├── 🎙️ AI 模拟面试
│   ├── 文字面试（LLM 实时追问）
│   ├── 语音面试（Whisper + TTS）
│   ├── JD 定向面试
│   ├── 领域自适应探测
│   └── 面试报告 & 改进建议
├── 📋 学习路径
│   ├── 角色定向路径（后端/云原生/基础架构）
│   ├── 差距补齐路径
│   └── 项目实战路线图
├── 🔗 招聘平台联动
│   ├── Boss 直聘扩展
│   ├── JD 智能解析
│   ├── 简历-JD 匹配度
│   └── 针对性学习推荐
└── ⚙️ 系统设置
    ├── LLM 提供商配置
    ├── 学习偏好设置
    └── 数据导入/导出
```

### 2.2 核心模块详细设计

---

## 三、模块一：智能诊断

### 3.1 技能雷达图

**功能描述**：通过自评 + 实测双维度生成 Go 技能雷达图，直观展示能力分布。

**Go 专属评估维度**：

| 维度 | 评估内容 | 权重 |
|------|----------|------|
| Go 语言基础 | 语法、类型系统、接口、泛型、错误处理 | 15% |
| 并发编程 | goroutine、channel、sync 包、context、并发模式 | 20% |
| 运行时 internals | GC、调度器、内存分配、pprof、逃逸分析 | 15% |
| 工程实践 | 项目结构、测试、lint、CI/CD、模块管理 | 10% |
| 微服务 & RPC | gRPC、Protobuf、服务注册、链路追踪、熔断限流 | 15% |
| 数据库 & 存储 | SQL、Redis、MongoDB、ORM、连接池 | 10% |
| 云原生 | Docker、K8s、Helm、云服务 SDK | 10% |
| 系统设计 | 架构模式、分布式、高可用、性能优化 | 5% |

**交互流程**：

1. 用户进入诊断页，看到 8 维度雷达图（初始为空）
2. 先完成**自评**：每个维度 1-5 星
3. 可选完成**快速测验**：每维度 3 题，根据正确率校准
4. 生成**双雷达叠加图**：自评（虚线）vs 实测（实线）
5. 高亮差距最大的 2-3 个维度，推荐学习路径

**改进点（vs Coolearn）**：
- Coolearn 仅有自评，无实测校准 → GoMaster 增加快速测验验证自评准确性
- 雷达图支持时间线对比，追踪成长轨迹

### 3.2 简历解析

**功能描述**：上传简历（PDF/DOCX/Markdown），自动提取 Go 技术栈和项目经验。

**解析策略**（继承 Coolearn 多策略融合设计，增加 Go 特化）：

| 策略 | 触发条件 | Go 特化 |
|------|----------|---------|
| Go 技术栈锚点 | 检测到 `goroutine`, `gRPC`, `gin` 等关键词 | 优先匹配 Go 生态关键词表 |
| 项目日期行 | `2024.03 - 2025.01` 格式 | 不变 |
| 编号列表 | `1.` / `-` / `•` 开头 | 不变 |
| Markdown 标题 | `##` / `###` 标题 | 不变 |

**Go 技术栈关键词表**（部分）：

```
语言: Go, Golang, goroutine, channel, interface, generic, embed
框架: gin, echo, fiber, chi, gorilla/mux, go-zero, kratos, go-kit
RPC:  gRPC, Protobuf, twirp
数据库: GORM, sqlx, pgx, go-redis, mongo-driver
云原生: Docker, Kubernetes, Helm, Terraform, Pulumi
可观测: Prometheus, OpenTelemetry, Zap, Logrus
测试: testify, gomock, goconvey, fuzz
```

### 3.3 差距分析报告

**功能描述**：综合技能评估 + 简历解析 + 目标 JD，生成差距分析报告。

**输出格式**：

```markdown
## 差距分析报告

### 目标岗位：Go 后端高级工程师 @ 某公司

| 技能维度 | 当前水平 | 岗位要求 | 差距 | 优先级 |
|----------|----------|----------|------|--------|
| 并发编程 | L2 | L4 | 🔴 2级 | P0 |
| gRPC     | L1 | L3 | 🔴 2级 | P0 |
| 运行时   | L2 | L3 | 🟡 1级 | P1 |
| K8s      | L1 | L2 | 🟡 1级 | P1 |
| Go 基础  | L4 | L4 | 🟢 0级 | — |

### 推荐学习路径
1. [并发编程] channel 实战 → context 模式 → 并发模式精讲
2. [gRPC] Protobuf 基础 → 流式 RPC → 拦截器与中间件
3. [运行时] GC 机制 → 调度器 GMP → pprof 实战
```

---

## 四、模块二：知识图谱

### 4.1 Go 全景知识地图

**功能描述**：以交互式有向图展示 Go 知识体系，支持两级浏览（全景 → 领域详情）。

**Go 知识领域定义**：

```
Go 知识体系（8 大领域，每领域 3-4 个层级）
│
├── 1. Go 语言基础
│   ├── L1: 语法/类型/控制流
│   ├── L2: 接口/错误处理/泛型
│   ├── L3: 反射/unsafe/cgo/embed
│   └── L4: 编译器指令/内部机制
│
├── 2. 并发编程
│   ├── L1: goroutine/channel 基础
│   ├── L2: select/context/sync 包
│   ├── L3: 并发模式（fan-in/out, pipeline, worker pool）
│   └── L4: 数据竞争检测/死锁分析/调度器原理
│
├── 3. 运行时与性能
│   ├── L1: GC 基本概念/pprof 入门
│   ├── L2: 三色标记/内存分配器/逃逸分析
│   ├── L3: GMP 调度模型/STW 优化
│   └── L4: 运行时源码级理解/自定义调优
│
├── 4. 工程实践
│   ├── L1: 项目结构/go mod/测试基础
│   ├── L2: 表驱动测试/mock/benchmark/CI
│   ├── L3: 代码审查/lint 规则/文档生成
│   └── L4: 大型项目工程化/monorepo 管理
│
├── 5. 微服务与 RPC
│   ├── L1: HTTP 服务/gin/echo
│   ├── L2: gRPC/Protobuf/中间件
│   ├── L3: 服务注册发现/配置中心/链路追踪
│   └── L4: 服务网格/多集群/灰度发布
│
├── 6. 数据与存储
│   ├── L1: database/sql/Redis 基础
│   ├── L2: GORM/sqlx/连接池/事务
│   ├── L3: 分库分表/读写分离/缓存策略
│   └── L4: 时序数据库/图数据库/新SQL
│
├── 7. 云原生
│   ├── L1: Docker 基础/多阶段构建
│   ├── L2: Kubernetes 核心资源/部署
│   ├── L3: Helm/Operator/Terraform
│   └── L4: 平台工程/内部开发者平台
│
└── 8. 系统设计
    ├── L1: 设计模式/RESTful API
    ├── L2: 分布式基础/CAP/一致性
    ├── L3: 消息队列/事件驱动/CQRS
    └── L4: 高可用架构/限流降级/混沌工程
```

### 4.2 交互设计

**全景视图**：
- 8 个领域以卡片形式排列，每卡片显示：领域名、掌握度进度条、题目完成数
- 卡片颜色编码：🟢 已掌握（≥80%）/ 🟡 学习中（30-80%） / 🔴 薄弱（<30%）
- 点击卡片进入领域详情

**领域详情视图**：
- 使用 React Flow + dagre 自动布局
- 节点 = 知识点，边 = 依赖关系
- 节点大小反映重要性，颜色反映掌握度
- 双击节点 → 跳转学习内容或关联题目

**改进点（vs Coolearn）**：
- Coolearn 的 dagre 布局每次切换重新计算 → GoMaster 缓存布局结果
- 增加搜索和筛选功能（按掌握度、按标签）
- 增加知识路径高亮（从当前节点到目标节点的最短学习路径）

---

## 五、模块三：自适应刷题

### 5.1 题库设计

**题目数据结构**：

```typescript
interface QuizQuestion {
  id: string;                    // 唯一标识
  domain: Domain;                // 所属领域 (1-8)
  level: 1 | 2 | 3 | 4;         // 难度层级
  topic: string;                 // 具体知识点
  question: string;              // 题目文本
  keywords: string[];            // 答案关键词（规则评分用）
  referenceAnswer: string;       // 参考答案
  hints: string[];               // 提示（渐进式）
  tags: string[];                // 标签（用于筛选）
  source?: 'community' | 'official' | 'ai-generated';  // 来源
}
```

**题库规模规划**：

| 领域 | L1 | L2 | L3 | L4 | 合计 |
|------|----|----|----|----|------|
| Go 语言基础 | 30 | 40 | 25 | 15 | 110 |
| 并发编程 | 25 | 40 | 30 | 20 | 115 |
| 运行时与性能 | 15 | 30 | 25 | 15 | 85 |
| 工程实践 | 20 | 30 | 20 | 10 | 80 |
| 微服务与 RPC | 20 | 35 | 25 | 15 | 95 |
| 数据与存储 | 20 | 30 | 20 | 10 | 80 |
| 云原生 | 15 | 25 | 20 | 10 | 70 |
| 系统设计 | 15 | 25 | 20 | 15 | 75 |
| **合计** | **160** | **255** | **185** | **110** | **710** |

### 5.2 刷题模式

#### 练习模式（AI 评分）

**流程**：

1. 用户选择领域和难度（或由系统推荐）
2. 展示题目，用户作答（文本/语音）
3. **双轨评分**：
   - LLM 评分（优先）：5 维度打分 + 详细反馈
   - 规则评分（兜底）：关键词匹配 + 长度 + 结构
4. 展示评分结果 + 参考答案 + 改进建议
5. 更新掌握度

**评分维度**（Go 特化）：

| 维度 | 权重 | 评估重点 |
|------|------|----------|
| 准确性 | 30% | 核心概念是否正确，有无明显错误 |
| 完整性 | 25% | 是否覆盖关键要点，有无遗漏 |
| 深度 | 20% | 是否触及底层原理（如 runtime 行为、内存布局） |
| 工程性 | 15% | 是否考虑边界条件、错误处理、性能影响 |
| 表达力 | 10% | 逻辑是否清晰，术语是否准确 |

#### 快速模式（自测）

- 展示题目 → 用户心中作答 → 展示参考答案 → 用户自评"会/不会/模糊"
- 适合快速过题，不消耗 LLM 额度

### 5.3 间隔重复调度

**功能描述**：基于 SuperMemo SM-2 算法的间隔重复系统，确保长期记忆。

**调度规则**：

```
初始间隔: 1天
答对（掌握度 ≥ 4/5）: 间隔 × 2.5
答对（掌握度 3/5）:   间隔 × 1.5
答错:                 间隔重置为 1天，掌握度 -1
"不会":               间隔重置为 1天，掌握度重置为 0
```

**每日复习队列**：
- 今日到期复习题（优先级最高）
- 新题（根据每日配额）
- 提前复习（用户主动）

**改进点（vs Coolearn）**：
- Coolearn 仅用"5 次答对算掌握"的简单计数 → GoMaster 引入 SM-2 科学调度
- 增加遗忘曲线可视化
- 支持自定义每日配额

### 5.4 掌握度模型

**4 级掌握度**（替代 Coolearn 的简单计数）：

| 级别 | 名称 | 标准 | 触发条件 |
|------|------|------|----------|
| 0 | 未学 | 从未接触 | 初始状态 |
| 1 | 了解 | 能说出基本概念 | 答对 1 次 L1 题 |
| 2 | 理解 | 能解释原理和区别 | 连续答对 2 次同难度题 |
| 3 | 掌握 | 能结合实际场景分析 | 连续答对 3 次 + LLM 评分 ≥ 4 |
| 4 | 精通 | 能深度扩展和教学 | 连续答对 5 次 + 跨难度答对 + LLM 评分 ≥ 4.5 |

**降级机制**（Coolearn 缺失）：
- 间隔复习答错 → 掌握度 -1
- 连续 2 次答错 → 掌握度 -2
- 30 天未复习 → 掌握度 -1（遗忘衰减）

---

## 六、模块四：AI 模拟面试

### 6.1 面试模式

| 模式 | 输入方式 | 评分方式 | 适用场景 |
|------|----------|----------|----------|
| **文字面试** | 键盘输入 | LLM 实时评分 | 深度技术面试准备 |
| **语音面试** | 麦克风 + Whisper | LLM + 语音质量评估 | 模拟真实面试场景 |
| **JD 定向面试** | 文字/语音 | LLM + JD 匹配度 | 针对特定岗位准备 |

### 6.2 面试引擎设计

**核心改进**：修复 Coolearn 中 `generateJDQuestion` 总是回退到通用题目的 bug，实现真正的 JD 感知面试。

#### 领域自适应探测（继承并增强）

```
面试流程:
1. 初始化: 确定探测领域列表和优先级
2. 对每个领域:
   a. 从 L2 开始出题
   b. 根据回答质量决定:
      - 答得好 (LLM 评分 ≥ 4): 升一级 (L2 → L3)
      - 答得一般 (LLM 评分 2.5-4): 同级再出一题
      - 答得差 (LLM 评分 < 2.5): 降一级 (L2 → L1)，标记为当前水平
   c. 达到稳定水平后，切换到下一个领域
3. 所有领域探测完成，生成综合报告
```

#### JD 定向面试（修复版）

```
JD 面试流程:
1. 解析 JD → 提取技术栈和经验要求
2. 匹配技术栈到知识领域 → 确定面试重点
3. 优先从 JD 匹配的领域出题:
   a. 从 JD 题目池中选取匹配题目
   b. 若题目池不足，LLM 实时生成 JD 相关题目
   c. 不再无条件回退到通用题目
4. 面试结束后额外输出: JD 匹配度分析
```

#### LLM 追问机制（新增）

```
追问逻辑:
1. 用户回答后，LLM 评估回答质量
2. 若回答不完整:
   a. 追问 1: "能再详细说说 X 方面吗？"
   b. 追问 2: "如果遇到 Y 情况，你会怎么处理？"
3. 若回答有误:
   a. 追问: "你确定吗？考虑一下 Z 的情况"
4. 最多追问 2 次，避免无限追问
5. 追问的回答也纳入评分
```

### 6.3 面试评分体系

**5 维度评分**（Go 特化）：

| 维度 | 权重 | Go 特化评估点 |
|------|------|---------------|
| 准确性 | 30% | 概念正确性、runtime 行为理解 |
| 完整性 | 25% | 是否覆盖边界条件、error handling |
| 深度 | 20% | 是否触及底层原理（GMP、GC、内存布局） |
| 工程性 | 15% | context 传播、graceful shutdown、资源释放 |
| 表达力 | 10% | 逻辑清晰度、Go 术语准确性 |

**面试报告输出**：

```markdown
## 面试报告

### 综合评分: 3.6 / 5.0

### 各领域表现
| 领域 | 评估等级 | 得分 | 关键反馈 |
|------|----------|------|----------|
| 并发编程 | L3 | 4.2 | channel 使用熟练，但 context 取消传播理解不足 |
| gRPC | L2 | 3.0 | 基础概念清楚，流式 RPC 和拦截器需加强 |
| 运行时 | L1 | 2.5 | GC 基本概念了解，GMP 调度模型需深入学习 |

### 薄弱项分析
1. **context 传播模式**: 建议学习 context.WithTimeout + select 配合模式
2. **gRPC 流式通信**: 建议实践双向流式 RPC 的错误处理
3. **GMP 调度模型**: 建议阅读 Go runtime scheduler 源码分析

### 推荐学习路径
→ [并发编程 L3 → L4] → [gRPC L2 → L3] → [运行时 L1 → L2]
```

### 6.4 语音面试技术方案

```
架构:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  麦克风输入   │ ──→ │ Whisper 本地  │ ──→ │ 文本清理     │
│  (MediaStream)│     │ (ONNX Runtime)│     │ (cleanVoice) │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
┌─────────────┐     ┌──────────────┐     ┌──────▼──────┐
│  TTS 朗读    │ ←── │  面试引擎     │ ←── │  LLM 评分   │
│  (Web TTS)   │     │ (状态机)      │     │ (多维度)     │
└─────────────┘     └──────────────┘     └─────────────┘
```

**改进点（vs Coolearn）**：
- Whisper 模型改为运行时按需下载（不打入构建产物）
- 增加语音质量评估（语速、停顿、填充词频率）
- TTS 支持选择声音和语速

---

## 七、模块五：学习路径

### 7.1 角色定向路径

| 路径名称 | 目标角色 | 核心领域 | 预计学习量 |
|----------|----------|----------|-----------|
| Go 后端工程师 | Web 服务开发 | 基础 + 并发 + 微服务 + 数据 | 200 题 |
| Go 云原生工程师 | 基础设施 & K8s | 基础 + 并发 + 云原生 + 运行时 | 180 题 |
| Go 基础架构工程师 | 中间件/数据库 | 并发 + 运行时 + 系统设计 + 数据 | 220 题 |
| Go 全栈工程师 | 前后端兼顾 | 基础 + 微服务 + 数据 + 工程实践 | 190 题 |

### 7.2 差距补齐路径

**自动生成逻辑**：
1. 读取差距分析报告
2. 按"差距 × 优先级"排序
3. 为每个差距领域生成: 当前水平 → 目标水平的学习步骤
4. 插入对应的题目和阅读材料

### 7.3 项目实战路线图

**功能描述**：推荐与学习进度匹配的实战项目。

| 阶段 | 项目示例 | 涉及领域 |
|------|----------|----------|
| L1-L2 | Todo REST API (gin + GORM) | 基础、微服务 L1、数据 L1 |
| L2-L3 | 分布式任务队列 (goroutine + Redis) | 并发 L2-L3、数据 L2 |
| L3-L4 | gRPC 微服务集群 (go-zero + K8s) | 微服务 L3、云原生 L2 |
| L4 | 高性能消息推送 (netpoll + etcd) | 运行时 L3-L4、系统设计 L3 |

---

## 八、模块六：招聘平台联动

### 8.1 Boss 直聘浏览器扩展

**功能**（继承 Coolearn 设计）：
- 自动抓取投递记录
- 一键分析 JD 技术栈
- 简历-JD 匹配度计算
- 同步数据到主应用

**改进点**：
- 增加拉勾、猎聘支持（扩展适配器模式）
- 数据同步改用 WebSocket 替代 3 秒轮询
- 增加投递状态追踪看板

### 8.2 JD 智能解析

**Go 特化解析规则**：

```typescript
// Go 技术栈提取正则（部分示例）
const GO_PATTERNS = {
  language:   /\b(go|golang)\b/i,
  frameworks: /\b(gin|echo|fiber|chi|gorilla|go-zero|kratos|go-kit)\b/i,
  rpc:        /\b(grpc|protobuf|twirp)\b/i,
  database:   /\b(mysql|postgresql|postgres|redis|mongodb|clickhouse)\b/i,
  cloud:      /\b(docker|kubernetes|k8s|helm|terraform)\b/i,
  messaging:  /\b(kafka|rabbitmq|nats|rocketmq)\b/i,
  observability: /\b(prometheus|grafana|opentelemetry|jaeger)\b/i,
  level:      /(\d+)\+?\s*年/,  // 经验年限
};
```

### 8.3 简历-JD 匹配度

**匹配算法**：

```
匹配度 = Σ(匹配技能权重) / Σ(JD 要求技能权重) × 100%

技能权重:
- 必须技能 (JD 中 "必须/要求/精通"): 权重 3
- 加分技能 (JD 中 "优先/加分/了解"): 权重 1
- 匹配判定: 简历中出现的技能 → 完全匹配; 相关技能 → 部分匹配(0.5)
```

---

## 九、技术架构

### 9.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    GoMaster 前端                      │
│  React 19 + TypeScript + Vite + Tailwind CSS         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │知识图谱   │ │刷题系统   │ │模拟面试   │ │招聘联动│ │
│  │React Flow│ │Quiz Engine│ │Interview │ │Boss Ext│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │  Zustand（运行时状态）+ IndexedDB（离线缓存）      ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────┘
                       │ WebSocket + REST
┌──────────────────────▼──────────────────────────────┐
│                   GoMaster 后端                       │
│              Go (Gin) + MySQL                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │API 网关   │ │面试调度   │ │JD 解析    │ │数据同步│ │
│  │JWT Auth  │ │LLM Proxy │ │NLP 提取   │ │Ext API │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ LLM API  │  │  MySQL   │  │ Boss API │
  │OpenAI/   │  │ 8.0+     │  │ Cookie   │
  │DeepSeek  │  │ InnoDB   │  │ 登录     │
  └──────────┘  └──────────┘  └──────────┘
```

### 9.2 关键技术选型

| 层级 | 技术 | 选型理由 | vs Coolearn 改进 |
|------|------|----------|-----------------|
| **前端框架** | React 19 + TypeScript | 类型安全 + 生态成熟 | JS → TS |
| **构建工具** | Vite 8 | 快速 HMR + 生态好 | 不变 |
| **状态管理** | Zustand + persist | 轻量 + 内置持久化 | localStorage 直连 → Zustand |
| **持久存储** | IndexedDB (idb-keyval) | 大容量 + 异步 | localStorage → IndexedDB |
| **CSS 方案** | Tailwind CSS + CSS 变量 | 原子化 + 主题支持 | 不变 |
| **图谱渲染** | React Flow + dagre | 成熟 + 自动布局 | 不变 |
| **动画** | Framer Motion | 声明式动画 | 移除 three/ogl/gsap |
| **后端语言** | Go (Gin) | 与产品主题一致 + 高性能 | Express/Node → Go |
| **数据库** | MySQL 8.0+ (InnoDB) | 生产级关系型数据库 + JSON 字段支持 | JSON 文件 → MySQL |
| **ORM** | GORM | Go 生态主流 ORM + 自动迁移 | 无 → GORM |
| **实时通信** | WebSocket (gorilla/websocket) | 双向实时 | 3s 轮询 → WebSocket |
| **语音识别** | Whisper (transformers.js) | 本地运行 + 隐私 | 不变，但按需加载 |
| **LLM 集成** | OpenAI/DeepSeek/Custom | 多提供商支持 | 修复调用链路 |
| **浏览器扩展** | WXT + TypeScript | 类型安全 + 跨浏览器 | 混淆 JS → TS |

### 9.3 数据模型

#### 前端数据模型（TypeScript）

```typescript
// 前端 IndexedDB 缓存（离线可用）
interface LocalCache {
  // 用户进度（离线刷题后同步到后端）
  questionProgress: Map<string, QuestionProgress>;
  // LLM 配置（敏感信息仅存本地）
  llmConfig: LLMConfig;
  // 待同步队列（离线操作记录）
  syncQueue: SyncAction[];
}

interface QuestionProgress {
  questionId: string;
  correctCount: number;
  masteryLevel: 0 | 1 | 2 | 3 | 4;
  nextReviewDate: string;
  interval: number;
  lastAnswerDate: string;
  lastScore: number;
  dirty: boolean;  // 是否待同步到后端
}

interface LLMConfig {
  provider: 'openai' | 'deepseek' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}
```

#### 后端数据模型（MySQL）

```sql
-- 用户表
CREATE TABLE users (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  email      VARCHAR(255) UNIQUE,
  nickname   VARCHAR(100),
  avatar_url VARCHAR(500),
  settings   JSON,              -- 偏好设置（每日配额、刷题模式等）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 题库表
CREATE TABLE questions (
  id               INT PRIMARY KEY,
  domain           TINYINT NOT NULL,        -- 1-8 领域
  level            TINYINT NOT NULL,        -- 1-4 难度
  topic            VARCHAR(100) NOT NULL,
  question         TEXT NOT NULL,
  reference_answer TEXT NOT NULL,
  keywords         JSON,                    -- ["goroutine", "GMP"]
  hints            JSON,                    -- 渐进式提示
  tags             JSON,                    -- 标签
  source           ENUM('community','official','ai-generated') DEFAULT 'official',
  INDEX idx_domain_level (domain, level),
  INDEX idx_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 刷题进度表
CREATE TABLE progress (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT NOT NULL,
  question_id     INT NOT NULL,
  mastery_level   TINYINT DEFAULT 0,       -- 0-4 掌握度
  correct_count   INT DEFAULT 0,
  next_review     DATE,                    -- SM-2 下次复习日期
  review_interval INT DEFAULT 1,           -- SM-2 间隔天数
  last_score      DECIMAL(3,2),
  last_answer_at  DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_question (user_id, question_id),
  INDEX idx_review (user_id, next_review),  -- 间隔重复查询优化
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 面试记录表
CREATE TABLE interviews (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT NOT NULL,
  type           ENUM('text','voice','jd') NOT NULL,
  jd_id          BIGINT,                   -- JD 定向面试关联
  overall_score  DECIMAL(3,2),
  domain_results JSON,                     -- 各领域评估结果
  summary        TEXT,
  improvements   JSON,                     -- 改进建议列表
  started_at     DATETIME NOT NULL,
  finished_at    DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 面试答题明细表
CREATE TABLE interview_answers (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  interview_id   BIGINT NOT NULL,
  question_id    INT NOT NULL,
  domain         TINYINT,
  level          TINYINT,
  user_answer    TEXT,
  score          DECIMAL(3,2),
  score_detail   JSON,                     -- 各维度评分详情
  follow_ups     JSON,                     -- 追问记录
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interview (interview_id),
  FOREIGN KEY (interview_id) REFERENCES interviews(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JD 记录表
CREATE TABLE job_descriptions (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  source      ENUM('boss','lagou','liepin','manual') NOT NULL,
  company     VARCHAR(200),
  position    VARCHAR(200),
  raw_text    TEXT,                        -- JD 原文
  tech_stack  JSON,                        -- 提取的技术栈
  requirements JSON,                      -- 结构化要求（含权重）
  match_score DECIMAL(5,2),               -- 匹配度百分比
  salary_min  INT,
  salary_max  INT,
  experience  VARCHAR(50),
  source_url  VARCHAR(500),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_source (source),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学习路径表
CREATE TABLE learning_paths (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  path_type   ENUM('role','gap','project') NOT NULL,
  name        VARCHAR(200),
  target_role VARCHAR(100),               -- 角色定向路径的目标角色
  steps       JSON,                       -- 路径步骤（领域+目标等级+资源）
  progress    DECIMAL(5,2) DEFAULT 0,     -- 完成百分比
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 前后端数据同步策略

```
在线模式:
  用户操作 → 前端 Zustand 更新 → 即时写后端 MySQL → 成功后写 IndexedDB 缓存

离线模式:
  用户操作 → 前端 Zustand 更新 → 写 IndexedDB + 加入 syncQueue
  恢复在线 → 批量同步 syncQueue 到后端 → 清空队列

冲突处理:
  以后端数据为准，前端进度取 max(本地, 服务端)
  面试记录等不可合并数据，提示用户选择保留版本
```

### 9.4 项目目录结构

```
gomaster/
├── web/                            # 前端项目
│   ├── src/
│   │   ├── app/                    # 路由 & 布局
│   │   │   ├── App.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── routes.ts
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Dashboard/
│   │   │   ├── KnowledgeGraph/
│   │   │   ├── Quiz/
│   │   │   ├── Interview/
│   │   │   │   ├── index.tsx       # 面试入口
│   │   │   │   ├── TextInterview.tsx
│   │   │   │   ├── VoiceInterview.tsx
│   │   │   │   ├── JDInterview.tsx
│   │   │   │   └── InterviewReport.tsx
│   │   │   ├── LearningPath/
│   │   │   ├── JobSync/
│   │   │   └── Settings/
│   │   ├── features/               # 业务逻辑（按功能域组织）
│   │   │   ├── quiz/
│   │   │   │   ├── quizEngine.ts   # 刷题引擎
│   │   │   │   ├── spacedRepetition.ts  # SM-2 调度
│   │   │   │   └── scoring.ts      # 评分算法
│   │   │   ├── interview/
│   │   │   │   ├── interviewEngine.ts   # 面试状态机
│   │   │   │   ├── domainProbing.ts     # 领域探测
│   │   │   │   └── followUp.ts          # 追问逻辑
│   │   │   ├── knowledge/
│   │   │   │   ├── graphBuilder.ts      # 图谱构建
│   │   │   │   └── pathFinder.ts        # 学习路径计算
│   │   │   ├── resume/
│   │   │   │   ├── parser.ts            # 简历解析
│   │   │   │   └── goSkillExtractor.ts  # Go 技能提取
│   │   │   └── jd/
│   │   │       ├── parser.ts            # JD 解析
│   │   │       └── matcher.ts           # 匹配度计算
│   │   ├── stores/                 # Zustand 状态
│   │   │   ├── useQuizStore.ts
│   │   │   ├── useInterviewStore.ts
│   │   │   ├── useConfigStore.ts
│   │   │   └── useJobStore.ts
│   │   ├── services/               # 外部服务
│   │   │   ├── llm.ts              # LLM 适配器
│   │   │   ├── whisper.ts          # 语音识别
│   │   │   └── websocket.ts        # WebSocket 客户端
│   │   ├── data/                   # 静态数据（JSON）
│   │   │   ├── domains.json
│   │   │   ├── questions/          # 按领域拆分
│   │   │   │   ├── basics.json
│   │   │   │   ├── concurrency.json
│   │   │   │   ├── runtime.json
│   │   │   │   └── ...
│   │   │   └── learning-paths.json
│   │   ├── components/             # 通用 UI 组件
│   │   │   ├── ui/                 # 基础组件
│   │   │   ├── charts/             # 图表组件
│   │   │   └── voice/              # 语音组件
│   │   └── lib/                    # 工具库
│   │       ├── storage.ts          # IndexedDB 封装
│   │       └── utils.ts
│   ├── public/
│   └── tests/
│       ├── features/               # 业务逻辑测试
│       └── components/             # 组件测试
│
├── server/                         # Go 后端
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── handler/                # HTTP 处理器
│   │   ├── service/                # 业务逻辑
│   │   ├── repository/             # 数据访问
│   │   ├── model/                  # 数据模型
│   │   └── middleware/             # 中间件
│   ├── pkg/
│   │   ├── llm/                    # LLM 客户端
│   │   ├── jd/                     # JD 解析
│   │   └── ws/                     # WebSocket
│   ├── db/
│   │   ├── schema.sql
│   │   ├── seed/
│   │   │   └── questions.sql       # 题库种子数据
│   │   └── migrations/
│   └── go.mod
│
├── extension/                      # 浏览器扩展
│   ├── src/
│   │   ├── background.ts
│   │   ├── content.ts
│   │   └── popup/
│   ├── wxt.config.ts
│   └── package.json
│
└── scripts/                        # 工具脚本
    ├── seed-questions/              # 题目生成器
    └── import-data/                 # 数据导入
```

---

## 十、LLM 集成方案

### 10.1 调用架构（修复 Coolearn 的核心 bug）

```typescript
// llm.ts — LLM 适配器（修复版）

interface LLMConfig {
  provider: 'openai' | 'deepseek' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 统一调用入口，确保 LLM 真正被调用
async function callLLM(prompt: string, config: LLMConfig): Promise<string> {
  if (!config.apiKey) {
    throw new LLMNotConfiguredError('API Key 未配置');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new LLMCallError(`LLM 调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 优雅降级：LLM 优先 → 规则兜底
async function scoreAnswer(
  question: QuizQuestion,
  answer: string,
  config: LLMConfig
): Promise<ScoreResult> {
  try {
    // 优先使用 LLM 评分
    const llmResult = await scoreWithLLM(question, answer, config);
    return { ...llmResult, source: 'llm' };
  } catch (error) {
    // 降级到规则评分
    console.warn('LLM 评分失败，降级到规则评分:', error);
    const ruleResult = scoreWithRules(question, answer);
    return { ...ruleResult, source: 'rules' };
  }
}
```

### 10.2 Prompt 工程

**评分 Prompt**：

```
你是一位资深 Go 工程师面试官，请对以下回答进行评分。

题目：{question}
参考答案要点：{referenceAnswer}
候选人回答：{userAnswer}

请按以下维度评分（1-5 分），并给出简要反馈：

1. 准确性（权重 30%）：核心概念是否正确
2. 完整性（权重 25%）：是否覆盖关键要点
3. 深度（权重 20%）：是否触及底层原理
4. 工程性（权重 15%）：是否考虑边界条件和错误处理
5. 表达力（权重 10%）：逻辑是否清晰

请以 JSON 格式输出：
{
  "accuracy": { "score": 4, "feedback": "..." },
  "completeness": { "score": 3, "feedback": "..." },
  "depth": { "score": 3, "feedback": "..." },
  "engineering": { "score": 4, "feedback": "..." },
  "expression": { "score": 4, "feedback": "..." },
  "overall": 3.6,
  "improvement": "建议..."
}
```

**题目生成 Prompt**：

```
你是一位 Go 语言面试题出题专家，请根据以下要求生成一道面试题。

领域：{domain}
难度：Level {level}
知识点：{topic}
JD 关键词（如有）：{jdKeywords}

要求：
1. 题目应考察对 Go 语言核心概念的理解，而非死记硬背
2. Level 1-2 考察基础概念和用法
3. Level 3 考察原理理解和实际应用
4. Level 4 考察底层机制和源码级理解
5. 提供参考答案和评分要点

请以 JSON 格式输出：
{
  "question": "...",
  "referenceAnswer": "...",
  "keywords": ["...", "..."],
  "hints": ["...", "..."]
}
```

---

## 十一、非功能需求

### 11.1 性能指标

| 指标 | 目标值 |
|------|--------|
| 首屏加载时间 | < 2s（3G 网络） |
| 题目切换响应 | < 200ms |
| LLM 评分响应 | < 5s |
| 语音识别延迟 | < 2s |
| WebSocket 消息延迟 | < 100ms |
| IndexedDB 读写 | < 50ms |
| 知识图谱渲染 | < 500ms（50 节点） |

### 11.2 数据容量

| 数据类型 | 预估大小 | 存储方案 |
|----------|----------|----------|
| 题目数据 | ~2MB (710 题) | MySQL questions 表 + 前端按需加载 |
| 用户进度 | ~500KB | MySQL progress 表 + IndexedDB 离线缓存 |
| 面试记录 | ~2MB (100 次) | MySQL interviews + interview_answers 表 |
| JD 记录 | ~1MB (200 条) | MySQL job_descriptions 表 |
| LLM 配置 | ~1KB | 仅 IndexedDB（敏感信息不存后端） |
| Whisper 模型 | ~40MB | 运行时按需下载 |

### 11.3 安全需求

| 需求 | 方案 |
|------|------|
| API Key 存储 | 加密存储于 IndexedDB，仅存本地，不明文传输 |
| 后端认证 | JWT Token + HttpOnly Cookie |
| LLM 调用 | 后端代理，API Key 不暴露到前端 |
| 数据库安全 | MySQL 最小权限账号 + 连接加密 + 定期备份 |
| 浏览器扩展 | 最小权限原则，仅申请必要权限 |
| 数据导出 | 支持用户数据完整导出（GDPR 合规） |

### 11.4 兼容性

| 平台 | 最低版本 |
|------|----------|
| Chrome | 100+ |
| Edge | 100+ |
| Firefox | 100+ |
| Safari | 16+ |
| 移动端浏览器 | iOS 16+ / Android 12+ |

---

## 十二、开发计划

### Phase 1：核心 MVP（4 周）

| 周次 | 交付物 |
|------|--------|
| W1 | 项目脚手架 + 路由 + 布局 + Zustand + IndexedDB 基础设施 |
| W2 | 刷题系统（练习模式 + 快速模式 + 规则评分）+ 题库 200 题 |
| W3 | LLM 集成（评分 + 题目生成）+ 知识图谱全景视图 |
| W4 | 文字面试 + 面试报告 + Dashboard |

### Phase 2：完善体验（4 周）

| 周次 | 交付物 |
|------|--------|
| W5 | 间隔重复调度 + 错题本 + 掌握度模型 |
| W6 | 语音面试（Whisper + TTS）+ 简历解析 |
| W7 | Go 后端搭建 + MySQL + GORM + WebSocket + JD 解析 |
| W8 | Boss 直聘扩展 + 简历-JD 匹配 |

### Phase 3：高级功能（4 周）

| 周次 | 交付物 |
|------|--------|
| W9 | JD 定向面试 + LLM 追问机制 |
| W10 | 学习路径 + 项目实战路线图 |
| W11 | 差距分析报告 + 技能雷达图 |
| W12 | 性能优化 + 测试补全 + 部署上线 |

---

## 十三、成功指标

| 指标 | 3 个月目标 | 6 个月目标 |
|------|-----------|-----------|
| 注册用户 | 500 | 2000 |
| 周活跃用户 | 200 | 800 |
| 人均刷题数/周 | 20 | 35 |
| 模拟面试完成率 | 40% | 60% |
| 用户 NPS | ≥ 30 | ≥ 50 |
| 题库规模 | 400 | 710 |
| LLM 评分占比 | 60% | 80% |
