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
      id: 'dual-track-matrix',
      title: '为什么不能只靠单元测试断言？机械客观测试与人工专家复审的边界与权重是如何划分的？',
      tag: '双轨架构与评分逻辑',
      icon: UserCheck,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
      content: `【双轨综合评价体系的核心逻辑】：

一、为什么不能只看单元测试（Pass@1）？
在纯单测验收下，Agent 完全可能为了让测试跑绿而采取极端手段：硬编码写死数据、写一堆 any 逃避类型检查、没有任何异常捕获甚至存在内存泄漏；更普遍的是模型产生“过度工程化”，为了一个小功能凭空新建数层包装类和多余 demo 文件。
测试虽然绿了，但交付的代码极度肮脏脆弱。因此，真实的软件工程评测必须将“客观机器门禁”与“人类专家复审”明确分轨，各司其职。

二、第一轨：机械客观自动化判断 (50% 权重大盘)
具备 0 人工偏见、100% 确定性与沙箱可重现性：
1. 测试用例断言与退出码 (Pass Rate & Exit Code 0, 50% 机械分)：
   - 运行单元测试与 Playwright E2E 无头测试，进程退出码非 0 即判定失败；
2. 静态编译与类型安全 (TypeScript 0 Error / ESLint, 25% 机械分)：
   - 运行 tsc 与静态扫描，杜绝隐式 any、未处理 Promise 与死循环；
3. Git 物理变更纯净度 (Git Diff & Budget, 25% 机械分)：
   - 审计文件变动行数与目录树纯净度，严厉惩罚未经许可创建的临时 demo 文件与多余包装类；
4. 运行时能耗遥测 (Telemetry)：
   - 记录执行耗时、Token 吞吐速率、Thinking 推理 Token 及 Prompt 缓存命中率。

三、第二轨：人类专家 5 维工程复审量表 (50% 权重大盘)
用于评估机器单测难以量化的架构品味、代码规范度与交互可用性（0~100 分制）：
1. 🎯 需求切中与意图理解 (Intent Fidelity, 30% 人工分)：是否准确理解真实隐式诉求，有无偷工减料或阳奉阴违；
2. 🧹 代码规范与工程纯净度 (Code Cleanliness, 25% 人工分)：命名分层、模块解耦与简洁性，杜绝过度设计；
3. 🛡️ 边界防御与异常健壮度 (Defensive Robustness, 25% 人工分)：空值保护、网络异常重试、竞态防抖与内存泄露防御；
4. 🎨 交互可用性与视觉质感 (UI/UX Ergonomics, 20% 人工分)：界面布局呼吸感、暗黑模式适配、交互反馈细腻度；
5. 🏷️ PR 准入评级 (Merge Readiness Level)：🟢 免修合入 / 🟡 微调合入 / 🟠 需重构 / 🔴 拒绝合入。

四、综合天梯成绩合成公式：
Codex IQ = 客观自动化得分 × 50% + 人工专家复审得分 × 50%
系统支持在评测卡片中随时点击【专家复审】核准量表滑块，分数将实时重新计算并同步天梯榜。`,
    },
    {
      id: 'paradigm-decoupling',
      title: '“做项目 (Spec-to-Ship)”与“修 Bug”有什么本质区别？做项目的主观复杂题目如何科学跑分？',
      tag: '赛道解耦与 Spec 契约',
      icon: Scale,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      content: `【双赛道解耦与开放项目标准化破局】：

一、为什么传统 Benchmark 只测修 Bug，而实际生产以“做项目”为主？
- 传统 SWE-bench 风格主要跑开源仓库的历史 Bug 修复单测，这能测出基础排错能力，但在开发者日常使用 Agent 的场景中只占一小部分；
- 现实中 80% 以上的需求是“做项目”：提自然语言需求、头脑风暴梳理规范、编写前端交互并联调后端 API 与数据持久化。因此评测系统必须把【确定性 Bug 修复】与【全栈项目构建】解耦为两大独立赛道。

二、“做项目”的跑分痛点与三大难题：
1. 过于自由：如果只给一句模糊需求，不同模型实现差异巨大，测试脚本无法统一定位 DOM 和 API，导致只能靠主观盲猜；
2. 过于僵化：如果把函数名变量名写死，本质上退化成了单测题，测不出面对复杂业务时的方案拆解与架构能力；
3. 环境依赖易崩溃：从零装包极其容易因为 node 版本或端口冲突中断。

三、四大标准化 Spec 协议解决方案：
1. Golden Spec 需求契约：每道项目题预置标准化规范书（包含核心用户故事闭环、RESTful 接口契约、数据持久化 Schema、验收门禁标准）；
2. 预置轻量沙箱脚手架：提供干净现代的前后端模板，免除 Agent 折腾环境装包的无关损耗；
3. 三层立体智能验收栈：
   - E2E 无头端到端自动化测试 (40%)：机器人真实模拟点击、表单交互、接口连通与数据恢复；
   - 审查 Agent 契约覆盖率比对 (30%)：逐项核对 Spec 用户故事与代码分层，识别多余包装；
   - Web 实时预览与手感核验 (30%)：人工滑块对视觉层级与操作流畅度做直观确认。`,
    },
    {
      id: 'task-bank-tiers',
      title: '题库的 4 级难度是如何划分的？分别对应测试 Agent 的什么能力水平？',
      tag: '4 级能力分级体系',
      icon: Sparkles,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
      content: `【4 级标准化难度阶梯与考察目标】：
题库按照工业界真实复杂度梯队划分为 4 级：
- 🟢 Easy (简单/入门)：单文件局部修改、简单配置切换、基础组件样式修缮，重点考察 Agent 的响应速度与零失误执行；
- 🔵 Medium (中等/进阶)：多组件联动、异步表单动态校验、并发请求去重缓存、解耦 Store 重构，考察状态机自洽与类型严谨；
- 🟡 Hard (困难/工业级)：万级数据虚拟滚动列表、双栏 Markdown 同频滚动、循环 AST 递归解析、ReDoS 正则防护，考察高阶算法与底层原理；
- 🔴 Nightmare (高压极限/极端边界)：分布式 Redlock 租期脑裂排查、Canvas 60fps 高刷波形图渲染、极端网络分区与多通道并发死锁自愈，考验前沿大模型最高深度推理档位 (xhigh) 下的攻坚极限。

【支持私有题库扩展】：
支持在【题库中心】通过标准 JSON 格式导入私有业务场景用例，挂载团队自定义测试集。`,
    },
    {
      id: 'runtime-telemetry',
      title: '为什么 Harness 跑分必须计入运行耗时、Token 吞吐与 Prompt 缓存命中率？',
      tag: '能耗与成本遥测',
      icon: Zap,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50',
      content: `【离开资源开销谈代码生成是空中楼阁】：
不同 Harness 配置对资源开销的影响往往天差地别：臃肿冗余的全局规则会导致上下文暴增、响应极度迟缓，并产生巨大的 Token 账单。系统内建了全链路运行时遥测：
1. 真实时延与速率：精准记录端到端执行耗时（秒）与平均吞吐速率 (Tokens/sec)；
2. Token 消耗四元细分：区分统计输入 Prompt Token、生成输出 Token、思维链推理 Token (Reasoning Tokens)；
3. 提示词缓存命中率 (Prompt Cache Hit Rate)：度量长上下文与规则库复用下的真实计费成本；
4. 综合能耗雷达：每次测试后自动生成能效指标卡，直观比对不同 Harness 配置的资源开销与交付效率。`,
    },
    {
      id: 'failure-modes',
      title: '评测中途出告警报错了怎么办？比如 API 限流 429、额度耗尽、上下文溢出或沙箱超时卡死？',
      tag: '异常熔断与容错',
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
      content: `【状态机设计与故障隔离规范】：
真实自动化评测中常因网络或 API 问题中断。系统建立了完备的异常状态机与自愈工作流：
1. 细粒度中断状态码：
   - \`quota_exhausted\`：API 余额耗尽，提示前往供应商控制台充值；
   - \`rate_limit_429\`：并发触发限流，启用退避重试；
   - \`context_overflow\`：输入超出上下文窗口，建议调整思考档位或启用修剪规则；
   - \`timeout\`：沙箱运行超过 300s 阈值，强制中断以防死循环；
   - \`sandbox_crash\`：沙箱运行环境退出异常，保留现场堆栈。
2. 异常与代码分值隔离：
   - 发生非代码本身的外部基础设施故障时，系统将试次标记为【中断 (INTERRUPTED)】，不以 0 分计入天梯榜，避免污染历史基线；
3. 现场保护与一键原地自愈：
   - 战报卡片呈现醒目的异常报警横幅与修复指引，修复环境后点击【自愈重试】即可原地继续跑分。`,
    },
    {
      id: 'stage-gate-progression',
      title: '分批/多阶段需求如何客观评判？具体怎么推送提示词、跑完检查哪个文件夹？',
      tag: '多阶段与沙箱物理验收',
      icon: Layers,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
      content: `【多轮物理执行与检查机制】：

一、怎么给提示词？怎么推送？
1. 手动/半自动执行流：
   - 在工作台选定题目，点击【一键复制阶段提示词】；
   - 在 Codex 桌面端打开指定的物理工作区目录（推荐沙箱或自定义本地目录），将提示词发送给 Codex 开始编写；
   - Codex 跑完后不要关闭窗口，在终端对该文件夹进行客观验证，确认通过后再复制下一阶段提示词继续在同一会话中推进；
2. 自动化执行流：
   - 通过 Codex CLI (\`codex exec --sandbox <dir> -p "<prompt>"\`) 自动串联执行各阶段指令。

二、等它跑完，检查的是什么？是检查指定文件夹吗？
是的！完全就是检查系统指定的沙箱目录或你指定的本地测试目录！检查三项硬核指标：
1. 运行客观测试套件：在该文件夹内运行验证命令，以 Exit Code 0 作为功能达标铁律；
2. 反向防退化回归测试 (Regression Test)：在多阶段任务中，执行完第二阶段后必须重新验证第一阶段的用例，确保新代码没有破坏已有功能；
3. Git Diff 纯净度检查：运行 \`git diff --stat\`，检查改动范围是否克制，严禁擅自新建临时 demo 文件或多余包装类。`,
    },
    {
      id: 'anti-hallucination-algorithms',
      title: '裁判 AI（LLM-as-a-Judge）打分存在主观偏见和幻觉怎么办？尤其是对做项目的主观性？',
      tag: '抗幻觉四大算法墙',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      content: `【裁判模型常见偏见病灶与四大算法防御墙】：
LLM 担任代码裁判时容易产生啰嗦偏见（过度包装多写无用注释盲目给高分）、虚假缺失指控（代码明明写了暗黑模式却声称没写）或同门偏好。系统内建了四道抗幻觉防御墙：
1. AST & DOM 客观事实先验锚定：
   - 在将 Diff 交付裁判模型前，预先由静态工具提取改动文件数、控制台报错及 Export 符号等硬事实，作为不可违背的前提假设注入 Prompt，杜绝裁判凭空诬告；
2. 标杆相对比较法 (Anchor-based Relative Delta)：
   - 提供 Golden Anchor 官方标杆实现，由裁判比对相对增量与多余封装，减少绝对评分离散方差；
3. 双裁判背对背盲审与分歧熔断：
   - 支持引入两个不同架构的模型分别作为主审与交叉核验，当评分方差超过阈值时触发争议标记，转交人工复核；
4. 强制行号引用证据链：
   - 扣分项必须精确引用 Git Diff 中的文件路径与起止行号，凡是没有具体代码行证据的空洞扣分项一律作废。`,
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
              评测体系规范与方法论指南 (Benchmark Methodology & Guidelines)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              双轨评分计算引擎、全栈 Spec 契约体系、物理沙箱隔离规范与指标定义手册
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
