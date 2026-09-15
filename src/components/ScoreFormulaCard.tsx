import React, { useState } from 'react';
import { TaskChannel } from '../types/arena';
import {
  Scale,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Calculator,
  Cpu,
  UserCheck,
  ShieldCheck,
  Terminal,
  FileCode,
  Gauge,
  GitBranch,
} from 'lucide-react';

interface ScoreFormulaCardProps {
  currentChannel?: TaskChannel;
  compact?: boolean;
}

export const ScoreFormulaCard: React.FC<ScoreFormulaCardProps> = ({
  currentChannel = 'frontend-ui',
  compact = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showSandbox, setShowSandbox] = useState(false);

  // Mechanical mock values
  const [mockCodePass, setMockCodePass] = useState(95);
  const [mockBuildLint, setMockBuildLint] = useState(98);
  const [mockGitPurity, setMockGitPurity] = useState(92);

  // Human expert 4-dimension mock values
  const [mockIntent, setMockIntent] = useState(90);
  const [mockMaintainability, setMockMaintainability] = useState(88);
  const [mockRobustness, setMockRobustness] = useState(86);
  const [mockUX, setMockUX] = useState(92);

  // Dynamic calculations
  const mockMechanical = Math.round((mockCodePass * 0.5 + mockBuildLint * 0.25 + mockGitPurity * 0.25) * 10) / 10;
  const mockHuman = Math.round((mockIntent * 0.3 + mockMaintainability * 0.25 + mockRobustness * 0.25 + mockUX * 0.2) * 10) / 10;
  const mockOverall = Math.round((mockMechanical * 0.5 + mockHuman * 0.5) * 10) / 10;

  return (
    <div className="panel overflow-hidden border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-sm transition-all duration-200">
      {/* Top Banner */}
      <div className="px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center shadow-sm">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                双轨评测体系与工业级权重公示
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
                机械客观自动化 (50%) ⟷ 人类专家 5 维复审 (50%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              客观断言杜绝主观偏见，人类专家复核切中真实交付体感与工程维护规范
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSandbox(!showSandbox)}
            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
          >
            <Calculator className="w-3.5 h-3.5 text-zinc-500" />
            <span>{showSandbox ? '收起试算器' : '双轨实时试算'}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
          >
            <span className="text-[11px]">{isExpanded ? '收起详情' : '展开体系'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Dual-Track Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Track: Machine Objective Engine */}
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      一、机械客观自动化判断部分 (50%)
                    </h4>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">
                      沙箱执行器脚本检测 · 0 人工主观误差 · 确定性重现
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-600 text-white">
                  占比 50%
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-blue-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-600" />
                      1. 客观单测断言与退出码 (Pass Rate & Exit Code 0)
                    </span>
                    <span className="font-mono font-bold text-blue-600 text-[11px]">50% 机械分</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    在干净沙箱中自动触发 Playwright / Vitest / Pytest 端到端测试用例，用例通过率与进程退出码 100% 机械断言。
                  </p>
                </div>

                {/* 2 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-blue-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      2. 工程编译与静态健康 (Build & Static Check)
                    </span>
                    <span className="font-mono font-bold text-blue-600 text-[11px]">25% 机械分</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    自动化执行 TypeScript 编译器检查与 ESLint 规范检验，零语法告警与类型报错为满分。
                  </p>
                </div>

                {/* 3 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-blue-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                      3. Git 物理变更纯净度 (Git Diff & Line Budget)
                    </span>
                    <span className="font-mono font-bold text-blue-600 text-[11px]">25% 机械分</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    运行 git status 与 git diff，严禁未经批准偷加冗余依赖、临时测试文件或擅自重构非相关外围接口。
                  </p>
                </div>

                {/* 4 Telemetry */}
                <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between font-mono">
                  <span>⚡ 资源遥测指标：</span>
                  <span>执行时延(s) · 输入/输出/推理 Token · 缓存命中率</span>
                </div>
              </div>
            </div>

            {/* Right Track: Human Expert Review Matrix */}
            <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                      二、人类专家 5 维公允复审体系 (50%)
                    </h4>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">
                      国际主流 Engineering Review 规范 · 0~100 连续数值打分
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-600 text-white">
                  占比 50%
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Human Dim 1 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-purple-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      1. 需求理解与要害切中度 (Intent Fidelity & Completeness)
                    </span>
                    <span className="font-mono font-bold text-purple-600 text-[11px]">权重 30%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    AI 是否真正领会核心业务意图与隐式边界？主干业务链路是否 100% 完整闭环，严禁只写半截假功能。
                  </p>
                </div>

                {/* Human Dim 2 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-purple-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      2. 代码规范与工程纯净 (Code Maintainability & Idioms)
                    </span>
                    <span className="font-mono font-bold text-purple-600 text-[11px]">权重 25%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    命名规范、模块解耦清晰、遵循现代技术栈惯用法（Idiomatic），杜绝为了应付单测写出难维护的面条代码。
                  </p>
                </div>

                {/* Human Dim 3 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-purple-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      3. 异常边界与防御健壮度 (Defensive Robustness & Edge Handling)
                    </span>
                    <span className="font-mono font-bold text-purple-600 text-[11px]">权重 25%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    网络波动重试、空数据状态（Empty State）、极端并发竞态防范与入参校验，评判真实生产环境下的防御力。
                  </p>
                </div>

                {/* Human Dim 4 & 5 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-purple-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      4. 交互可用性与视觉质感 (UI/UX Ergonomics)
                    </span>
                    <span className="font-mono font-bold text-purple-600 text-[11px]">权重 20%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
                    <span>界面层级、深浅色模式手感、无掉帧交互</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      5. PR 准入评级: 🟢 直接合并 / 🟡 微调 / 🟠 重构 / 🔴 拒绝
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Sandbox Calculator */}
          {showSandbox && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-4 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    双轨合成实时试算器 (Live Dual-Track Simulator)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span>机械分: <strong className="text-blue-600">{mockMechanical}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>专家分: <strong className="text-purple-600">{mockHuman}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold shadow-sm">
                    天梯总成绩: {mockOverall} 分
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Mechanical sliders */}
                <div className="space-y-3 p-3 rounded-xl bg-white dark:bg-[#121215] border border-blue-100 dark:border-zinc-800">
                  <div className="font-bold text-blue-700 dark:text-blue-300 text-[11px]">
                    🤖 机械客观得分试算 (加权平均: {mockMechanical}分)
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>单测断言 (50%):</span>
                      <span className="font-mono font-bold">{mockCodePass}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockCodePass}
                      onChange={(e) => setMockCodePass(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>编译与类型安全 (25%):</span>
                      <span className="font-mono font-bold">{mockBuildLint}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockBuildLint}
                      onChange={(e) => setMockBuildLint(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>Git 物理纯净度 (25%):</span>
                      <span className="font-mono font-bold">{mockGitPurity}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockGitPurity}
                      onChange={(e) => setMockGitPurity(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                {/* Human sliders */}
                <div className="space-y-3 p-3 rounded-xl bg-white dark:bg-[#121215] border border-purple-100 dark:border-zinc-800">
                  <div className="font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                    👤 人类专家复审试算 (加权平均: {mockHuman}分)
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>需求切中度 (30%):</span>
                      <span className="font-mono font-bold">{mockIntent}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockIntent}
                      onChange={(e) => setMockIntent(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>代码规范可维护 (25%):</span>
                      <span className="font-mono font-bold">{mockMaintainability}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockMaintainability}
                      onChange={(e) => setMockMaintainability(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>边界防御健壮 (25%):</span>
                      <span className="font-mono font-bold">{mockRobustness}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockRobustness}
                      onChange={(e) => setMockRobustness(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>交互可用与视觉 (20%):</span>
                      <span className="font-mono font-bold">{mockUX}分</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockUX}
                      onChange={(e) => setMockUX(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
