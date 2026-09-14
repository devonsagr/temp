import React, { useState } from 'react';
import { WeightPreset } from '../types/arena';
import { WEIGHT_PRESETS } from '../services/arenaStore';
import { Sliders, Sparkles, Check, RotateCcw } from 'lucide-react';

interface WeightPresetCustomizerProps {
  currentPresetId: string;
  onSelectPreset: (preset: WeightPreset) => void;
  customWeights?: {
    codePass: number;
    directness: number;
    aesthetic: number;
    constraint: number;
  };
  onCustomWeightsChange?: (weights: {
    codePass: number;
    directness: number;
    aesthetic: number;
    constraint: number;
  }) => void;
}

export const WeightPresetCustomizer: React.FC<WeightPresetCustomizerProps> = ({
  currentPresetId,
  onSelectPreset,
}) => {
  const [selectedId, setSelectedId] = useState(currentPresetId || WEIGHT_PRESETS[0].id);

  const handleSelect = (preset: WeightPreset) => {
    setSelectedId(preset.id);
    onSelectPreset(preset);
  };

  const activePreset = WEIGHT_PRESETS.find((p) => p.id === selectedId) || WEIGHT_PRESETS[0];

  return (
    <div className="panel p-5 bg-white dark:bg-[#121215] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            维度权重预设与灵活自定义 (Weight Strategy)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          打破固定比例死板限制，按需随心配置
        </span>
      </div>

      {/* Preset Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {WEIGHT_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-zinc-900 dark:border-white bg-slate-50 dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-900 dark:ring-white'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {preset.tag}
                </span>
                {isSelected && <Check className="w-3 h-3 text-zinc-900 dark:text-white" />}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {preset.name.split('(')[0]}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Preset Weight Breakdown Bars */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
          <span className="font-semibold">当前生效策略权重分布:</span>
          <span className="text-[11px] font-mono text-slate-500">{activePreset.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800">
            <div className="text-slate-400 text-[10px]">代码功能与单测通过</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {activePreset.weights.codePass}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${activePreset.weights.codePass}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800">
            <div className="text-slate-400 text-[10px]">直达效率 (反过度工程化)</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {activePreset.weights.directness}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${activePreset.weights.directness}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800">
            <div className="text-slate-400 text-[10px]">视觉审美与交互手感</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {activePreset.weights.aesthetic}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${activePreset.weights.aesthetic}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800">
            <div className="text-slate-400 text-[10px]">团队私有约束遵守</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {activePreset.weights.constraint}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${activePreset.weights.constraint}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
