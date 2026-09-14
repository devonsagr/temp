import React, { useState } from 'react';
import { BenchmarkTask, TaskChannel } from '../types/arena';
import { BENCHMARK_CHANNELS } from '../services/benchmarkSuites';
import { BookOpen, Plus, Tag, CheckCircle2, Terminal, HelpCircle, Sparkles, Filter, ChevronRight, AlertTriangle, FileText, Globe, Layers } from 'lucide-react';

interface TaskBankViewProps {
  tasks: BenchmarkTask[];
  onAddTask: (task: BenchmarkTask) => void;
  onSelectForRun: (taskId: string, channel: TaskChannel) => void;
}

export const TaskBankView: React.FC<TaskBankViewProps> = ({
  tasks,
  onAddTask,
  onSelectForRun,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<TaskChannel | 'all'>('all');
  const [selectedParadigm, setSelectedParadigm] = useState<'all' | 'deterministic-bugfix' | 'open-ended-project'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard' | 'Nightmare'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedSpecTaskId, setExpandedSpecTaskId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'methodology'>('tasks');

  // Form states for new task
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState<TaskChannel>('frontend-ui');
  const [newParadigm, setNewParadigm] = useState<'deterministic-bugfix' | 'open-ended-project'>('open-ended-project');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Nightmare'>('Medium');
  const [newPrompt, setNewPrompt] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCmd, setNewCmd] = useState('');
  const [newScope, setNewScope] = useState<'fullstack-node' | 'fullstack-sqlite' | 'frontend-mockapi' | 'frontend-only'>('fullstack-node');
  const [newTechStack, setNewTechStack] = useState('React 19 + TypeScript + TailwindCSS + Fastify/SQLite');
  const [newUserStories, setNewUserStories] = useState(
    '用户输入并创建业务条目，实时渲染至看板\n支持流转状态与批量操作，PATCH 异步更新后端\n页面 F5 刷新后状态从持久化层无损还原'
  );
  const [newApiEndpoints, setNewApiEndpoints] = useState(
    'GET /api/items - 获取全量业务条目\nPOST /api/items - 新增数据记录\nPATCH /api/items/:id - 更新状态与属性\nDELETE /api/items/:id - 软删除或物理删除'
  );
  const [newAcceptanceCriteria, setNewAcceptanceCriteria] = useState(
    '端到端无死锁，Console 0 报错\n网络异常带友好重试提示与降级\n深浅色模式样式自适应无白边'
  );

  const filteredTasks = tasks.filter((t) => {
    const matchChannel = selectedChannel === 'all' || t.channel === selectedChannel;
    const matchParadigm = selectedParadigm === 'all' || t.taskParadigm === selectedParadigm;
    const matchDifficulty = selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
    const matchKeyword =
      !searchKeyword ||
      t.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.inputPrompt.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchChannel && matchParadigm && matchDifficulty && matchKeyword;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrompt) return;

    const userStoriesList = newUserStories.split('\n').map((s) => s.trim()).filter(Boolean);
    const apiEndpointsList = newApiEndpoints.split('\n').map((s) => s.trim()).filter(Boolean);
    const acceptanceList = newAcceptanceCriteria.split('\n').map((s) => s.trim()).filter(Boolean);

    const created: BenchmarkTask = {
      id: `custom-task-${Date.now().toString(36)}`,
      title: newTitle,
      channel: newChannel,
      taskParadigm: newParadigm,
      difficulty: newDifficulty,
      fullstackScope: newParadigm === 'open-ended-project' ? newScope : undefined,
      projectSpec:
        newParadigm === 'open-ended-project'
          ? {
              userStories: userStoriesList.length > 0 ? userStoriesList : ['用户能完成核心业务流程输入与提交'],
              apiEndpoints: apiEndpointsList.length > 0 ? apiEndpointsList : undefined,
              dataModel: [`SQLite: ${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.db`, 'LocalStorage 客户端状态持久化缓存'],
              acceptanceCriteria: acceptanceList.length > 0 ? acceptanceList : ['无未捕获异常，端到端流畅'],
              techStack: newTechStack || 'React 19 + TypeScript + TailwindCSS + Fastify/SQLite',
            }
          : undefined,
      sourceRepo: 'Custom Workspace',
      description: newDesc || newTitle,
      inputPrompt: newPrompt,
      hasFrontendUI: newChannel === 'frontend-ui' || newParadigm === 'open-ended-project',
      expectedTurns: newParadigm === 'open-ended-project' ? 2 : 1,
      verificationCmd: newCmd || (newParadigm === 'open-ended-project' ? 'npm run test:e2e' : 'npm test'),
      evaluationRubric:
        newParadigm === 'open-ended-project'
          ? ['严格吻合 Spec 规范书协议', '端到端 E2E 全通无崩溃', '界面高级审美手感无死链接']
          : ['根据题目特定断言点进行核验', '无未处理的异常与副作用'],
      customChecklist: [
        { key: 'primary_goal', label: '核心目标完全达成', points: 30 },
        { key: 'clean_implementation', label: '实现轻量无多余冗余', points: 20 },
      ],
    };

    onAddTask(created);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrompt('');
    setNewDesc('');
    setNewCmd('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>基准题库中心 (Benchmark Task Suite)</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
              共 {tasks.length} 道题目
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            涵盖前端视觉交互、真实 Bug 修复、团队个性化约束遵从与分步人机协同
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              浏览题库
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'methodology'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>题库来源与误差说明</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加自定义题目</span>
          </button>
        </div>
      </div>

      {activeTab === 'methodology' ? (
        /* ================= Methodology & Variance Guide ================= */
        <div className="space-y-6 animate-in-scale">
          <div className="panel p-6 space-y-5 bg-white dark:bg-[#121215]">
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  一、这个跑分的题库从何而来？
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  基准测试题库采用“三层漏斗”设计，杜绝空洞的玩具 Demo，确保每道题目真实反映工程研发中的痛点：
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">1</span>
                  <span>真实开源仓库核心缺陷</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  参考真实 GitHub 开源项目历史真实 PR，聚焦并发竞态、死锁、内存泄漏、正则回溯与边界容错。配有客观回归测试集（pytest/npm test）。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">2</span>
                  <span>现代前端交互与审美手感</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  要求组件不仅“无报错通过”，更考核视觉层次、微动效质感、白天/暗色双模自适应与无障碍键盘导航。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">3</span>
                  <span>团队个性化与工作区扩展</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  支持随时点击【添加自定义题目】，将团队私有项目的典型需求与约束用例录入，使跑分 100% 契合实际业务。
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-6 space-y-5 bg-white dark:bg-[#121215]">
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  二、微量更改的跑分误差行吗？如何衡量置信度？
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  大语言模型评测天然存在温度（Temperature）与采样波动。关于误差的可信度，基准系统定义了明确的科学准则：
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  1. 单次微调的正常方差范围（±2 ~ 4 分）
                </h4>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  如果仅仅修改了一两个提示词单词，单次跑分波动在 ±2~4 分内是正常的采样随机性，<strong>不代表配置有实质提升</strong>。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  2. 置信提升判定阈值（Δ Score &gt; 5.0 分）
                </h4>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  当配置改动（如剔除了繁复冗余规则、添加了直击核心意图的防蔓延约束、切换了合适的推理档位）带来的综合分提升<strong>超过 5.0 分</strong>时，系统才判定该改动为<strong>统计学显著有效（Statistically Significant）</strong>。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  3. 历史多次测试加权平滑 (Moving Average)
                </h4>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  系统会在配置管理中持续维护该配置的多轮历史加权平均分（<code>最新总分 = (历史总分 × 3 + 当前跑分) / 4</code>），自动平滑单次网络或偶发抖动。
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= Task List ================= */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Channel Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedChannel('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedChannel === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  全部赛道 ({tasks.length})
                </button>
                {BENCHMARK_CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id as TaskChannel)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedChannel === ch.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Keyword Search */}
              <input
                type="text"
                placeholder="搜索题目、需求指令或技术关键词..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Paradigm & Difficulty Second Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium mr-1">评测赛道:</span>
                <button
                  onClick={() => setSelectedParadigm('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    selectedParadigm === 'all'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  全部赛道
                </button>
                <button
                  onClick={() => setSelectedParadigm('open-ended-project')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    selectedParadigm === 'open-ended-project'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  <span>🚀 项目构建主力轨 (提需求·写Spec·前后端全栈)</span>
                </button>
                <button
                  onClick={() => setSelectedParadigm('deterministic-bugfix')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    selectedParadigm === 'deterministic-bugfix'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  <span>🐛 确定性工程 Bug 修复轨 (开源缺陷·单测断言)</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium mr-1">难度:</span>
                {(['all', 'Easy', 'Medium', 'Hard', 'Nightmare'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      selectedDifficulty === d
                        ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold'
                        : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {d === 'all' ? '全部' : d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="panel p-5 flex flex-col justify-between hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
                        {t.id}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          t.difficulty === 'Nightmare'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : t.difficulty === 'Hard'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : t.difficulty === 'Medium'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {t.difficulty}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        t.taskParadigm === 'deterministic-bugfix'
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}>
                        {t.taskParadigm === 'deterministic-bugfix' ? '🐛 客观单测' : '🚀 项目构建'}
                      </span>

                      {t.fullstackScope === 'fullstack-node' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          全栈 Node+UI
                        </span>
                      )}

                      {t.fullstackScope === 'frontend-mockapi' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                          Mock API + 前端
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      预期轮次: {t.expectedTurns}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {t.description}
                  </p>

                  {/* Real Input Prompt Quote */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800">
                    <div className="text-[10px] font-semibold text-slate-400 mb-1">
                      输入给 Agent 的指令 (User Prompt):
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-zinc-300 font-mono italic line-clamp-2">
                      "{t.inputPrompt}"
                    </div>
                  </div>

                  {/* Spec Contract Drawer for Projects */}
                  {t.projectSpec && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedSpecTaskId(expandedSpecTaskId === t.id ? null : t.id)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{expandedSpecTaskId === t.id ? '收起产品与技术规范书 (Spec)' : '📋 查看完整 Spec 规范书 (用户故事与接口契约)'}</span>
                      </button>

                      {expandedSpecTaskId === t.id && (
                        <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2 text-[11px] animate-in-fade">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">🎯 核心用户故事链路:</span>
                            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600 dark:text-zinc-400">
                              {t.projectSpec.userStories.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>

                          {t.projectSpec.apiEndpoints && (
                            <div>
                              <span className="font-bold text-slate-800 dark:text-zinc-200">🔌 前后端接口契约:</span>
                              <div className="mt-1 space-y-0.5">
                                {t.projectSpec.apiEndpoints.map((ep, idx) => (
                                  <code key={idx} className="block px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto">
                                    {ep}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">✅ 客观验收门禁标准:</span>
                            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600 dark:text-zinc-400">
                              {t.projectSpec.acceptanceCriteria.map((ac, idx) => (
                                <li key={idx}>{ac}</li>
                              ))}
                            </ul>
                          </div>

                          {t.projectSpec.techStack && (
                            <div className="text-slate-500 dark:text-zinc-400 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                              <strong>🛠️ 技术栈环境:</strong> {t.projectSpec.techStack}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Command */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                      {t.verificationCmd}
                    </code>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    核验规则: {t.customChecklist?.length || 0} 项
                  </span>

                  <button
                    onClick={() => onSelectForRun(t.id, t.channel)}
                    className="btn-ghost !text-xs !py-1 text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                  >
                    <span>在工作台跑此题</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in-scale">
          <div className="panel w-full max-w-2xl max-h-[90vh] flex flex-col p-6 bg-white dark:bg-[#121215] shadow-2xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    添加基准评测题目 (Add Benchmark Task)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    支持录入完整的全栈 Spec 规范书、用户故事与前后端契约
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg leading-none p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateTask} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Paradigm Selector */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 font-bold">
                  评测范式与赛道轨 (Task Paradigm):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewParadigm('open-ended-project');
                      setNewChannel('frontend-ui');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newParadigm === 'open-ended-project'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>🚀 开放性项目构建轨 (主力)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-normal">
                        提需求·写Spec
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      适合考核从产品需求、架构选型到前后端全栈落地，配有三层立体 Spec 验收。
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewParadigm('deterministic-bugfix');
                      setNewChannel('deepswe-core');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newParadigm === 'deterministic-bugfix'
                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>🐛 确定性工程 Bug 修复轨</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-normal">
                        客观单测
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      适合开源仓库缺陷重现与修复，以回归测试集（pytest/vitest）断言为准。
                    </p>
                  </button>
                </div>
              </div>

              {/* Title & Channel & Difficulty */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 mb-1 font-bold">
                  题目标题 (Task Title):
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newParadigm === 'open-ended-project'
                      ? '例如：全栈协同画板系统 (Fastify WebSocket + React Canvas + 本地持久化)'
                      : '例如：修复 Redis 缓存锁高并发竞争死锁缺陷'
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 mb-1 font-medium">
                    赛道类别 (Channel):
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as TaskChannel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                  >
                    {BENCHMARK_CHANNELS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 mb-1 font-medium">
                    难度级别 (Difficulty):
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="L1-入门">L1-入门</option>
                    <option value="L2-中等">L2-中等</option>
                    <option value="L3-专家">L3-专家</option>
                  </select>
                </div>
              </div>

              {/* Project-Specific Fields */}
              {newParadigm === 'open-ended-project' && (
                <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50 space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-indigo-200/50 dark:border-indigo-900/40 pb-2">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      项目构建轨：产品与技术规范书 (Project Spec Protocol)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                        全栈工程范围 (Scope):
                      </label>
                      <select
                        value={newScope}
                        onChange={(e) => setNewScope(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                      >
                        <option value="fullstack-node">fullstack-node (全栈 Node.js/Fastify + 前端)</option>
                        <option value="fullstack-sqlite">fullstack-sqlite (本地 SQLite 持久化 + 前端)</option>
                        <option value="frontend-mockapi">frontend-mockapi (前端交互 + MSW/Mock 接口)</option>
                        <option value="frontend-only">frontend-only (纯前端状态交互流转)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                        约束技术栈 (Tech Stack):
                      </label>
                      <input
                        type="text"
                        value={newTechStack}
                        onChange={(e) => setNewTechStack(e.target.value)}
                        placeholder="React 19 + TypeScript + TailwindCSS + Fastify/SQLite"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium flex items-center justify-between">
                      <span>核心用户故事链路 (User Stories - 每行一条):</span>
                      <span className="text-[10px] text-slate-400">将转化为逐项勾选的验收清单</span>
                    </label>
                    <textarea
                      rows={3}
                      value={newUserStories}
                      onChange={(e) => setNewUserStories(e.target.value)}
                      placeholder="用户输入并创建条目，实时渲染至看板&#10;支持拖拽与流转，PATCH 异步更新后端&#10;F5 刷新后状态从持久化层无损还原"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium flex items-center justify-between">
                      <span>前后端接口契约 (API Endpoints - 每行一条):</span>
                      <span className="text-[10px] text-slate-400">格式：METHOD /path - 说明</span>
                    </label>
                    <textarea
                      rows={3}
                      value={newApiEndpoints}
                      onChange={(e) => setNewApiEndpoints(e.target.value)}
                      placeholder="GET /api/tasks - 获取全量列表&#10;POST /api/tasks - 新增任务记录&#10;PATCH /api/tasks/:id - 更新任务状态"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                      客观验收门禁标准 (Acceptance Criteria - 每行一条):
                    </label>
                    <textarea
                      rows={2}
                      value={newAcceptanceCriteria}
                      onChange={(e) => setNewAcceptanceCriteria(e.target.value)}
                      placeholder="端到端无死锁，Console 0 报错&#10;网络断网带友好重试提示与降级&#10;深浅色模式样式自适应无白边"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Input Prompt */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 mb-1 font-bold">
                  输入给 Agent 的真实需求指令 (Prompt):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="输入要求 Codex / Agent 完整执行的 prompt，例如：请为团队实现一个..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              {/* Verification Command */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 mb-1 font-bold">
                  自动化断言命令 (Verification Command):
                </label>
                <input
                  type="text"
                  placeholder={
                    newParadigm === 'open-ended-project'
                      ? 'npm run test:e2e 或 vitest run --reporter=json'
                      : 'npm test 或 pytest tests/test_core.py'
                  }
                  value={newCmd}
                  onChange={(e) => setNewCmd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-mono"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary !py-2 !px-4"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary !py-2 !px-5 shadow-md">
                  保存并加入题库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
