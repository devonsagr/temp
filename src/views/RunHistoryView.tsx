import React, { useState } from 'react';
import { RunHistoryRecord } from '../types/arena';
import { Clock, Cpu, FileCheck2, Trash2, ChevronDown, ChevronUp, Copy, Check, Play, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { IQBadge } from '../components/IQBadge';

interface RunHistoryViewProps {
  history: RunHistoryRecord[];
  onRerun: (configId: string, channel: any) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({
  history,
  onRerun,
  onDeleteRecord,
  onClearHistory,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 1800);
  };

  if (history.length === 0) {
    return (
      <div className="panel p-12 text-center space-y-4 max-w-xl mx-auto my-12 animate-slide-up">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-slate-400 dark:text-zinc-500">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            暂无评测历史记录
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto">
            前往【评测工作台】运行一次单配置跑分或对照评测，系统将自动对当时的完整配置快照、各维度得分与手动评审进行全量归档。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>评测历史与配置快照归档</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
              共 {history.length} 次运行记录
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            永久留存历次跑分的完整参数快照（模型档位、AGENTS.md、技能集、个性化约束），支持随时追溯复盘
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>清空所有记录</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {history.map((record) => {
          const isExpanded = expandedId === record.id;
          const snap = record.configSnapshot;

          return (
            <div
              key={record.id}
              className={`panel transition-all duration-200 overflow-hidden ${
                isExpanded ? 'ring-1 ring-zinc-300 dark:ring-zinc-700' : ''
              }`}
            >
              {/* Record Summary Banner */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 select-none transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {record.runType === 'single' ? '单配置评测' : 'A/B 对比评测'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {snap?.name || record.configId}
                      </h3>
                      {record.configBSnapshot && (
                        <>
                          <span className="text-xs text-slate-400">VS</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                            {record.configBSnapshot.name}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {record.createdAt}
                      </span>
                      <span>赛道: {record.channel}</span>
                      <span>任务数: {record.taskIds.length} 题</span>
                      <span>耗时: {record.totalSeconds}s</span>
                      <span>Tokens: ~{record.totalTokens}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">综合得分</div>
                    <IQBadge score={record.overallScore} size="md" />
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">测试通过率</div>
                    <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {record.passRate}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : record.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail Panel: Configuration Snapshot & Task Breakdown */}
              {isExpanded && (
                <div className="border-t border-slate-200/80 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-950/40 space-y-6">
                  {/* 1. Configuration Snapshot at Testing Moment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>当时生效的配置快照 (Snapshot)</span>
                      </h4>

                      <button
                        onClick={() => onRerun(record.configId, record.channel)}
                        className="btn-primary !py-1 !px-3 !text-[11px]"
                      >
                        <Play className="w-3 h-3" />
                        <span>使用此配置重跑</span>
                      </button>
                    </div>

                    <div className="panel p-4 bg-white dark:bg-[#121215] space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px]">推理档位:</span>
                          <div className="font-semibold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                            {snap?.reasoning || 'medium'}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">交互模式:</span>
                          <div className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {snap?.interactiveMode === 'one-shot-direct'
                              ? '单轮直接落地'
                              : snap?.interactiveMode === 'step-by-step-confirm'
                              ? '分步计划等待确认'
                              : '自适应调优'}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">挂载技能组:</span>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {snap?.skills?.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono"
                              >
                                {s}
                              </span>
                            )) || <span className="text-slate-400">无附加技能</span>}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">防蔓延/自测:</span>
                          <div className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {snap?.specialFeatures?.antiScopeCreep ? '✓ 切中要害·无冗余' : '未开启'}
                          </div>
                        </div>
                      </div>

                      {/* Active Custom Constraints */}
                      {snap?.customConstraints && snap.customConstraints.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                            <span>个性化约束核验项清单:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {snap.customConstraints.map((c) => (
                              <div
                                key={c.id}
                                className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-2"
                              >
                                <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${c.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                                <div>
                                  <div className="font-medium text-slate-800 dark:text-zinc-200 text-[11px]">
                                    {c.title} ({c.weightPoints}分)
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                                    {c.ruleDesc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full AGENTS.md / System Prompt Snippet */}
                      {snap?.agentsPrompt && (
                        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                              提示词与规则全文 (AGENTS.md)
                            </span>
                            <button
                              onClick={() => handleCopyPrompt(record.id, snap.agentsPrompt)}
                              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1"
                            >
                              {copiedPromptId === record.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500">已复制</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>一键复制 Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-2.5 rounded-lg bg-slate-900 text-zinc-200 font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {snap.agentsPrompt}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Task-by-Task Result Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      逐题评测成绩与断言明细
                    </h4>

                    <div className="space-y-2">
                      {record.results.map((r, idx) => (
                        <div
                          key={r.taskId || idx}
                          className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  r.status === 'passed' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              <span className="font-bold text-slate-800 dark:text-zinc-100">
                                {r.taskTitle}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-3">
                              <span>代码通过: {r.scores.codePassScore}分</span>
                              <span>直达效率: {r.scores.directnessScore}分</span>
                              <span>视觉交互: {r.scores.aestheticScore}分</span>
                              <span>约束遵从: {r.scores.constraintScore}分</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-slate-400">
                              {r.scores.secondsUsed}s · {r.scores.tokensTotal} tok
                            </span>
                            <IQBadge score={r.scores.codexIQ} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delete this record button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除此条记录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
