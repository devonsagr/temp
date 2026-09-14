import React, { useState } from 'react';
import { BattleTrialResult } from '../types/arena';
import { X, Sparkles, Sliders } from 'lucide-react';

interface ManualScoringModalProps {
  trial: BattleTrialResult | null;
  onSave: (rating: {
    aestheticScore: number;
    directnessScore: number;
    aestheticStars: number;
    directnessStars: number;
    aestheticNotes: string;
    customChecks: Record<string, boolean>;
  }) => void;
  onClose: () => void;
}

export const ManualScoringModal: React.FC<ManualScoringModalProps> = ({
  trial,
  onSave,
  onClose,
}) => {
  if (!trial) return null;

  const [aestheticScore, setAestheticScore] = useState<number>(
    trial.manualRatings?.aestheticScore ?? trial.scores.aestheticScore ?? 85
  );
  const [directnessScore, setDirectnessScore] = useState<number>(
    trial.manualRatings?.directnessScore ?? trial.scores.directnessScore ?? 85
  );
  const [notes, setNotes] = useState<string>(
    trial.manualRatings?.aestheticNotes || ''
  );
  const [checks, setChecks] = useState<Record<string, boolean>>(
    trial.manualRatings?.customChecks || {
      mirror_sync_respected: true,
      no_scope_creep: true,
      direct_clean_code: true,
    }
  );

  const toggleCheck = (k: string) => {
    setChecks((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  // Live trial score simulation preview
  let checklistBonus = 0;
  Object.values(checks).forEach((c) => {
    checklistBonus += c ? 5 : -5;
  });
  const previewConstraint = Math.min(100, Math.max(0, trial.scores.constraintScore + checklistBonus));
  const previewScore = Math.round(
    ((aestheticScore * 0.35) + (directnessScore * 0.35) + (trial.scores.codePassScore * 0.30)) * 10
  ) / 10;

  const handleApply = () => {
    onSave({
      aestheticScore,
      directnessScore,
      aestheticStars: Math.round(aestheticScore / 20),
      directnessStars: Math.round(directnessScore / 20),
      aestheticNotes: notes,
      customChecks: checks,
    });
    onClose();
  };

  const presetScores = [60, 75, 85, 92, 98];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              人工评审与精细打分 · {trial.taskTitle}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              受测配置: <strong className="text-slate-800 dark:text-zinc-200">{trial.configName}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Section 1: Aesthetic Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-zinc-200">
                1. 界面设计美观度与视觉质感
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={aestheticScore}
                  onChange={(e) => setAestheticScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-14 text-center font-mono font-bold text-xs py-0.5 px-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
                <span className="text-slate-500 font-mono">分</span>
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
              <input
                type="range"
                min="0"
                max="100"
                value={aestheticScore}
                onChange={(e) => setAestheticScore(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {presetScores.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAestheticScore(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        aestheticScore === p
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {aestheticScore >= 90 ? '卓越' : aestheticScore >= 80 ? '良好' : aestheticScore >= 60 ? '及格' : '欠佳'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Directness Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-zinc-200">
                2. 直出切中需求与意图满意度
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={directnessScore}
                  onChange={(e) => setDirectnessScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-14 text-center font-mono font-bold text-xs py-0.5 px-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
                <span className="text-slate-500 font-mono">分</span>
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
              <input
                type="range"
                min="0"
                max="100"
                value={directnessScore}
                onChange={(e) => setDirectnessScore(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {presetScores.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDirectnessScore(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        directnessScore === p
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {directnessScore >= 90 ? '单指令精准搞定' : directnessScore >= 80 ? '基本到位' : '存在反复追问'}
                </span>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="记录视觉细节、手感或直出效果评语 (选填)..."
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-slate-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
          </div>

          {/* Section 3: Architecture Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="font-semibold text-slate-800 dark:text-zinc-200 block">
              3. 架构规范与边界核验 (Checklist)
            </label>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <span className="text-slate-700 dark:text-zinc-300 text-[11px]">
                  遵守本地镜像防冲突机制 (Mirror Sync)
                </span>
                <input
                  type="checkbox"
                  checked={checks.mirror_sync_respected ?? false}
                  onChange={() => toggleCheck('mirror_sync_respected')}
                  className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <span className="text-slate-700 dark:text-zinc-300 text-[11px]">
                  切中需求要害，无无关文件蔓延
                </span>
                <input
                  type="checkbox"
                  checked={checks.no_scope_creep ?? false}
                  onChange={() => toggleCheck('no_scope_creep')}
                  className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-white"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer with Live Preview */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">试算加权得分:</span>
            <span className="text-xs px-2 py-0.5 rounded font-bold font-mono bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
              {previewScore} 分
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button onClick={handleApply} className="btn-primary">
              保存并应用评分
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
