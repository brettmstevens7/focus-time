import * as vscode from 'vscode';
// import { workspace } from 'vscode';

import {
  INTERVAL_LENGTH_MIN,
  INTERVAL_LENGTH_SEC,
  RESUME_LABEL,
  RESET_LABEL
} from "./constants";

// initialize status bar
let myStatusBarItem: vscode.StatusBarItem;
let statusBarText = "";

// set remaining time based on preferences
let currentWorkTimeMin = INTERVAL_LENGTH_MIN;
let currentWorkTimeSec = INTERVAL_LENGTH_SEC;

// initialize timer
let timer: NodeJS.Timer | null = null;

// initialize Pomodoro state
let pomodoroState = {
	event: "Initialized Focus Time",
	running: false, 
	paused: false, 
	remaining_seconds: currentWorkTimeSec,
	cycle: 1,
	time: ""
}

// initialize event stream
let eventStream: any[] = [];

// commands
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

function logPomodoroEvent() {
	// update the remaining seconds and time
	pomodoroState.remaining_seconds = currentWorkTimeSec;
	pomodoroState.time = new Date().toLocaleTimeString();
	//console.log(pomodoroState);

	// push the last event to a new array 
	eventStream.push(pomodoroState);
	console.log(eventStream);
}

function runPomodoro() {
	if (!pomodoroState.running) {
		myStatusBarItem.text = "🍅";
		myStatusBarItem.tooltip = "Start Pomodoro timer";
		myStatusBarItem.command = startPomodoro;
	} else if (pomodoroState.running && !pomodoroState.paused) {
		handleStartPomodoro();
	} else if (pomodoroState.running && pomodoroState.paused) {
		handlePausePomodoro();
	}
}

function handleStartPomodoro() {
	// update status bar (prevents one second delay)
	myStatusBarItem.text = getStatusBarText(); 

	// start up the timer
	if (!timer) {
		timer = setInterval(setTime, 1000);
	}

	// show info message
	// if (currentWorkTimeSec == 1500){
	// 	vscode.window.showInformationMessage(`Pomodoro timer started`);
	// }

	// update status bar
	myStatusBarItem.command = pausePomodoro;
	myStatusBarItem.tooltip = "Click to pause";

	// update state
	pomodoroState.running = true;
	pomodoroState.paused = false;
	if (currentWorkTimeSec == INTERVAL_LENGTH_SEC) {
		pomodoroState.event = "Started Pomodoro";
	} else {
		pomodoroState.event = "Resumed Pomodoro";
	}
	logPomodoroEvent();
}

function handlePausePomodoro() {
	// stop the timer
	if (timer) {
		clearInterval(timer);
		timer = null;
	}

	// create info message
	let statusBarText = getStatusBarText();
	let pauseMsg = `Pomodoro timer paused at ${statusBarText}`;
	vscode.window
    .showInformationMessage(pauseMsg, ...[RESET_LABEL, RESUME_LABEL])
    .then(async selection => {
      if (selection === RESUME_LABEL) {
		  // resume Pomodoro
		  handleStartPomodoro();
      } else if (selection === RESET_LABEL) {
		  // reset Pomdoro
		  handleResetPomodoro();
      } else {
		  // no action
	  }
	});
	
	// update status bar
	myStatusBarItem.command = startPomodoro;
	myStatusBarItem.text = "Paused";
	myStatusBarItem.tooltip = "Click to resume";

	// log event
	pomodoroState.paused = true;
	pomodoroState.event = "Paused Pomodoro";
	logPomodoroEvent();
}

function handleResetPomodoro() {
	// stop the timer
	if (timer) {
		clearInterval(timer);
		timer = null;
	}

	// update status bar
	currentWorkTimeSec = currentWorkTimeMin * 60;
	myStatusBarItem.command = startPomodoro;
	myStatusBarItem.text = "🍅";
	myStatusBarItem.tooltip = "Start Pomodoro timer";

	// log event
	pomodoroState.running = false;
	pomodoroState.event = "Reset Pomodoro";
	logPomodoroEvent();
}

function setTime() {
	currentWorkTimeSec -= 1;
	myStatusBarItem.text = getStatusBarText();
}

function getStatusBarText() {
	let workTimeMinLabel = Math.floor(currentWorkTimeSec/60).toString();
	let workTimeSec = (currentWorkTimeSec - Math.floor(currentWorkTimeSec/60)*60);
	let workTimeSecLabel = workTimeSec.toString();
	if (workTimeSec == 0) {
		workTimeSecLabel = "00";
	}
	statusBarText = `⏱${workTimeMinLabel}:${workTimeSecLabel}`;
	return statusBarText;
}

export function deactivate() {}
