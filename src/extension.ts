import * as vscode from 'vscode';
import { HcfChatPanel } from './chatPanel';
import { PomodoroTimer } from './pomodoro';
import { IdleWatcher } from './idleWatcher';
import { StatsTracker } from './stats';
import {
  getOpening, getWorkLine, getEncourageLine, getJudgment,
  getFocusStart, getFocusEnd, getBreakRemind, getBreakEnd,
  getFinale, getIdleRemind, getTimeBasedGreeting,
  getSharpLine, getCityRule, getNickname,
} from './persona';
import { generateResponse, analyzeCodeProblems, CODE_ANALYSIS_KEYWORDS } from './dynamicReply';
import { updateStyleConfig, PersonaMode } from './styleConfig';

export function activate(context: vscode.ExtensionContext): void {
    const syncStyleConfig = (): void => {
      const cfg = vscode.workspace.getConfiguration('hcf');
      updateStyleConfig({
        mode: cfg.get<PersonaMode>('personaMode', 'standard'),
        safeMode: cfg.get<boolean>('safeMode', true),
      });
    };
    syncStyleConfig();

  const panel = new HcfChatPanel(context.extensionUri);
  const pomodoro = new PomodoroTimer();
  const stats = new StatsTracker(context.globalState);

  const idleWatcher = new IdleWatcher(() => panel.addBotMessage(getIdleRemind()));

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '🎯 户晨风';
  statusBar.tooltip = '户晨风工作陪伴';
  statusBar.command = 'hcf.openStage';
  const show = vscode.workspace.getConfiguration('hcf').get<boolean>('enableStatusBar', true);
  if (show) statusBar.show();
  context.subscriptions.push(statusBar);

  context.subscriptions.push(vscode.window.registerWebviewViewProvider(HcfChatPanel.viewType, panel));

  panel.setOnUserMessage((text) => {
    stats.recordMessage();
    panel.updateStats(stats.current);
    idleWatcher.reset();

    const lower = text.toLowerCase();
    if (CODE_ANALYSIS_KEYWORDS.some((k) => lower.includes(k))) {
      panel.addBotMessage(analyzeCodeProblems());
      return;
    }
    panel.addBotMessage(generateResponse(text));
  });

  const welcomed = context.globalState.get<boolean>('hcf.welcomed', false);
  if (!welcomed) {
    panel.addBotMessage('欢迎来到户晨风对焦室。先对焦，再推进。');
    panel.addBotMessage('📌 提示：\n• 在面板聊天\n• 命令面板搜索“户晨风”\n• 用番茄钟推进关键任务\n• 说“检查代码”做体检');
    panel.addBotMessage('准备好了就开麦。');
    void context.globalState.update('hcf.welcomed', true);
  } else {
    panel.addBotMessage(getTimeBasedGreeting());
  }

  panel.updateStats(stats.current);

  context.subscriptions.push(
    vscode.commands.registerCommand('hcf.openStage', () => {
      const msg = getOpening();
      panel.addBotMessage(msg);
      panel.addBotMessage(getTimeBasedGreeting());
      void vscode.window.showInformationMessage(`🎯 户晨风：${msg}`);
    }),

    vscode.commands.registerCommand('hcf.startPomodoro', () => {
      if (pomodoro.isRunning) { panel.addBotMessage('番茄钟已经在跑，先把这一轮做完。'); return; }
      const minutes = vscode.workspace.getConfiguration('hcf').get<number>('pomodoroMinutes', 25);
      panel.addBotMessage(getFocusStart(minutes));
      pomodoro.start(minutes, (phase) => {
        switch (phase) {
          case 'focus-end': panel.addBotMessage(getFocusEnd()); stats.recordPomodoro(); panel.updateStats(stats.current); break;
          case 'break-start': panel.addBotMessage(getBreakRemind()); break;
          case 'break-end': panel.addBotMessage(getBreakEnd()); break;
        }
      });
    }),

    vscode.commands.registerCommand('hcf.stopPomodoro', () => {
      if (!pomodoro.isRunning) { panel.addBotMessage('番茄钟还没开始。'); return; }
      pomodoro.stop();
      panel.addBotMessage('番茄钟已提前结束。');
    }),

    vscode.commands.registerCommand('hcf.encourageMe', () => {
      const msg = getEncourageLine();
      panel.addBotMessage(msg);
      void vscode.window.showInformationMessage(`🎯 户晨风：${msg}`);
    }),

    vscode.commands.registerCommand('hcf.reviewWork', () => {
      const diagnostics = vscode.languages.getDiagnostics();
      const issues: string[] = [];
      for (const [uri, diags] of diagnostics) {
        for (const d of diags) {
          if (d.severity === vscode.DiagnosticSeverity.Error) {
            issues.push(`${vscode.workspace.asRelativePath(uri)}:${d.range.start.line + 1} — ${d.message}`);
          }
        }
      }
      const top = issues.slice(0, 10);
      if (issues.length > 10) top.push(`……以及另外 ${issues.length - 10} 项问题。`);
      panel.addBotMessage(getJudgment(top));
      void vscode.window.showInformationMessage(`🎯 户晨风体检：发现 ${issues.length} 项错误`);
    }),

    vscode.commands.registerCommand('hcf.finale', () => {
      const msg = getFinale(pomodoro.completedCount);
      panel.addBotMessage(msg);
      pomodoro.stop();
      void vscode.window.showInformationMessage(`🎯 户晨风：${msg}`);
    }),

    vscode.commands.registerCommand('hcf.sharpLine', () => panel.addBotMessage(getSharpLine())),
    vscode.commands.registerCommand('hcf.cityRule', () => panel.addBotMessage(getCityRule())),
    vscode.commands.registerCommand('hcf.nickname', () => panel.addBotMessage(getNickname())),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('hcf.personaMode') || e.affectsConfiguration('hcf.safeMode')) {
        syncStyleConfig();
      }
    }),

    vscode.workspace.onDidSaveTextDocument(() => {
      stats.recordSave();
      panel.updateStats(stats.current);
      idleWatcher.reset();
      if (stats.current.todaySaves % 10 === 0) panel.addBotMessage(getWorkLine());
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => idleWatcher.reset()),
    vscode.window.onDidChangeActiveTextEditor(() => idleWatcher.reset()),
  );

  context.subscriptions.push({ dispose() { pomodoro.dispose(); idleWatcher.dispose(); } });
}

export function deactivate(): void { }
