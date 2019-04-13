import * as vscode from 'vscode';
import { workspace, window, ViewColumn } from 'vscode';

import {
    INTERVAL_LENGTH_MIN,
    INTERVAL_LENGTH_SEC,
    RESUME_LABEL,
	RESET_LABEL,
    startPomodoroCmd,
    pausePomodoroCmd,
    resetPomodoroCmd,
    pomodoroMetricsCmd,
    pomodoroCmd
  } from "./constants";

import { 
	storePayload, 
	createMetrics,
	getMetricsFile 
} from "./util";

import { getStatusBarItem } from "./extension";

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

export function handleRunPomodoro() {
	if (!pomodoroState.running) {
		getStatusBarItem().text = "🍅";
		getStatusBarItem().tooltip = "Start Pomodoro timer";
		getStatusBarItem().command = startPomodoroCmd;
	} else if (pomodoroState.running && !pomodoroState.paused) {
		handleStartPomodoro();
	} else if (pomodoroState.running && pomodoroState.paused) {
		handlePausePomodoro();
	}
}

export function handleStartPomodoro() {
	// update status bar (prevents one second delay)
	getStatusBarItem().text = getStatusBarText(); 

	// start up the timer
	if (!timer) {
		timer = setInterval(setTime, 1000);
	}

	// show info message
	// if (currentWorkTimeSec == 1500){
	// 	vscode.window.showInformationMessage(`Pomodoro timer started`);
	// }

	// update status bar
	getStatusBarItem().command = pausePomodoroCmd;
	getStatusBarItem().tooltip = "Click to pause";

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

export function handlePausePomodoro() {
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
	getStatusBarItem().command = startPomodoroCmd;
	getStatusBarItem().text = "Paused";
	getStatusBarItem().tooltip = "Click to resume";

	// log event
	pomodoroState.paused = true;
	pomodoroState.event = "Paused Pomodoro";
	logPomodoroEvent();
}

export function handleResetPomodoro() {
	// stop the timer
	if (timer) {
		clearInterval(timer);
		timer = null;
	}

	// update status bar
	currentWorkTimeSec = currentWorkTimeMin * 60;
	getStatusBarItem().command = startPomodoroCmd;
	getStatusBarItem().text = "🍅";
	getStatusBarItem().tooltip = "Start Pomodoro timer";

	// log event
	pomodoroState.running = false;
	pomodoroState.event = "Reset Pomodoro";
	logPomodoroEvent();
}

function setTime() {
	currentWorkTimeSec -= 1;
	getStatusBarItem().text = getStatusBarText();
}

function getStatusBarText() {
	let workTimeMinLabel = Math.floor(currentWorkTimeSec/60).toString();
	let workTimeSec = (currentWorkTimeSec - Math.floor(currentWorkTimeSec/60)*60);
	let workTimeSecLabel = workTimeSec.toString();
	if (workTimeSec == 0) {
		workTimeSecLabel = "00";
    }
    let statusBarText = "";
	statusBarText = `⏱${workTimeMinLabel}:${workTimeSecLabel}`;
	return statusBarText;
}

function logPomodoroEvent() {
	// update the remaining seconds and time
	pomodoroState.remaining_seconds = currentWorkTimeSec;
	pomodoroState.time = new Date().toLocaleTimeString();
	//console.log(pomodoroState);

	// push the last event to a new array 
	// eventStream.push(pomodoroState);
	// console.log(eventStream);

	// store the payload as a new row locally
	storePayload(pomodoroState);
}

export function handleGetPomodoroMetrics() {
	// generate the metrics file
	createMetrics();

	// open the metrics file
	let filePath = getMetricsFile();
	workspace.openTextDocument(filePath).then(doc => {
		window.showTextDocument(doc, ViewColumn.One, false);
	});
}