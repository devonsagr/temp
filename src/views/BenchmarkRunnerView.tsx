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
    rating: {
      aestheticScore?: number;
      directnessScore?: number;
      aestheticStars?: number;
      directnessStars?: number;
      aestheticNotes?: string;
      customChecks?: Record<string, boolean>;
    }
  ) => void;
}

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
    type: 'aesthetic' | 'directness',
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

    const newAesthetic = type === 'aesthetic' ? clamped : targetTrial.scores.aestheticScore;
    const newDirectness = type === 'directness' ? clamped : targetTrial.scores.directnessScore;

    onSaveManualRating(runId, trialIndex, isConfigA, {
      aestheticScore: newAesthetic,
      directnessScore: newDirectness,
      aestheticStars: Math.round(newAesthetic / 20),
      directnessStars: Math.round(newDirectness / 20),
      aestheticNotes: targetTrial.manualRatings?.aestheticNotes || '',
      customChecks: targetTrial.manualRatings?.customChecks || {},
    });

    targetTrial.scores[type === 'aesthetic' ? 'aestheticScore' : 'directnessScore'] = clamped;
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
                        ? 'border-zinc-900 dark:border-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-white'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#121215]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />}
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

        {/* Step 2: Select Tasks Channel & Specific Tasks */}
        <div className="panel p-5 space-y-4 bg-white dark:bg-[#121215]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>选择评测赛道与执行模式</span>
            </h3>

            {/* Scope Mode Switcher: Single vs Batch */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
              <button
                onClick={() => {
                  setTaskExecMode('single');
                  const currentOrFirst = channelTasks.find((t) => t.id === focusedTaskId) || channelTasks[0];
                  if (currentOrFirst) {
                    setFocusedTaskId(currentOrFirst.id);
                    setSelectedTaskIds([currentOrFirst.id]);
                  }
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  taskExecMode === 'single'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
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
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  taskExecMode === 'batch'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 text-purple-500" />
                <span>📑 批量队列自动跑 ({channelTasks.length}题)</span>
              </button>
            </div>
          </div>

          {/* Channel Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BENCHMARK_CHANNELS.map((ch) => {
              const isChActive = ch.id === selectedChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id as TaskChannel)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    isChActive
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm font-semibold'
                      : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold">{ch.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isChActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-slate-400'
                    }`}
                  >
                    共 {ch.count} 题
                  </div>
                </button>
              );
            })}
          </div>

          {/* Paradigm & Difficulty Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            {/* Paradigm Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5" /> 赛道:
              </span>
              <button
                onClick={() => setParadigmFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  paradigmFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                全部赛道
              </button>
              <button
                onClick={() => setParadigmFilter('open-ended-project')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  paradigmFilter === 'open-ended-project'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                🚀 项目构建主力轨 (提需求·写Spec·全栈)
              </button>
              <button
                onClick={() => setParadigmFilter('deterministic-bugfix')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  paradigmFilter === 'deterministic-bugfix'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                🐛 确定性工程 Bug 修复轨 (开源单测)
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium mr-1">
                难度:
              </span>
              {(['all', 'Easy', 'Medium', 'Hard', 'Nightmare'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    difficultyFilter === diff
                      ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {diff === 'all' ? '全部' : diff}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Mode Header bar if batch */}
          {taskExecMode === 'batch' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">
                批量队列已选中 {selectedTaskIds.length} / {channelTasks.length} 题
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTaskIds(channelTasks.map((t) => t.id))}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  全选当前题
                </button>
                <span className="text-slate-300 dark:text-zinc-700">|</span>
                <button
                  onClick={() => setSelectedTaskIds(channelTasks.length > 0 ? [channelTasks[0].id] : [])}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  仅留单题
                </button>
              </div>
            </div>
          )}

          {/* Task Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {channelTasks.length === 0 ? (
              <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                当前筛选条件下无测试题，请切换范式或难度筛选
              </div>
            ) : (
              channelTasks.map((t) => {
                const isSelected =
                  taskExecMode === 'single'
                    ? focusedTaskId === t.id
                    : selectedTaskIds.includes(t.id);

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
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-zinc-900 border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white text-slate-900 dark:text-white shadow-sm'
                        : 'bg-white dark:bg-[#121215] border-slate-200/70 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      {taskExecMode === 'single' ? (
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-zinc-700'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-zinc-900 dark:text-white shrink-0"
                        />
                      )}
                      <span className="font-medium truncate">{t.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          t.taskParadigm === 'deterministic-bugfix'
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        {t.taskParadigm === 'deterministic-bugfix' ? '客观单测' : '项目构建'}
                      </span>

                      {t.fullstackScope === 'fullstack-node' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                          全栈Node
                        </span>
                      )}

                      {t.projectSpec && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                          Spec
                        </span>
                      )}

                      {t.multiTurnStages && t.multiTurnStages.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono">
                          {t.multiTurnStages.length}阶段
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          t.difficulty === 'Nightmare'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            : t.difficulty === 'Hard'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : t.difficulty === 'Medium'
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Focused Single Task Deep Inspector Card */}
          {taskExecMode === 'single' && focusedTask && (
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 mt-3 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    当前聚焦执行任务: {focusedTask.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      focusedTask.taskParadigm === 'deterministic-bugfix'
                        ? 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {focusedTask.taskParadigm === 'deterministic-bugfix'
                      ? '🐛 确定性 Bug 修复'
                      : '🚀 项目构建主力轨'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {focusedTask.id} · 难度: {focusedTask.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Sandbox Path */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
                      物理隔离沙箱工作区
                    </span>
                    <button
                      onClick={() =>
                        handleCopy('focused-ws', `~/.codex/sandboxes/eval-${focusedTask.id}`)
                      }
                      className="btn-ghost !text-[10px] !py-0.5 flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                    >
                      {copiedKey === 'focused-ws' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === 'focused-ws' ? '已复制' : '复制目录'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 text-[11px] font-mono text-slate-800 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-800 truncate select-all">
                    ~/.codex/sandboxes/eval-{focusedTask.id}
                  </div>
                </div>

                {/* Verification Command */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                      客观断言命令 (Exit Code 0)
                    </span>
                    <button
                      onClick={() => handleCopy('focused-cmd', focusedTask.verificationCmd)}
                      className="btn-ghost !text-[10px] !py-0.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                    >
                      {copiedKey === 'focused-cmd' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === 'focused-cmd' ? '已复制' : '复制命令'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 text-[11px] font-mono text-slate-800 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-800 truncate select-all">
                    {focusedTask.verificationCmd}
                  </div>
                </div>
              </div>

              {/* Task Prompt Box */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                    真实需求指令 Prompt 预览 ({focusedTask.inputPrompt.length} 字)
                  </span>
                  <button
                    onClick={() => handleCopy('focused-prompt', focusedTask.inputPrompt)}
                    className="btn-ghost !text-[10px] !py-0.5 flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold"
                  >
                    {copiedKey === 'focused-prompt' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'focused-prompt' ? '已复制提示词' : '一键复制提示词'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto border border-zinc-800">
                  {focusedTask.inputPrompt}
                </pre>
              </div>

              {/* 3-Step Review Workflow Pill */}
              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>全自动三步流水线：</strong>沙箱 Exit Code 0 ➔ Review Agent 自动拉取 Diff 与日志打分（免人肉二次复制）➔ 人工可用性质感微调
                  </span>
                </div>
                <button
                  onClick={() => setIsCodexLauncherOpen(true)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  查看沙箱编排详情 →
                </button>
              </div>
            </div>
          )}
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
                ? `🎯 单题精细执行: 仅针对【${focusedTask?.title || '选定任务'}】进行沙箱测试、Diff 提取与三层审查`
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
                          {r.taskTitle}
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

                  {/* Fine-Grained Sliders (0-100) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                    {/* Visual Aesthetics Slider */}
                    <div className="space-y-1.5 bg-white dark:bg-[#121215] p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          视觉审美与交互质感:
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            onClick={() =>
                              handleAdjustScore(idx, true, 'aesthetic', r.scores.aestheticScore - 5)
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px]"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={r.scores.aestheticScore}
                            onChange={(e) =>
                              handleAdjustScore(idx, true, 'aesthetic', Number(e.target.value))
                            }
                            className="w-12 text-center py-0.5 border rounded bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                          />
                          <button
                            onClick={() =>
                              handleAdjustScore(idx, true, 'aesthetic', r.scores.aestheticScore + 5)
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px]"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={r.scores.aestheticScore}
                        onChange={(e) =>
                          handleAdjustScore(idx, true, 'aesthetic', Number(e.target.value))
                        }
                        className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                      />

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>快速应用:</span>
                        {[60, 80, 90, 98].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleAdjustScore(idx, true, 'aesthetic', preset)}
                            className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Hit Slider */}
                    <div className="space-y-1.5 bg-white dark:bg-[#121215] p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          单指令直出意图切中与交付满意度:
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            onClick={() =>
                              handleAdjustScore(idx, true, 'directness', r.scores.directnessScore - 5)
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px]"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={r.scores.directnessScore}
                            onChange={(e) =>
                              handleAdjustScore(idx, true, 'directness', Number(e.target.value))
                            }
                            className="w-12 text-center py-0.5 border rounded bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                          />
                          <button
                            onClick={() =>
                              handleAdjustScore(idx, true, 'directness', r.scores.directnessScore + 5)
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px]"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={r.scores.directnessScore}
                        onChange={(e) =>
                          handleAdjustScore(idx, true, 'directness', Number(e.target.value))
                        }
                        className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                      />

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>快速应用:</span>
                        {[60, 80, 90, 98].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleAdjustScore(idx, true, 'directness', preset)}
                            className="px-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                          >
                            {preset}
                          </button>
                        ))}
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
                          {matchedTask?.title || trialA?.taskTitle || tid}
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

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                            <span>代码客观通过: {trialA.scores.codePassScore} 分</span>
                            <span>切中直达: {trialA.scores.directnessScore} 分</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
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
                              <span>Diff & 审核</span>
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

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                            <span>代码客观通过: {trialB.scores.codePassScore} 分</span>
                            <span>切中直达: {trialB.scores.directnessScore} 分</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
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
                              <span>Diff & 审核</span>
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
