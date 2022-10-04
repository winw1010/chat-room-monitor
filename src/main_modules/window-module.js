'use strict';

// electron modules
const { screen } = require('electron');

// window list
let windowList = {
    index: null,
};

// get window size
function getWindowSize(windowName, config) {
    // set default value
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    // get current display bounds
    const displayBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;

    switch (windowName) {
        case 'index': {
            // first time
            if (
                config.indexWindow.x === null ||
                config.indexWindow.y === null ||
                config.indexWindow.width === null ||
                config.indexWindow.height === null
            ) {
                config.indexWindow.x = displayBounds.x + parseInt(displayBounds.width * 0.7);
                config.indexWindow.y = displayBounds.y + parseInt(displayBounds.height * 0.2);
                config.indexWindow.width = parseInt(displayBounds.width * 0.2);
                config.indexWindow.height = parseInt(displayBounds.height * 0.6);
            }

            x = config.indexWindow.x;
            y = config.indexWindow.y;
            width = config.indexWindow.width;
            height = config.indexWindow.height;
            break;
        }

        case 'config': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.22);
            height = parseInt(displayBounds.height * 0.65);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        default:
            break;
    }

    return {
        x: x >= displayBounds.x && x < displayBounds.x + displayBounds.width ? x : displayBounds.x,
        y: y >= displayBounds.y && y < displayBounds.y + displayBounds.height ? y : displayBounds.y,
        width: width,
        height: height,
    };

    function getNearX(indexBounds, width) {
        return indexBounds.x - width > displayBounds.x ? indexBounds.x - width : indexBounds.x + indexBounds.width;
    }

    function getNearY(indexBounds, height) {
        return indexBounds.y + height > displayBounds.y + displayBounds.height
            ? displayBounds.y + displayBounds.height - height
            : indexBounds.y;
    }
}

// set window
function setWindow(windowName, myWindow) {
    windowList[windowName] = myWindow;
}

// get window
function getWindow(windowName) {
    return windowList[windowName];
}

// close window
function closeWindow(windowName) {
    windowList[windowName].close();
    windowList[windowName] = null;
}

// send window
function sendWindow(windowName, channel, ...args) {
    windowList[windowName]?.webContents?.send(channel, ...args);
}

// send index
function sendIndex(channel, ...args) {
    windowList['index']?.webContents?.send(channel, ...args);
}

// for each window
function forEachWindow(callback = () => {}) {
    const windowNames = Object.getOwnPropertyNames(windowList);
    windowNames.forEach((windowName) => {
        try {
            callback(windowList[windowName]);
        } catch (error) {
            //console.log(windowName, error);
        }
    });
}

// open DevTools
function openDevTools() {
    if (windowList['index']?.webContents?.isDevToolsOpened()) {
        windowList['index']?.webContents?.closeDevTools();
    } else {
        windowList['index']?.webContents?.openDevTools({ mode: 'detach' });
    }
}

// module exports
module.exports = {
    getWindowSize,
    setWindow,
    getWindow,
    closeWindow,
    sendWindow,
    sendIndex,
    forEachWindow,
    openDevTools,
};
