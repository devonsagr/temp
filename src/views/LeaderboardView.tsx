import React, { useState } from 'react';
import { HarnessConfig } from '../types/arena';
import { IQBadge } from '../components/IQBadge';
import { Trophy, ArrowRight, ShieldCheck, Zap, Cpu, Sparkles, Filter } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/arenaStore';

interface LeaderboardViewProps {
  configs: HarnessConfig[];
  onSelectBattle: (configId: string) => void;
  onViewConfig: (configId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  configs,
  onSelectBattle,
  onViewConfig,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'project' | 'bugfix'>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const filteredConfigs = configs.filter((cfg) => {
    if (selectedModel !== 'all' && cfg.baseModel !== selectedModel) return false;
    if (selectedMode !== 'all' && cfg.interactiveMode !== selectedMode) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Harness 配置天梯排行榜 (Leaderboard)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                横向对比底层模型、思考档位与策略规则在【做项目】与【修Bug】两大维度的实测表现
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
              展示 {filteredConfigs.length} / {configs.length} 套配置
            </span>
          </div>
        </div>

        {/* Track Switcher (Project Building vs Bugfix) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium mr-1">榜单赛道:</span>
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedTrack === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            🏆 综合全赛道总榜
          </button>
          <button
            onClick={() => setSelectedTrack('project')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              selectedTrack === 'project'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span>🚀 做项目·从需求到全栈落地榜 (主力核心)</span>
          </button>
          <button
            onClick={() => setSelectedTrack('bugfix')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              selectedTrack === 'bugfix'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span>🐛 确定性工程 Bug 修复榜 (客观单测)</span>
          </button>
        </div>

        {/* Model Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>基底模型:</span>
          </div>
          <button
            onClick={() => setSelectedModel('all')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              selectedModel === 'all'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            全部模型
          </button>
          {AVAILABLE_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.name)}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                selectedModel === m.name
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300">
                <th className="py-3 px-4 w-14 text-center font-semibold">排位</th>
                <th className="py-3 px-4 font-semibold">配置方案</th>
                <th className="py-3 px-4 font-semibold">基底模型</th>
                <th className="py-3 px-4 font-semibold">思考档位</th>
                {selectedTrack === 'project' ? (
                  <>
                    <th className="py-3 px-4 font-semibold">Spec 契约切中度</th>
                    <th className="py-3 px-4 font-semibold">全栈 E2E 达成率</th>
                    <th className="py-3 px-4 font-semibold">视觉交互美学</th>
                  </>
                ) : selectedTrack === 'bugfix' ? (
                  <>
                    <th className="py-3 px-4 font-semibold">单测断言退出码</th>
                    <th className="py-3 px-4 font-semibold">零冗余代码纯净度</th>
                    <th className="py-3 px-4 font-semibold">单轮直达效率</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 font-semibold">装载 Skills</th>
                    <th className="py-3 px-4 font-semibold">交付机制</th>
                  </>
                )}
                <th className="py-3 px-4 text-center font-semibold">实测综合分</th>
                <th className="py-3 px-4 text-center font-semibold">胜率</th>
                <th className="py-3 px-4 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    未找到匹配筛选条件的 Harness 配置
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((cfg, idx) => (
                  <tr key={cfg.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {idx === 0 ? (
                        <span className="text-amber-500 text-sm">🥇 01</span>
                      ) : idx === 1 ? (
                        <span className="text-slate-400 text-sm">🥈 02</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-700 text-sm">🥉 03</span>
                      ) : (
                        <span className="text-slate-400 font-normal">{String(idx + 1).padStart(2, '0')}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                        <span>{cfg.name}</span>
                        {cfg.customConstraints && cfg.customConstraints.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-normal border border-zinc-200 dark:border-zinc-700 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
                            {cfg.customConstraints.filter(c => c.isActive).length}项规则
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cfg.tagline}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        <Cpu className="w-3 h-3" />
                        {cfg.baseModel || 'GPT-6 Astra'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        cfg.reasoning === 'xhigh' || cfg.reasoning === 'high'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          : cfg.reasoning === 'none'
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}>
                        {cfg.reasoning}
                      </span>
                    </td>

                    {selectedTrack === 'project' ? (
                      <>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, Math.round(cfg.iqScore * 0.98))}%` }}
                              />
                            </div>
                            <span className="text-slate-800 dark:text-zinc-200 font-semibold text-[11px]">
                              {Math.min(99, Math.round(cfg.iqScore * 0.98))}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            cfg.iqScore >= 85
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}>
                            {cfg.iqScore >= 85 ? '✓ 100% 跑通' : `${Math.round(cfg.iqScore * 0.94)}% 跑通`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                          {Math.round(cfg.iqScore * 0.96)} 分
                        </td>
                      </>
                    ) : selectedTrack === 'bugfix' ? (
                      <>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {Math.min(100, Math.round(cfg.iqScore * 1.01))}% Exit 0
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded ${
                            cfg.specialFeatures?.antiScopeCreep
                              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'text-slate-500'
                          }`}>
                            {cfg.specialFeatures?.antiScopeCreep ? '✓ 100% 洁癖' : '88% 轻度包装'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                          {Math.round(cfg.winRate * 0.98)}%
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs font-mono">
                            {cfg.skills.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300 text-xs">
                          {cfg.interactiveMode === 'one-shot-direct' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Zap className="w-3 h-3" /> 一步到位直击
                            </span>
                          ) : cfg.interactiveMode === 'step-by-step-confirm' ? (
                            <span className="text-slate-600 dark:text-zinc-400">分步确认审批</span>
                          ) : (
                            <span className="text-slate-500 dark:text-zinc-400">自适应</span>
                          )}
                        </td>
                      </>
                    )}

                    <td className="py-3.5 px-4 text-center">
                      <IQBadge score={cfg.iqScore} />
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-slate-800 dark:text-zinc-200 font-bold">{cfg.winRate}%</span>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] block font-normal">
                        {cfg.totalBattles} 场对决
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onViewConfig(cfg.id)} className="btn-ghost">
                          详情
                        </button>
                        <button onClick={() => onSelectBattle(cfg.id)} className="btn-secondary">
                          发起评测
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
