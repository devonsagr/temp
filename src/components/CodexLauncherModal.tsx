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
  Cpu,
  Bot,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'task-run' | 'review-pipeline' | 'lifecycle' | 'automation'>('task-run');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || 'proj-01-fullstack-kanban');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0] || {
    id: 'proj-01-fullstack-kanban',
    title: '全栈敏捷任务看板',
    inputPrompt: '构建一个支持三列拖拽流转的前端看板，并联调 Node.js 服务端完成持久化。要求代码简洁，严禁引入无关三方依赖。',
    verificationCmd: 'npx playwright test test/fullstack-kanban.e2e.ts',
    difficulty: 'Medium',
    taskParadigm: 'open-ended-project',
  };

  const workspacePath = `~/.codex/sandboxes/eval-${currentTask.id}`;
  const inputPrompt = currentTask.inputPrompt;

  const cliCommand = `codex harness run \\
  --task "${currentTask.id}" \\
  --sandbox-dir "${workspacePath}" \\
  --model "${config.baseModel || 'gpt-6-astra'}" \\
  --reasoning-effort "${config.reasoning}" \\
  --rubric "universal-v1" \\
  --auto-review`;

  const pwshScript = `# 1. 创建干净隔离沙箱
$evalDir = "$HOME/.codex/sandboxes/eval-${currentTask.id}"
New-Item -ItemType Directory -Force -Path $evalDir
Set-Location $evalDir

# 2. 拉取基线脚手架并封存 Baseline Commit
git init
git checkout -b main
# 将任务前置代码放置于此...
git add . ; git commit -m "baseline: initial scaffold"

# 3. 注入 Harness 运行与自动审查流水线
codex exec --model "${config.baseModel || 'gpt-6-astra'}" --prompt @"
${inputPrompt}
"@

# 4. 执行自动化测试与客观断言
${currentTask.verificationCmd}

# 5. 自动拉取 Git Diff 提交 Review LLM 打分（无需人工二次复制代码）
$diff = git diff baseline
Invoke-RestMethod -Uri "http://localhost:5174/api/review" -Method Post -Body (@{ diff = $diff; taskId = "${currentTask.id}" } | ConvertTo-Json)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Codex 启动与隔离工作区编排
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  真实物理沙箱标准
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                单题物理沙箱目录、需求 Prompt 预览与全自动三步审查闭环
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center gap-2 shrink-0 text-xs overflow-x-auto">
          {[
            { id: 'task-run' as const, label: '🎯 单题沙箱与执行向导' },
            { id: 'review-pipeline' as const, label: '🤖 全自动审查流水线 (解密无需手动复制)' },
            { id: 'lifecycle' as const, label: '🔁 复现重放与历史快照' },
            { id: 'automation' as const, label: '⚡ Codex CLI & PowerShell 脚本' },
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
        <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#09090b] flex-1">
          {/* Tab 1: Single Task Run & Sandbox Guidance */}
          {activeTab === 'task-run' && (
            <div className="space-y-4 text-xs">
              {/* Task Selector Bar */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">当前选定测试题:</span>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.difficulty} · {t.taskParadigm === 'open-ended-project' ? '项目构建' : 'Bug修复'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>当前 Harness 配置:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">
                    {config.name} ({config.baseModel || 'GPT-6 Astra'})
                  </span>
                </div>
              </div>

              {/* Workspace Directory & Copy */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <FolderTree className="w-4 h-4 text-indigo-500" />
                    <span>1. 物理沙箱隔离工作区 (Sandbox Directory)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('wsPath', workspacePath)}
                    className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                  >
                    {copiedKey === 'wsPath' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'wsPath' ? '已复制沙箱路径' : '复制沙箱路径'}</span>
                  </button>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  在此物理路径下初始化 Git 仓库与基线代码。在 Codex 中直接使用 <strong>Open Folder</strong> 打开此目录：
                </p>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-900 font-mono text-xs text-slate-800 dark:text-zinc-200 select-all border border-slate-200/60 dark:border-zinc-800">
                  {workspacePath}
                </div>
              </div>

              {/* Task Prompt Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <FileCheck2 className="w-4 h-4 text-emerald-500" />
                    <span>2. 真实需求指令 (Prompt 给 Codex)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('prompt', inputPrompt)}
                    className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"
                  >
                    {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'prompt' ? '已复制提示词' : '一键复制提示词'}</span>
                  </button>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  在 Codex 中打开沙箱文件夹后，直接将此需求指令粘贴给 Codex Agent：
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-zinc-800">
                  {inputPrompt}
                </pre>
              </div>

              {/* Verification Command */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">3. 沙箱客观自动化验收命令:</span>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    {currentTask.verificationCmd}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('cmd', currentTask.verificationCmd)}
                  className="btn-ghost !text-xs !py-1 flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>复制命令</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Automated Review Pipeline */}
          {activeTab === 'review-pipeline' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200">
                <strong>💡 答疑解密：跑完后怎么打分？用户需要人肉复制提示词给审查 AI 吗？</strong>
                <p className="mt-1 text-slate-600 dark:text-zinc-300">
                  <strong>绝对不需要！</strong> 评测平台由 Harness 执行器与后台 Review Agent 联动，整个验收流程是 100% 自动化的。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                    <span>沙箱客观断言 (35%)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                    <p>• 脚本在沙箱执行 <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Exit Code 0</code> 检测</p>
                    <p>• 自动运行 Playwright/Vitest 端到端单测</p>
                    <p>• 客观通过率由测试用例通过数严格计算，零主观误差</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">2</span>
                    <span>审查 Agent 自动拉 Diff (50%)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                    <p>• Harness 自动拉取 <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">git diff baseline</code> 与终端执行日志</p>
                    <p>• 自动结构化推送到审查 Agent，无需人工介入复制</p>
                    <p>• 基于工业级 Universal Rubric 审查代码纯净度与需求切中度</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">3</span>
                    <span>人工可用性质感抽检 (15%)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                    <p>• 在战报中直接查看界面与功能完整度</p>
                    <p>• 提供 0-100 连续滑动条手动微调</p>
                    <p>• 作为加权维度实时沉淀至天梯历史记录</p>
                  </div>
                </div>
              </div>

              {/* Rubric Details */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>如何解决主观题的打分幻觉？通用 Rubric 判定法则</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1.5 pl-2 border-l-2 border-emerald-500">
                  <p><strong>① 证据锚定要求：</strong>审查 Agent 打分时必须引用 Git Diff 具体的修改文件与代码行号，严禁“凭空想象”评语。</p>
                  <p><strong>② 零客制化通用法则：</strong>无论内置题还是用户自定义导入的新题，均遵循相同的四维 Industrial Rubric（需求切中 30%、客观单测 35%、代码纯净 20%、UI质感 15%），确保天梯榜单的绝对公平。</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Lifecycle & Reproducibility */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>这是一次性的吗？每次评测如何对比与重放？</span>
                </div>
                <div className="text-slate-600 dark:text-zinc-400 space-y-2 text-[11px]">
                  <p>
                    <strong>答案：单次执行是隔离的任务 Run，但整套测试支持永久快照、横向 A/B 对照与历史重放！</strong>
                  </p>
                  <div className="space-y-2 pl-2 border-l-2 border-indigo-500">
                    <div>
                      <strong>① 运行结果被永久快照记录：</strong>
                      每次跑完，系统自动记录 Git Commit SHA、补丁代码、Token 消耗分项（输入/输出/推理/缓存命中率）与裁判打分，保存在【评测历史】中随时回顾。
                    </div>
                    <div>
                      <strong>② 控制变量横向对照（A/B Testing）：</strong>
                      当你更换 Harness 配置（如从 5.6 Solluna 换为 GPT-6 Astra，或切换思考档位），系统在独立的干净沙箱中输入完全一致的指令与环境，进行无偏见对比。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: CLI & Automation */}
          {activeTab === 'automation' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Codex Harness CLI 自动化命令行:</span>
                  <button
                    onClick={() => handleCopy('cli', cliCommand)}
                    className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                  >
                    {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cli' ? '已复制命令' : '复制命令'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto border border-zinc-800">
                  {cliCommand}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Windows PowerShell 一键沙箱创建与跑分脚本:</span>
                  <button
                    onClick={() => handleCopy('pwsh', pwshScript)}
                    className="btn-ghost !text-xs !py-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                  >
                    {copiedKey === 'pwsh' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pwsh' ? '已复制脚本' : '复制脚本'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap border border-zinc-800 max-h-56">
                  {pwshScript}
                </pre>
              </div>
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
