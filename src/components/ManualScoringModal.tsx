import React, { useState } from 'react';
import { BattleTrialResult, ManualRatingInput, MergeReadinessLevel } from '../types/arena';
import { X, Sparkles, Sliders, Check, ShieldCheck, UserCheck } from 'lucide-react';

interface ManualScoringModalProps {
  trial: BattleTrialResult | null;
  onSave: (rating: ManualRatingInput) => void;
  onClose: () => void;
}

export const ManualScoringModal: React.FC<ManualScoringModalProps> = ({
  trial,
  onSave,
  onClose,
}) => {
  if (!trial) return null;

  const [intentScore, setIntentScore] = useState<number>(
    trial.manualRatings?.intentScore ?? trial.scores.intentScore ?? trial.manualRatings?.directnessScore ?? trial.scores.directnessScore ?? 88
  );
  const [maintainabilityScore, setMaintainabilityScore] = useState<number>(
    trial.manualRatings?.maintainabilityScore ?? trial.scores.maintainabilityScore ?? trial.scores.constraintScore ?? 86
  );
  const [robustnessScore, setRobustnessScore] = useState<number>(
    trial.manualRatings?.robustnessScore ?? trial.scores.robustnessScore ?? 85
  );
  const [uxScore, setUXScore] = useState<number>(
    trial.manualRatings?.uxScore ?? trial.scores.uxScore ?? trial.manualRatings?.aestheticScore ?? trial.scores.aestheticScore ?? 88
  );
  const [mergeReadiness, setMergeReadiness] = useState<MergeReadinessLevel>(
    trial.manualRatings?.mergeReadiness ?? trial.scores.mergeReadiness ?? 'minor_polish'
  );

  const [notes, setNotes] = useState<string>(
    trial.manualRatings?.aestheticNotes || ''
  );
  const [checks, setChecks] = useState<Record<string, boolean>>(
    trial.manualRatings?.customChecks || {
      no_extra_files: true,
      surgical_edits: true,
      smooth_interaction: true,
    }
  );

  const toggleCheck = (k: string) => {
    setChecks((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  // Live simulation calculations
  const humanScore = Math.round((intentScore * 0.3 + maintainabilityScore * 0.25 + robustnessScore * 0.25 + uxScore * 0.2) * 10) / 10;
  const mechanicalScore = trial.scores.mechanicalScore ?? Math.round((trial.scores.codePassScore * 0.5 + 96 * 0.25 + 92 * 0.25) * 10) / 10;
  const compositeScore = Math.round((mechanicalScore * 0.5 + humanScore * 0.5) * 10) / 10;

  const handleApply = () => {
    onSave({
      intentScore,
      maintainabilityScore,
      robustnessScore,
      uxScore,
      mergeReadiness,
      aestheticScore: uxScore,
      directnessScore: intentScore,
      aestheticStars: Math.round(uxScore / 20),
      directnessStars: Math.round(intentScore / 20),
      aestheticNotes: notes,
      customChecks: checks,
    });
    onClose();
  };

  const presetScores = [60, 75, 85, 92, 98];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              人类专家 5 维公允复审量表 · {trial.taskTitle}
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

        {/* Live Score Synthesis Bar */}
        <div className="px-5 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-200/50 dark:border-indigo-900/50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span>机械客观: <strong className="text-blue-600">{mechanicalScore}</strong></span>
            <span className="text-slate-300">|</span>
            <span>专家量表: <strong className="text-purple-600">{humanScore}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">最新天梯分:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs">
              {compositeScore} 分
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* PR Readiness */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block">
              1. PR 准入与交付就绪评级 (Merge Readiness)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ready_to_merge' as const, label: '🟢 免修直接合并', desc: '达到资深标准' },
                { id: 'minor_polish' as const, label: '🟡 微调即可合入', desc: '微调文案/小样式' },
                { id: 'major_rework' as const, label: '🟠 需较大幅重构', desc: '需人类花费20+分钟' },
                { id: 'rejected' as const, label: '🔴 拒绝合入', desc: '存在严重缺陷' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setMergeReadiness(lvl.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    mergeReadiness === lvl.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                  }`}
                >
                  <div>{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dim 1: Intent */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200">
                2. 需求理解与要害切中度 (30%)
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={intentScore}
                  onChange={(e) => setIntentScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 text-center font-bold text-xs py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <span className="text-slate-400">分</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intentScore}
              onChange={(e) => setIntentScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Dim 2: Maintainability */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200">
                3. 代码可维护与工程纯净 (25%)
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={maintainabilityScore}
                  onChange={(e) => setMaintainabilityScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 text-center font-bold text-xs py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <span className="text-slate-400">分</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={maintainabilityScore}
              onChange={(e) => setMaintainabilityScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Dim 3: Robustness */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200">
                4. 异常边界与防御健壮度 (25%)
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={robustnessScore}
                  onChange={(e) => setRobustnessScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 text-center font-bold text-xs py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <span className="text-slate-400">分</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={robustnessScore}
              onChange={(e) => setRobustnessScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Dim 4: UX */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200">
                5. 交互可用性与视觉质感 (20%)
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={uxScore}
                  onChange={(e) => setUXScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 text-center font-bold text-xs py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <span className="text-slate-400">分</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={uxScore}
              onChange={(e) => setUXScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block">
              评审备注文档 (选填)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="记录意图把握、架构质量或缺陷细节..."
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <button onClick={onClose} className="btn-secondary !py-1.5 !px-3">
            取消
          </button>
          <button onClick={handleApply} className="btn-primary !py-1.5 !px-5 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>保存并应用复审分</span>
          </button>
        </div>
      </div>
    </div>
  );
};
