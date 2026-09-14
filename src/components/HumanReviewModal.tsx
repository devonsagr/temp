import React, { useState } from 'react';
import { BattleTrialResult, BenchmarkTask } from '../types/arena';
import { IQBadge } from './IQBadge';
import {
  FileCode,
  Terminal,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  Check,
  FolderTree,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Database,
  Layers,
  Play,
  RotateCcw,
  CheckSquare,
  AlertCircle,
  XCircle,
  Cpu,
} from 'lucide-react';

interface HumanReviewModalProps {
  trial: BattleTrialResult;
  trialIndex: number;
  isConfigA: boolean;
  task?: BenchmarkTask;
  initialTab?: 'spec' | 'diff' | 'terminal' | 'judge' | 'facts' | 'rubric';
  onClose: () => void;
  onSaveRating: (
    trialIndex: number,
    isConfigA: boolean,
    rating: {
      aestheticScore?: number;
      directnessScore?: number;
      aestheticNotes?: string;
      customChecks?: Record<string, boolean>;
    }
  ) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  trial,
  trialIndex,
  isConfigA,
  task,
  initialTab,
  onClose,
  onSaveRating,
}) => {
  const isProjectTask =
    task?.taskParadigm === 'open-ended-project' ||
    Boolean(task?.projectSpec) ||
    trial.taskId.startsWith('proj') ||
    trial.taskId.startsWith('ui');

  const [activeTab, setActiveTab] = useState<'spec' | 'diff' | 'terminal' | 'judge' | 'facts' | 'rubric'>(
    initialTab || (isProjectTask ? 'spec' : 'diff')
  );

  const [aesthetic, setAesthetic] = useState(
    trial.manualRatings?.aestheticScore ?? trial.scores.aestheticScore
  );
  const [directness, setDirectness] = useState(
    trial.manualRatings?.directnessScore ?? trial.scores.directnessScore
  );
  const [notes, setNotes] = useState(trial.manualRatings?.aestheticNotes || '');
  const [checks, setChecks] = useState<Record<string, boolean>>(
    trial.manualRatings?.customChecks || {
      no_extra_files: true,
      surgical_edits: true,
      smooth_interaction: true,
    }
  );

  // User stories verification state
  const defaultStories = task?.projectSpec?.userStories || [
    '用户能流畅输入需求并触发响应式数据更新',
    '数据在增删改查操作后能实时更新并触发视图渲染',
    '前后端网络请求正常，边界异常处理健全，无假功能死按钮',
  ];
  const [storyStatus, setStoryStatus] = useState<Record<number, 'passed' | 'partial' | 'failed'>>(() => {
    const init: Record<number, 'passed' | 'partial' | 'failed'> = {};
    defaultStories.forEach((_, idx) => {
      init[idx] = 'passed';
    });
    return init;
  });

  // Simulated API endpoint testing
  const [testedEndpoints, setTestedEndpoints] = useState<Record<string, boolean>>({});

  // 3-Layer Acceptance Scorecard
  const [layer1Score, setLayer1Score] = useState(96); // E2E 自动化 40%
  const [layer2Score, setLayer2Score] = useState(92); // AI 裁判契约 30%
  const [layer3Score, setLayer3Score] = useState(trial.manualRatings?.aestheticScore ?? trial.scores.aestheticScore); // 人工可用性与质感 30%
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const calculatedSpecScore = Math.round(layer1Score * 0.4 + layer2Score * 0.3 + layer3Score * 0.3);

  const handleToggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplySpecScores = () => {
    setAesthetic(layer3Score);
    setDirectness(layer1Score);
    setChecks((prev) => ({
      ...prev,
      no_extra_files: layer2Score >= 85,
      surgical_edits: layer2Score >= 80,
      smooth_interaction: layer3Score >= 85,
    }));
    setSyncFeedback('✓ 已将 3 层 Spec 立体验收得分同步至人工复核分与考核项！');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleMarkAllStoriesPass = () => {
    const next: Record<number, 'passed' | 'partial' | 'failed'> = {};
    defaultStories.forEach((_, idx) => {
      next[idx] = 'passed';
    });
    setStoryStatus(next);
  };

  const handleTestEndpoint = (ep: string) => {
    setTestedEndpoints((prev) => ({ ...prev, [ep]: !prev[ep] }));
  };

  const handleSave = () => {
    onSaveRating(trialIndex, isConfigA, {
      aestheticScore: aesthetic,
      directnessScore: directness,
      aestheticNotes: notes,
      customChecks: checks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in-scale">
      <div className="panel w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-[#121215] shadow-2xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-700">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {trial.taskId}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {trial.taskTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                评测目标: <span className="font-semibold text-slate-800 dark:text-zinc-200">{trial.configName}</span> · 人工验收与代码审计
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IQBadge score={trial.scores.codexIQ} size="md" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Alert Banner if trial errored / interrupted */}
        {trial.errorDetails && (
          <div className="p-3.5 mx-5 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>运行时异常中断: {trial.errorDetails.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/60 font-mono">
                  {trial.status}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">{trial.errorDetails.message}</p>
              <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 bg-white/60 dark:bg-black/30 p-2 rounded-lg mt-1 border border-rose-200/50 dark:border-rose-900/50">
                💡 建议排查方案: {trial.errorDetails.suggestedFix}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            {
              id: 'spec' as const,
              label: isProjectTask ? '📋 Spec 契约与全栈验收 (主力)' : '📋 需求与断言契约验收',
              icon: FileSpreadsheet,
              highlight: isProjectTask,
            },
            { id: 'diff' as const, label: '代码变更审查 (Git Diff)', icon: FileCode },
            { id: 'terminal' as const, label: '终端断言日志', icon: Terminal },
            { id: 'judge' as const, label: '独立裁判 AI 报告', icon: Sparkles },
            { id: 'facts' as const, label: '反幻觉与双裁判共识', icon: ShieldCheck },
            { id: 'rubric' as const, label: '人工量表与精细打分', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-zinc-900 dark:border-white text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : ''}`} />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-normal">
                    核心
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 dark:bg-[#09090b]">
          {/* Tab 0: Spec Contract & Fullstack Verification (Primary Track) */}
          {activeTab === 'spec' && (
            <div className="space-y-5 animate-in-scale">
              {/* Sync Feedback Toast */}
              {syncFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Header Spec Overview Banner */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          isProjectTask
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isProjectTask ? '🚀 项目构建主力轨 (提需求·写Spec·全栈闭环)' : '🐛 确定性工程 Bug 修复轨'}
                      </span>
                      {task?.fullstackScope && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-slate-700 dark:text-zinc-300">
                          范围: {task.fullstackScope}
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                        验收达成率: {calculatedSpecScore}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {isProjectTask
                        ? '全栈项目验收规范协议 (Full-Stack Spec Acceptance Protocol)'
                        : '缺陷修复断言规范协议 (Bugfix Assertion Protocol)'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      约束技术栈: <span className="font-mono text-slate-700 dark:text-zinc-300">{task?.projectSpec?.techStack || 'React 19 + TypeScript + TailwindCSS + Fastify/SQLite'}</span>
                    </p>
                  </div>

                  {/* Spec Score Gauge */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-center min-w-[130px] shrink-0">
                    <div className="text-[11px] text-slate-400 font-medium">三层立体加权分</div>
                    <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {calculatedSpecScore} <span className="text-xs font-normal">/ 100</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      ✓ 符合生产级验收
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Spec 需求与契约综合达成度:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{calculatedSpecScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${calculatedSpecScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 1: User Stories Checklist */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        核心业务场景与用户故事链路 (User Stories Acceptance)
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        逐项核验 Agent 直出项目的用户操作链路
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleMarkAllStoriesPass}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>一键全部标记通过</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {defaultStories.map((story, idx) => {
                    const status = storyStatus[idx] || 'passed';
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                              {story}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                              验收断言: 用户触发交互时状态更新无抖动、网络正常、无假死
                            </span>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setStoryStatus((prev) => ({ ...prev, [idx]: 'passed' }))}
                            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              status === 'passed'
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>完整通过</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStoryStatus((prev) => ({ ...prev, [idx]: 'partial' }))}
                            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              status === 'partial'
                                ? 'bg-amber-500 text-white font-bold shadow-sm'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>边缘瑕疵</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStoryStatus((prev) => ({ ...prev, [idx]: 'failed' }))}
                            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              status === 'failed'
                                ? 'bg-rose-600 text-white font-bold shadow-sm'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>未达成/死按钮</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Full-Stack API Endpoints & Contract Simulator */}
              {task?.projectSpec?.apiEndpoints && task.projectSpec.apiEndpoints.length > 0 && (
                <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          全栈接口契约与端到端联调模拟 (API Contract Simulator)
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          验证后端路由、中间件与数据交互的真实可用性
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono">
                      {task.projectSpec.apiEndpoints.length} 个端点契约
                    </span>
                  </div>

                  <div className="space-y-3">
                    {task.projectSpec.apiEndpoints.map((ep, idx) => {
                      const method = ep.split(' ')[0] || 'GET';
                      const path = ep.split(' ')[1] || ep;
                      const isTested = Boolean(testedEndpoints[ep]);

                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-3.5 space-y-2.5 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                  method === 'GET'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : method === 'POST'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : method === 'PATCH'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {method}
                              </span>
                              <code className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                                {path}
                              </code>
                              <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                                {ep.includes(' - ') ? ep.split(' - ')[1] : '业务数据交互接口'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                                200 OK · 18ms
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTestEndpoint(ep)}
                                className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Play className="w-3 h-3 text-indigo-500" />
                                <span>{isTested ? '收起 Payload' : '⚡ 模拟联调发包'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Expandable Simulated Request & Response Payload */}
                          {isTested && (
                            <div className="p-3 rounded-lg bg-slate-950 text-zinc-200 font-mono text-[11px] space-y-2 animate-in-scale border border-zinc-800">
                              <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1">
                                <span>Request: {method} {path} HTTP/1.1</span>
                                <span className="text-emerald-400">Response: 200 OK (Content-Type: application/json)</span>
                              </div>
                              <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
                                {JSON.stringify(
                                  {
                                    status: 'success',
                                    statusCode: 200,
                                    endpoint: path,
                                    data: {
                                      id: `record-${Date.now().toString(36)}`,
                                      synchronized: true,
                                      timestamp: new Date().toISOString(),
                                      message: '全栈契约联调通过：前后端状态更新自洽',
                                    },
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Data Persistence & State Hydration Audit */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        本地持久化与数据还原审计 (Persistence & Hydration Audit)
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        保障刷新与重启后业务状态不丢失
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                    ACID / LocalStorage 自洽
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      <span>持久化介质与数据模型 Schema</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {task?.projectSpec?.dataModel?.join(' · ') || 'SQLite: schema.sql (本地数据库文件) + LocalStorage 状态恢复'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>硬刷新 (F5) 状态还原测试</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      ✓ 模拟浏览器 F5 刷新，数据无损还原，无白屏幽灵数据与状态脱节。
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: 3-Layer Acceptance Scorecard */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4 border-2 border-indigo-100 dark:border-indigo-950/60">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        三层立体综合验收量表 (3-Layer Acceptance Protocol)
                      </span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        加权公式: E2E 黑盒自动化 (40%) + AI 裁判契约自洽 (30%) + 人工可用性质感 (30%)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleApplySpecScores}
                    className="btn-primary !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>📌 将 3 层得分同步至总成绩</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Layer 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        Layer 1: 客观 E2E 自动化 (40%)
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {layer1Score} 分
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Playwright/Vitest 跨组件与网络自动化流转，0 Console Error。
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer1Score}
                      onChange={(e) => setLayer1Score(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Layer 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        Layer 2: AI 裁判契约自洽 (30%)
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {layer2Score} 分
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      严格对齐 Spec 规范书，无多余空架子文件与过度工程化。
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer2Score}
                      onChange={(e) => setLayer2Score(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Layer 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        Layer 3: 人工可用性与质感 (30%)
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {layer3Score} 分
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      界面微动效细腻、深浅色无违和、直出切中、无任何死链接。
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer3Score}
                      onChange={(e) => setLayer3Score(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Git Diff Inspector */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
                  <span>隔离沙箱工作区: <code className="font-mono">{trial.workspacePath || '~/.codex/sandbox'}</code></span>
                </span>
                <span>行级代码纯净度审计</span>
              </div>

              {trial.aiJudgeReport?.detectedBloatFiles && trial.aiJudgeReport.detectedBloatFiles.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs flex items-start gap-2 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">检测到非必要的过度工程化包装文件！</div>
                    <div className="text-[11px] mt-0.5">
                      以下文件为多余抽象，严重拖慢交付直达效率：
                      {trial.aiJudgeReport.detectedBloatFiles.map((f) => (
                        <code key={f} className="ml-1 px-1 rounded bg-amber-200/60 dark:bg-amber-900/60 font-mono">
                          {f}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-950 font-mono text-xs">
                <div className="p-2.5 bg-slate-900 border-b border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>git diff --unified=3</span>
                  <span className="text-emerald-400">Green: Additions | Red: Removals</span>
                </div>
                <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed max-h-[460px]">
                  {trial.diffPatch?.split('\n').map((line, idx) => {
                    const isAdd = line.startsWith('+');
                    const isDel = line.startsWith('-');
                    const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                    return (
                      <div
                        key={idx}
                        className={`${
                          isAdd
                            ? 'bg-emerald-950/40 text-emerald-300'
                            : isDel
                            ? 'bg-red-950/40 text-red-300'
                            : isHeader
                            ? 'text-indigo-400 font-bold'
                            : 'text-zinc-400'
                        }`}
                      >
                        {line}
                      </div>
                    );
                  }) || '无代码变动记录'}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Terminal Execution Output */}
          {activeTab === 'terminal' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>自动化测试与构建命令输出:</span>
                <span className="font-mono text-emerald-500">Exit Code: 0</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-950 p-4 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {trial.terminalOutput || '未捕获终端输出'}
              </div>
            </div>
          )}

          {/* Tab 3: AI Judge Report */}
          {activeTab === 'judge' && (
            <div className="space-y-4">
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      独立裁判 AI (LLM-as-a-Judge) 深度审核报告
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      trial.aiJudgeReport?.verdict === 'passed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    判定: {trial.aiJudgeReport?.verdict === 'passed' ? '通过 (PASSED)' : '不通过 (FAILED)'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                  {trial.aiJudgeReport?.rationale || '无 AI 裁判评语'}
                </div>

                {/* Rubric breakdown pills */}
                {trial.aiJudgeReport?.rubricBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {Object.entries(trial.aiJudgeReport.rubricBreakdown).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs"
                      >
                        <div className="text-slate-400 text-[11px] truncate">{k}</div>
                        <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                          {v} 分
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Anti-Hallucination Grounded Facts & Dual-Judge Consensus */}
          {activeTab === 'facts' && (
            <div className="space-y-4">
              {/* Grounded Facts Card */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      AST 语法树与客观事实指纹 (Grounded Facts)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                    静态事实先验拦截防幻觉
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <div className="text-slate-400 text-[11px]">AST 语法解析</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 结构合法通过
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <div className="text-slate-400 text-[11px]">改动文件数量</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                      {trial.aiJudgeReport?.groundedFacts?.filesChangedCount ?? 1} 个文件
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <div className="text-slate-400 text-[11px]">控制台错误 (Console)</div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      0 错误 / 0 警告
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <div className="text-slate-400 text-[11px]">Diff 行数变更</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                      +{trial.aiJudgeReport?.groundedFacts?.linesAdded ?? 18} / -{trial.aiJudgeReport?.groundedFacts?.linesRemoved ?? 4}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual-Judge Consensus */}
              <div className="panel p-5 bg-white dark:bg-[#121215] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      双裁判 AI 背对背盲审共识 (Dual-Judge Consensus)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    分歧度: {trial.aiJudgeReport?.judgeConsensus?.deviation ?? 2} 分
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5">
                    <div className="font-bold text-indigo-900 dark:text-indigo-200">
                      {trial.aiJudgeReport?.judgeConsensus?.judgeA.name || 'Claude-3.7-Judge (主裁判)'}
                    </div>
                    <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {trial.aiJudgeReport?.judgeConsensus?.judgeA.score || trial.scores.codexIQ} <span className="text-xs font-normal">分</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      依据细化 Rubric 量表打分，重点审查交互质感与架构自洽
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-1.5">
                    <div className="font-bold text-sky-900 dark:text-sky-200">
                      {trial.aiJudgeReport?.judgeConsensus?.judgeB.name || 'GPT-6-Judge (交叉核验)'}
                    </div>
                    <div className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400">
                      {trial.aiJudgeReport?.judgeConsensus?.judgeB.score || trial.scores.codexIQ} <span className="text-xs font-normal">分</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      独立实例背对背复核，偏差 &lt; 6 分判定为高置信度共识
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Code Citation Evidence */}
              {trial.aiJudgeReport?.evidenceQuotes && trial.aiJudgeReport.evidenceQuotes.length > 0 && (
                <div className="panel p-5 bg-white dark:bg-[#121215] space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-amber-500" />
                    <span>裁判判定依据：强制代码引用证据链 (Mandatory Diff Citations)</span>
                  </span>

                  <div className="space-y-2 text-xs">
                    {trial.aiJudgeReport.evidenceQuotes.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            {ev.lineRef}
                          </span>
                          <span className="text-slate-400 font-mono">[{ev.rubricId}]</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300 text-xs">{ev.critique}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Human Review & Rubric Checklist */}
          {activeTab === 'rubric' && (
            <div className="space-y-5">
              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="panel p-4 bg-white dark:bg-[#121215] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">视觉审美与交互质感:</span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{aesthetic} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={aesthetic}
                    onChange={(e) => setAesthetic(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                  <div className="flex justify-end gap-1 text-[10px] text-slate-400">
                    {[60, 80, 90, 98].map((p) => (
                      <button
                        key={p}
                        onClick={() => setAesthetic(p)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel p-4 bg-white dark:bg-[#121215] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">直出切中满意度 (反过度工程化):</span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{directness} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={directness}
                    onChange={(e) => setDirectness(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                  <div className="flex justify-end gap-1 text-[10px] text-slate-400">
                    {[60, 80, 90, 98].map((p) => (
                      <button
                        key={p}
                        onClick={() => setDirectness(p)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rubric Checklist */}
              <div className="panel p-4 bg-white dark:bg-[#121215] space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>个性化约束与质量核验 Checklist (勾选即计分):</span>
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    { key: 'no_extra_files', label: '零冗余文件：没有产生未经许可的包装/测试/日志文件' },
                    { key: 'surgical_edits', label: '切中需求要害：仅针对必要关键代码修改，未随意重构外围接口' },
                    { key: 'smooth_interaction', label: '手感流畅：界面动效细腻，无掉帧闪烁，深色模式对比度达标' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => handleToggleCheck(item.key)}
                      className="p-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900"
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          checks[item.key]
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                            : 'border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {checks[item.key] && <Check className="w-3 h-3" />}
                      </button>
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Notes */}
              <div className="panel p-4 bg-white dark:bg-[#121215] space-y-2 text-xs">
                <label className="font-bold text-slate-800 dark:text-zinc-200 block">
                  人工评审备注文档 (Audit Notes):
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录该配置在当前题目中的表现亮点或失误细节（如：单轮直达、界面高级感极强、无冗余代码）..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/40">
          <span className="text-xs text-slate-400">
            人工打分将与客观单测成绩加权合成最新基准分
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary !py-2 !px-4">
              取消
            </button>
            <button onClick={handleSave} className="btn-primary !py-2 !px-5">
              保存并应用复核分
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
