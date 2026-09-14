export type ReasoningLevel = 'none' | 'low' | 'medium' | 'high' | 'xhigh';

export interface CustomConstraint {
  id: string;
  title: string;
  category: 'file-hygiene' | 'interaction-gate' | 'sync-hook' | 'scope-control' | 'custom-script';
  ruleDesc: string;
  weightPoints: number; // 扣减或奖励分 (如 15 分)
  isActive: boolean;
}

export interface HarnessConfig {
  id: string;
  name: string;
  baseModel: string;    // 具体模型: 如 5.6 (Solluna), Terra-v2, GPT-6 Astra, Claude-3.7 Sonnet 等
  tagline: string;
  author: string;
  agentsPrompt: string;
  skills: string[];
  reasoning: ReasoningLevel;
  interactiveMode: 'one-shot-direct' | 'step-by-step-confirm' | 'adaptive';
  customConstraints?: CustomConstraint[];
  specialFeatures?: {
    antiScopeCreep?: boolean;
    autoSelfTest?: boolean;
    [key: string]: boolean | undefined;
  };
  iqScore: number;      // 0-100 综合基准得分
  winRate: number;
  totalBattles: number;
  lastTestedAt: string;
}

export type TaskChannel = 'frontend-ui' | 'deepswe-core' | 'architecture-constraint' | 'interactive-confirm';

export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Nightmare' | 'L1-入门' | 'L2-中等' | 'L3-专家';

export type TaskParadigm = 'deterministic-bugfix' | 'open-ended-project';

export interface TaskRubricItem {
  id: string;
  label: string;
  maxPoints: number;
  desc: string;
}

export interface MultiTurnStage {
  stageIndex: number;
  title: string;
  prompt: string;
  stageAssertionCmd: string;
  status?: 'pending' | 'running' | 'passed' | 'failed';
}

export interface ProjectSpecContract {
  userStories: string[];        // 核心业务场景与用户故事链路
  apiEndpoints?: string[];      // 前后端接口契约 (如 POST /api/v1/tasks)
  dataModel?: string[];         // 数据持久化模型或 Schema 定义
  acceptanceCriteria: string[]; // 客观验收门禁标准
  techStack?: string;           // 推荐或约束的技术栈
}

export interface BenchmarkTask {
  id: string;
  channel: TaskChannel;
  title: string;
  difficulty: TaskDifficulty;
  taskParadigm: TaskParadigm;  // 区分：确定性 Bug 修复 vs 开放性项目构建
  fullstackScope?: 'frontend-only' | 'fullstack-node' | 'fullstack-sqlite' | 'frontend-mockapi';
  projectSpec?: ProjectSpecContract; // 项目构建轨专属：产品与技术规范书
  sourceRepo: string;
  description: string;
  inputPrompt: string;         // 给 Agent 执行的真实输入指令
  hasFrontendUI: boolean;
  expectedTurns: number;
  verificationCmd: string;
  multiTurnStages?: MultiTurnStage[]; // 多阶段分步执行流
  evaluationRubric?: string[]; // 评分准则与关键断言点
  rubrics?: TaskRubricItem[];  // 精细多维打分量表
  customChecklist: {
    key: string;
    label: string;
    points: number;
  }[];
}

export interface TokensDetail {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;     // 思考/推演 Token
  cacheReadTokens: number;     // 缓存命中读取 Token
  cacheHitRate: number;        // 提示词缓存命中率 (例如 82.5%)
}

export interface ScoreBreakdown {
  codePassScore: number;       // 0-100 客观自动化代码通过率
  directnessScore: number;     // 0-100 直击效率分（轮数少、耗时短、直达核心）
  aestheticScore: number;      // 0-100 前端交互与视觉手感分（支持手动或视觉评估）
  constraintScore: number;     // 0-100 约束遵从分（如未改动无关代码、遵循团队私有约束）
  overallPercent: number;      // 0-100% 加权综合得分
  codexIQ: number;             // 0-100 综合基准得分
  varianceMargin: number;      // 采样方差误差范围 (例如 ±3.2 分)
  turnsUsed: number;
  secondsUsed: number;
  tokensTotal: number;
  // 深度 Telemetry 遥测字段
  executionLatencySec?: number;
  tokensPerSecond?: number;
  tokensDetail?: TokensDetail;
}

export interface ManualRatingData {
  aestheticScore?: number;   // 0-100 精细打分 (连续数值)
  directnessScore?: number;  // 0-100 精细打分 (连续数值)
  aestheticStars?: number;   // 1-5 星 (辅助展示)
  directnessStars?: number;  // 1-5 星 (辅助展示)
  aestheticNotes: string;    // 手动评测备注文档
  customChecks: Record<string, boolean>; // 个性化架构与约束核验
  rubricScores?: Record<string, number>; // 逐项细则打分
}

export interface GroundedFacts {
  astVerified: boolean;
  filesChangedCount: number;
  consoleErrorsCount: number;
  linesAdded: number;
  linesRemoved: number;
}

export interface JudgeConsensus {
  judgeA: { name: string; score: number };
  judgeB: { name: string; score: number };
  deviation: number;
  confidence: 'high' | 'medium' | 'disputed';
}

export interface AIJudgeReport {
  overallScore: number;
  verdict: 'passed' | 'failed' | 'flawed';
  rationale: string;
  rubricBreakdown: Record<string, number>;
  detectedBloatFiles?: string[];
  surgicalPrecision: 'high' | 'medium' | 'low';
  groundedFacts?: GroundedFacts;       // AST 与 DOM 提取的客观事实指纹
  judgeConsensus?: JudgeConsensus;     // 双裁判共识比对
  evidenceQuotes?: { rubricId: string; lineRef: string; critique: string }[]; // 扣分代码行证据
}

export type BattleTrialStatus =
  | 'passed'
  | 'failed'
  | 'interrupted'
  | 'rate_limit_429'
  | 'quota_exhausted'
  | 'context_overflow'
  | 'timeout'
  | 'sandbox_crash';

export interface BattleTrialResult {
  taskId: string;
  taskTitle: string;
  configId: string;
  configName: string;
  scores: ScoreBreakdown;
  manualRatings?: ManualRatingData;
  status: BattleTrialStatus;
  errorDetails?: {
    code: string;
    message: string;
    suggestedFix: string;
  };
  evidenceTrace: string[];
  diffPatch?: string;          // 真实代码变更 Diff
  terminalOutput?: string;     // 终端执行输出日志
  aiJudgeReport?: AIJudgeReport; // 独立裁判 AI 的判定报告
  workspacePath?: string;      // 隔离工作区路径
}

export interface ChannelFormulaSpec {
  channel: TaskChannel;
  title: string;
  categoryDesc: string;
  formulaText: string;
  weights: {
    key: 'codePass' | 'directness' | 'aesthetic' | 'constraint';
    label: string;
    weight: number; // e.g. 0.35
    percentText: string;
    desc: string;
    isManualSupported?: boolean;
  }[];
}

export interface WeightPreset {
  id: string;
  name: string;
  tag: string;
  desc: string;
  weights: {
    codePass: number;
    directness: number;
    aesthetic: number;
    constraint: number;
  };
}

export interface BattleMatch {
  id: string;
  createdAt: string;
  channel: TaskChannel;
  taskIds: string[];
  configAId: string;
  configBId: string;
  resultsA: BattleTrialResult[];
  resultsB: BattleTrialResult[];
  averageIQA: number;
  averageIQB: number;
  winnerConfigId: string | 'draw';
}

/**
 * 完整评测运行历史记录（保存评测时刻的完整配置快照）
 */
export interface RunHistoryRecord {
  id: string;
  createdAt: string;
  runType: 'single' | 'compare';
  channel: TaskChannel;
  configId: string;
  configSnapshot: HarnessConfig;
  configBId?: string;
  configBSnapshot?: HarnessConfig;
  taskIds: string[];
  results: BattleTrialResult[];
  resultsB?: BattleTrialResult[];
  overallScore: number;
  overallScoreB?: number;
  passRate: number;
  totalSeconds: number;
  totalTokens: number;
  notes?: string;
}


