const fs = require("fs");
const os = require("os");

export function getDirectory(){
    const homedir = os.homedir();
    let focusTimeDataDir = homedir;

    if (isWindows()) {
        focusTimeDataDir += "\\.focus_time";
    } else {
        focusTimeDataDir += "/.focus_time";
    }

    if (!fs.existsSync(focusTimeDataDir)) {
        fs.mkdirSync(focusTimeDataDir);
    }

    return focusTimeDataDir;
}

export function getDataStoreFile() {
    let file = getDirectory();
    if (isWindows()) {
        file += "\\data.json";
    } else {
        file += "/data.json";
    }
    return file;
}

export function getMetricsFile() {
    let file = getDirectory();
    if (isWindows()) {
        file += "\\metrics.json";
    } else {
        file += "/metrics.json";
    }
    return file;
}

export function storePayload(payload: any) {
    fs.appendFile(
        getDataStoreFile(),
        JSON.stringify(payload) + os.EOL,
        (        err: { message: any; }) => {
            if (err)
                console.log(
                    "Focus Time: error adding event to data store: ",
                    err.message
                );
        }
    );
}

export function createMetrics() {
    //const events = getDataAsJson();

    // CODE TO GENERATE SUMMARY METRICS HERE 

    fs.writeFile(
        getMetricsFile(),
        "We'll show you some cool data soon!",
        (        err: { message: any; }) => {
            if (err)
                console.log(
                    "Focus Time: error adding event to data store: ",
                    err.message
                );
        }
    );
}

export function isMac() {
    return process.platform.indexOf("darwin") !== -1;
}

export function isWindows() {
    return process.platform.indexOf("win32") !== -1;
}

// reads data from local file into an array of JSON objects
export function getDataAsJson() {
    let events: any[] = [];
    const dataStoreFile = getDataStoreFile();

    if (fs.existsSync(dataStoreFile)) {
        const data = fs.readFileSync(dataStoreFile).toString();
        const payloads = data.split(/\r?\n/);
        payloads.map((item: string) => {
            let obj = null;
            if (item.length > 0) {
                try {
                    obj = JSON.parse(item);
                    events.push(obj);
                } catch (e) {
                    console.log("Focus Time: could not parse JSON object.")
                }
            }
        });
    }

    return events ? events : [];
}