import React, { useState } from 'react';
import { HarnessConfig, BenchmarkTask } from '../types/arena';
import {
  Terminal,
  FolderTree,
  Play,
  Copy,
  Check,
  X,
  FileCheck2,
  GitBranch,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

interface CodexLauncherModalProps {
  config: HarnessConfig;
  tasks: BenchmarkTask[];
  onClose: () => void;
  onExecuteNow: () => void;
}

export const CodexLauncherModal: React.FC<CodexLauncherModalProps> = ({
  config,
  tasks,
  onClose,
  onExecuteNow,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'workspace' | 'lifecycle' | 'cli' | 'powershell'>('manual');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const sampleTask = tasks[0] || {
    id: 'ui-02-form-wizard',
    title: '多步骤向导与草稿暂存',
    inputPrompt: '构建一个支持三步导航的表单向导组件...',
    verificationCmd: 'npm test',
  };

  const stage1Prompt = `【第一阶段：骨架与基础步骤】\n请为本项目实现基础三步向导组件（基本信息 -> 偏好设置 -> 提交确认）。\n要求：\n1. 仅修改 src/components/FormWizard.tsx；\n2. 点击“下一步”能正确切换步骤索引，通过 tests/stage-1.spec.ts 测试；\n3. 严禁生成未经许可的临时辅助包装文件。`;

  const stage2Prompt = `【第二阶段：表单异步校验与草稿暂存】\n在刚刚已实现的第一阶段向导基础上，补齐以下新能力：\n1. 在第一步增加邮箱异步防重校验；\n2. 在页面刷新时从 localStorage 自动恢复未提交草稿；\n3. 注意向后兼容：严禁改坏第一阶段已通过的测试！必须同时通过 stage-1 与 stage-2 测试。`;

  const cliCommand = `codex-harness run \\
  --model "${config.baseModel || 'GPT-6 Astra'}" \\
  --reasoning "${config.reasoning}" \\
  --agents "./configs/${config.id}/AGENTS.md" \\
  --tasks "${tasks.map((t) => t.id).join(',')}" \\
  --output "./reports/run-${Date.now().toString(36)}.json"`;

  const pwshScript = `# PowerShell 一键自动编排与启动评测
$ConfigId = "${config.id}"
$Model = "${config.baseModel || 'GPT-6 Astra'}"
$Tasks = @("${tasks.map((t) => t.id).join('", "')}")

Write-Host ">>> [1/3] 正在为各题目自动初始化独立沙箱工作区..." -ForegroundColor Cyan
foreach ($task in $Tasks) {
    $Workspace = "$HOME/.codex/workspaces/$ConfigId-$task"
    New-Item -ItemType Directory -Force -Path $Workspace | Out-Null
    Copy-Item "./configs/$ConfigId/AGENTS.md" -Destination "$Workspace/AGENTS.md"
}

Write-Host ">>> [2/3] 挂载模型 $Model (思考档位: ${config.reasoning}) 启动评测..." -ForegroundColor Green
codex run --config "./configs/$ConfigId/config.json"

Write-Host ">>> [3/3] 执行客观回归断言并生成基准跑分报告!" -ForegroundColor Yellow`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in-scale">
      <div className="panel w-full max-w-3xl flex flex-col bg-white dark:bg-[#121215] shadow-2xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Codex 真实运行操作指引与沙箱执行机制
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                彻底厘清：手动怎么测、提示词怎么推、检查哪个文件夹、分轮怎么递进
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav */}
        <div className="px-5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center gap-2 shrink-0 text-xs overflow-x-auto">
          {[
            { id: 'manual' as const, label: '① 手动在 Codex 怎么测 (人肉分轮)' },
            { id: 'workspace' as const, label: '② 沙箱文件夹 (具体检查什么)' },
            { id: 'lifecycle' as const, label: '③ 是一次性的吗 (复现与重放)' },
            { id: 'cli' as const, label: '④ Codex CLI 自动化' },
            { id: 'powershell' as const, label: '⑤ PowerShell 批处理' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-zinc-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#09090b]">
          {/* Tab 1: Manual Step-by-Step Guide */}
          {activeTab === 'manual' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <strong>💡 人类开发者在 Codex 里手动评测的真实物理操作流：</strong>
                无需玄学想象，整个过程就是标准的「开指定工作区文件夹 ➔ 复制阶段提示词给它 ➔ 等它改完 ➔ 在该文件夹跑测试与 Diff 检查 ➔ 在同一文件夹给下一阶段提示词 ➔ 反向重跑旧测试防退化」。
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">1</span>
                      <span>准备指定的沙箱文件夹并封存基线</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">指定物理目录</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    在你的电脑上创建一个干净文件夹，例如 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">~/.codex/sandboxes/eval-{sampleTask.id}</code>，把题目初始脚手架代码复制进去。
                    在终端进入该文件夹，运行 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">git init && git add . && git commit -m "baseline"</code> 封存基线，方便之后一键看 Git Diff。
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">2</span>
                      <span>在 Codex 中打开该文件夹，推送第一阶段提示词</span>
                    </span>
                    <button
                      onClick={() => handleCopy('stage1', stage1Prompt)}
                      className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                    >
                      {copiedKey === 'stage1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'stage1' ? '已复制第一轮提示词' : '复制 Stage 1 提示词'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    打开 Codex，菜单选择 <strong>Open Folder</strong> 指向上一步创建的文件夹。把下面第一阶段提示词直接粘贴进 Codex 对话框，按回车。
                  </p>
                  <pre className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {stage1Prompt}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">3</span>
                      <span>等 Codex 执行结束，检查指定文件夹（检查什么？）</span>
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">第一轮客观验收</span>
                  </div>
                  <div className="text-slate-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                    <p>Codex 在该文件夹内自动修改代码、创建组件。跑完后，你在该文件夹的终端运行两项物理检查：</p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li><strong>运行测试用例</strong>：在文件夹内跑 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">npm run test:stage-1</code>，看断言是否全部通过 (Exit Code 0)。</li>
                      <li><strong>检查文件树与 Git Diff</strong>：跑 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">git status --porcelain</code> 与 <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">git diff --stat</code>，检查是否切中需求要害、有没有擅自新建临时 demo 或垃圾包装文件。</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">4</span>
                      <span>分批推进：在同一个文件夹、同一个会话继续推第二轮提示词</span>
                    </span>
                    <button
                      onClick={() => handleCopy('stage2', stage2Prompt)}
                      className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                    >
                      {copiedKey === 'stage2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'stage2' ? '已复制第二轮提示词' : '复制 Stage 2 提示词'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <strong>千万不要新建文件夹！</strong>直接在同一个 Codex 会话中，将【Stage 2 提示词】发给它。Codex 此时知道第一轮的代码全貌，会在已有代码上继续实现校验与暂存功能。
                  </p>
                  <pre className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {stage2Prompt}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-[11px]">
                    <strong>🚨 关键评测铁律（防退化反向回归断言）：</strong>
                    Codex 跑完第二轮后，你在指定文件夹必须同时执行两个测试：
                    <code className="block mt-1 font-mono text-slate-900 dark:text-white">npm run test:stage-2 && npm run test:stage-1</code>
                    如果第二轮引入的新代码把第一轮原本通过的单测改挂了，系统直接触发「代码破坏回归扣分」！
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Sandbox Workspace Detail */}
          {activeTab === 'workspace' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                评测检查的<strong>目标文件夹内部结构</strong>与三大核心检查要素：
              </div>
              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre">
{`~/.codex/sandboxes/eval-${sampleTask.id}/
├── .git/                              # 记录基线 baseline commit，随时对比 git diff
├── AGENTS.md                          # 注入切中需求要害的防蔓延规则与团队专属指令
├── src/                               # 待测核心源码目录
│   ├── components/FormWizard.tsx      # 【检查点 1】AI 修改的目标文件
│   └── (严禁出现 unneeded_*.ts)        # 【检查点 2】git status 审查是否产生多余垃圾文件
├── tests/                             # 客观测试用例套件
│   ├── stage-1.spec.ts                # 第一阶段基础功能单元测试
│   └── stage-2.spec.ts                # 第二阶段异步校验与草稿恢复测试
└── diff.patch                         # 评测完成后提取出的纯净代码补丁`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>1. 测试脚本退出码</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    在文件夹中运行测试，Exit Code 0 为满分通过，失败用例逐项扣减客观测试分。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                    <span>2. Git 文件纯净度</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    运行 git status，任何未经批准新建的 wrapper、说明 md、临时脚本均被判定为过度工程化。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
                    <span>3. 防退化防破坏</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    后续轮次必须在同一个文件夹上增量构建，并反向重跑前序所有阶段测试确保零回归。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Lifecycle & Reproducibility */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>这是一次性的吗？每次评测怎么对比、怎么重放？</span>
                </div>
                <div className="text-slate-600 dark:text-zinc-400 space-y-2">
                  <p>
                    <strong>答案：单次执行是闭环的任务 Job，但整套评测体系是 100% 可复现、可回放、可横向对照的！</strong>
                  </p>
                  <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500">
                    <div>
                      <strong>① 运行结果被永久快照记录：</strong>
                      每次跑完，系统会捕获当时的 Git Commit SHA、生成的代码补丁、Token 消耗细项（输入/输出/推理/缓存命中率）与双裁判打分，保存在【评测历史 (Run History)】中。
                    </div>
                    <div>
                      <strong>② 控制变量横向对照（A/B Testing）：</strong>
                      当你调整了 Harness 配置（例如：从 <code>5.6 (Solluna)</code> 换成 <code>GPT-6 Astra</code>，或者关闭了思考档位），系统会基于<strong>完全一致的初始基线分支</strong>，在新的干净沙箱中重放完全相同的一套 Stage 1 ➔ Stage 2 提示词序列！
                    </div>
                    <div>
                      <strong>③ 历史多轮平滑计算：</strong>
                      系统支持对同一个配置反复跑多次，自动计算平均分与标准差，彻底过滤由于 LLM 随机采样带来的偶发波动。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: CLI */}
          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>如果你不想手动复制粘贴，可直接在终端调用自动化 Harness 脚本：</span>
                <button
                  onClick={() => handleCopy('cli', cliCommand)}
                  className="btn-ghost !text-xs !py-1 flex items-center gap-1"
                >
                  {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                {cliCommand}
              </pre>
            </div>
          )}

          {/* Tab 5: PowerShell */}
          {activeTab === 'powershell' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Windows 平台一键自动创建隔离沙箱与顺序执行脚本：</span>
                <button
                  onClick={() => handleCopy('pwsh', pwshScript)}
                  className="btn-ghost !text-xs !py-1 flex items-center gap-1"
                >
                  {copiedKey === 'pwsh' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pwsh' ? '已复制' : '复制脚本'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {pwshScript}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/40">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            当前测试配置: <span className="font-bold text-slate-800 dark:text-zinc-200">{config.name}</span> ({config.baseModel || 'GPT-6 Astra'})
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary !py-2 !px-4">
              关闭
            </button>
            <button
              onClick={() => {
                onClose();
                onExecuteNow();
              }}
              className="btn-primary !py-2 !px-5 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>在此界面立即跑分测试</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
