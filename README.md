# Codex Harness Benchmark (CHB) ⚡

> **面向 AI Coding Agent 与私有 Harness 配置的统一工业级双轨评测系统**  
> 告别虚假跑分，将**全栈需求落地 (Spec-to-Ship)** 与**确定性 Bug 修复**彻底解耦，结合**机械客观自动化断言 (50%)** 与**人类专家 5 维复审量表 (50%)**，深度量化不同模型、思考档位与系统规则的真实工程净交付效能。

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

---

## 📖 项目背景与核心破局

当前大模型代码评测领域（如 SWE-bench）存在一个巨大的**现实与学术脱节**：
1. **开源修 Bug 只是跑分的一角**：传统基准 90% 以上在跑 Python 仓库的历史单测修复，但在日常工程实际场景中，**80% 以上的开发者使用 Agent 是为了提需求“做项目”**（头脑风暴 ➔ 敲定 Spec 规范书 ➔ 协同实现前端交互与后端 API 数据持久化）；
2. **缺乏统一公允的双轨评价**：过去的人工打分往往只有一两个浅薄的滑块，无法识别代码写死硬编码、缺失类型防御与反直觉抽象的问题；
3. **资源遥测盲区**：脱离了时延、Token 消耗、Thinking 推理 Token 和 Prompt 缓存命中率谈代码生成毫无工程意义。

**Codex Harness Benchmark** 致力于提供一套标准化、高可读性、符合现代开发者工程直觉的现代化交互工作台。

---

## 🌟 核心设计：双轨评测与工业级量表体系

全系统在底层彻底摒弃暗箱操作，将总成绩 **Codex IQ (100 分制)** 划分为清晰的两大轨道：

- **机械客观自动化判断 (权重大盘 50%)**：
  - 自动化测试断言 & 退出码 0 (Exit Code 0) · 50% 机械分
  - 静态工程编译与类型安全 (TypeScript 0 Error / ESLint) · 25% 机械分
  - Git 物理变更纯净度 (Diff 行数 / 零冗余文件预算) · 25% 机械分
  - 全链路能效遥测 (执行时延 / 吞吐速率 / 推理 Token / 缓存命中率)
- **人类专家 5 维复审量表 (权重大盘 50%)**：
  - 🎯 需求切中与意图理解 (Intent Fidelity & Completeness) · 30% 人工分
  - 🧹 代码规范与工程纯净度 (Code Cleanliness & Maintainability) · 25% 人工分
  - 🛡️ 边界防御与异常健壮度 (Defensive Robustness & Error Handling) · 25% 人工分
  - 🎨 交互可用性与视觉质感 (UI/UX Ergonomics & Usability) · 20% 人工分
  - 🏷️ PR 准入决策评级 (🟢 免修直接合并 / 🟡 微调合入 / 🟠 大幅重构 / 🔴 拒绝合入)

综合天梯合成公式：
Codex IQ = 机械客观得分 × 50% + 人类专家复审得分 × 50%

---

## 🖥️ 已落地的交互功能与界面架构

系统采用纯正的现代开发者工具美学（Linear / Vercel 风格），摒弃任何刺眼花哨的高饱和度杂音：

1. **Master-Detail 左右联动评测工作台**：
   - **左侧精炼任务列表**：集成 4 大主流赛道切换（前端交互、核心逻辑、约束遵从、人机协作）与快捷筛选（项目构建 / Bug 修复）；智能清洗长标题前缀，层级分明；
   - **右侧常驻沙箱工作台**：选中任务即时联动，无需上下滚屏；实时展示真实需求指令 Prompt（一键复制）、物理隔离沙箱目录（~/.codex/sandboxes/eval-...）、退出码验收断言命令（
px playwright test...）与直接执行按钮。
2. **全流程执行与沙箱编排**：
   - 默认**单题精细执行 (Focused Single-Task Run)**，兼备**批量队列自动跑分**；
   - 内置容错演练模拟器（模拟额度耗尽 Quota、429 限流、上下文溢出、执行超时等自愈状态机）；
3. **24 道工业级真实题库中心**：
   - 涵盖从全栈敏捷任务系统、SaaS BI 数据大屏、实时 Markdown 编辑器，到分布式 Redlock 脑裂修复与万级长列表虚拟滚动；
   - 具备 🟢 Easy、🔵 Medium、🟡 Hard、🔴 Nightmare 四级国际难度规范与自定义 JSON 导入；
4. **透明权重公式与双轨试算器**：
   - 支持实时调整机械 vs 人工占比，提供 4 套标准权重预设（标准平衡、精简交付、SWE-bench 极端客观、深度人机协同）；
5. **天梯排行榜与快照归档历史**：
   - 支持单配置跑分战报与 A/B 对照矩阵（Compare）；
   - 完整保存每一次评测的参数快照，支持无损回溯复盘；
6. **精致暗黑模式与字体排版引擎**：
   - 彻底修复夜间模式强光死白问题，沉浸式深色微光边框；
   - 内置 Google Fonts（Inter、Plus Jakarta Sans、JetBrains Mono）实时切换器。

---

## 🛠️ 技术栈与目录结构

`
codex-harness-arena/
├── src/
│   ├── components/            # 高品质 UI 组件
│   │   ├── ArenaHeader.tsx        # 顶部导航、深色模式与字体切换
│   │   ├── ScoreFormulaCard.tsx   # 双轨评测体系与工业级权重试算公示卡
│   │   ├── HumanReviewModal.tsx   # 人类专家 5 维复审、Diff 审查与 PR 准入弹窗
│   │   ├── ManualScoringModal.tsx # 快速微调评分弹窗
│   │   ├── CodexLauncherModal.tsx # Codex 物理沙箱向导与全自动审查流水线解密
│   │   └── WeightPresetCustomizer.tsx # 权重预设微调面板
│   ├── views/                 # 主路由视图
│   │   ├── BenchmarkRunnerView.tsx # 核心评测工作台 (Master-Detail)
│   │   ├── TaskBankView.tsx       # 题库中心 (24道题目、Spec契约与自定义导入)
│   │   ├── ConfigArenaView.tsx    # 配置管理 (Harness 参数、模型档位与约束规则)
│   │   ├── LeaderboardView.tsx    # 天梯排行榜 (多维度横向对比)
│   │   ├── RunHistoryView.tsx     # 评测历史与参数快照归档
│   │   └── ScoringGuideView.tsx   # 原理深度答疑与 Benchmark 对比矩阵
│   ├── services/              # 评测状态机与基准题库
│   │   ├── arenaStore.ts          # 评分引擎、双轨加权合成、历史存储持久化
│   │   └── benchmarkSuites.ts     # 24 道题目库、Golden Spec 契约、赛道公式定义
│   └── types/                 # 严格 TypeScript 类型定义
│       └── arena.ts               # 任务、试次、遥测、评级与量表接口
├── package.json
├── tailwind.config.js
└── vite.config.ts
`

---

## 🚀 快速开始

`ash
# 1. 克隆仓库
git clone https://github.com/devonsagr/temp.git codex-harness-arena
cd codex-harness-arena

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 构建生产产物
pnpm build
`

---

## 🧭 面向 Codex 的后续后端接入与功能演进路线 (Backend Roadmap)

> **💡 提示**：当前仓库已具备完整的前端交互逻辑、双轨数学引擎、模拟数据采样与持久化状态机。若需接入真实环境执行，后续可让 **Codex** 补充以下后端模块：

1. **真实沙箱工作区生命周期编排 (POST /api/benchmark/spawn)**：
   - 接收 	askId 与 configSnapshot；
   - 在本地临时路径 ~/.codex/sandboxes/eval- 自动 git clone 或复制干净的脚手架模板；
   - 自动生成该配置对应的 AGENTS.md 与配置文件。
2. **Codex 执行器接口 (POST /api/benchmark/exec)**：
   - 调用本机 codex exec --sandbox <dir> -p "<prompt>" 或通过子进程运行测试命令；
   - 捕获真实的进程退出码（Exit Code 0 为通过）、执行耗时与控制台标准输出。
3. **真实 Git Diff 与 AST 事实提取器 (GET /api/benchmark/diff-facts)**：
   - 执行 git diff --stat，自动解析改动的文件列表、增删代码行数；
   - 使用 TypeScript Compiler API / Babel 检查是否有编译错误、类型违规或新增临时垃圾文件。
4. **自动化审查 Agent (Review LLM-as-a-Judge)**：
   - 将沙箱代码补丁 Diff、终端日志和题目 Golden Spec 组装为标准提示词；
   - 自动调用审评模型（如 Claude-3.7 或 GPT-6）给出前置机器初审评分与引用行号的代码级评语。
5. **本地 SQLite / JSON 持久化存储**：
   - 将现有 renaStore.ts 中的 localStorage 持久化迁移至轻量本地 SQLite 数据库或本地服务文件。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
