import * as vscode from 'vscode';
import { workspace } from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;

let intervalLengthMin : number | any = workspace.getConfiguration().get("intervalLength");

let currentWorkTimeMin = intervalLengthMin;
let currentWorkTimeSec = intervalLengthMin * 60;
let statusBarText = "";
let paused = false;
let running = false;
let timer: NodeJS.Timer | null = null;

const startPomodoro = 'extension.startPomodoro';
const pausePomodoro = 'extension.pausePomodoro';
const resetPomodoro = 'extension.resetPomodoro';
const Pomodoro = 'extension.Pomodoro';

export function activate({ subscriptions }: vscode.ExtensionContext) {

	console.log('Focus time activated.');

	subscriptions.push(vscode.commands.registerCommand(startPomodoro, () => {
		handleStartPomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(pausePomodoro, () => {
		handlePausePomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(resetPomodoro, () => {
		handleResetPomodoro();
	}));

	subscriptions.push(vscode.commands.registerCommand(Pomodoro, () => {
		runPomodoro();
	}));

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	subscriptions.push(myStatusBarItem);

	runPomodoro();
	myStatusBarItem.show();

}

function runPomodoro() {
	if (running == false) {
		myStatusBarItem.text = "Start";
		myStatusBarItem.tooltip = "Start Pomodoro timer";
		myStatusBarItem.command = startPomodoro;
	} else if (running && paused == false) {
		handleStartPomodoro();
	} else if (running && paused == true) {
		handlePausePomodoro();
	}
}

function handleStartPomodoro() {
	if (!timer) {
		timer = setInterval(setTime, 1000);
	}
	vscode.window.showInformationMessage(`Pomodoro timer set`);
	myStatusBarItem.command = pausePomodoro;
	myStatusBarItem.tooltip = "Click to start";
}

function handlePausePomodoro() {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
	vscode.window.showInformationMessage(`Pomodoro timer paused`);
	myStatusBarItem.command = startPomodoro;
	myStatusBarItem.text = "Paused";
	myStatusBarItem.tooltip = "Click to resume";
}

function handleResetPomodoro() {
	if (timer) {
		clearInterval(timer);
		timer = null;
		currentWorkTimeSec = currentWorkTimeMin * 60;
	}
}

function setTime() {
	currentWorkTimeSec -= 1;
	myStatusBarItem.text = showStatusBar();
}

function showStatusBar() {
	let workTimeMinLabel = Math.floor(currentWorkTimeSec/60).toString();
	let workTimeSecLabel = (currentWorkTimeSec - Math.floor(currentWorkTimeSec/60)*60).toString();
	statusBarText = `⏱${workTimeMinLabel}:${workTimeSecLabel}`;
	return statusBarText;
}


export function deactivate() {}
