import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Layers,
  Cpu,
  GitBranch,
  Terminal,
  UserCheck,
  Scale,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { ScoreFormulaCard } from '../components/ScoreFormulaCard';

export const ScoringGuideView: React.FC = () => {
  const sections = [
    {
      id: 'task-bank-tiers',
      title: '① 题库规模够多吗？4 级难度标识如何划分？',
      tag: '题库分级标准',
      icon: Sparkles,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
      content: `【题库 4 级国际化难度规范】：
全站题库彻底废除混乱的自定义标签，统一引入工业界 4 级能力分级：
- 🟢 Easy (简单/入门)：单文件局部修改、简单配置切换、基础组件样式修缮，重点考察 Agent 的单指令响应速度与首字零犹豫；
- 🔵 Medium (中等/进阶)：多组件联动、异步表单动态校验、并发请求去重缓存、解耦 Store 重构，考察状态机自洽与类型严谨；
- 🟡 Hard (困难/工业级)：万级数据虚拟滚动列表、双栏 Markdown 同频滚动、循环 AST 遍历溢出修复、灾难性 ReDoS 正则防护，考察高阶算法与底层原理；
- 🔴 Nightmare (地狱/极端边界)：分布式 Redlock 租期脑裂排查、Retina 屏 60fps Canvas 音频波形图高刷渲染、极端网络分区与多通道并发死锁自愈，考验前沿前沿大模型最高深度推理档位 (xhigh) 下的攻坚极限。

【题库真实来源与可持续扩充】：
取材于真实 GitHub 生产仓库历史缺陷与现代 Web 交互挑战，并开放了【题库中心】JSON 格式自由导入机制，团队可随时挂载私有业务代码库。`,
    },
    {
      id: 'paradigm-decoupling',
      title: '③ 解决 Bug vs 做项目两大赛道：为什么说“做项目”才是主力，而“修Bug”只是一小部分？做项目的题目和要求究竟怎么设置？',
      tag: '主力赛道解耦与Spec协议',
      icon: Scale,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      content: `【一针见血：开源修 Bug 只是跑分一角，从需求落地做项目才是实际生产主力！】：

一、传统学术基准的严重盲区 vs 真实生产现实：
- 传统 SWE-bench 风格的测试，90% 都在跑 Python 开源项目的历史单测修复。这确实能测出基础的排错能力，但这在实际工程师日常使用 Agent 的场景中只占 10%~20%；
- 真实世界里，80% 以上的用户使用 Agent 是为了【做项目 (Spec-to-Ship)】：
  1. 用户直接提业务需求（比如做一个任务协同看板、流式 AI 工作台、运营分析大屏、RBAC 权限系统）；
  2. 与 Agent 进行头脑风暴，把模糊需求梳理成清晰的技术规范与产品 Spec；
  3. 协同落地全栈工程：既要写前端交互、状态响应与视觉质感，又要写后端 API 路由、契约校验与数据持久化。
因此，评测系统必须把【确定性 Bug 修复】与【全栈项目构建】彻底区分为两大顶级赛道，并把【项目构建】作为核心主力！

二、为什么“做项目”的题目与要求设置特别麻烦？
1. 麻烦 1（过于自由导致无法跑分）：如果题目只写“帮我做一个看板”，AI 自由发挥写出的代码千差万别，测试脚本根本无法统一定位 DOM 元素和接口路由，导致只能靠人工瞎猜打分；
2. 麻烦 2（过于僵化退化为假项目）：如果把代码写死到具体的函数名和变量名，这本质上退化成了单测题，根本测不出 Agent 面对复杂业务场景时的方案拆解、架构分层与自洽实现能力；
3. 麻烦 3（环境依赖容易跑崩）：全栈项目如果让 Agent 从零 npm init 盲猜装包，极其容易出现 node 版本冲突、服务端口抢占等非智力因素的意外中断。

三、本基准系统的破局之道：项目题目设计的四大标准化协议 (Project Benchmark Spec Protocol)：
1. 需求与产品技术规范书四元组 (Golden Spec Contract)：
   每道项目题目在底层都预置了一份标准化的 Spec 契约：
   - 🎯 核心用户故事 (User Stories)：定义 3~5 条可交互的闭环操作链路（如：新建卡片 -> 跨列拖拽流转 -> Ctrl+Z 撤销 -> 刷新页面持久化恢复）；
   - 🔌 前后端接口契约 (API Endpoints)：约定规范的 RESTful/SSE 接口格式（如 GET/POST /api/tasks），保障前后端分层有迹可循；
   - 💾 数据持久化模型 (Data Models)：规定任务/实体的字段契约与本地存储（JSON / SQLite / LocalStorage），杜绝页面一刷数据全空的玩具 Demo；
   - ✅ 验收门禁标准 (Acceptance Criteria)：明确规定 Playwright 自动化巡检要求、无控制台报错、以及 60fps 流畅度标准。
2. 开箱即用的轻量全栈脚手架 (Pre-baked Starter Sandbox)：
   - 沙箱预先铺设现代前端（Vite + React + Tailwind）与轻量后端（Node.js / Fastify / SQLite / Mock Server）；
   - Agent 无需浪费轮次配置 package.json，把 100% 的精力聚焦在【需求意图理解、Spec 契约落地与系统架构编写】。
3. 三层立体智能验收栈 (3-Layer Acceptance Stack)：
   - 第 1 层：Playwright E2E 无头端到端自动化断言 (40%)：由机器人真实模拟用户点击、表单提交、拖拽流转、API 状态码验证与刷新持久化检查；
   - 第 2 层：裁判 AI 对照 Golden Spec 进行业务覆盖率审查 (30%)：逐项核对 Spec 用户故事是否遗漏、前后端分层是否优雅自洽、有无垃圾过度包装；
   - 第 3 层：真实沙箱 Web 实时预览 + 人机感官速评 (30%)：支持在卡片内一键打开 Live Preview，人类评测员通过滑块对视觉层级、响应手感做直观核验。`,
    },
    {
      id: 'runtime-telemetry',
      title: '④ 运行时耗时速度、Token 消耗细分与 Prompt 缓存能写进去吗？',
      tag: '能效与缓存遥测',
      icon: Zap,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50',
      content: `【不仅能写进去，而且是 Harness 能耗评估的核心灵魂！】：
离开资源开销谈代码生成是空中楼阁。本系统在评分引擎与战报卡片中全面集成了全链路运行时遥测 (Telemetry)：
1. 真实耗时与吞吐率：精准统计端到端时延（秒）与生成速率 (Tokens/sec)；
2. Token 四元细分：区分展示输入 Prompt Token、生成输出 Token、思维链推理 Token (Reasoning Tokens)；
3. 提示词缓存命中率 (Prompt Cache Hit Rate)：显示命中缓存比例（如 84.5%），直接反映长上下文复用下的真实计费成本；
4. 战报卡片实时呈现：每次评测后，卡片直接展示能耗雷达，高消耗且低效的配置一目了然。`,
    },
    {
      id: 'failure-modes',
      title: '⑤ 评测中途出告警报错了咋办？比如欠费限流、Token 超长、超时卡死？',
      tag: '异常熔断与自愈',
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
      content: `【严密的状态机设计与故障隔离机制】：
真实评测中不可能永远一帆风顺。系统建立了完备的异常状态机与自愈工作流：
1. 细粒度执行状态码：
   - \`quota_exhausted\`：API 账户余额用尽，提示前往供应商控制台充值；
   - \`rate_limit_429\`：并发触发限流，提示开启指数退避重试；
   - \`context_overflow\`：输入超过上下文窗口，建议调整思考档位或启用历史修剪；
   - \`timeout\`：沙箱运行超 300s 阈值，强制中断保护资源防死循环；
   - \`sandbox_crash\`：沙箱环境退出异常，保留崩溃现场与调用堆栈。
2. 保护天梯榜数据纯度：
   - 发生非代码本身的外部故障时，系统将测试标记为【中断 (INTERRUPTED)】，不将 0 分计入天梯榜，避免污染历史平均分；
3. 断点快照与一键自愈：
   - 战报卡片直接呈现醒目的【异常报警横幅 (Alert Banner)】并输出修复指引，修复凭据后点击【自愈重试】即可在原地继续跑分。`,
    },
    {
      id: 'stage-gate-progression',
      title: '⑥ 分批/多轮实现如何评判？具体怎么给提示词、跑完检查哪个文件夹、是一次性的吗？',
      tag: '分段门禁与物理执行流',
      icon: Layers,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
      content: `【彻底讲透多轮任务的真实物理执行与检查机制】：

一、怎么给提示词？怎么推送？（手动模式 vs 自动模式）：
1. 手动测试模式（人类在 Codex IDE 里的真实操作）：
   - 系统为题目生成阶段提示词（如 Stage 1 骨架实现）。开发者点击【复制 Stage 1 提示词】；
   - 在 Codex 中选择 Open Folder 打开系统指定的沙箱文件夹（例如：~/.codex/sandboxes/eval-form-wizard/）；
   - 将提示词粘贴发给 Codex。Codex 在该工作区内自动进行代码编辑；
   - 等 Codex 跑完后，不要关闭窗口，在终端对该文件夹进行客观检查；
   - 接着把【Stage 2 提示词】粘贴到同一个 Codex 会话中！此时 Codex 带着第一轮改好的全部代码上下文，继续推进第二轮需求。
2. 自动化脚本模式：
   - 后台 Runner 脚本直接调用 \`codex exec --sandbox <dir> -p "Stage 1 提示词"\`；
   - 等待退出码为 0，自动执行单测；通过后再继续执行 Stage 2 命令，完全无需人肉干预。

二、等它跑完，检查的是什么？是检查指定文件夹吗？
是的！完全就是检查系统给出的那个指定沙箱文件夹！检查内容分为三项硬核指标：
1. 运行测试套件（Exit Code 铁律）：
   - 跑完 Stage 1，在文件夹内运行 \`npm run test:stage-1\`，验证第一阶段功能是否达标；
   - 跑完 Stage 2，在文件夹内运行 \`npm run test:stage-2\`，验证新增功能是否达标。
2. 关键铁律：反向防退化回归测试（Regression Test）：
   - 在 Stage 2 跑完后，系统必须重新运行 \`npm run test:stage-1\`！检查第二轮新代码有没有把第一轮辛辛苦苦写好的功能改崩！一旦改崩，扣除严重回归分；
3. Git Diff 与文件树纯净度：
   - 在该文件夹内运行 \`git status --porcelain\` 与 \`git diff --stat\`；
    - 检查 AI 是否精准切中需求要害，严惩擅自新建临时 demo 文件、无用日志包装类等代码冗余破坏行为。

三、这是一次性的吗？每次评测怎么对比、怎么重放？
- 单次执行是一个闭环的任务 Job，但整套机制是 100% 可重复回放、可横向对照（A/B Testing）的！
- 每次跑完，该沙箱的 Git Commit、生成的代码补丁、Token 能耗细项和双裁判打分都会被永久存档到【评测历史 (Run History)】；
- 当你调整了配置（例如切换模型、调整思考档位、注入防蔓延规则），系统可以基于完全一致的初始 Git 基线分支，在崭新的干净文件夹中重放完全相同的一套 Stage 提示词，实现严谨的控制变量评测！`,
    },
    {
      id: 'anti-hallucination-algorithms',
      title: '⑦ 裁判测试打分存在幻觉怎么办？尤其是做项目的主观性？',
      tag: '抗幻觉四大算法墙',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      content: `【LLM-as-a-Judge 常见幻觉病灶】：
- 啰嗦偏见 (Verbosity Bias)：Agent 代码写了一堆冗余无用注释，裁判 AI 盲目给出高分；
- 虚假缺失指控 (Hallucinated Omission)：裁判 AI 睁眼说瞎话，声称“未实现暗黑模式”，但代码里明明写着；
- 自身喜好偏见 (Self-Enhancement Bias)：同一家模型倾向于给同门模型打高分。

【本系统建立的四大抗幻觉算法防御墙】：
1. AST & DOM 客观事实先验锚定 (Grounded Facts Pre-Extraction)：
   - 在将 Diff 喂给裁判 AI 之前，先由无头浏览器与 TypeScript AST 分析器提取“绝对客观事实指纹”（例如：真实修改了几个文件、控制台是否有 Error、关键 Export 符号是否存在、Diff 增删代码行数）；
   - 将这些硬性事实指纹作为“不可违背的前提假设”注入裁判 AI 的 Prompt，从根本上杜绝裁判凭空诬告！
2. 基准锚点相对打分法 (Anchor-based Relative Delta)：
   - 不让裁判 AI 面对虚空给代码打绝对 0~100 分；
   - 而是提供一份官方标杆代码（Golden Anchor Diff），让裁判只对比：“相比于标杆实现，该解法是否存在过度封装？是否存在设计缩水？”评估相对增量分，大幅降低离散方差。
3. 双裁判背对背盲审与分歧熔断 (Dual-Judge Consensus & Dispute Gate)：
   - 引入两套完全不同架构的裁判实例（如 Claude-3.7-Judge 作为主审，GPT-6-Judge 作为交叉核验）；
   - 当两个独立裁判的分歧偏差超过 15 分时，系统自动判定为【共识争议 (DISPUTED)】，熔断自动打分，强制推送至人工复核工作台。
4. 强制代码引用证据链 (Mandatory Diff Citation Enforcement)：
   - 裁判 AI 的每一项扣分评语，必须精确引用 Git Diff 中的文件路径与起始行号（如 src/utils.ts#L12-L18）；
   - 凡是没有代码行引用证据的空洞扣分项，算法判定为非法无效，自动作废。`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-12">
      {/* Intro Header */}
      <div className="panel p-5 sm:p-6 bg-white dark:bg-[#121215]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              评测核心原理与规范说明 (Benchmark Methodology & FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              深度拆解底层模型分层、双引擎打分机制、Codex 沙箱编排与主流 Benchmark 架构对比
            </p>
          </div>
        </div>
      </div>

      {/* Formula Card */}
      <ScoreFormulaCard currentChannel="frontend-ui" />

      {/* Industry Benchmark Comparison Matrix */}
      <div className="panel p-5 sm:p-6 bg-white dark:bg-[#121215] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                工业界主流 Benchmark 横向对比矩阵
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                为什么已有测试基准无法衡量“代码纯净度”与“Harness 交付效率”？
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
            基准设计推演
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300">
                <th className="py-2.5 px-3 font-semibold w-28">评测基准</th>
                <th className="py-2.5 px-3 font-semibold">核心评测目标</th>
                <th className="py-2.5 px-3 font-semibold">单轮直击与效率</th>
                <th className="py-2.5 px-3 font-semibold">意图切中与代码纯净度</th>
                <th className="py-2.5 px-3 font-semibold">UI 美感与交互质感</th>
                <th className="py-2.5 px-3 font-semibold">私有 Harness 约束挂载</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-[11px]">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">
                  SWE-bench
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                  真实 GitHub Python 疑难 Bug 修复
                </td>
                <td className="py-2.5 px-3 text-rose-500">❌ 仅看 Pass@1，不计轮次与废话</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 不惩罚多建文件与多余包装</td>
                <td className="py-2.5 px-3 text-slate-400">❌ 无前端题目</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 仅支持固定测试补丁</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">
                  Aider Benchmark
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                  命令行代码助手的两轮编辑成功率
                </td>
                <td className="py-2.5 px-3 text-amber-500">⚠️ 仅粗略区分 1-pass 与 2-pass</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 不审计文件树与抽象蔓延</td>
                <td className="py-2.5 px-3 text-slate-400">❌ 无 UI 渲染与手感质检</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 固定在 Aider 内置格式</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">
                  LMSYS Arena
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                  人类用户双盲投票主观优劣
                </td>
                <td className="py-2.5 px-3 text-slate-400">⚠️ 依赖用户主观印象</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 无代码沙箱执行与 diff 审计</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">✅ 偏好视觉美观排版</td>
                <td className="py-2.5 px-3 text-rose-500">❌ 无法挂载项目规则</td>
              </tr>
              <tr className="bg-indigo-50/60 dark:bg-indigo-950/20 font-medium">
                <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> 本基准系统
                </td>
                <td className="py-2.5 px-3 text-indigo-900 dark:text-indigo-200">
                  Codex Harness 整体工程落地净效能
                </td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ 核心指标：单轮直出、低轮次重奖
                </td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ 严格审计：多余包装与冗余文件扣分
                </td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ AI 裁判 + 人工 0~100 质感验收
                </td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ 自由配置团队私有约束清单
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Sections */}
      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              className="panel p-5 sm:p-6 space-y-3 bg-white dark:bg-[#121215] hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${sec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {idx + 1}. {sec.title}
                  </h3>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                  {sec.tag}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed pl-2 whitespace-pre-line">
                {sec.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
