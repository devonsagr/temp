import React from 'react';
import { HarnessConfig } from '../types/arena';
import { Check, Minus, GitCompare } from 'lucide-react';

interface ConfigDiffMatrixProps {
  configA: HarnessConfig;
  configB: HarnessConfig;
}

export const ConfigDiffMatrix: React.FC<ConfigDiffMatrixProps> = ({ configA, configB }) => {
  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              控制变量对照矩阵 (Controlled Variables Matrix)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              锁定控制变量，清晰定位具体改动对交付耗时与代码质量的影响
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono">
          A / B Testing
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
              <th className="pb-2.5 font-medium w-1/4">变量维度</th>
              <th className="pb-2.5 font-semibold text-slate-900 dark:text-zinc-100 w-3/8">
                基准: {configA.name}
              </th>
              <th className="pb-2.5 font-semibold text-slate-900 dark:text-zinc-100 w-3/8">
                对比: {configB.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-[11px]">
            <tr>
              <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">推理深度档位</td>
              <td className="py-2.5 text-slate-700 dark:text-slate-200 font-mono">{configA.reasoning}</td>
              <td className="py-2.5 text-slate-700 dark:text-slate-200 font-mono">{configB.reasoning}</td>
            </tr>

            <tr>
              <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">交互交付机制</td>
              <td className="py-2.5 text-slate-700 dark:text-slate-200">
                {configA.interactiveMode === 'one-shot-direct'
                  ? '单轮一步到位直击'
                  : configA.interactiveMode === 'step-by-step-confirm'
                  ? '分步计划等待批准'
                  : '自适应'}
              </td>
              <td className="py-2.5 text-slate-700 dark:text-slate-200">
                {configB.interactiveMode === 'one-shot-direct'
                  ? '单轮一步到位直击'
                  : configB.interactiveMode === 'step-by-step-confirm'
                  ? '分步计划等待批准'
                  : '自适应'}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">附加技能组 (Skills)</td>
              <td className="py-2.5">
                <div className="flex flex-wrap gap-1">
                  {configA.skills.length > 0 ? (
                    configA.skills.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">纯净模式 (无额外技能)</span>
                  )}
                </div>
              </td>
              <td className="py-2.5">
                <div className="flex flex-wrap gap-1">
                  {configB.skills.length > 0 ? (
                    configB.skills.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">纯净模式 (无额外技能)</span>
                  )}
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-2.5 text-slate-500 dark:text-zinc-400 font-medium">团队个性化约束核验项</td>
              <td className="py-2.5">
                {configA.customConstraints && configA.customConstraints.length > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> 已挂载 {configA.customConstraints.filter(c => c.isActive).length} 项约束
                  </span>
                ) : (
                  <span className="text-slate-400 inline-flex items-center gap-1">
                    <Minus className="w-3.5 h-3.5" /> 未配置私有约束
                  </span>
                )}
              </td>
              <td className="py-2.5">
                {configB.customConstraints && configB.customConstraints.length > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> 已挂载 {configB.customConstraints.filter(c => c.isActive).length} 项约束
                  </span>
                ) : (
                  <span className="text-slate-400 inline-flex items-center gap-1">
                    <Minus className="w-3.5 h-3.5" /> 未配置私有约束
                  </span>
                )}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 text-slate-500 dark:text-zinc-400 font-medium">切中需求要害（无冗余蔓延）</td>
              <td className="py-2.5">
                {configA.specialFeatures?.antiScopeCreep ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    切中要害·无冗余约束开启
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    默认自由修改
                  </span>
                )}
              </td>
              <td className="py-2.5">
                {configB.specialFeatures?.antiScopeCreep ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    切中要害·无冗余约束开启
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    默认自由修改
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
