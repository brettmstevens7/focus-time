import * as vscode from 'vscode';

import {
	startPomodoroCmd,
	pausePomodoroCmd,
	resetPomodoroCmd,
	pomodoroMetricsCmd,
	pomodoroCmd,
	toggleDoNotDisturbCmd,
	toggleDarkModeCmd,
	toggleDockPositionCmd,
	toggleDockCmd
} from "./Constants";

import {
  handleRunPomodoro,
  handleStartPomodoro,
  handlePausePomodoro,
	handleResetPomodoro,
	handleGetPomodoroMetrics
} from "./Pomodoro";

import {
	toggleDoNotDisturb,
	toggleDarkMode,
	toggleDockPosition,
	toggleDock
} from "./DesktopNotifications";

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

	subscriptions.push(vscode.commands.registerCommand(toggleDoNotDisturbCmd, () => {
		toggleDoNotDisturb();
	}));

	subscriptions.push(vscode.commands.registerCommand(toggleDarkModeCmd, () => {
		toggleDarkMode();
	}));

	subscriptions.push(vscode.commands.registerCommand(toggleDockPositionCmd, () => {
		toggleDockPosition();
	}));

	subscriptions.push(vscode.commands.registerCommand(toggleDockCmd, () => {
		toggleDock();
	}));

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	subscriptions.push(myStatusBarItem);

	handleRunPomodoro();
	myStatusBarItem.show();

}

export function deactivate() {}
