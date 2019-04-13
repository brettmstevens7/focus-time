const doNotDisturb = require('@sindresorhus/do-not-disturb');

import { isMac } from "./Util";

export async function toggleDoNotDisturb() {
    if (isMac) {
      let isEnabled = await doNotDisturb.isEnabled();
      if (isEnabled) {
        await doNotDisturb.disable();
        console.log("Disabled!");
      } else {
        await doNotDisturb.enable();
        console.log("Enabled!)");
      }
    }

    // Windows
    // Not yet supported

    // Linux
    // Not yet supported
}

export async function toggleDarkMode() {
// TBD
}