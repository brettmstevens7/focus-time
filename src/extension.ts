import * as vscode from 'vscode';

import {
	startPomodoroCmd,
  pausePomodoroCmd,
  resetPomodoroCmd,
  pomodoroMetricsCmd,
  pomodoroCmd
} from "./constants";

import {
  handleRunPomodoro,
  handleStartPomodoro,
  handlePausePomodoro,
	handleResetPomodoro,
	handleGetPomodoroMetrics
} from "./pomodoro";

// initialize status bar
let myStatusBarItem: vscode.StatusBarItem;

export function getStatusBarItem() {
	return myStatusBarItem;
}

// initialize event stream
// let eventStream: any[] = [];

export function activate({ subscriptions }: vscode.ExtensionContext) {

	console.log('Focus time activated.');

	subscriptions.push(vscode.commands.registerCommand(startPomodoroCmd, () => {
		handleStartPomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(pausePomodoroCmd, () => {
		handlePausePomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(resetPomodoroCmd, () => {
		handleResetPomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(pomodoroCmd, () => {
		handleRunPomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(pomodoroMetricsCmd, () => {
		handleGetPomodoroMetrics();
	}));

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	subscriptions.push(myStatusBarItem);

	handleRunPomodoro();
	myStatusBarItem.show();

}

export function deactivate() {}
