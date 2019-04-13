import { workspace } from 'vscode';

// preferences
export const INTERVAL_LENGTH_MIN: number | any = workspace.getConfiguration().get("intervalLength");
export const INTERVAL_LENGTH_SEC = INTERVAL_LENGTH_MIN * 60;

// labels
export const RESUME_LABEL = "Resume";
export const RESET_LABEL = "Reset";

// commands
export const startPomodoroCmd = 'extension.startPomodoroCmd';
export const pausePomodoroCmd = 'extension.pausePomodoroCmd';
export const resetPomodoroCmd = 'extension.resetPomodoroCmd';
export const pomodoroCmd = 'extension.PomodoroCmd';
export const pomodoroMetricsCmd = 'extension.getPomodoroMetricsCmd';
export const toggleDoNotDisturbCmd = 'extension.toggleDoNotDisturbCmd';