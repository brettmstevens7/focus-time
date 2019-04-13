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