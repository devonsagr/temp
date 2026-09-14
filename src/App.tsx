import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { ArenaHeader, ArenaTab } from './components/ArenaHeader';
import { LeaderboardView } from './views/LeaderboardView';
import { ConfigArenaView } from './views/ConfigArenaView';
import { BenchmarkRunnerView } from './views/BenchmarkRunnerView';
import { ScoringGuideView } from './views/ScoringGuideView';
import { RunHistoryView } from './views/RunHistoryView';
import { TaskBankView } from './views/TaskBankView';
import { arenaStore } from './services/arenaStore';
import { HarnessConfig, BattleMatch, TaskChannel, RunHistoryRecord, BenchmarkTask, ManualRatingInput } from './types/arena';

// Robust Error Boundary to guarantee screen is NEVER pure black
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || String(error) };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Frontend runtime crash intercepted:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 flex items-center justify-center p-6">
          <div className="panel p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">组件渲染异常拦截</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono break-all bg-slate-100 dark:bg-zinc-800 p-3 rounded-xl">
              {this.state.error}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="btn-primary"
            >
              重置缓存并重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ArenaTab>('workbench');

  // Theme state: defaults to 'light' per user requirement
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('chb_theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chb_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Synchronous store data initialization
  const [configs, setConfigs] = useState<HarnessConfig[]>(() => arenaStore.getConfigs());
  const [tasks, setTasks] = useState<BenchmarkTask[]>(() => arenaStore.getAllTasks());
  const [history, setHistory] = useState<RunHistoryRecord[]>(() => arenaStore.getHistory());
  const [targetConfigId, setTargetConfigId] = useState<string | undefined>();

  const refreshData = () => {
    setConfigs(arenaStore.getConfigs());
    setTasks(arenaStore.getAllTasks());
    setHistory(arenaStore.getHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSelectBattle = (configId: string) => {
    setTargetConfigId(configId);
    setActiveTab('workbench');
  };

  const handleViewConfig = (configId: string) => {
    setTargetConfigId(configId);
    setActiveTab('configs');
  };

  const handleSaveConfig = (config: HarnessConfig) => {
    arenaStore.saveConfig(config);
    refreshData();
  };

  const handleDeleteConfig = (id: string) => {
    arenaStore.deleteConfig(id);
    refreshData();
  };

  const handleRunSingle = async (
    configId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep: (msg: string) => void
  ): Promise<RunHistoryRecord> => {
    const rec = await arenaStore.runSingleBenchmark(configId, taskIds, channel, onStep);
    refreshData();
    return rec;
  };

  const handleRunMatch = async (
    configAId: string,
    configBId: string,
    taskIds: string[],
    channel: TaskChannel,
    onStep: (msg: string) => void
  ): Promise<BattleMatch> => {
    const match = await arenaStore.runMatch(configAId, configBId, taskIds, channel, onStep);
    refreshData();
    return match;
  };

  const handleSaveManualRating = (
    matchId: string,
    trialIndex: number,
    isConfigA: boolean,
    rating: ManualRatingInput
  ) => {
    arenaStore.updateManualRating(matchId, trialIndex, isConfigA, rating);
    refreshData();
  };

  const handleAddTask = (newTask: BenchmarkTask) => {
    arenaStore.addCustomTask(newTask);
    refreshData();
  };

  const handleSelectTaskForRun = (taskId: string, channel: TaskChannel) => {
    setActiveTab('workbench');
  };

  const handleRerun = (configId: string, channel: any) => {
    setTargetConfigId(configId);
    setActiveTab('workbench');
  };

  const handleDeleteHistory = (id: string) => {
    arenaStore.deleteHistoryRecord(id);
    refreshData();
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有评测历史与配置快照记录吗？')) {
      arenaStore.clearHistory();
      refreshData();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white transition-colors duration-200">
        <ArenaHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 md:p-8">
          {activeTab === 'workbench' && (
            <BenchmarkRunnerView
              configs={configs}
              tasks={tasks}
              initialConfigAId={targetConfigId}
              onRunSingle={handleRunSingle}
              onRunMatch={handleRunMatch}
              onSaveManualRating={handleSaveManualRating}
            />
          )}

          {activeTab === 'history' && (
            <RunHistoryView
              history={history}
              onRerun={handleRerun}
              onDeleteRecord={handleDeleteHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBankView
              tasks={tasks}
              onAddTask={handleAddTask}
              onSelectForRun={handleSelectTaskForRun}
            />
          )}

          {activeTab === 'configs' && (
            <ConfigArenaView
              configs={configs}
              selectedId={targetConfigId}
              onSaveConfig={handleSaveConfig}
              onDeleteConfig={handleDeleteConfig}
              onStartBattleWith={handleSelectBattle}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              configs={configs}
              onSelectBattle={handleSelectBattle}
              onViewConfig={handleViewConfig}
            />
          )}

          {activeTab === 'spec' && <ScoringGuideView />}
        </main>

        <footer className="py-4 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-[#121215] text-center text-xs text-slate-500 dark:text-zinc-500">
          CODEX HARNESS BENCHMARK · 本地开源评测基准 · 统一 100 分制多维量化
        </footer>
      </div>
    </ErrorBoundary>
  );
};
