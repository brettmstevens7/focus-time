import * as vscode from "vscode";
import { workspace, window, ViewColumn } from "vscode";

import {
  INTERVAL_LENGTH_MIN,
  INTERVAL_LENGTH_SEC,
  RESUME_LABEL,
  RESET_LABEL,
  startPomodoroCmd,
  pausePomodoroCmd
} from "./Constants";

import {
  storePayload,
  getDataAsJson,
  viewMetrics,
  getMetricsFile
} from "./Util";

import { getStatusBarItem } from "./extension";

// initialize timer
let timer: NodeJS.Timer | null = null;

// set the initial timer based on preferences
let currentWorkTimeMin = INTERVAL_LENGTH_MIN;
let currentWorkTimeSec = INTERVAL_LENGTH_SEC;

// initialize Pomodoro state
let pomodoroState = {
  event: "Initialized Focus Time",
  running: false,
  paused: false,
  remaining_seconds: currentWorkTimeSec,
  cycle: 1,
	time: "",
	timestamp: Date.now()
};

// main function to control the Pomodoro timer
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

  // log event
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

  // update state
  pomodoroState.paused = true;
  pomodoroState.event = "Paused Pomodoro";

  // log event
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

  // update state
  pomodoroState.running = false;
  pomodoroState.event = "Reset Pomodoro";

  // log event
  logPomodoroEvent();
}

function setTime() {
  currentWorkTimeSec -= 1;
  getStatusBarItem().text = getStatusBarText();
}

function getStatusBarText() {
  let workTimeMinLabel = Math.floor(currentWorkTimeSec / 60).toString();
  let workTimeSec =
    currentWorkTimeSec - Math.floor(currentWorkTimeSec / 60) * 60;
  let workTimeSecLabel = workTimeSec.toString();
  if (workTimeSec == 0) {
    workTimeSecLabel = "00";
  }
  let statusBarText = "";
  statusBarText = `⏱${workTimeMinLabel}:${workTimeSecLabel}`;
  return statusBarText;
}

function logPomodoroEvent() {
  // update the remaining seconds and time before storing the event
	pomodoroState.remaining_seconds = currentWorkTimeSec;
	
	let options = {
    weekday: "short",
    year: "numeric",
    month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZoneName: "short"
	};
	
	pomodoroState.time = new Date().toLocaleTimeString('en-US', options);
	
	// get the unix timestamp in seconds
	let timestamp = Date.now() / 1000; 
	pomodoroState.timestamp = timestamp;

	console.log(timestamp);
	console.log(pomodoroState.time);

  // store the payload as a new row locally
  storePayload(pomodoroState);
}

export async function handleGetPomodoroMetrics() {
	let sessions = 0;
	let total_time = 0;
	
  const events = await getDataAsJson();

  if (events) {
    events.map((num, idx) => {
      let curr = events[idx].event;
      let next;

      // get the next event in the sequence, starting with the latest event
      if (idx < events.length - 1) {
        next = events[idx+1].event;
      } else {
        next = events[idx].event;
      }

      if (curr === "Started Pomodoro" || curr === "Resumed Pomodoro") {
        // increment sessions by 1
        sessions++;
  
        // if the next event is pause, subtract the times and add it to the counter
        if (next === "Paused Pomodoro") {
          total_time += events[idx+1].timestamp - events[idx].timestamp;
        }
      } 
    });
  }

  const output = `You had ${sessions} sessions that lasted ${total_time} seconds.`;

  // generate the metrics file
  viewMetrics(output);

  // open the metrics file
  let filePath = getMetricsFile();
  workspace.openTextDocument(filePath).then(doc => {
    window.showTextDocument(doc, ViewColumn.One, false);
  });
}
