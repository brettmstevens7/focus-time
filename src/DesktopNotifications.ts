import * as vscode from 'vscode';
import { exec } from 'child_process';

const doNotDisturb = require('@sindresorhus/do-not-disturb');

import { isMac } from "./Util";

export async function toggleDoNotDisturb() {
    if (isMac) {
      let isEnabled = await doNotDisturb.isEnabled();
      if (isEnabled) {
        await doNotDisturb.disable();
        vscode.window.showInformationMessage('Do Not Disturb is now disabled');
        console.log("Do not disturb disabled!");
      } else {
        await doNotDisturb.enable();
        vscode.window.showInformationMessage('Do Not Disturb is now enabled');
        console.log("Do not disturb enabled!");
      }
    }

    // Windows
    // Not yet supported

    // Linux
    // Not yet supported
}

export async function toggleDarkMode() {
    let darkModeCmd = `osascript -e \'
        tell application "System Events"
          tell appearance preferences
            set dark mode to not dark mode
          end tell
        end tell \'`;
    
    exec(darkModeCmd);
    console.log("Dark mode enabled!");    
}

// change the position of the dock depending on user input
export async function toggleDockPosition() {
  
  let newPosition = await vscode.window.showInputBox({ placeHolder: 'left, right, or bottom?' });

  function setPosition(position: any) {
    return `osascript -e \'
      tell application "System Events"
        tell dock preferences
          set properties to {screen edge:${position}}
        end tell
      end tell \'`;
    }
  
  if (newPosition) {
    exec(setPosition(newPosition));
    console.log("Dock position updated");
  }
}

// hide and unhide the dock
export async function toggleDock() {
  let toggleDockCmd = `osascript -e \'
    tell application "System Events"
      tell dock preferences
        set x to autohide
        if x is false then
          set properties to {autohide:true}
        else 
          set properties to {autohide:false}
        end if
      end tell
    end tell \'`;
  
  exec(toggleDockCmd);
  console.log("Dock toggled!");
}