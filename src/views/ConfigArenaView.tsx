import React, { useState } from 'react';
import { HarnessConfig, ReasoningLevel, CustomConstraint } from '../types/arena';
import { IQBadge } from '../components/IQBadge';
import { Plus, Save, Play, ShieldCheck, FileCode, Sliders, Trash2, Check } from 'lucide-react';

interface ConfigArenaViewProps {
  configs: HarnessConfig[];
  selectedId?: string;
  onSaveConfig: (config: HarnessConfig) => void;
  onDeleteConfig: (id: string) => void;
  onStartBattleWith: (configId: string) => void;
}

export const ConfigArenaView: React.FC<ConfigArenaViewProps> = ({
  configs,
  selectedId,
  onSaveConfig,
  onDeleteConfig,
  onStartBattleWith,
}) => {
  const [activeId, setActiveId] = useState<string>(selectedId || configs[0]?.id || '');
  const activeConfig = configs.find((c) => c.id === activeId) || configs[0];

  const [name, setName] = useState(activeConfig?.name || '');
  const [baseModel, setBaseModel] = useState(activeConfig?.baseModel || 'GPT-6 Astra');
  const [tagline, setTagline] = useState(activeConfig?.tagline || '');
  const [prompt, setPrompt] = useState(activeConfig?.agentsPrompt || '');
  const [skillsStr, setSkillsStr] = useState(activeConfig?.skills.join(', ') || '');
  const [reasoning, setReasoning] = useState<ReasoningLevel>(activeConfig?.reasoning || 'medium');
  const [mode, setMode] = useState(activeConfig?.interactiveMode || 'one-shot-direct');
  const [constraints, setConstraints] = useState<CustomConstraint[]>(
    activeConfig?.customConstraints || [
      {
        id: 'c-clean-diff',
        title: '切中需求要害与极简变更',
        category: 'scope-control',
        ruleDesc: '精准理解意图，修改行数严格限制在核心范围内，不随意重构周边无关代码',
        weightPoints: 20,
        isActive: true,
      },
      {
        id: 'c-no-bloat',
        title: '零冗余文件产生',
        category: 'file-hygiene',
        ruleDesc: '严禁新建未经许可的临时测试、demo 或封装辅助文件',
        weightPoints: 20,
        isActive: true,
      },
    ]
  );

  const [newConstraintTitle, setNewConstraintTitle] = useState('');
  const [newConstraintPoints, setNewConstraintPoints] = useState(20);

  if (!configs || configs.length === 0) {
    return (
      <div className="panel p-12 text-center text-slate-500 text-xs">
        正在读取配置库...
      </div>
    );
  }

  const handleSelect = (cfg: HarnessConfig) => {
    setActiveId(cfg.id);
    setName(cfg.name);
    setBaseModel(cfg.baseModel || 'GPT-6 Astra');
    setTagline(cfg.tagline);
    setPrompt(cfg.agentsPrompt);
    setSkillsStr(cfg.skills.join(', '));
    setReasoning(cfg.reasoning);
    setMode(cfg.interactiveMode);
    setConstraints(cfg.customConstraints || []);
  };

  const handleCreateNew = () => {
    const newId = `cfg_${Date.now().toString(36)}`;
    const newCfg: HarnessConfig = {
      id: newId,
      name: 'Custom-Action-Config',
      baseModel: '5.6 (Solluna)',
      tagline: '自定义 Harness 配置',
      author: 'User',
      agentsPrompt: `# Custom Action Protocol\n1. Target core intent with lean code edits.\n2. Do NOT produce redundant wrappers or bloated helper abstractions.\n3. Run verification before delivering.\n`,
      skills: ['quick-lint'],
      reasoning: 'medium',
      interactiveMode: 'one-shot-direct',
      customConstraints: [
        {
          id: 'c-clean-diff',
          title: '切中需求要害与极简变更',
          category: 'scope-control',
          ruleDesc: '严格控制代码修改范围，切中要害',
          weightPoints: 20,
          isActive: true,
        },
        {
          id: 'c-no-bloat',
          title: '零冗余文件产生',
          category: 'file-hygiene',
          ruleDesc: '不生成额外无关文件',
          weightPoints: 20,
          isActive: true,
        },
      ],
      specialFeatures: {
        antiScopeCreep: true,
        autoSelfTest: true,
      },
      iqScore: 82.0,
      winRate: 50.0,
      totalBattles: 0,
      lastTestedAt: '未评测',
    };
    onSaveConfig(newCfg);
    handleSelect(newCfg);
  };

  const handleToggleConstraint = (id: string) => {
    setConstraints(
      constraints.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleAddConstraint = () => {
    if (!newConstraintTitle.trim()) return;
    const item: CustomConstraint = {
      id: `c-user-${Date.now().toString(36)}`,
      title: newConstraintTitle.trim(),
      category: 'custom-script',
      ruleDesc: '用户在配置中自定义的个性化 Harness 约束核验项',
      weightPoints: newConstraintPoints,
      isActive: true,
    };
    setConstraints([...constraints, item]);
    setNewConstraintTitle('');
  };

  const handleDeleteConstraint = (id: string) => {
    setConstraints(constraints.filter((c) => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfig) return;
    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: HarnessConfig = {
      ...activeConfig,
      name,
      baseModel,
      tagline,
      agentsPrompt: prompt,
      skills,
      reasoning,
      interactiveMode: mode,
      customConstraints: constraints,
      specialFeatures: {
        ...activeConfig.specialFeatures,
        antiScopeCreep: constraints.some((c) => c.id === 'c-clean-diff' && c.isActive),
      },
    };
    onSaveConfig(updated);
    alert('配置已成功保存！');
  };

  return (
    <div className="grid grid-cols-12 gap-6 animate-slide-up">
      {/* Left 4 Cols: Config List */}
      <div className="col-span-12 md:col-span-4 space-y-3">
        <div className="panel p-4 space-y-3 bg-white dark:bg-[#121215]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              配置库清单 ({configs.length})
            </span>
            <button onClick={handleCreateNew} className="btn-secondary !text-xs !py-1">
              <Plus className="w-3.5 h-3.5" />
              <span>新建配置</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {configs.map((c) => {
              const isSelected = c.id === activeConfig?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white bg-slate-50 dark:bg-zinc-900 shadow-sm'
                      : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#121215]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[9px]">
                        {c.baseModel || 'GPT-6 Astra'}
                      </span>
                      <span>推理: {c.reasoning}</span>
                    </div>
                  </div>

                  <IQBadge score={c.iqScore} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right 8 Cols: Edit Form */}
      <div className="col-span-12 md:col-span-8">
        <form onSubmit={handleSave} className="panel p-5 sm:p-6 space-y-5 bg-white dark:bg-[#121215]">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>编辑配置: {name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-zinc-800 text-slate-500">
                  {activeConfig?.id}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                调整基座模型 (5.6/Solluna/Terra/GPT-6)、推理强度、提示词规则及个性化约束清单
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartBattleWith(activeConfig.id)}
                className="btn-secondary !text-xs !py-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                <span>立即跑分</span>
              </button>

              <button type="submit" className="btn-primary !text-xs !py-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>保存配置</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                配置名称:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                简短特色标语:
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                基座模型 (Base Model):
              </label>
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-medium"
              >
                <option value="GPT-6 Astra">GPT-6 Astra (通用直击前沿)</option>
                <option value="5.6 (Solluna)">5.6 (Solluna) (Codex 工程主力)</option>
                <option value="Terra-v2 (DeepSWE)">Terra-v2 (DeepSWE Bugfix)</option>
                <option value="Claude-3.7 Sonnet">Claude-3.7 Sonnet (UI视觉审美)</option>
                <option value="Gemini-2.5 Pro">Gemini-2.5 Pro (超长上下文)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                思考档位 (Reasoning):
              </label>
              <select
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value as ReasoningLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
              >
                <option value="none">none (零思考 / 极速直出)</option>
                <option value="low">low (低耗时 / 快速响应)</option>
                <option value="medium">medium (常规推荐)</option>
                <option value="high">high (深思增强)</option>
                <option value="xhigh">xhigh (极致思考 / 疑难排错)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                交互协议模式:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
              >
                <option value="one-shot-direct">单轮一步到位直出</option>
                <option value="step-by-step-confirm">分步提报计划等用户批准</option>
                <option value="adaptive">自适应动态调优</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                挂载技能组 (逗号隔开):
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="quick-lint, type-safety"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* System Prompt / AGENTS.md Editor */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                <span>核心指令与规则注入 (AGENTS.md / System Instructions)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {prompt.length} 字符
              </span>
            </div>
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none"
            />
          </div>

          {/* Custom Constraints Checklist Builder */}
          <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  团队个性化约束核验项 (Custom Constraints Checklist)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                违规将扣减对应分值
              </span>
            </div>

            <div className="space-y-2">
              {constraints.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    c.isActive
                      ? 'bg-slate-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                      : 'bg-white dark:bg-[#121215] border-slate-200 dark:border-zinc-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleConstraint(c.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        c.isActive
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                          : 'border-slate-300 dark:border-zinc-600'
                      }`}
                    >
                      {c.isActive && <Check className="w-3 h-3" />}
                    </button>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {c.ruleDesc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {c.weightPoints} 分
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteConstraint(c.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Constraint */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="新增约束规则（如：必须通过本地镜像防冲突校验、严禁改动公共API）"
                value={newConstraintTitle}
                onChange={(e) => setNewConstraintTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="number"
                min="5"
                max="50"
                value={newConstraintPoints}
                onChange={(e) => setNewConstraintPoints(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-center font-mono"
              />
              <button
                type="button"
                onClick={handleAddConstraint}
                className="btn-secondary !text-xs !py-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加规则</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
