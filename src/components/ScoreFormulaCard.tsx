import React, { useState } from 'react';
import { TaskChannel } from '../types/arena';
import { CHANNEL_FORMULAS, BENCHMARK_CHANNELS } from '../services/benchmarkSuites';
import { Scale, Sparkles, CheckCircle2, Sliders, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

interface ScoreFormulaCardProps {
  currentChannel?: TaskChannel;
  compact?: boolean;
}

export const ScoreFormulaCard: React.FC<ScoreFormulaCardProps> = ({
  currentChannel = 'frontend-ui',
  compact = true,
}) => {
  const [activeChannel, setActiveChannel] = useState<TaskChannel>(currentChannel);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showSandbox, setShowSandbox] = useState(false);

  // Sandbox simulation values
  const [mockCodePass, setMockCodePass] = useState(90);
  const [mockDirectness, setMockDirectness] = useState(85);
  const [mockAesthetic, setMockAesthetic] = useState(92);
  const [mockConstraint, setMockConstraint] = useState(95);

  const formulaSpec = CHANNEL_FORMULAS[activeChannel] || CHANNEL_FORMULAS['frontend-ui'];

  // Calculate sandbox score based on active channel
  let sandboxOverall = 0;
  if (activeChannel === 'frontend-ui') {
    sandboxOverall = mockAesthetic * 0.35 + mockDirectness * 0.35 + mockCodePass * 0.30;
  } else if (activeChannel === 'deepswe-core') {
    sandboxOverall = mockCodePass * 0.50 + mockDirectness * 0.30 + mockConstraint * 0.20;
  } else if (activeChannel === 'architecture-constraint') {
    sandboxOverall = mockConstraint * 0.40 + mockDirectness * 0.30 + mockCodePass * 0.30;
  } else if (activeChannel === 'interactive-confirm') {
    sandboxOverall = mockCodePass * 0.45 + mockDirectness * 0.35 + mockConstraint * 0.20;
  }
  const sandboxScore = Math.round(sandboxOverall * 10) / 10;

  return (
    <div className="panel overflow-hidden border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-sm transition-all duration-200">
      {/* Top Banner */}
      <div className="px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-sm">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                评测维度与权重公示
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                {formulaSpec.formulaText}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSandbox(!showSandbox)}
            className="btn-secondary text-[11px] py-1 px-2.5"
          >
            <Calculator className="w-3.5 h-3.5 text-zinc-500" />
            <span>{showSandbox ? '收起试算' : '实时试算'}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
          >
            <span className="text-[11px]">{isExpanded ? '收起详情' : '展开规则'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Channel Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <span className="text-xs text-slate-400 dark:text-zinc-500 mr-1 font-medium">赛道题型：</span>
            {BENCHMARK_CHANNELS.map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id as TaskChannel)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm font-semibold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* 4 Dimension Weights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {formulaSpec.weights.map((w) => (
              <div
                key={w.key}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/70 space-y-1.5 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                    {w.label}
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    {w.percentText}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed min-h-[36px]">
                  {w.desc}
                </p>

                {w.isManualSupported && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>支持卡片实时精细打分 (0~100分)</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Live Sandbox Calculator */}
          {showSandbox && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    各维度实时试算
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">试算得分:</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold font-mono shadow-sm">
                    {sandboxScore} 分
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Code Pass Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>功能代码测试</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{mockCodePass} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mockCodePass}
                    onChange={(e) => setMockCodePass(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                </div>

                {/* 2. Directness Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>直出切中需求</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{mockDirectness} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mockDirectness}
                    onChange={(e) => setMockDirectness(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                </div>

                {/* 3. Aesthetic Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>视觉质感与审美</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{mockAesthetic} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mockAesthetic}
                    onChange={(e) => setMockAesthetic(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                </div>

                {/* 4. Constraint Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>架构约束遵从</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{mockConstraint} 分</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mockConstraint}
                    onChange={(e) => setMockConstraint(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
