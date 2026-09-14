import { HarnessConfig, BattleMatch, BattleTrialResult, ScoreBreakdown, RunHistoryRecord, TaskChannel, BenchmarkTask, CustomConstraint, WeightPreset, AIJudgeReport, BattleTrialStatus, MergeReadinessLevel, ManualRatingInput } from '../types/arena';
import { BENCHMARK_TASKS, CHANNEL_FORMULAS } from './benchmarkSuites';

export const AVAILABLE_MODELS = [
  { id: 'gpt-6-astra', name: 'GPT-6 Astra', desc: '新一代通用高效前沿模型，极强代码遵循与直达能力' },
  { id: '5.6-solluna', name: '5.6 (Solluna)', desc: 'Codex 核心工程主力模型，擅长架构推演与长程执行' },
  { id: 'terra-v2', name: 'Terra-v2 (DeepSWE)', desc: '专长于复杂 Bug 修复、长上下文回溯与客观单测通过' },
  { id: 'claude-3.7-sonnet', name: 'Claude-3.7 Sonnet', desc: '卓越的前端 UI 美感、代码整洁度与自测闭环' },
  { id: 'gemini-2.5-pro', name: 'Gemini-2.5 Pro', desc: '超长上下文工程库理解与跨文件重构' },
];

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: 'preset-balanced',
    name: '赛道标准平衡配比 (Default Balanced)',
    tag: '标准平衡',
    desc: '根据赛道核心目标自动设定最优比例，兼顾客观代码通过与直达体验',
    weights: { codePass: 30, directness: 35, aesthetic: 35, constraint: 0 },
  },
  {
    id: 'preset-sniper',
    name: '极简直击交付型 (Sniper Directness)',
    tag: '精简交付',
    desc: '重奖单轮一步到位、首轮直出与零冗余文件，重罚多余包装与来回扯皮',
    weights: { codePass: 25, directness: 45, aesthetic: 10, constraint: 20 },
  },
  {
    id: 'preset-swebench',
    name: 'SWE-bench 极端客观型 (Hardcore Bugfix)',
    tag: '纯客观单测',
    desc: '以自动化单元测试回归通过率为绝对核心指标 (70% 权重)',
    weights: { codePass: 70, directness: 20, aesthetic: 0, constraint: 10 },
  },
  {
    id: 'preset-ui-design',
    name: 'UI 交互与视觉手感型 (Design & Polish)',
    tag: '前端质感',
    desc: '以排版留白、微动效质感与人工主观审美验收为最高权重 (50%)',
    weights: { codePass: 20, directness: 20, aesthetic: 50, constraint: 10 },
  },
  {
    id: 'preset-governance',
    name: '企业级严谨治理型 (Enterprise Governance)',
    tag: '约束安全',
    desc: '严厉惩罚擅自破坏公共接口、违反分步审批或污染工作区的行为',
    weights: { codePass: 25, directness: 15, aesthetic: 10, constraint: 50 },
  },
];

const INITIAL_CONFIGS: HarnessConfig[] = [
  {
    id: 'cfg-sniper-minimal',
    name: 'Sniper-Minimal (极简高效型)',
    baseModel: 'GPT-6 Astra',
    tagline: '去除一切繁琐包装，直奔核心病灶，单轮高质量一步到位',
    author: 'Devon',
    agentsPrompt: `# Sniper Direct Action Rules
1. Do not ask redundant questions if task instruction is unambiguous.
2. Do NOT create extraneous abstraction layers, helper loggers, or bloat files.
3. Make surgical edits, run targeted tests, and complete directly.
`,
    skills: ['quick-lint'],
    reasoning: 'medium',
    interactiveMode: 'one-shot-direct',
    customConstraints: [
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
    ],
    specialFeatures: {
      antiScopeCreep: true,
      autoSelfTest: true,
    },
    iqScore: 92.4,
    winRate: 85.7,
    totalBattles: 28,
    lastTestedAt: '10 分钟前',
  },
  {
    id: 'cfg-standard-engineer',
    name: 'Standard-Engineer (工程标准型)',
    baseModel: 'Terra-v2 (DeepSWE)',
    tagline: '严守类型安全、规范测试与格式化约束，均衡稳健交付',
    author: 'CoreTeam',
    agentsPrompt: `# Standard Engineering Protocol
1. Follow existing codebase architectural patterns and naming conventions.
2. Ensure strict TypeScript types and comprehensive unit test assertions.
3. Avoid scope creep and preserve backward compatibility.
`,
    skills: ['type-safety', 'unit-test-runner', 'linter-guard'],
    reasoning: 'high',
    interactiveMode: 'adaptive',
    customConstraints: [
      {
        id: 'c-type-safety',
        title: '静态类型零报错',
        category: 'scope-control',
        ruleDesc: '严格禁止 any 逃逸，所有接口定义必须完整闭环',
        weightPoints: 25,
        isActive: true,
      },
      {
        id: 'c-no-bloat',
        title: '零冗余文件产生',
        category: 'file-hygiene',
        ruleDesc: '仅修改目标业务代码，不生成垃圾文件',
        weightPoints: 15,
        isActive: true,
      },
    ],
    specialFeatures: {
      antiScopeCreep: true,
      autoSelfTest: true,
    },
    iqScore: 86.8,
    winRate: 74.2,
    totalBattles: 21,
    lastTestedAt: '30 分钟前',
  },
  {
    id: 'cfg-interactive-copilot',
    name: 'Guided-Planner (分步确认型)',
    baseModel: '5.6 (Solluna)',
    tagline: '针对复杂项目：重大变动前先输出清晰方案，待用户批准后稳妥执行',
    author: 'AgileTeam',
    agentsPrompt: `# Step-by-Step Approval Protocol
1. For complex or architectural changes, output a concise plan first.
2. Do NOT write destructive code changes until user confirms the plan.
3. Once approved, execute cleanly with clear rollback verification.
`,
    skills: ['plan-generator', 'review-gate'],
    reasoning: 'medium',
    interactiveMode: 'step-by-step-confirm',
    customConstraints: [
      {
        id: 'c-confirm-gate',
        title: '重大操作分步门禁',
        category: 'interaction-gate',
        ruleDesc: '破坏性或架构变更前必须先给出方案等用户确认，不可单轮擅自动手',
        weightPoints: 30,
        isActive: true,
      },
      {
        id: 'c-rollback-plan',
        title: '具备清晰回滚预案',
        category: 'scope-control',
        ruleDesc: '方案中需包含出现异常时的回滚建议与测试验证命令',
        weightPoints: 20,
        isActive: true,
      },
    ],
    specialFeatures: {
      antiScopeCreep: true,
      autoSelfTest: true,
    },
    iqScore: 80.5,
    winRate: 62.1,
    totalBattles: 16,
    lastTestedAt: '2 小时前',
  },
  {
    id: 'cfg-heavy-wrapper',
    name: 'Verbose-Legacy (繁复多层旧配置)',
    baseModel: 'Legacy-5.6',
    tagline: '规则层级过厚、提示词冗长，容易产生过多无用中间包装与多余文件',
    author: 'Legacy',
    agentsPrompt: `# Verbose Multi-Layered Instructions
Ensure deep multidimensional abstraction layers.
Mandate 8 internal pre-checks, verbose markdown logs, and wrapper classes for everything.
`,
    skills: ['heavy-logger', 'extra-parsers', 'doc-generator'],
    reasoning: 'low',
    interactiveMode: 'one-shot-direct',
    customConstraints: [
      {
        id: 'c-no-bloat',
        title: '零冗余文件产生',
        category: 'file-hygiene',
        ruleDesc: '不生成无用中间文件',
        weightPoints: 20,
        isActive: false,
      },
    ],
    specialFeatures: {
      antiScopeCreep: false,
      autoSelfTest: false,
    },
    iqScore: 58.2,
    winRate: 24.0,
    totalBattles: 25,
    lastTestedAt: '昨天',
  },
];

const STORAGE_KEYS = {
  CONFIGS: 'chb_benchmark_configs_v2',
  MATCHES: 'chb_benchmark_matches_v2',
  HISTORY: 'chb_benchmark_history_v2',
  CUSTOM_TASKS: 'chb_benchmark_custom_tasks_v2',
};

class ArenaStore {
  private configs: HarnessConfig[] = [];
  private matches: BattleMatch[] = [];
  private history: RunHistoryRecord[] = [];
  private customTasks: BenchmarkTask[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const c = localStorage.getItem(STORAGE_KEYS.CONFIGS);
      this.configs = c ? JSON.parse(c) : INITIAL_CONFIGS;
      const m = localStorage.getItem(STORAGE_KEYS.MATCHES);
      this.matches = m ? JSON.parse(m) : [];
      const h = localStorage.getItem(STORAGE_KEYS.HISTORY);
      this.history = h ? JSON.parse(h) : [];
      const t = localStorage.getItem(STORAGE_KEYS.CUSTOM_TASKS);
      this.customTasks = t ? JSON.parse(t) : [];
    } catch (e) {
      this.configs = INITIAL_CONFIGS;
      this.matches = [];
      this.history = [];
      this.customTasks = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(this.configs));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(this.matches));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TASKS, JSON.stringify(this.customTasks));
    } catch (e) {
      console.error(e);
    }
  }

  // ================= Configs =================
  getConfigs(): HarnessConfig[] {
    return [...this.configs].sort((a, b) => b.iqScore - a.iqScore);
  }

  getConfig(id: string): HarnessConfig | undefined {
    return this.configs.find((c) => c.id === id);
  }

  saveConfig(config: HarnessConfig) {
    const idx = this.configs.findIndex((c) => c.id === config.id);
    if (idx >= 0) {
      this.configs[idx] = config;
    } else {
      this.configs.push(config);
    }
    this.persist();
  }

  deleteConfig(id: string) {
    this.configs = this.configs.filter((c) => c.id !== id);
    this.persist();
  }

  // ================= Tasks =================
  getAllTasks(): BenchmarkTask[] {
    return [...BENCHMARK_TASKS, ...this.customTasks];
  }

  getCustomTasks(): BenchmarkTask[] {
    return [...this.customTasks];
  }

  addCustomTask(task: BenchmarkTask) {
    this.customTasks.push(task);
    this.persist();
  }

  deleteCustomTask(id: string) {
    this.customTasks = this.customTasks.filter((t) => t.id !== id);
    this.persist();
  }

  // ================= History =================
  getHistory(): RunHistoryRecord[] {
    return [...this.history];
  }

  saveHistoryRecord(record: RunHistoryRecord) {
    this.history.unshift(record);
    this.persist();
  }

  deleteHistoryRecord(id: string) {
    this.history = this.history.filter((h) => h.id !== id);
    this.persist();
  }

  clearHistory() {
    this.history = [];
    this.persist();
  }

  getMatches(): BattleMatch[] {
    return [...this.matches];
  }

  // ================= Single Benchmark Runner =================
  async runSingleBenchmark(
    configId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep?: (msg: string) => void
  ): Promise<RunHistoryRecord> {
    const conf = this.getConfig(configId);
    if (!conf) throw new Error('评测目标配置不存在');

    onStep?.(`[Benchmark] 初始化评测引擎: 正在加载配置【${conf.name}】...`);
    await new Promise((r) => setTimeout(r, 350));

    const tasks = this.getAllTasks().filter((t) => taskIds.includes(t.id));
    const results: BattleTrialResult[] = [];

    let totalSec = 0;
    let totalTokens = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      onStep?.(`[执行 ${i + 1}/${tasks.length}] 正在评测任务: ${task.title}...`);
      await new Promise((r) => setTimeout(r, 600));

      const scores = this.simulateScore(conf, task, channel);
      totalSec += scores.secondsUsed;
      totalTokens += scores.tokensTotal;

      const isSimulatedError = this.simulatedErrorType !== null && i === 0;
      const status: BattleTrialStatus = isSimulatedError
        ? this.simulatedErrorType!
        : scores.codePassScore >= 60
        ? 'passed'
        : 'failed';

      const errorDetails = isSimulatedError
        ? {
            code:
              this.simulatedErrorType === 'quota_exhausted'
                ? 'ERR_QUOTA_EXHAUSTED'
                : this.simulatedErrorType === 'rate_limit_429'
                ? 'ERR_RATE_LIMIT_429'
                : this.simulatedErrorType === 'context_overflow'
                ? 'ERR_CONTEXT_WINDOW_OVERFLOW'
                : 'ERR_TASK_TIMEOUT_300S',
            message:
              this.simulatedErrorType === 'quota_exhausted'
                ? '当前模型 API 账户额度不足 (Insufficient Quota / Billing Limit Reached)。'
                : this.simulatedErrorType === 'rate_limit_429'
                ? '上游并发限流 (HTTP 429 Too Many Requests)，已暂停执行。'
                : this.simulatedErrorType === 'context_overflow'
                ? '提示词与工具输出超过当前模型窗口上限 (Context Window Exceeded)。'
                : '沙箱任务单次运行超过 300s 超时上限，系统强制中止保护资源。',
            suggestedFix:
              this.simulatedErrorType === 'quota_exhausted'
                ? '请前往 OpenAI / Anthropic 控制台充值或更换 API Key，点击下方“断点重试”自愈继续。'
                : this.simulatedErrorType === 'rate_limit_429'
                ? '建议降低测试并发度，或在 Codex Harness 设置中开启 exponential_backoff 自动退避。'
                : this.simulatedErrorType === 'context_overflow'
                ? '建议降低思考档位（如 xhigh -> medium）或在 AGENTS.md 中开启自动上下文清理。'
                : '建议检查代码逻辑是否陷入死循环或死锁。',
          }
        : undefined;

      results.push({
        taskId: task.id,
        taskTitle: task.title,
        configId: conf.id,
        configName: conf.name,
        scores,
        status,
        errorDetails,
        diffPatch: this.generateSampleDiff(task, conf),
        terminalOutput: isSimulatedError
          ? `$ ${task.verificationCmd}\n[API RUNTIME ERROR] ${errorDetails?.code}: ${errorDetails?.message}\nExecution aborted at turn ${scores.turnsUsed}. Trace preserved.`
          : this.generateTerminalOutput(task, scores),
        aiJudgeReport: this.generateAIJudgeReport(task, conf, scores),
        workspacePath: `~/.codex/workspaces/bench-${conf.id.slice(4)}-${task.id}`,
        evidenceTrace: [
          `[环境检测] 注入 AGENTS.md 规则，基座模型: ${conf.baseModel || 'GPT-6 Astra'} | 推理档位: ${conf.reasoning}`,
          `[指令输入] ${task.inputPrompt}`,
          isSimulatedError
            ? `[异常熔断] ${errorDetails?.code}: ${errorDetails?.message}`
            : `[自动化断言] ${task.verificationCmd} -> exit code 0 (通过)`,
          `[资源消耗] 耗时 ${scores.secondsUsed}s | Token: ${scores.tokensTotal} | 轮次: ${scores.turnsUsed}`,
        ],
      });
    }

    const passedCount = results.filter((r) => r.status === 'passed').length;
    const passRate = Math.round((passedCount / results.length) * 100);
    const avgScore = Math.round(
      (results.reduce((sum, r) => sum + r.scores.codexIQ, 0) / results.length) * 10
    ) / 10;

    // Update config overall stats
    conf.totalBattles += 1;
    conf.iqScore = Math.round(((conf.iqScore * 3 + avgScore) / 4) * 10) / 10;
    conf.lastTestedAt = '刚刚';

    const historyRecord: RunHistoryRecord = {
      id: `run_${Date.now().toString(36)}`,
      createdAt: new Date().toLocaleString('zh-CN'),
      runType: 'single',
      channel,
      configId: conf.id,
      configSnapshot: JSON.parse(JSON.stringify(conf)),
      taskIds,
      results,
      overallScore: avgScore,
      passRate,
      totalSeconds: Math.round(totalSec * 10) / 10,
      totalTokens,
      notes: `单配置基准测试通过率: ${passRate}%`,
    };

    this.saveHistoryRecord(historyRecord);
    this.persist();
    return historyRecord;
  }

  // ================= A/B Compare Runner =================
  async runMatch(
    configAId: string,
    configBId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep?: (msg: string) => void
  ): Promise<BattleMatch> {
    const confA = this.getConfig(configAId);
    const confB = this.getConfig(configBId);
    if (!confA || !confB) throw new Error('配置不存在');

    onStep?.(`[对比评测] 准备对照评测: ${confA.name} VS ${confB.name}`);
    await new Promise((r) => setTimeout(r, 400));

    const resultsA: BattleTrialResult[] = [];
    const resultsB: BattleTrialResult[] = [];
    const tasks = this.getAllTasks().filter((t) => taskIds.includes(t.id));

    let totalSec = 0;
    let totalTokens = 0;

    for (const task of tasks) {
      onStep?.(`[任务评测] 正在对比测试: ${task.title}...`);
      await new Promise((r) => setTimeout(r, 600));

      const scoreA = this.simulateScore(confA, task, channel);
      const scoreB = this.simulateScore(confB, task, channel);

      totalSec += scoreA.secondsUsed + scoreB.secondsUsed;
      totalTokens += scoreA.tokensTotal + scoreB.tokensTotal;

      resultsA.push({
        taskId: task.id,
        taskTitle: task.title,
        configId: confA.id,
        configName: confA.name,
        scores: scoreA,
        status: scoreA.codePassScore >= 60 ? 'passed' : 'failed',
        diffPatch: this.generateSampleDiff(task, confA),
        terminalOutput: this.generateTerminalOutput(task, scoreA),
        aiJudgeReport: this.generateAIJudgeReport(task, confA, scoreA),
        workspacePath: `~/.codex/workspaces/bench-${confA.id.slice(4)}-${task.id}`,
        evidenceTrace: [
          `[执行日志] 注入规则【${confA.name}】，模型: ${confA.baseModel || 'GPT-6 Astra'}，推理档位: ${confA.reasoning}`,
          `[断言检查] ${task.verificationCmd} -> 验证通过`,
          `[消耗] 耗时 ${scoreA.secondsUsed}s | Token: ${scoreA.tokensTotal}`,
        ],
      });

      resultsB.push({
        taskId: task.id,
        taskTitle: task.title,
        configId: confB.id,
        configName: confB.name,
        scores: scoreB,
        status: scoreB.codePassScore >= 60 ? 'passed' : 'failed',
        diffPatch: this.generateSampleDiff(task, confB),
        terminalOutput: this.generateTerminalOutput(task, scoreB),
        aiJudgeReport: this.generateAIJudgeReport(task, confB, scoreB),
        workspacePath: `~/.codex/workspaces/bench-${confB.id.slice(4)}-${task.id}`,
        evidenceTrace: [
          `[执行日志] 注入规则【${confB.name}】，模型: ${confB.baseModel || 'GPT-6 Astra'}，推理档位: ${confB.reasoning}`,
          `[断言检查] ${task.verificationCmd} -> 验证通过`,
          `[消耗] 耗时 ${scoreB.secondsUsed}s | Token: ${scoreB.tokensTotal}`,
        ],
      });
    }

    const avgA =
      Math.round(
        (resultsA.reduce((sum, r) => sum + r.scores.codexIQ, 0) / resultsA.length) * 10
      ) / 10;
    const avgB =
      Math.round(
        (resultsB.reduce((sum, r) => sum + r.scores.codexIQ, 0) / resultsB.length) * 10
      ) / 10;

    const winner = avgA > avgB ? confA.id : avgA < avgB ? confB.id : 'draw';

    // Update config stats
    confA.totalBattles++;
    confB.totalBattles++;
    if (winner === confA.id) {
      confA.winRate = Math.round(((confA.winRate * (confA.totalBattles - 1) + 100) / confA.totalBattles) * 10) / 10;
      confB.winRate = Math.round(((confB.winRate * (confB.totalBattles - 1)) / confB.totalBattles) * 10) / 10;
    } else if (winner === confB.id) {
      confB.winRate = Math.round(((confB.winRate * (confB.totalBattles - 1) + 100) / confB.totalBattles) * 10) / 10;
      confA.winRate = Math.round(((confA.winRate * (confA.totalBattles - 1)) / confA.totalBattles) * 10) / 10;
    }
    confA.iqScore = Math.round(((confA.iqScore * 3 + avgA) / 4) * 10) / 10;
    confB.iqScore = Math.round(((confB.iqScore * 3 + avgB) / 4) * 10) / 10;
    confA.lastTestedAt = '刚刚';
    confB.lastTestedAt = '刚刚';

    const match: BattleMatch = {
      id: `match_${Date.now().toString(36)}`,
      createdAt: new Date().toLocaleString('zh-CN'),
      channel,
      taskIds,
      configAId: confA.id,
      configBId: confB.id,
      resultsA,
      resultsB,
      averageIQA: avgA,
      averageIQB: avgB,
      winnerConfigId: winner,
    };

    this.matches.unshift(match);

    // Save to unified history as well
    const historyRecord: RunHistoryRecord = {
      id: match.id,
      createdAt: match.createdAt,
      runType: 'compare',
      channel,
      configId: confA.id,
      configSnapshot: JSON.parse(JSON.stringify(confA)),
      configBId: confB.id,
      configBSnapshot: JSON.parse(JSON.stringify(confB)),
      taskIds,
      results: resultsA,
      resultsB: resultsB,
      overallScore: avgA,
      overallScoreB: avgB,
      passRate: Math.round((resultsA.filter((r) => r.status === 'passed').length / resultsA.length) * 100),
      totalSeconds: Math.round(totalSec * 10) / 10,
      totalTokens,
      notes: `A/B 对比评测: ${confA.name} (${avgA}分) VS ${confB.name} (${avgB}分)`,
    };
    this.saveHistoryRecord(historyRecord);

    this.persist();
    return match;
  }

  // ================= Realistic Score Simulation =================
  private simulateScore(conf: HarnessConfig, task: BenchmarkTask, channel: TaskChannel): ScoreBreakdown {
    const isHeavy = conf.skills.length >= 4;
    const isDirect = conf.interactiveMode === 'one-shot-direct';
    const isStepByStep = conf.interactiveMode === 'step-by-step-confirm';

    // 1. Code pass score (0 - 100)
    let codePass = 86 + Math.random() * 12;
    if (conf.reasoning === 'xhigh' || conf.reasoning === 'high') codePass += 4;
    if (conf.specialFeatures?.autoSelfTest) codePass += 3;
    codePass = Math.min(100, Math.round(codePass));

    // 2. Directness / Intent score (0 - 100)
    let directness = 88 + Math.random() * 10;
    if (isDirect) directness += 5;
    if (isHeavy) directness -= 18; // heavy wrappers penalize directness
    if (task.difficulty === 'Nightmare') directness -= 6;
    directness = Math.max(35, Math.min(100, Math.round(directness)));

    // 3. Aesthetic / UX quality score (0 - 100)
    let aesthetic = 85 + Math.random() * 12;
    if (task.hasFrontendUI) {
      if (conf.skills.includes('quick-lint') || conf.skills.includes('type-safety')) aesthetic += 3;
    }
    aesthetic = Math.min(100, Math.max(40, Math.round(aesthetic)));

    // 4. Constraint / Maintainability adherence score (0 - 100)
    let constraint = 88;
    if (conf.customConstraints && conf.customConstraints.length > 0) {
      const activeCount = conf.customConstraints.filter((c) => c.isActive).length;
      constraint = 75 + activeCount * 8 + Math.round(Math.random() * 8);
    }
    if (channel === 'interactive-confirm' && isStepByStep) constraint += 8;
    if (isHeavy) constraint -= 14;
    constraint = Math.min(100, Math.max(30, Math.round(constraint)));

    // 5. Robustness / Edge defense score (0 - 100)
    let robustness = Math.round(82 + Math.random() * 14);
    if (isHeavy) robustness -= 8;
    if (task.difficulty === 'Nightmare') robustness -= 10;
    robustness = Math.min(100, Math.max(30, robustness));

    // === 机械客观自动化判断分 (Mechanical Score - 50%) ===
    const buildLint = Math.round(94 + Math.random() * 6);
    const gitPurity = constraint;
    const mechanicalScore = Math.round((codePass * 0.5 + buildLint * 0.25 + gitPurity * 0.25) * 10) / 10;

    // === 人类专家 5 维复审分 (Human Expert Score - 50%) ===
    const intentScore = directness;
    const maintainabilityScore = constraint;
    const robustnessScore = robustness;
    const uxScore = aesthetic;
    const humanScore = Math.round((intentScore * 0.3 + maintainabilityScore * 0.25 + robustnessScore * 0.25 + uxScore * 0.2) * 10) / 10;

    const mergeReadiness: MergeReadinessLevel =
      humanScore >= 90 ? 'ready_to_merge' : humanScore >= 80 ? 'minor_polish' : humanScore >= 60 ? 'major_rework' : 'rejected';

    // 综合加权天梯总成绩 (50% 机械 + 50% 人类专家)
    const overall = Math.round((mechanicalScore * 0.5 + humanScore * 0.5) * 10) / 10;

    const seconds = isHeavy ? Math.round(18 + Math.random() * 8) : Math.round(7 + Math.random() * 5);
    const turns = isStepByStep ? 2 : 1;

    // Rich Telemetry: Input, Output, Reasoning, Prompt Caching
    let reasoningTokens = 0;
    if (conf.reasoning === 'low') reasoningTokens = Math.round(500 + Math.random() * 300);
    else if (conf.reasoning === 'medium') reasoningTokens = Math.round(1600 + Math.random() * 800);
    else if (conf.reasoning === 'high') reasoningTokens = Math.round(4200 + Math.random() * 1500);
    else if (conf.reasoning === 'xhigh') reasoningTokens = Math.round(8500 + Math.random() * 3000);

    const inputTokens = isHeavy ? Math.round(6500 + Math.random() * 3000) : Math.round(2800 + Math.random() * 1200);
    const outputTokens = isHeavy ? Math.round(1600 + Math.random() * 800) : Math.round(650 + Math.random() * 300);
    const cacheHitRate = Math.round((78 + Math.random() * 16) * 10) / 10;
    const cacheReadTokens = Math.round((inputTokens * cacheHitRate) / 100);
    const tokensTotal = inputTokens + outputTokens + reasoningTokens;
    const tokensPerSecond = Math.round((tokensTotal / Math.max(1, seconds)) * 10) / 10;

    return {
      codePassScore: codePass,
      buildLintScore: buildLint,
      gitPurityScore: gitPurity,
      mechanicalScore: mechanicalScore,

      intentScore: intentScore,
      maintainabilityScore: maintainabilityScore,
      robustnessScore: robustnessScore,
      uxScore: uxScore,
      humanScore: humanScore,
      mergeReadiness: mergeReadiness,

      directnessScore: directness,
      aestheticScore: aesthetic,
      constraintScore: constraint,

      overallPercent: overall,
      codexIQ: overall,
      varianceMargin: Math.round((2.0 + Math.random() * 1.5) * 10) / 10,
      turnsUsed: turns,
      secondsUsed: seconds,
      tokensTotal: tokensTotal,
      executionLatencySec: seconds,
      tokensPerSecond: tokensPerSecond,
      tokensDetail: {
        inputTokens,
        outputTokens,
        reasoningTokens,
        cacheReadTokens,
        cacheHitRate,
      },
    };
  }

  // ================= Manual Rating Updates =================
  updateManualRating(
    matchId: string,
    trialIndex: number,
    isConfigA: boolean,
    rating: ManualRatingInput
  ) {
    // Check in matches
    const match = this.matches.find((m) => m.id === matchId);
    if (match) {
      const trial = isConfigA ? match.resultsA[trialIndex] : match.resultsB[trialIndex];
      if (trial) {
        this.applyRatingToTrial(trial, rating, match.channel);
      }
    }

    // Check in unified history
    const historyItem = this.history.find((h) => h.id === matchId);
    if (historyItem) {
      const trial = isConfigA ? historyItem.results[trialIndex] : historyItem.resultsB?.[trialIndex];
      if (trial) {
        this.applyRatingToTrial(trial, rating, historyItem.channel);
      }
      historyItem.overallScore = Math.round(
        (historyItem.results.reduce((s, r) => s + r.scores.codexIQ, 0) / historyItem.results.length) * 10
      ) / 10;
    }

    this.persist();
  }

  private applyRatingToTrial(trial: BattleTrialResult, rating: ManualRatingInput, channel: TaskChannel) {
    const scores = trial.scores;
    const prev = trial.manualRatings;

    // 1. Resolve 4 human dimensions
    const intent =
      rating.intentScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.intentScore)))
        : rating.directnessScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.directnessScore)))
        : scores.intentScore ?? scores.directnessScore ?? 85;

    const maintainability =
      rating.maintainabilityScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.maintainabilityScore)))
        : scores.maintainabilityScore ?? scores.constraintScore ?? 88;

    const robustness =
      rating.robustnessScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.robustnessScore)))
        : scores.robustnessScore ?? 85;

    const ux =
      rating.uxScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.uxScore)))
        : rating.aestheticScore != null
        ? Math.max(0, Math.min(100, Math.round(rating.aestheticScore)))
        : scores.uxScore ?? scores.aestheticScore ?? 85;

    // 2. Human total (30% + 25% + 25% + 20%)
    const humanScore = Math.round((intent * 0.3 + maintainability * 0.25 + robustness * 0.25 + ux * 0.2) * 10) / 10;

    // 3. PR readiness
    const mergeReadiness: MergeReadinessLevel =
      rating.mergeReadiness ||
      (humanScore >= 90 ? 'ready_to_merge' : humanScore >= 80 ? 'minor_polish' : humanScore >= 60 ? 'major_rework' : 'rejected');

    // 4. Mechanical score
    const codePass = scores.codePassScore ?? 90;
    const buildLint = scores.buildLintScore ?? 96;
    const gitPurity = scores.gitPurityScore ?? 92;
    const mechanicalScore = Math.round((codePass * 0.5 + buildLint * 0.25 + gitPurity * 0.25) * 10) / 10;

    // 5. Synthesized Composite Overall Score (50% Mechanical + 50% Human)
    const overall = Math.round((mechanicalScore * 0.5 + humanScore * 0.5) * 10) / 10;

    // Apply back to scores
    scores.codePassScore = codePass;
    scores.buildLintScore = buildLint;
    scores.gitPurityScore = gitPurity;
    scores.mechanicalScore = mechanicalScore;

    scores.intentScore = intent;
    scores.maintainabilityScore = maintainability;
    scores.robustnessScore = robustness;
    scores.uxScore = ux;
    scores.humanScore = humanScore;
    scores.mergeReadiness = mergeReadiness;

    // Legacy sync
    scores.directnessScore = intent;
    scores.aestheticScore = ux;
    scores.constraintScore = maintainability;
    scores.overallPercent = overall;
    scores.codexIQ = overall;

    trial.manualRatings = {
      intentScore: intent,
      maintainabilityScore: maintainability,
      robustnessScore: robustness,
      uxScore: ux,
      mergeReadiness: mergeReadiness,
      aestheticScore: ux,
      directnessScore: intent,
      aestheticStars: Math.round(ux / 20),
      directnessStars: Math.round(intent / 20),
      aestheticNotes: rating.aestheticNotes ?? prev?.aestheticNotes ?? '',
      customChecks: rating.customChecks ?? prev?.customChecks ?? {},
      rubricScores: rating.rubricScores ?? prev?.rubricScores,
    };
  }

  private generateSampleDiff(task: BenchmarkTask, conf: HarnessConfig): string {
    const isHeavy = conf.skills.length >= 4;
    if (task.channel === 'frontend-ui') {
      const bloat = isHeavy
        ? `\n\n--- /dev/null
+++ b/src/helpers/unneeded_logger_wrapper.ts
@@ -0,0 +1,14 @@
+// [冗余封装检测] 无效中间封装类
export class BloatLoggerWrapper {
  static log(msg: string) { console.log('[Trace]', msg); }
}`
        : '';

      return `--- a/src/components/${task.id.slice(0, 8)}.tsx
+++ b/src/components/${task.id.slice(0, 8)}.tsx
@@ -12,4 +12,22 @@
+export const DynamicComponent: React.FC = () => {
+  const [active, setActive] = useState(false);
+  return (
+    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-sm hover:-translate-y-0.5 transition-all">
+      <div className="flex items-center justify-between text-xs font-semibold">
+        <span>${task.title}</span>
+        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
+      </div>
+      <p className="text-xs text-zinc-500 mt-2">自适应主题与无障碍交互手感优化完成</p>
+    </div>
+  );
+};` + bloat;
    }

    if (task.channel === 'deepswe-core') {
      return `--- a/src/core/concurrency_mutex.ts
+++ b/src/core/concurrency_mutex.ts
@@ -34,7 +34,13 @@
-  const tokenRes = await executeRefreshRequest();
-  return tokenRes.accessToken;
+  if (!activeRefreshPromise) {
+    activeRefreshPromise = executeRefreshRequest()
+      .finally(() => { activeRefreshPromise = null; });
+  }
+  const res = await activeRefreshPromise;
+  return res.accessToken;`;
    }

    return `--- a/src/services/contract.ts
+++ b/src/services/contract.ts
@@ -15,3 +15,11 @@
+  // 切中需求要害：仅强化类型边界，绝不重构无关外围逻辑
+  export function executeStrictly(input: unknown): ContractResult {
+    const validated = StrictSchema.parse(input);
+    return processValidated(validated);
+  }`;
  }

  private generateTerminalOutput(task: BenchmarkTask, scores: ScoreBreakdown): string {
    return `$ ${task.verificationCmd}
[SANDBOX RUNNER] Environment: Linux x86_64 · Node v20.12.0 · Python 3.11.8
[EXECUTION TRACE] Running automated deterministic test assertions on isolated branch...
✓ PASS test_suite.py (14 passed, 0 failed, 0 flaky)
✓ Lint & Typecheck: 0 type errors, 0 ESLint warnings
✓ Diff Scope Audit: modified 1 target file (${scores.turnsUsed === 1 ? 'Surgical single-turn' : '2 turns'})
[METRICS] Execution time: ${scores.secondsUsed}s | Peak RAM: 48.2MB | Tokens consumed: ~${scores.tokensTotal}
[SUMMARY] Assertion Result: SUCCESS (exit code 0)`;
  }

  private simulatedErrorType: BattleTrialStatus | null = null;

  setSimulatedError(err: BattleTrialStatus | null) {
    this.simulatedErrorType = err;
  }

  getSimulatedError(): BattleTrialStatus | null {
    return this.simulatedErrorType;
  }

  private generateAIJudgeReport(task: BenchmarkTask, conf: HarnessConfig, scores: ScoreBreakdown): AIJudgeReport {
    const isHeavy = conf.skills.length >= 4;
    const isSurgical = conf.specialFeatures?.antiScopeCreep ?? true;

    const judgeAScore = scores.codexIQ;
    const judgeBScore = Math.min(100, Math.max(0, Math.round(scores.codexIQ + (Math.random() * 4 - 2))));
    const deviation = Math.abs(judgeAScore - judgeBScore);

    return {
      overallScore: scores.codexIQ,
      verdict: scores.codePassScore >= 70 ? 'passed' : 'failed',
      rationale: `【独立裁判 AI 评述】:
1. 代码执行与断言：通过全部客观自动化回归测试，无未捕获异常；
2. 意图切中与精简交付：${
        isHeavy
          ? '检测到生成了多余的包装文件 (unneeded_logger_wrapper.ts)，存在代码冗余倾向，扣除精简交付分。'
          : '首轮切中需求要害，改动精准克制，无任何多余包装文件。'
      }
3. 交互质感与规范：结构优雅清晰，完整遵守了当前配置的个性化约束清单。`,
      rubricBreakdown: {
        '客观自动化断言': scores.codePassScore,
        '意图切中与精简交付': scores.directnessScore,
        '视觉与交互手感': scores.aestheticScore,
        '团队私有约束': scores.constraintScore,
      },
      detectedBloatFiles: isHeavy ? ['unneeded_logger_wrapper.ts'] : [],
      surgicalPrecision: isHeavy ? 'low' : isSurgical ? 'high' : 'medium',
      groundedFacts: {
        astVerified: true,
        filesChangedCount: isHeavy ? 2 : 1,
        consoleErrorsCount: 0,
        linesAdded: isHeavy ? 36 : 14,
        linesRemoved: isHeavy ? 8 : 4,
      },
      judgeConsensus: {
        judgeA: { name: 'Claude-3.7-Judge (Primary)', score: judgeAScore },
        judgeB: { name: 'GPT-6-Judge (Cross-check)', score: judgeBScore },
        deviation,
        confidence: deviation <= 6 ? 'high' : 'medium',
      },
      evidenceQuotes: [
        {
          rubricId: 'surgical_diff',
          lineRef: 'src/components/DynamicComponent.tsx#L12-L22',
          critique: '精准定位组件声明行，受控状态自洽，无全局状态污染。',
        },
        ...(isHeavy
          ? [
              {
                rubricId: 'anti_bloat',
                lineRef: 'src/helpers/unneeded_logger_wrapper.ts#L1-L14',
                critique: '发现未授权新建的无效静态包装 Logger 类，违反零冗余文件约束。',
              },
            ]
          : []),
      ],
    };
  }
}

export const arenaStore = new ArenaStore();
