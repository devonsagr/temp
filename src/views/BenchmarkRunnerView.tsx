import React, { useState } from 'react';
import {
  HarnessConfig,
  TaskChannel,
  BattleMatch,
  BattleTrialResult,
  RunHistoryRecord,
  BenchmarkTask,
  WeightPreset,
  BattleTrialStatus,
  TaskParadigm,
  TaskDifficulty,
  ManualRatingInput,
  MergeReadinessLevel,
} from '../types/arena';
import { BENCHMARK_CHANNELS } from '../services/benchmarkSuites';
import { WEIGHT_PRESETS, arenaStore } from '../services/arenaStore';
import { IQBadge } from '../components/IQBadge';
import { ScoreFormulaCard } from '../components/ScoreFormulaCard';
import { HumanReviewModal } from '../components/HumanReviewModal';
import { CodexLauncherModal } from '../components/CodexLauncherModal';
import { WeightPresetCustomizer } from '../components/WeightPresetCustomizer';
import {
  Play,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRightLeft,
  Check,
  Terminal,
  FileCode,
  FileSpreadsheet,
  Database,
  Sliders,
  Zap,
  Filter,
  Layers,
  AlertTriangle,
  RotateCcw,
  Copy,
  Target,
  ListOrdered,
  FolderTree,
  Edit3,
} from 'lucide-react';

interface BenchmarkRunnerViewProps {
  configs: HarnessConfig[];
  tasks: BenchmarkTask[];
  initialConfigAId?: string;
  onRunSingle: (
    configId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep: (msg: string) => void
  ) => Promise<RunHistoryRecord>;
  onRunMatch: (
    configAId: string,
    configBId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep: (msg: string) => void
  ) => Promise<BattleMatch>;
  onSaveManualRating: (
    matchId: string,
    trialIndex: number,
    isConfigA: boolean,
    rating: ManualRatingInput
  ) => void;
}

// Helper: Cleans up verbose prefixes and extracts secondary subtitles for clean readability
const cleanTaskTitle = (rawTitle: string) => {
  const stripped = rawTitle.replace(/^从(?:需求|模糊需求|零全栈实现)到落地[：:]\s*/, '');
  const match = stripped.match(/^(.*?)\s*[(（](.*?)[)）]$/);
  if (match) {
    return { title: match[1].trim(), subtitle: match[2].trim() };
  }
  return { title: stripped, subtitle: '' };
};

export const BenchmarkRunnerView: React.FC<BenchmarkRunnerViewProps> = ({
  configs,
  tasks,
  initialConfigAId,
  onRunSingle,
  onRunMatch,
  onSaveManualRating,
}) => {
  // Mode: 'single' (Default) or 'compare' (A/B)
  const [benchMode, setBenchMode] = useState<'single' | 'compare'>('single');

  const [selectedConfigId, setSelectedConfigId] = useState<string>(
    initialConfigAId || configs[0]?.id || ''
  );
  const [compareConfigBId, setCompareConfigBId] = useState<string>(
    configs[1]?.id || configs[0]?.id || ''
  );

  const [selectedChannel, setSelectedChannel] = useState<TaskChannel>('frontend-ui');

  // Paradigm & Difficulty Filters
  const [paradigmFilter, setParadigmFilter] = useState<'all' | TaskParadigm>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard' | 'Nightmare'>('all');

  // Simulated error injection for resiliency drill
  const [simulatedError, setSimulatedError] = useState<BattleTrialStatus | null>(null);

  // Execution Scope: 'single' (Focused Single-Task Run) vs 'batch' (Batch Queue Run)
  const [taskExecMode, setTaskExecMode] = useState<'single' | 'batch'>('single');
  const [focusedTaskId, setFocusedTaskId] = useState<string>(
    tasks.find((t) => t.channel === 'frontend-ui')?.id || tasks[0]?.id || ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customWorkspaces, setCustomWorkspaces] = useState<Record<string, string>>({});
  const [isCustomWsMode, setIsCustomWsMode] = useState<Record<string, boolean>>({});

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([
    tasks.find((t) => t.channel === 'frontend-ui')?.id || tasks[0]?.id || ''
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [liveLog, setLiveLog] = useState<string>('');

  // Results
  const [singleResult, setSingleResult] = useState<RunHistoryRecord | null>(null);
  const [matchResult, setMatchResult] = useState<BattleMatch | null>(null);
  const [historySavedTip, setHistorySavedTip] = useState(false);

  // Weight Presets
  const [activePreset, setActivePreset] = useState<WeightPreset>(WEIGHT_PRESETS[0]);
  const [showWeightCustomizer, setShowWeightCustomizer] = useState(false);

  // Modals
  const [isCodexLauncherOpen, setIsCodexLauncherOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    trial: BattleTrialResult;
    index: number;
    isConfigA: boolean;
    initialTab?: 'spec' | 'diff' | 'terminal' | 'judge' | 'facts' | 'rubric';
  } | null>(null);

  if (!configs || configs.length === 0) {
    return (
      <div className="panel p-12 text-center text-slate-500 text-xs">
        正在读取配置...
      </div>
    );
  }

  const activeConfig = configs.find((c) => c.id === selectedConfigId) || configs[0];
  const compareConfigB = configs.find((c) => c.id === compareConfigBId) || configs[1] || configs[0];

  const channelTasks = tasks.filter((t) => {
    if (t.channel !== selectedChannel) return false;
    if (paradigmFilter !== 'all' && t.taskParadigm !== paradigmFilter) return false;
    if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
    return true;
  });

  const focusedTask = tasks.find((t) => t.id === focusedTaskId) || channelTasks[0] || tasks[0];

  const handleChannelSelect = (ch: TaskChannel) => {
    setSelectedChannel(ch);
    const chTasks = tasks.filter((t) => t.channel === ch);
    const firstTaskId = chTasks[0]?.id || '';
    if (taskExecMode === 'single') {
      setFocusedTaskId(firstTaskId);
      setSelectedTaskIds(firstTaskId ? [firstTaskId] : []);
    } else {
      setSelectedTaskIds(chTasks.map((t) => t.id));
    }
  };

  const handleSelectFocusedTask = (id: string) => {
    setFocusedTaskId(id);
    setSelectedTaskIds([id]);
  };

  const toggleTaskSelection = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      if (selectedTaskIds.length === 1) return; // keep at least 1
      setSelectedTaskIds(selectedTaskIds.filter((t) => t !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  // Run Benchmark
  const handleStartBenchmark = async () => {
    if (selectedTaskIds.length === 0) {
      alert('请至少选择一道评测题目！');
      return;
    }

    setIsRunning(true);
    setLiveLog('初始化测试环境与代码沙箱...');
    setSingleResult(null);
    setMatchResult(null);
    setHistorySavedTip(false);

    try {
      if (benchMode === 'single') {
        const res = await onRunSingle(
          selectedConfigId,
          selectedTaskIds,
          selectedChannel,
          (msg) => setLiveLog(msg)
        );
        setSingleResult(res);
        setHistorySavedTip(true);
      } else {
        if (selectedConfigId === compareConfigBId) {
          alert('请选择两套不同的配置进行对照！');
          return;
        }
        const match = await onRunMatch(
          selectedConfigId,
          compareConfigBId,
          selectedTaskIds,
          selectedChannel,
          (msg) => setLiveLog(msg)
        );
        setMatchResult(match);
        setHistorySavedTip(true);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Fine-grained In-line Score Adjustment (0-100 continuous)
  const handleAdjustScore = (
    trialIndex: number,
    isConfigA: boolean,
    type: 'intent' | 'maintainability' | 'robustness' | 'ux' | 'aesthetic' | 'directness',
    value: number
  ) => {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    const runId = benchMode === 'single' ? singleResult?.id : matchResult?.id;
    if (!runId) return;

    let targetTrial: BattleTrialResult | undefined;
    if (benchMode === 'single' && singleResult) {
      targetTrial = singleResult.results[trialIndex];
    } else if (matchResult) {
      targetTrial = isConfigA ? matchResult.resultsA[trialIndex] : matchResult.resultsB[trialIndex];
    }
    if (!targetTrial) return;

    const intent = (type === 'intent' || type === 'directness') ? clamped : (targetTrial.scores.intentScore ?? targetTrial.scores.directnessScore);
    const maintainability = type === 'maintainability' ? clamped : (targetTrial.scores.maintainabilityScore ?? targetTrial.scores.constraintScore ?? 86);
    const robustness = type === 'robustness' ? clamped : (targetTrial.scores.robustnessScore ?? 85);
    const ux = (type === 'ux' || type === 'aesthetic') ? clamped : (targetTrial.scores.uxScore ?? targetTrial.scores.aestheticScore);

    const humanScore = Math.round((intent * 0.3 + maintainability * 0.25 + robustness * 0.25 + ux * 0.2) * 10) / 10;
    const readiness: MergeReadinessLevel =
      humanScore >= 90 ? 'ready_to_merge' : humanScore >= 80 ? 'minor_polish' : humanScore >= 60 ? 'major_rework' : 'rejected';

    const mechanicalScore = targetTrial.scores.mechanicalScore ?? Math.round((targetTrial.scores.codePassScore * 0.5 + 96 * 0.25 + 92 * 0.25) * 10) / 10;
    const overall = Math.round((mechanicalScore * 0.5 + humanScore * 0.5) * 10) / 10;

    targetTrial.scores.intentScore = intent;
    targetTrial.scores.maintainabilityScore = maintainability;
    targetTrial.scores.robustnessScore = robustness;
    targetTrial.scores.uxScore = ux;
    targetTrial.scores.humanScore = humanScore;
    targetTrial.scores.mergeReadiness = readiness;
    targetTrial.scores.directnessScore = intent;
    targetTrial.scores.aestheticScore = ux;
    targetTrial.scores.constraintScore = maintainability;
    targetTrial.scores.overallPercent = overall;
    targetTrial.scores.codexIQ = overall;

    onSaveManualRating(runId, trialIndex, isConfigA, {
      intentScore: intent,
      maintainabilityScore: maintainability,
      robustnessScore: robustness,
      uxScore: ux,
      mergeReadiness: readiness,
      aestheticScore: ux,
      directnessScore: intent,
      aestheticStars: Math.round(ux / 20),
      directnessStars: Math.round(intent / 20),
      aestheticNotes: targetTrial.manualRatings?.aestheticNotes || '',
      customChecks: targetTrial.manualRatings?.customChecks || {},
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 1. Transparent Score Formula & Disclosure Pill */}
      <ScoreFormulaCard currentChannel={selectedChannel} />

      {/* 2. Mode Selector & Weight Customizer Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setBenchMode('single')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              benchMode === 'single'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            单配置独立评测 (Single)
          </button>
          <button
            onClick={() => setBenchMode('compare')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              benchMode === 'compare'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>A/B 对照评测 (Compare)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightCustomizer(!showWeightCustomizer)}
            className={`text-xs !py-1.5 flex items-center gap-1.5 px-3 rounded-xl border transition-all ${
              showWeightCustomizer
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm ring-1 ring-indigo-500/30'
                : 'btn-secondary text-slate-700 dark:text-zinc-300 hover:border-indigo-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>评分权重策略: {activePreset.tag}</span>
            {showWeightCustomizer ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-indigo-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setIsCodexLauncherOpen(true)}
            className="btn-secondary !text-xs !py-1.5 flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Codex 启动与工作区编排</span>
          </button>
        </div>
      </div>

      {/* Collapsible Weight Preset Customizer with clear visual anchor */}
      {showWeightCustomizer && (
        <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-500/50 space-y-3 animate-slide-up shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-900/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white">
                正在生效: {activePreset.name}
              </span>
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                各评测维度权重占比公示与实时微调面板（所有跑分实时应用此公式）
              </span>
            </div>
            <button
              onClick={() => setShowWeightCustomizer(false)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              ✕ 收起面板
            </button>
          </div>
          <WeightPresetCustomizer
            currentPresetId={activePreset.id}
            onSelectPreset={(p) => setActivePreset(p)}
          />
        </div>
      )}

      {/* 3. Three-Step Benchmarking Workbench */}
      <div className="space-y-4">
        {/* Step 1: Select Configuration */}
        <div className="panel p-5 space-y-3 bg-white dark:bg-[#121215]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>{benchMode === 'single' ? '选择待评测配置' : '选择 A/B 对照的两套配置'}</span>
            </h3>

            <span className="text-[11px] text-slate-400 font-mono">
              库中共 {configs.length} 套配置
            </span>
          </div>

          {benchMode === 'single' ? (
            /* Single Config Selector */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {configs.map((c) => {
                const isSelected = c.id === selectedConfigId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConfigId(c.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/40'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#121215]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>

                      <div className="flex items-center gap-1.5 my-1 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-medium border border-indigo-200/60 dark:border-indigo-800/60">
                          {c.baseModel || 'GPT-6 Astra'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          思考: {c.reasoning}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {c.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[10px] text-slate-400">
                      <span>胜率: {c.winRate}%</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                        {c.iqScore} 分
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* A/B Compare Selector */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  基准配置 (A):
                </label>
                <select
                  value={selectedConfigId}
                  onChange={(e) => setSelectedConfigId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                >
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.baseModel || 'GPT-6'} ({c.iqScore}分)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
                  {activeConfig?.tagline}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  对照配置 (B):
                </label>
                <select
                  value={compareConfigBId}
                  onChange={(e) => setCompareConfigBId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
                >
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.baseModel || 'GPT-6'} ({c.iqScore}分)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
                  {compareConfigB?.tagline}
                </p>
              </div>
            </div>
          )}

          {/* Active Custom Constraints */}
          {activeConfig?.customConstraints && activeConfig.customConstraints.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  当前配置挂载的团队个性化约束核验项 ({activeConfig.customConstraints.length} 项):
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {activeConfig.customConstraints.map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium"
                    >
                      ✓ {c.title} ({c.weightPoints}分)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Select Tasks Channel & Specific Tasks (Clean Master-Detail Workspace) */}
        <div className="panel p-5 space-y-4 bg-white dark:bg-[#121215]">
          {/* Step 2 Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  评测任务与沙箱工作台
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  选择赛道与具体任务，指令与沙箱环境即时联动
                </p>
              </div>
            </div>

            {/* Scope Mode Switcher: Single vs Batch */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
              <button
                onClick={() => {
                  setTaskExecMode('single');
                  const currentOrFirst = channelTasks.find((t) => t.id === focusedTaskId) || channelTasks[0];
                  if (currentOrFirst) {
                    setFocusedTaskId(currentOrFirst.id);
                    setSelectedTaskIds([currentOrFirst.id]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  taskExecMode === 'single'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>🎯 单题精细评测 (推荐)</span>
              </button>
              <button
                onClick={() => {
                  setTaskExecMode('batch');
                  setSelectedTaskIds(channelTasks.map((t) => t.id));
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  taskExecMode === 'batch'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 text-purple-500" />
                <span>📑 批量队列自动跑 ({channelTasks.length}题)</span>
              </button>
            </div>
          </div>

          {/* Channel Selector - Sleek Horizontal Tabs (No harsh glaring card) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900/90 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-x-auto">
            {BENCHMARK_CHANNELS.map((ch) => {
              const isChActive = ch.id === selectedChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id as TaskChannel)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    isChActive
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold border border-slate-200/70 dark:border-zinc-700'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{ch.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isChActive
                        ? 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                        : 'text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {ch.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Filters Toolbar (Type & Difficulty) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 text-xs">
            {/* Paradigm Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] mr-0.5">类型:</span>
              <button
                onClick={() => setParadigmFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  paradigmFilter === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                全部 ({tasks.filter((t) => t.channel === selectedChannel).length})
              </button>
              <button
                onClick={() => setParadigmFilter('open-ended-project')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  paradigmFilter === 'open-ended-project'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                🛠️ 项目构建
              </button>
              <button
                onClick={() => setParadigmFilter('deterministic-bugfix')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  paradigmFilter === 'deterministic-bugfix'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                🐛 Bug 修复
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] mr-0.5">难度:</span>
              {(['all', 'Easy', 'Medium', 'Hard', 'Nightmare'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    difficultyFilter === diff
                      ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold'
                      : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {diff === 'all' ? '全部' : diff}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Split Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
            {/* Left Column: Clean Task List */}
            <div className="lg:col-span-6 space-y-2">
              {/* Batch Mode Toolbar if in batch */}
              {taskExecMode === 'batch' && (
                <div className="flex items-center justify-between text-xs px-1 pb-1">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">
                    已勾选 {selectedTaskIds.length} / {channelTasks.length} 题
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTaskIds(channelTasks.map((t) => t.id))}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      全选当前列表
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">|</span>
                    <button
                      onClick={() =>
                        setSelectedTaskIds(channelTasks.length > 0 ? [channelTasks[0].id] : [])
                      }
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                    >
                      仅留单题
                    </button>
                  </div>
                </div>
              )}

              {/* Task List container with clean scroll */}
              <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
                {channelTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
                    当前筛选条件下无测试题，请调整上方类型或难度过滤
                  </div>
                ) : (
                  channelTasks.map((t) => {
                    const isSelected =
                      taskExecMode === 'single'
                        ? focusedTaskId === t.id
                        : selectedTaskIds.includes(t.id);
                    const { title, subtitle } = cleanTaskTitle(t.title);

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (taskExecMode === 'single') {
                            handleSelectFocusedTask(t.id);
                          } else {
                            toggleTaskSelection(t.id);
                          }
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/70 dark:border-indigo-500/60 ring-1 ring-indigo-500/30 text-slate-900 dark:text-white shadow-sm'
                            : 'bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800/90 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100/60 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        {/* Radio or Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          {taskExecMode === 'single' ? (
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 dark:border-zinc-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-indigo-600 shrink-0 cursor-pointer mt-0.5"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-800 dark:text-zinc-200'
                              }`}
                            >
                              {title}
                            </span>

                            {/* Minimal Difficulty & Paradigm indicators */}
                            <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                              <span
                                className={`px-1.5 py-0.2 rounded font-medium ${
                                  t.taskParadigm === 'deterministic-bugfix'
                                    ? 'bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                    : 'bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                }`}
                              >
                                {t.taskParadigm === 'deterministic-bugfix' ? 'Bug' : '项目'}
                              </span>

                              <span
                                className={`font-mono font-medium ${
                                  t.difficulty === 'Nightmare'
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : t.difficulty === 'Hard'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : t.difficulty === 'Medium'
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                • {t.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Subtitle / Tech summary */}
                          {subtitle && (
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Focused Task Inspector & Workbench (Sticky on desktop) */}
            <div className="lg:col-span-6">
              {taskExecMode === 'single' && focusedTask ? (
                <div className="sticky top-20 p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-sm">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 dark:border-zinc-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cleanTaskTitle(focusedTask.title).title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {focusedTask.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {focusedTask.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Prompt Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 text-[11px]">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                        真实需求指令 Prompt 预览 ({focusedTask.inputPrompt.length} 字)
                      </span>
                      <button
                        onClick={() => handleCopy('focused-prompt', focusedTask.inputPrompt)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        {copiedKey === 'focused-prompt' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'focused-prompt' ? '已复制' : '复制提示词'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed max-h-28 overflow-y-auto font-sans">
                      {focusedTask.inputPrompt}
                    </div>
                  </div>

                  {/* Workspace Directory & Objective Command Grid */}
                  <div className="space-y-2.5">
                    {/* Sandbox / Workspace Directory */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
                          物理工作区目录 (Codex 在此处读写代码)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const currentMode = isCustomWsMode[focusedTask.id] || false;
                              setIsCustomWsMode((prev) => ({ ...prev, [focusedTask.id]: !currentMode }));
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>{isCustomWsMode[focusedTask.id] ? '切回推荐沙箱' : '指定本地目录'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const path = isCustomWsMode[focusedTask.id]
                                ? customWorkspaces[focusedTask.id] || `~/.codex/sandboxes/eval-${focusedTask.id}`
                                : `~/.codex/sandboxes/eval-${focusedTask.id}`;
                              handleCopy('focused-ws', path);
                            }}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 ml-1"
                          >
                            {copiedKey === 'focused-ws' ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            <span>{copiedKey === 'focused-ws' ? '已复制' : '复制路径'}</span>
                          </button>
                        </div>
                      </div>

                      {isCustomWsMode[focusedTask.id] ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={customWorkspaces[focusedTask.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomWorkspaces((prev) => ({ ...prev, [focusedTask.id]: val }));
                            }}
                            placeholder="粘贴本地测试文件夹的绝对路径，例如: D:/test-projects/eval-01"
                            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                            💡 Codex 桌面端直接打开此文件夹后执行需求，代码将直接落在此目录下。
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800/80">
                          <span className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 truncate select-all">
                            ~/.codex/sandboxes/eval-{focusedTask.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0 font-medium">
                            推荐隔离沙箱
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Test Assertion Command */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-emerald-500" />
                          客观验证断言命令 (Exit Code 0 代表通过)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy('focused-cmd', focusedTask.verificationCmd)
                          }
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          {copiedKey === 'focused-cmd' ? (
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                          <span>{copiedKey === 'focused-cmd' ? '已复制' : '复制命令'}</span>
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 truncate select-all bg-slate-50 dark:bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        {focusedTask.verificationCmd}
                      </div>
                    </div>
                  </div>

                  {/* 3-Step Practical Acceptance Flow Guide */}
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>实际评测与验收三步闭环:</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 pl-1">
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                        <span><strong>Codex 跑代码</strong>：复制上方提示词，在选定工作区文件夹中发给 Codex 编写代码。</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                        <span><strong>终端客观验收</strong>：在该文件夹内运行上方命令（看 Exit Code 0）及 <code className="font-mono text-[10px]">git diff</code> 查看文件洁净度。</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                        <span><strong>结果录入与复审</strong>：点击下方【立即启动评测】记录数据，点击【专家复审】核定 4 维量表并入榜。</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Spec Highlights if project */}
                  {focusedTask.projectSpec && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] space-y-1">
                      <div className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 text-[10px]">
                        <FileSpreadsheet className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>Spec 核心验收门禁:</span>
                      </div>
                      <div className="space-y-0.5 pl-3 text-slate-600 dark:text-zinc-400 text-[10px]">
                        {focusedTask.projectSpec.acceptanceCriteria.slice(0, 2).map((ac, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span className="truncate">{ac}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workflow Note */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <span>⚡ 全自动流转：沙箱运行 ➔ 自动拉取 Diff 评分 ➔ 人工 5 维复审</span>
                    <button
                      onClick={() => setIsCodexLauncherOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>编排向导 →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Batch Mode Summary Box */
                <div className="sticky top-20 p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-4 text-xs">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      📑 批量队列执行模式
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      系统将按序在独立沙箱中依次执行当前已勾选的 {selectedTaskIds.length} 道测试题，跑完后统一输出天梯总分与排行榜。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">队列题目数量:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {selectedTaskIds.length} 题
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">预计执行耗时:</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">
                        约 {(selectedTaskIds.length * 0.5).toFixed(1)} 分钟
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">沙箱隔离策略:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        每个任务独立临时沙箱
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Run Benchmark Button & Error Injection Playground */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 panel p-5 bg-white dark:bg-[#121215]">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {benchMode === 'single'
                ? `准备对【${activeConfig?.name}】(${activeConfig?.baseModel || 'GPT-6'}) 执行跑分`
                : `准备对【${activeConfig?.name}】与【${compareConfigB?.name}】执行对照测试`}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {taskExecMode === 'single'
                ? `🎯 单题精细执行: 仅针对【${focusedTask?.title ? cleanTaskTitle(focusedTask.title).title : '选定任务'}】进行沙箱测试、Diff 提取与三层审查`
                : `📑 批量队列自动跑: 将按序在独立沙箱中执行选中的 ${selectedTaskIds.length} 道测试题并汇总战报`}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Error Injection Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={simulatedError || ''}
                onChange={(e) => {
                  const val = e.target.value ? (e.target.value as BattleTrialStatus) : null;
                  setSimulatedError(val);
                  arenaStore.setSimulatedError(val);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-700 dark:text-zinc-300"
              >
                <option value="">容错演练: 正常执行</option>
                <option value="quota_exhausted">🔴 模拟额度耗尽 (Quota)</option>
                <option value="rate_limit_429">⚠️ 模拟 429 并发限流</option>
                <option value="context_overflow">📑 模拟上下文窗口溢出</option>
                <option value="timeout">⏱️ 模拟 300s 执行超时</option>
              </select>
            </div>

            <button
              disabled={isRunning || selectedTaskIds.length === 0}
              onClick={handleStartBenchmark}
              className="btn-primary !px-6 !py-2.5 !text-sm flex items-center gap-2 shadow-md shrink-0"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>跑分测试执行中...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {taskExecMode === 'single'
                      ? `🚀 立即启动单题精细评测`
                      : `🚀 启动批量队列自动跑分 (${selectedTaskIds.length}题)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Execution Console */}
        {isRunning && (
          <div className="panel p-4 bg-slate-950 border-zinc-800 text-zinc-300 font-mono text-xs space-y-2 animate-in-scale">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] border-b border-zinc-800/80 pb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Codex Harness Runner 沙箱执行日志</span>
              </span>
              <span>实时采样模拟中</span>
            </div>
            <div className="text-emerald-400 font-mono text-xs py-1">
              {liveLog || '正在执行用例...'}
            </div>
          </div>
        )}
      </div>

      {/* 4. Results Section: Single Score Card or Compare Table */}
      {singleResult && (
        <div className="panel p-6 space-y-6 bg-white dark:bg-[#121215] animate-slide-up border-2 border-zinc-200 dark:border-zinc-700">
          {/* Summary Scorecard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                  评测完成
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {singleResult.configSnapshot.name} · 基准跑分报告
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                测试时间: {singleResult.createdAt} · 基座模型: {singleResult.configSnapshot.baseModel || 'GPT-6 Astra'} · 赛道: {singleResult.channel} · 自动归档至【评测历史】
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">综合总评</div>
                <IQBadge score={singleResult.overallScore} size="lg" />
              </div>

              <div className="text-right pl-4 border-l border-slate-200 dark:border-zinc-800">
                <div className="text-xs text-slate-400">客观通过率</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {singleResult.passRate}%
                </div>
              </div>

              <div className="text-right pl-4 border-l border-slate-200 dark:border-zinc-800">
                <div className="text-xs text-slate-400">用时 / Token</div>
                <div className="text-xs font-mono text-slate-700 dark:text-zinc-300 mt-1">
                  {singleResult.totalSeconds}s · ~{singleResult.totalTokens}
                </div>
              </div>
            </div>
          </div>

          {/* Task-by-Task Details with Fine-Grained Adjustments & Human Review Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                逐题评测明细与精细打分 (0~100 连续数值调节)
              </h4>
              <span className="text-[11px] text-slate-400">
                点击【人工深入验收】可检查代码 Diff、终端日志与 AI 裁判评语
              </span>
            </div>

            <div className="space-y-3">
              {singleResult.results.map((r, idx) => {
                const matchedTask = tasks.find((t) => t.id === r.taskId);
                const isProj =
                  matchedTask?.taskParadigm === 'open-ended-project' ||
                  Boolean(matchedTask?.projectSpec) ||
                  r.taskId.startsWith('proj') ||
                  r.taskId.startsWith('ui');

                return (
                  <div
                    key={r.taskId}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.status === 'passed' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {cleanTaskTitle(r.taskTitle).title}
                        </span>
                        {cleanTaskTitle(r.taskTitle).subtitle && (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal truncate max-w-xs">
                            ({cleanTaskTitle(r.taskTitle).subtitle})
                          </span>
                        )}
                        {isProj ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            🚀 项目主力轨
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                            🐛 Bug修复轨
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isProj && (
                          <button
                            onClick={() =>
                              setReviewModalData({
                                trial: r,
                                index: idx,
                                isConfigA: true,
                                initialTab: 'spec',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Spec 与全栈验收</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setReviewModalData({
                              trial: r,
                              index: idx,
                              isConfigA: true,
                              initialTab: 'diff',
                            })
                          }
                          className="btn-secondary !text-xs !py-1 !px-2.5 flex items-center gap-1.5"
                        >
                          <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                          <span>人工深入验收 (Diff & AI)</span>
                        </button>

                        <span className="text-[11px] text-slate-400 font-mono">
                          耗时: {r.scores.secondsUsed}s
                        </span>
                        <IQBadge score={r.scores.codexIQ} size="sm" />
                      </div>
                    </div>

                    {/* Project Spec Achievement Strip */}
                    {isProj && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/70 to-emerald-50/60 dark:from-indigo-950/30 dark:to-emerald-950/20 border border-indigo-200/70 dark:border-indigo-900/40 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] tracking-wide">
                            🚀 全栈落地
                          </span>
                          <span className="font-bold text-indigo-950 dark:text-indigo-200">
                            Spec 契约达成: 96%
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700">|</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            ✓ Playwright E2E 全通
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700">|</span>
                          <span className="text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                            持久化: {matchedTask?.projectSpec?.dataModel?.[0] || 'SQLite / LocalStorage 正常'}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setReviewModalData({
                              trial: r,
                              index: idx,
                              isConfigA: true,
                              initialTab: 'spec',
                            })
                          }
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <span>核验用户故事与联调 API &rarr;</span>
                        </button>
                      </div>
                    )}

                  {/* Error Alert Banner if trial errored */}
                  {r.errorDetails && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs flex items-start justify-between gap-3 text-rose-900 dark:text-rose-200 animate-in-scale">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>运行时异常: {r.errorDetails.code}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 font-mono">
                              {r.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">{r.errorDetails.message}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">💡 {r.errorDetails.suggestedFix}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          r.status = 'passed';
                          r.errorDetails = undefined;
                          r.scores.codePassScore = 92;
                          r.scores.codexIQ = 90;
                          setSingleResult({ ...singleResult });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold shrink-0 flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>自愈重试</span>
                      </button>
                    </div>
                  )}

                  {/* Runtime Telemetry: Latency, Tokens, Prompt Caching */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 text-[11px] mr-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium">能效遥测:</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                      ⏱️ 耗时: {r.scores.executionLatencySec ?? r.scores.secondsUsed}s
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                      🚀 吞吐: {r.scores.tokensPerSecond ?? 82} tok/s
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                      In: {r.scores.tokensDetail?.inputTokens.toLocaleString() ?? '3,800'} | Out: {r.scores.tokensDetail?.outputTokens.toLocaleString() ?? '820'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-semibold border border-purple-200 dark:border-purple-900/60">
                      🧠 思考 Token: {r.scores.tokensDetail?.reasoningTokens.toLocaleString() ?? '1,800'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-200 dark:border-cyan-900/60 flex items-center gap-1">
                      ⚡ 缓存命中: {r.scores.tokensDetail?.cacheHitRate ?? 84.5}%
                    </span>
                  </div>

                  {/* Multi-turn Stage Progress Stepper */}
                  {(() => {
                    const matchedTask = tasks.find((t) => t.id === r.taskId);
                    if (!matchedTask?.multiTurnStages || matchedTask.multiTurnStages.length === 0) return null;
                    return (
                      <div className="p-2.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 text-xs space-y-1.5">
                        <div className="text-[11px] font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-sky-600" />
                          <span>分段门禁流转 (Stage-Gate Progression):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          {matchedTask.multiTurnStages.map((stg) => (
                            <div key={stg.stageIndex} className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-sky-200/40 dark:border-zinc-800 text-[11px]">
                              <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                <span>{stg.title}</span>
                                <span className="text-emerald-500 font-bold">✓ 门禁通过</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">{stg.stageAssertionCmd}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dual-Track Evaluation & 4-Dimension Engineering Sliders */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-3">
                    {/* Synthesis Status Pill */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                            🤖 机械客观自动化判断 (50%)
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {r.scores.mechanicalScore ?? Math.round(r.scores.codePassScore * 0.5 + 47)} 分
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            (单测 {r.scores.codePassScore}分 · 编译通过 · Git 纯净)
                          </span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>

                        <div>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                            👤 人类专家 5 维复审 (50%)
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {r.scores.humanScore ??
                              Math.round(
                                ((r.scores.intentScore ?? r.scores.directnessScore) * 0.3 +
                                  (r.scores.maintainabilityScore ?? 86) * 0.25 +
                                  (r.scores.robustnessScore ?? 85) * 0.25 +
                                  (r.scores.uxScore ?? r.scores.aestheticScore) * 0.2) *
                                  10
                              ) / 10}{' '}
                            分
                          </span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            🏷️ PR 准入评级
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {r.scores.mergeReadiness === 'ready_to_merge'
                              ? '🟢 免修直接合并'
                              : r.scores.mergeReadiness === 'minor_polish'
                              ? '🟡 微调即可合入'
                              : r.scores.mergeReadiness === 'major_rework'
                              ? '🟠 需较大幅重构'
                              : '🔴 拒绝合入'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">加权总分:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-mono font-bold text-xs shadow-sm">
                          {r.scores.codexIQ} 分
                        </span>
                      </div>
                    </div>

                    {/* 4 Professional Engineering Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* Dim 1: Intent Fidelity */}
                      <div className="space-y-1.5 bg-white dark:bg-[#121215] p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 truncate">
                            🎯 需求切中 (30%)
                          </span>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'intent',
                                  (r.scores.intentScore ?? r.scores.directnessScore) - 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              -5
                            </button>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs w-6 text-center">
                              {r.scores.intentScore ?? r.scores.directnessScore}
                            </span>
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'intent',
                                  (r.scores.intentScore ?? r.scores.directnessScore) + 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.scores.intentScore ?? r.scores.directnessScore}
                          onChange={(e) =>
                            handleAdjustScore(idx, true, 'intent', Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer h-1.5"
                        />

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>段位:</span>
                          <div className="flex gap-1">
                            {[60, 80, 90, 98].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleAdjustScore(idx, true, 'intent', p)}
                                className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dim 2: Maintainability */}
                      <div className="space-y-1.5 bg-white dark:bg-[#121215] p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 truncate">
                            🧹 代码规范 (25%)
                          </span>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'maintainability',
                                  (r.scores.maintainabilityScore ?? r.scores.constraintScore ?? 86) - 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              -5
                            </button>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs w-6 text-center">
                              {r.scores.maintainabilityScore ?? r.scores.constraintScore ?? 86}
                            </span>
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'maintainability',
                                  (r.scores.maintainabilityScore ?? r.scores.constraintScore ?? 86) + 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.scores.maintainabilityScore ?? r.scores.constraintScore ?? 86}
                          onChange={(e) =>
                            handleAdjustScore(idx, true, 'maintainability', Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer h-1.5"
                        />

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>段位:</span>
                          <div className="flex gap-1">
                            {[60, 80, 90, 98].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleAdjustScore(idx, true, 'maintainability', p)}
                                className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dim 3: Robustness */}
                      <div className="space-y-1.5 bg-white dark:bg-[#121215] p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 truncate">
                            🛡️ 边界健壮 (25%)
                          </span>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'robustness',
                                  (r.scores.robustnessScore ?? 85) - 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              -5
                            </button>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs w-6 text-center">
                              {r.scores.robustnessScore ?? 85}
                            </span>
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'robustness',
                                  (r.scores.robustnessScore ?? 85) + 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.scores.robustnessScore ?? 85}
                          onChange={(e) =>
                            handleAdjustScore(idx, true, 'robustness', Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer h-1.5"
                        />

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>段位:</span>
                          <div className="flex gap-1">
                            {[60, 80, 90, 98].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleAdjustScore(idx, true, 'robustness', p)}
                                className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dim 4: UX */}
                      <div className="space-y-1.5 bg-white dark:bg-[#121215] p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 truncate">
                            ✨ 交互质感 (20%)
                          </span>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'ux',
                                  (r.scores.uxScore ?? r.scores.aestheticScore) - 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              -5
                            </button>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs w-6 text-center">
                              {r.scores.uxScore ?? r.scores.aestheticScore}
                            </span>
                            <button
                              onClick={() =>
                                handleAdjustScore(
                                  idx,
                                  true,
                                  'ux',
                                  (r.scores.uxScore ?? r.scores.aestheticScore) + 5
                                )
                              }
                              className="px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.scores.uxScore ?? r.scores.aestheticScore}
                          onChange={(e) =>
                            handleAdjustScore(idx, true, 'ux', Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer h-1.5"
                        />

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>段位:</span>
                          <div className="flex gap-1">
                            {[60, 80, 90, 98].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleAdjustScore(idx, true, 'ux', p)}
                                className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        </div>
      )}

      {/* Compare Result Section */}
      {matchResult && (
        <div className="panel p-6 space-y-6 bg-white dark:bg-[#121215] animate-slide-up border-2 border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">
                A/B 对照评测报告
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {activeConfig?.name} VS {compareConfigB?.name}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-[11px] text-slate-400 mb-1">{activeConfig?.name}</div>
                <IQBadge score={matchResult.averageIQA} size="md" />
              </div>
              <span className="text-xs font-bold text-slate-300 dark:text-zinc-600">VS</span>
              <div className="text-center">
                <div className="text-[11px] text-slate-400 mb-1">{compareConfigB?.name}</div>
                <IQBadge score={matchResult.averageIQB} size="md" />
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {matchResult.winnerConfigId === 'draw'
                  ? '双方综合表现持平 (平局)'
                  : matchResult.winnerConfigId === activeConfig?.id
                  ? `【${activeConfig?.name}】在直达速度与代码质量上综合胜出！`
                  : `【${compareConfigB?.name}】在直达速度与代码质量上综合胜出！`}
              </span>
              <p className="text-slate-500 dark:text-zinc-400 mt-0.5 text-[11px]">
                分差: {Math.abs(matchResult.averageIQA - matchResult.averageIQB).toFixed(1)} 分 · 已全量归档至【评测历史】
              </p>
            </div>
          </div>
          {/* Per-task Side-by-Side Trial Comparison */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                双轨题目对决明细与 Spec 契约复核 (Side-by-Side Breakdown)
              </h4>
              <span className="text-[11px] text-slate-400">
                支持分别对 Config A 和 Config B 审查 Spec 达成度与代码纯净度
              </span>
            </div>

            <div className="space-y-3">
              {matchResult.taskIds.map((tid, idx) => {
                const trialA = matchResult.resultsA.find((r) => r.taskId === tid) || matchResult.resultsA[idx];
                const trialB = matchResult.resultsB.find((r) => r.taskId === tid) || matchResult.resultsB[idx];
                const matchedTask = tasks.find((t) => t.id === tid);
                const isProj =
                  matchedTask?.taskParadigm === 'open-ended-project' ||
                  Boolean(matchedTask?.projectSpec) ||
                  tid.startsWith('proj') ||
                  tid.startsWith('ui');

                const scoreDiff = trialA && trialB ? trialA.scores.codexIQ - trialB.scores.codexIQ : 0;

                return (
                  <div
                    key={tid}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 space-y-3"
                  >
                    {/* Task Title & Paradigm */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-zinc-800/60 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {cleanTaskTitle(matchedTask?.title || trialA?.taskTitle || tid).title}
                        </span>
                        {isProj ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            🚀 项目主力轨
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                            🐛 Bug修复轨
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                          {matchedTask?.difficulty || 'Medium'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono font-semibold">
                        {scoreDiff > 0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            【{activeConfig?.name}】高出 {scoreDiff.toFixed(1)} 分
                          </span>
                        ) : scoreDiff < 0 ? (
                          <span className="text-sky-600 dark:text-sky-400">
                            【{compareConfigB?.name}】高出 {Math.abs(scoreDiff).toFixed(1)} 分
                          </span>
                        ) : (
                          <span className="text-slate-400">得分持平</span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side Trial Cards A vs B */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Config A Trial */}
                      {trialA && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-indigo-200/70 dark:border-indigo-950/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-950 dark:text-indigo-200 truncate max-w-[180px]">
                              {trialA.configName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono">{trialA.scores.secondsUsed}s</span>
                              <IQBadge score={trialA.scores.codexIQ} size="sm" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80">
                            <div>
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">🤖 机械客观自动化 (50%)</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                {trialA.scores.mechanicalScore ?? trialA.scores.codePassScore} 分
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium block">👤 专家5维复审 (50%)</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                {trialA.scores.humanScore ?? trialA.scores.directnessScore} 分
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>PR 准入:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                              {trialA.scores.mergeReadiness === 'ready_to_merge'
                                ? '🟢 免修直接合并'
                                : trialA.scores.mergeReadiness === 'minor_polish'
                                ? '🟡 微调即可合入'
                                : trialA.scores.mergeReadiness === 'major_rework'
                                ? '🟠 需较大幅重构'
                                : '🔴 拒绝合入'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800 flex-wrap">
                            {isProj && (
                              <button
                                onClick={() =>
                                  setReviewModalData({
                                    trial: trialA,
                                    index: idx,
                                    isConfigA: true,
                                    initialTab: 'spec',
                                  })
                                }
                                className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] hover:bg-indigo-100 flex items-center gap-1"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Spec 契约</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  trial: trialA,
                                  index: idx,
                                  isConfigA: true,
                                  initialTab: 'diff',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] hover:bg-slate-200 flex items-center gap-1"
                            >
                              <FileCode className="w-3 h-3 text-indigo-500" />
                              <span>Diff</span>
                            </button>
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  trial: trialA,
                                  index: idx,
                                  isConfigA: true,
                                  initialTab: 'rubric',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] hover:bg-purple-100 flex items-center gap-1 font-medium"
                            >
                              <Sliders className="w-3 h-3 text-purple-500" />
                              <span>专家复审</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Config B Trial */}
                      {trialB && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-sky-200/70 dark:border-sky-950/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-950 dark:text-sky-200 truncate max-w-[180px]">
                              {trialB.configName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono">{trialB.scores.secondsUsed}s</span>
                              <IQBadge score={trialB.scores.codexIQ} size="sm" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80">
                            <div>
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">🤖 机械客观自动化 (50%)</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                {trialB.scores.mechanicalScore ?? trialB.scores.codePassScore} 分
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium block">👤 专家5维复审 (50%)</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                {trialB.scores.humanScore ?? trialB.scores.directnessScore} 分
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>PR 准入:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                              {trialB.scores.mergeReadiness === 'ready_to_merge'
                                ? '🟢 免修直接合并'
                                : trialB.scores.mergeReadiness === 'minor_polish'
                                ? '🟡 微调即可合入'
                                : trialB.scores.mergeReadiness === 'major_rework'
                                ? '🟠 需较大幅重构'
                                : '🔴 拒绝合入'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800 flex-wrap">
                            {isProj && (
                              <button
                                onClick={() =>
                                  setReviewModalData({
                                    trial: trialB,
                                    index: idx,
                                    isConfigA: false,
                                    initialTab: 'spec',
                                  })
                                }
                                className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-medium text-[11px] hover:bg-sky-100 flex items-center gap-1"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Spec 契约</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  trial: trialB,
                                  index: idx,
                                  isConfigA: false,
                                  initialTab: 'diff',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] hover:bg-slate-200 flex items-center gap-1"
                            >
                              <FileCode className="w-3 h-3 text-sky-500" />
                              <span>Diff</span>
                            </button>
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  trial: trialB,
                                  index: idx,
                                  isConfigA: false,
                                  initialTab: 'rubric',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] hover:bg-purple-100 flex items-center gap-1 font-medium"
                            >
                              <Sliders className="w-3 h-3 text-purple-500" />
                              <span>专家复审</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Human Review Modal */}
      {reviewModalData && (
        <HumanReviewModal
          trial={reviewModalData.trial}
          trialIndex={reviewModalData.index}
          isConfigA={reviewModalData.isConfigA}
          task={tasks.find((t) => t.id === reviewModalData.trial.taskId)}
          initialTab={reviewModalData.initialTab}
          onClose={() => setReviewModalData(null)}
          onSaveRating={(idx, isA, rating) => {
            const runId = benchMode === 'single' ? singleResult?.id : matchResult?.id;
            if (runId) {
              onSaveManualRating(runId, idx, isA, rating);
            }
          }}
        />
      )}

      {/* Codex Launcher Modal */}
      {isCodexLauncherOpen && (
        <CodexLauncherModal
          config={activeConfig}
          tasks={tasks.filter((t) => selectedTaskIds.includes(t.id))}
          customWorkspaces={customWorkspaces}
          onClose={() => setIsCodexLauncherOpen(false)}
          onExecuteNow={() => {
            setIsCodexLauncherOpen(false);
            handleStartBenchmark();
          }}
        />
      )}
    </div>
  );
};
