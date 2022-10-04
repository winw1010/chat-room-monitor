'use strict';

// electron modules
const { app, ipcMain, screen, globalShortcut, BrowserWindow } = require('electron');

// file module
const fileModule = require('./src/main_modules/file-module');

// config module
const { loadConfig, saveConfig, getDefaultConfig } = require('./src/main_modules/config-module');

// child process
const { exec } = require('child_process');

// window module
const windowModule = require('./src/main_modules/window-module');

// twitch module
const twitchModule = require('./src/main_modules/twitch-module');

// youtube module
const youtubeModule = require('./src/main_modules/youtube-module');

// app version
const appVersion = app.getVersion();

// config
let config = null;

// when ready
app.whenReady().then(() => {
    // start app
    startApp();

    // create index window
    createWindow('index');
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow('index');
    });
});

// on window all closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// function

// start app
function startApp() {
    // disable http cache
    app.commandLine.appendSwitch('disable-http-cache');

    // directory check
    fileModule.directoryCheck();

    // load config
    config = loadConfig();

    // set ipc
    setIPC();

    // set shortcut
    setGlobalShortcut();
}

// set ipc
function setIPC() {
    setSystemChannel();
    setWindowChannel();
    setDragChannel();
    setChatRoomChannel();
}

// set system channel
function setSystemChannel() {
    // get app version
    ipcMain.on('get-version', (event) => {
        event.returnValue = appVersion;
    });

    // close app
    ipcMain.on('close-app', () => {
        app.quit();
    });

    // get config
    ipcMain.on('get-config', (event) => {
        if (!config) {
            config = loadConfig();
        }

        event.returnValue = config;
    });

    // set config
    ipcMain.on('set-config', (event, newConfig) => {
        config = newConfig;
        event.returnValue = config;
    });

    // set default config
    ipcMain.on('set-default-config', (event) => {
        config = getDefaultConfig();
        event.returnValue = config;
    });
}

// set window channel
function setWindowChannel() {
    // create window
    ipcMain.on('create-window', (event, windowName, data = null) => {
        try {
            windowModule.closeWindow(windowName);
        } catch (error) {
            createWindow(windowName, data);
        }
    });

    // minimize window
    ipcMain.on('minimize-window', (event) => {
        try {
            BrowserWindow.fromWebContents(event.sender).minimize();
        } catch (error) {
            console.log(error);
        }
    });

    // close window
    ipcMain.on('close-window', (event) => {
        try {
            BrowserWindow.fromWebContents(event.sender).close();
        } catch (error) {
            console.log(error);
        }
    });

    // always on top
    ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
        } catch (error) {
            console.log(error);
        }
    });

    // set focusable
    ipcMain.on('set-focusable', (event, isFocusable) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setFocusable(isFocusable);
            indexWindow.setAlwaysOnTop(true, 'screen-saver');
        } catch (error) {
            console.log(error);
        }
    });

    // set click through
    ipcMain.on('set-click-through', (event, ignore) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setIgnoreMouseEvents(ignore, { forward: true });
            indexWindow.setResizable(!ignore);
        } catch (error) {
            console.log(error);
        }
    });

    // mouse out check
    ipcMain.on('mouse-out-check', (event) => {
        const cursorScreenPoint = screen.getCursorScreenPoint();
        const windowBounds = BrowserWindow.fromWebContents(event.sender).getBounds();
        const isMouseOut =
            cursorScreenPoint.x < windowBounds.x ||
            cursorScreenPoint.x > windowBounds.x + windowBounds.width ||
            cursorScreenPoint.y < windowBounds.y ||
            cursorScreenPoint.y > windowBounds.y + windowBounds.height;

        event.sender.send('hide-button', isMouseOut, config.indexWindow.hideButton);
    });

    // send index
    ipcMain.on('send-index', (event, channel, ...args) => {
        windowModule.sendIndex(channel, ...args);
    });

    // change UI text
    ipcMain.on('change-ui-text', () => {
        windowModule.forEachWindow((myWindow) => {
            myWindow.webContents.send('change-ui-text');
        });
    });

    // execute command
    ipcMain.on('execute-command', (event, command) => {
        exec(command);
    });
}

function setDragChannel() {
    // drag window
    ipcMain.on('drag-window', (event, clientX, clientY, windowWidth, windowHeight) => {
        try {
            const cursorScreenPoint = screen.getCursorScreenPoint();
            BrowserWindow.fromWebContents(event.sender).setBounds({
                x: cursorScreenPoint.x - clientX,
                y: cursorScreenPoint.y - clientY,
                width: windowWidth,
                height: windowHeight,
            });
        } catch (error) {
            console.log(error);
        }
    });
}

// set chat room channel
function setChatRoomChannel() {
    // create chat room
    ipcMain.on('create-chat-room', () => {
        switch (config.user.type) {
            case 'twitch':
                twitchModule.createChatRoom(config.user.id);
                twitchModule.startFetch();
                break;
            case 'youtube':
                youtubeModule.createChatRoom(config.user.id);
                youtubeModule.startFetch();
                break;

            default:
                break;
        }
    });

    // stop fetch
    ipcMain.on('stop-fetch', () => {
        switch (config.user.type) {
            case 'twitch':
                twitchModule.stopFetch();
                break;
            case 'youtube':
                youtubeModule.stopFetch();
                break;

            default:
                break;
        }
    });
}

// set global shortcut
function setGlobalShortcut() {
    globalShortcut.register('CommandOrControl+F12', () => {
        windowModule.openDevTools();
    });
}

// create window
function createWindow(windowName, data = null) {
    try {
        // get size
        const windowSize = windowModule.getWindowSize(windowName, config);

        // create new window
        const window = new BrowserWindow({
            x: windowSize.x,
            y: windowSize.y,
            width: windowSize.width,
            height: windowSize.height,
            show: false,
            frame: false,
            transparent: true,
            fullscreenable: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                preload: fileModule.getPath(__dirname, 'src', `${windowName}.js`),
            },
        });

        // set always on top
        const alwaysOnTop = windowName !== 'edit';
        window.setAlwaysOnTop(alwaysOnTop, 'screen-saver');

        // set minimizable
        window.setMinimizable(false);

        // show window
        window.once('ready-to-show', () => {
            window.show();
        });

        // send data
        if (data) {
            window.webContents.once('did-finish-load', () => {
                window.webContents.send('send-data', data);
            });
        }

        // save config on closing
        switch (windowName) {
            case 'index':
                // set foucusable
                window.setFocusable(config.indexWindow.focusable);
                window.on('restore', () => {
                    window.setFocusable(config.indexWindow.focusable);
                });
                window.on('minimize', () => {
                    window.setFocusable(true);
                });

                // save position on close
                window.once('close', () => {
                    config.indexWindow.x = window.getPosition()[0];
                    config.indexWindow.y = window.getPosition()[1];

                    // save size
                    config.indexWindow.width = window.getSize()[0];
                    config.indexWindow.height = window.getSize()[1];

                    // save config
                    saveConfig(config);
                });
                break;

            default:
                break;
        }

        // load html
        window.loadFile(fileModule.getPath(__dirname, 'src', `${windowName}.html`));

        // save window
        windowModule.setWindow(windowName, window);
    } catch (error) {
        console.log(error);
    }
}
