# Codex Harness Arena (CHA)
## 系统全景架构与后端落地实现技术规范 (Architecture & Backend Specification)

> **💡 说明与使用指引**：  
> 本文档是 **Codex Harness Arena (CHA)** 的全景技术架构设计与后端完整落地方案规范。  
> 本文档详细梳理了当前前端的完整交互状态机、评测体系数学模型、物理沙箱工作区映射、双轨验收闭环、以及所有边界防御设计。  
> **可直接将本文档交付给 Codex**，作为补充后端服务、持久化存储与 CLI 自动化流水线的权威开发指南。

---

## 目录
1. [项目背景与系统核心定位 (Context & Bounds)](#1-项目背景与系统核心定位-context--bounds)
2. [评测体系与双轨数学引擎 (Evaluation & Math Engine)](#2-评测体系与双轨数学引擎-evaluation--math-engine)
3. [双赛道解耦与 Spec 契约协议 (Paradigms & Task Spec Protocol)](#3-双赛道解耦与-spec-契约协议-paradigms--task-spec-protocol)
4. [物理工作区与执行流细则 (Workspaces & Execution Flow)](#4-物理工作区与执行流细则-workspaces--execution-flow)
5. [异常中断状态机与抗幻觉防御机制 (Resiliency & Anti-Hallucination)](#5-异常中断状态机与抗幻觉防御机制-resiliency--anti-hallucination)
6. [前端组件与交互状态全景 (Frontend Architecture & State)](#6-前端组件与交互状态全景-frontend-architecture--state)
7. [面向 Codex 的完整后端接口与数据表规范 (Backend API & Database Specs)](#7-面向-codex-的完整后端接口与数据表规范-backend-api--database-specs)

---

## 1. 项目背景与系统核心定位 (Context & Bounds)

### 1.1 真实开发者痛点
日常使用 Codex 桌面端写代码时，开发者通常会不断向全局 `AGENTS.md` 追加规则、安装社区 Skills。随着时间推移，全局配置愈加臃肿，部分陈旧 Skill 产生冲突；同时前沿大模型本身也存在“过度工程化”倾向（喜欢擅自构建多层抽象、新增多余 demo 文件与日志包装类）。  
市面主流 Benchmark（如 SWE-bench）通常只在无菌环境测量纯裸模型，而现实生产中是 **模型 + 本地 Harness（全局规则、Skills、思考档位）** 共同作用。开发者无法判断微调的规则到底是在提效还是负优化。本项目即用于提供控制变量的本地对比工作台。

### 1.2 两大核心边界与叠甲声明 (Crucial Bounds)
1. **宿主基准固定在 Codex 桌面端**：
   - Codex 桌面客户端自带沙箱隔离、执行环境、文件修改协议与工具调用上下文；
   - 本系统以 Codex 桌面端为固定底座，被评测与控制的变量是其**外延部分**：全局 `AGENTS.md`、自定义局部规则、Skills 组合与思考档位（Reasoning Levels）；
2. **理性看待单次采样的物理波动 (Sampling Variance)**：
   - 大模型存在天然的采样随机性与温度波动；
   - 在基底模型与思考档位保持不变时，微调 2~3 行规则可能在单次测试中仅表现出 **±2~3 分** 的波动或采样噪音；
   - 评测系统旨在通过多用例、多次运行呈现**结构性趋势**（如是否有效压制垃圾文件生成、过时 Skill 是否导致退出码非 0）。

---

## 2. 评测体系与双轨数学引擎 (Evaluation & Math Engine)

### 2.1 综合成绩计算公式
系统总成绩为百分制（Codex IQ），由**机械客观自动化得分**与**人类专家复审得分**等权（50% : 50%）加权合成：

$$\text{Codex IQ} = \text{机械客观自动化得分} \times 50\% + \text{人类专家复审得分} \times 50\%$$

### 2.2 第一轨：机械客观自动化判断 (Machine Objective Engine - 50%)
具备 0 人工偏见、100% 确定性与可重现性：
1. **测试用例全量断言与退出码 (Pass Rate & Exit Code 0, 50% 机械分)**：
   - 运行单元测试（Vitest/Jest）与端到端无头测试（Playwright）；
   - 进程退出码必须为 0（Exit Code 0），非 0 则该项判定为失败；
2. **静态编译与类型安全 (TypeScript 0 Error / ESLint, 25% 机械分)**：
   - 执行 `tsc --noEmit` 与静态代码检查；
   - 杜绝隐式 `any` 逃避类型检查、未捕获 Promise 与死循环；
3. **Git 物理变更纯净度 (Git Diff & Budget, 25% 机械分)**：
   - 审计变动行数与文件树；
   - **惩罚规则**：严厉惩罚未经许可创建的临时 demo 文件、无用包装辅助类与日志类（发现 1 个扣除 15 分，超过文件预算扣分）；
4. **运行时能耗遥测 (Telemetry)**：
   - 端到端时延（秒）、生成吞吐速率（Tokens/sec）；
   - Token 消耗四元细分：输入 Prompt Token、生成输出 Token、思维链推理 Token（Reasoning Tokens）；
   - 提示词缓存命中率（Prompt Cache Hit Rate，如 84.5%）。

### 2.3 第二轨：人类专家 5 维工程复审量表 (Human Expert Review Matrix - 50%)
针对机器单测无法度量的架构自洽性与交互体验，由工程师按 0~100 连续数值打分：
1. **🎯 需求切中与意图理解 (Intent Fidelity, 30% 人工分)**：
   - 是否准确理解隐式真实诉求？核心功能是否一步到位？有无功能减配或阳奉阴违；
2. **🧹 代码规范与工程纯净度 (Code Cleanliness, 25% 人工分)**：
   - 命名是否规范？模块分层是否清晰自洽？有无反直觉的过度封装；
3. **🛡️ 边界防御与异常健壮度 (Defensive Robustness, 25% 人工分)**：
   - 空值与极端输入保护、网络异常重试、竞态防抖与内存泄露防御；
4. **🎨 交互可用性与视觉质感 (UI/UX Ergonomics, 20% 人工分)**：
   - 页面布局留白、暗黑模式适配、加载骨架屏与交互反馈细腻度；
5. **🏷️ PR 准入评级 (Merge Readiness Level)**：
   - 🟢 免修直接合并 (`ready_to_merge`, ≥90 分)
   - 🟡 微调即可合入 (`minor_polish`, 80~89 分)
   - 🟠 需较大幅重构 (`major_rework`, 60~79 分)
   - 🔴 拒绝合入 (`rejected`, <60 分)

### 2.4 权重预设微调机制 (Weight Presets)
系统内建 5 套权重预设，支持自定义微调（前端通过 `WeightPresetCustomizer` 实时联动）：
- **标准平衡配比**：客观单测 30%、直击效率 35%、视觉质感 35%；
- **极简直击交付型**：直击效率 45%、客观单测 25%、约束遵从 20%、视觉 10%；
- **SWE-bench 极端客观型**：客观单测 70%、直达 20%、约束 10%；
- **UI 交互手感型**：视觉手感 50%、客观单测 20%、直达 20%、约束 10%；
- **企业级严谨治理型**：约束遵从 50%、客观单测 25%、直达 15%、视觉 10%。

---

## 3. 双赛道解耦与 Spec 契约协议 (Paradigms & Task Spec Protocol)

### 3.1 赛道解耦原则
1. **确定性 Bug 修复赛道 (`deterministic-bugfix`)**：
   - 特点：局部精准修改、单测重现、退出码校验，考核排错与低修改量；
2. **全栈项目构建赛道 (`open-ended-project`)**：
   - 特点：从需求落地完整功能模块，涵盖前端交互、状态管理、后端 API 契约与持久化，考核端到端工程能力。

### 3.2 4 级标准化能力分级 (Difficulty Tiers)
- 🟢 **Easy (入门)**：单文件改动、基础样式修缮、简单配置切换；
- 🔵 **Medium (进阶)**：多组件联动、异步表单动态校验、并发请求去重缓存；
- 🟡 **Hard (工业级)**：万级数据虚拟滚动列表、长文本同频滚动、ReDoS 正则防御；
- 🔴 **Nightmare (高压极限)**：分布式锁租期脑裂排查、Canvas 60fps 高刷波形图、多通道死锁自愈。

### 3.3 开放性项目的四大标准化 Spec 协议 (Golden Spec Contract)
为解决“做项目太自由无法自动跑分，太死板退化为单测题”的难题，每道项目题预置标准化规范：
1. **核心用户故事 (User Stories)**：定义 3~5 条可交互的闭环操作链路（如：新建卡片 ➔ 拖拽流转 ➔ 撤销 ➔ 刷新恢复）；
2. **前后端接口契约 (API Endpoints)**：约定规范的 RESTful/SSE 接口格式（如 `GET/POST /api/tasks`）；
3. **数据持久化模型 (Data Models)**：定义实体字段契约与存储介质（SQLite / LocalStorage），杜绝页面一刷数据全空的玩具 Demo；
4. **验收门禁标准 (Acceptance Criteria)**：明确无头巡检要求与控制台 0 报错标准；
5. **预置脚手架沙箱**：预先铺设现代脚手架，免除 Agent 折腾 `package.json` 的损耗；
6. **三层立体智能验收栈**：
   - Layer 1：Playwright E2E 无头自动化测试 (40%)；
   - Layer 2：审查 Agent 契约覆盖率比对 (30%)；
   - Layer 3：Web 实时预览与人机感官速评 (30%)。

---

## 4. 物理工作区与执行流细则 (Workspaces & Execution Flow)

### 4.1 双模式物理工作区映射
Codex 必须在一个具体的本地物理文件夹内读写代码。系统支持两种工作区模式：
1. **推荐隔离沙箱 (默认)**：
   - 路径规则：`~/.codex/sandboxes/eval-${taskId}`
   - 优势：安全隔离，彻底杜绝污染开发者本地真实业务代码；
2. **指定本地目录 (自定义)**：
   - 允许用户粘贴本地电脑上的任意绝对路径（如 `D:/test-projects/eval-01`）；
   - 前端输入框与【复制路径】按钮即时联动，下方 CLI 与脚本自动同步替换为此绝对路径。

### 4.2 实际评测与验收三步闭环
```
┌───────────────────────────────────────┐
│ 1. Codex 跑代码                       │
│    复制提示词 ➔ 本地打开目录 ➔ 发送执行 │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 2. 终端跑客观验收命令                 │
│    运行 verificationCmd (Exit Code 0) │
│    运行 git diff --stat 检查文件纯净度 │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 3. 前端数据录入与专家复审             │
│    点击【立即启动评测】记录客观数据    │
│    点击【专家复审】调整 5 维量表并入榜  │
└───────────────────────────────────────┘
```

### 4.3 多轮多阶段执行 (Multi-Turn) 与反向防退化回归测试
对于复杂的演进任务，系统支持按阶段推进：
1. **阶段推进**：
   - 阶段 1：复制 Stage 1 提示词发给 Codex，完成基础骨架；
   - 阶段 2：在同一 Codex 会话中粘贴 Stage 2 提示词，推进进阶功能；
2. **关键铁律：反向防退化回归测试 (Regression Test)**：
   - 执行完 Stage 2 后，系统**必须重新运行 Stage 1 的测试用例**；
   - 确保第二轮新代码没有破坏第一轮已有功能，发生倒退直接扣除回归分。

---

## 5. 异常中断状态机与抗幻觉防御机制 (Resiliency & Anti-Hallucination)

### 5.1 细粒度中断状态码 (BattleTrialStatus)
真实评测中可能遇到各种外部中断，系统定义了完备的状态机：
- `passed`：客观测试与复审全部达标；
- `failed`：单测未通过（Exit Code ≠ 0）；
- `interrupted`：评测被用户或外部事件主动中断；
- `rate_limit_429`：并发触发服务商限流；
- `quota_exhausted`：API 账户余额用尽；
- `context_overflow`：上下文超出模型最大窗口；
- `timeout`：单题执行超时（系统默认设定 300s 阈值强制中断防死循环）；
- `sandbox_crash`：沙箱运行环境崩溃。

**天梯数据保护机制**：发生非代码原因的外部基础设施故障（429、欠费、崩溃）时，标记为中断，**不计入 0 分**，防止污染历史天梯平均线。支持环境修复后一键原地自愈重试。

### 5.2 审查 AI (LLM-as-a-Judge) 四大抗幻觉算法防御墙
1. **AST & DOM 客观事实先验锚定 (Grounded Facts)**：
   - 在将 Diff 交付裁判模型前，预先由静态工具提取改动文件数、增删行数、报错数及 Export 符号等硬事实，作为不可违背的前提假设注入 Prompt，杜绝虚假指控；
2. **标杆相对比较法 (Anchor-based Relative Delta)**：
   - 提供 Golden Anchor 官方标杆实现，由裁判对比相对增量与多余封装，减少绝对评分方差；
3. **双裁判背对背盲审与分歧熔断 (Dispute Gate)**：
   - 引入两个不同架构的模型分别作为主审与复核，评分偏差超过 15 分时触发争议标记，转交人工复核；
4. **强制代码行号证据链引用 (Mandatory Line Citation)**：
   - 扣分项必须精确引用 Git Diff 中的文件路径与起止行号，无具体行号证据的扣分判定为无效。

---

## 6. 前端组件与交互状态全景 (Frontend Architecture & State)

### 6.1 前端核心文件与职能分布
```
src/
├── types/
│   └── arena.ts              # 核心接口 (HarnessConfig, BenchmarkTask, ScoreBreakdown 等)
├── services/
│   ├── arenaStore.ts         # 状态管理、本地存储 (localStorage)、评分加权算法
│   └── benchmarkSuites.ts    # 24 道精选基准题目、Golden Spec 契约、赛道公式定义
├── components/
│   ├── ArenaHeader.tsx       # 顶部导航、深色模式切换、字体切换器
│   ├── ScoreFormulaCard.tsx  # 双轨公式透明公示卡与交互试算器
│   ├── HumanReviewModal.tsx  # 专家 5 维量表复审、Diff 审查、PR 准入弹窗
│   ├── CodexLauncherModal.tsx# 物理沙箱向导、CLI 与 PowerShell 脚本生成器
│   ├── WeightPresetCustomizer.tsx # 权重预设微调面板
│   └── IQBadge.tsx           # Codex IQ 分数徽章
└── views/
    ├── BenchmarkRunnerView.tsx # 核心评测工作台 (Master-Detail, 模式切换, 目录指定)
    ├── TaskBankView.tsx      # 题库管理 (24 题分类浏览, Spec 契约, JSON 导入导出)
    ├── ConfigArenaView.tsx   # Harness 配置中心 (模型、思考档位、规则、Skills)
    ├── LeaderboardView.tsx   # 天梯排行榜 (多配置对比、能效雷达)
    ├── RunHistoryView.tsx    # 评测历史与参数快照回溯
    └── ScoringGuideView.tsx  # 评测方法论与实战 QA
```

### 6.2 状态持久化键名 (LocalStorage Keys)
- `codex_arena_configs_v2`：保存所有 Harness 配置列表；
- `codex_arena_history_v2`：保存单配置与 A/B 对照评测历史快照；
- `codex_arena_custom_tasks`：用户自定义导入的题目列表；
- `codex_arena_theme`：深色/浅色模式状态。

---

## 7. 面向 Codex 的完整后端接口与数据表规范 (Backend API & Database Specs)

> **💡 Codex 实现指导**：后端推荐使用 **Node.js (TypeScript + Fastify/Express)** 或 **Python (FastAPI)** 构建轻量本地服务（默认端口 `5174` 或代理转发），数据存储推荐使用轻量级 **SQLite**。

### 7.1 SQLite 数据库 Schema 设计 (DDL)

```sql
-- 1. Harness 配置表
CREATE TABLE IF NOT EXISTS harness_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_model TEXT NOT NULL,
    tagline TEXT,
    author TEXT,
    agents_prompt TEXT,
    skills_json TEXT,         -- JSON 数组: ["quick-lint", "type-safety"]
    reasoning TEXT CHECK(reasoning IN ('none', 'low', 'medium', 'high', 'xhigh')),
    interactive_mode TEXT CHECK(interactive_mode IN ('one-shot-direct', 'step-by-step-confirm', 'adaptive')),
    custom_constraints_json TEXT, -- JSON 数组
    special_features_json TEXT,   -- JSON 对象: {"antiScopeCreep": true}
    iq_score REAL DEFAULT 0,
    win_rate REAL DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 评测题库表
CREATE TABLE IF NOT EXISTS benchmark_tasks (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    task_paradigm TEXT NOT NULL,
    description TEXT,
    input_prompt TEXT NOT NULL,
    verification_cmd TEXT NOT NULL,
    project_spec_json TEXT,   -- Golden Spec Contract 完整 JSON
    multi_turn_stages_json TEXT,
    expected_turns INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 评测批次与历史表 (Runs)
CREATE TABLE IF NOT EXISTS benchmark_runs (
    id TEXT PRIMARY KEY,
    run_type TEXT CHECK(run_type IN ('single', 'compare')),
    channel TEXT NOT NULL,
    config_id TEXT NOT NULL,
    config_snapshot_json TEXT NOT NULL,  -- 评测发生时的无损配置快照
    config_b_id TEXT,
    config_b_snapshot_json TEXT,
    overall_score REAL,
    overall_score_b REAL,
    pass_rate REAL,
    total_seconds REAL,
    total_tokens INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 单题测试试次详情表 (Trials)
CREATE TABLE IF NOT EXISTS battle_trials (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES benchmark_tasks(id),
    config_id TEXT NOT NULL,
    is_config_a BOOLEAN NOT NULL DEFAULT 1,
    status TEXT NOT NULL,
    workspace_path TEXT,
    code_pass_score REAL,
    build_lint_score REAL,
    git_purity_score REAL,
    mechanical_score REAL,
    intent_score REAL,
    maintainability_score REAL,
    robustness_score REAL,
    ux_score REAL,
    human_score REAL,
    merge_readiness TEXT,
    codex_iq REAL,
    turns_used INTEGER,
    seconds_used REAL,
    tokens_total INTEGER,
    tokens_detail_json TEXT,
    diff_patch TEXT,
    terminal_output TEXT,
    error_details_json TEXT,
    ai_judge_report_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 7.2 后端 RESTful API 契约设计

#### ① 沙箱工作区初始化与脚手架搭建
* **端点**：`POST /api/benchmark/spawn`
* **功能**：在本地磁盘分配隔离沙箱，准备基线代码分支，注入当前配置的 `AGENTS.md`。
* **请求体 (JSON)**：
  ```json
  {
    "taskId": "proj-01-fullstack-kanban",
    "customWorkspacePath": "D:/test-projects/eval-01", // 可选，为空则使用默认沙箱
    "configSnapshot": {
      "id": "cfg-sniper-minimal",
      "agentsPrompt": "# Sniper Direct Action Rules...",
      "skills": ["quick-lint"]
    }
  }
  ```
* **响应体 (JSON)**：
  ```json
  {
    "success": true,
    "workspacePath": "D:/test-projects/eval-01",
    "gitBaselineCommit": "a1b2c3d",
    "agentsMdInjected": true
  }
  ```

---

#### ② 驱动 Codex CLI 执行与实时流式输出
* **端点**：`POST /api/benchmark/exec` (支持 WebSocket 或 SSE 流式传输)
* **功能**：调用本机 `codex exec` 启动 Agent 在目标沙箱中执行指令，捕获标准输出与退出码。
* **请求体 (JSON)**：
  ```json
  {
    "workspacePath": "D:/test-projects/eval-01",
    "model": "gpt-6-astra",
    "reasoning": "medium",
    "prompt": "构建一个支持三列拖拽流转的前端看板...",
    "timeoutMs": 300000
  }
  ```
* **响应体 (JSON)**：
  ```json
  {
    "exitCode": 0,
    "durationSeconds": 14.8,
    "terminalOutput": "[Codex] 正在执行文件编辑...
[Playwright] 4 passed (2.3s)
",
    "tokensUsed": {
      "inputTokens": 3200,
      "outputTokens": 840,
      "reasoningTokens": 1600,
      "cacheHitRate": 0.85
    }
  }
  ```

---

#### ③ Git Diff 事实指纹提取与编译审计
* **端点**：`GET /api/benchmark/diff-facts`
* **功能**：运行 `git diff --stat` 提取变动事实，检查有无编译报错与无用包装文件。
* **查询参数**：`?workspacePath=D:/test-projects/eval-01&baselineCommit=a1b2c3d`
* **响应体 (JSON)**：
  ```json
  {
    "filesChangedCount": 2,
    "linesAdded": 86,
    "linesRemoved": 12,
    "diffPatch": "diff --git a/src/Kanban.tsx b/src/Kanban.tsx\\n...",
    "detectedBloatFiles": [], // 若检测到 demo.ts, test-helper.ts 则列出并扣分
    "typeCheck": {
      "passed": true,
      "errorCount": 0,
      "errors": []
    },
    "mechanicalScore": 96.5
  }
  ```

---

#### ④ 审查 Agent (LLM-as-a-Judge) 契约比对
* **端点**：`POST /api/judge/review`
* **功能**：组装 Diff、终端输出与题目 Golden Spec，调用裁判模型给出初审与行号证据链。
* **请求体 (JSON)**：
  ```json
  {
    "taskId": "proj-01-fullstack-kanban",
    "diffPatch": "diff --git a/src/Kanban.tsx...",
    "groundedFacts": {
      "filesChangedCount": 2,
      "consoleErrorsCount": 0
    }
  }
  ```
* **响应体 (JSON)**：
  ```json
  {
    "overallScore": 92.0,
    "verdict": "passed",
    "rationale": "核心拖拽链路闭环，状态持久化完备，代码分层自洽，无多余包装。",
    "rubricBreakdown": {
      "intent": 95,
      "cleanliness": 92,
      "robustness": 90,
      "ux": 91
    },
    "evidenceQuotes": [
      {
        "rubricId": "cleanliness",
        "lineRef": "src/Kanban.tsx#L45-L60",
        "critique": "状态更新逻辑清晰，未引入多余的临时事件中转类。"
      }
    ]
  }
  ```

---

#### ⑤ 评测结果与专家评分持久化
* **端点**：`POST /api/runs` & `PATCH /api/runs/:runId/trial/:trialIndex/rating`
* **功能**：存储完整跑分快照，更新专家量表与 PR 准入评级。

---

### 7.3 Codex CLI 驱动核心实现参考 (Node.js 示例)

```typescript
import { spawn } from 'child_process';
import path from 'path';

export interface CodexExecOptions {
  workspacePath: string;
  prompt: string;
  model?: string;
  reasoning?: string;
  timeoutMs?: number;
}

export function runCodexExec(options: CodexExecOptions): Promise<{ exitCode: number; output: string }> {
  return new Promise((resolve, reject) => {
    const args = [
      'exec',
      '--sandbox', options.workspacePath,
      '--prompt', options.prompt
    ];

    if (options.model) args.push('--model', options.model);
    if (options.reasoning) args.push('--reasoning-effort', options.reasoning);

    const child = spawn('codex', args, {
      cwd: options.workspacePath,
      shell: true,
      env: { ...process.env, CI: 'true' }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('TIMEOUT_EXCEEDED'));
    }, options.timeoutMs || 300000);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, output });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
```

---

## 8. 总结与 Codex 实施检查清单 (Implementation Checklist)

1. [ ] **数据库就绪**：基于 7.1 DDL 初始化 `arena.db`，并在服务启动时自动加载预置 24 道题目与基础配置。
2. [ ] **沙箱调度**：实现 `POST /api/benchmark/spawn`，负责物理工作区创建、脚手架放置与 `AGENTS.md` 注入。
3. [ ] **CLI 桥接**：实现 `POST /api/benchmark/exec`，安全调用本地 `codex exec`，输出实时流式日志并捕获退出码。
4. [ ] **Diff 审计**：实现 `GET /api/benchmark/diff-facts`，解析 `git diff --stat` 并运行类型编译器。
5. [ ] **裁判模型**：实现 `POST /api/judge/review`，注入 Grounded Facts，输出带行号的代码级审查评语。
6. [ ] **前端无缝对接**：前端 `arenaStore.ts` 切换为调用本地 API，实现全自动跑分与持久化入库。
