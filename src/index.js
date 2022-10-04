'use strict';

// electron
const { ipcRenderer } = require('electron');

// scrolling
let scrolling = true;

// mouse out check interval
let mouseOutCheckInterval = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setIPC();
    setEvent();
    setButton();

    ipcRenderer.send('create-chat-room');

    clearInterval(mouseOutCheckInterval);
    mouseOutCheckInterval = setInterval(() => {
        ipcRenderer.send('mouse-out-check');
    }, 100);
});

// set view
function setView() {
    // get config
    const config = ipcRenderer.sendSync('get-config');

    // reset view
    resetView(config);
}

// set IPC
function setIPC() {
    // hide button
    ipcRenderer.on('hide-button', (event, isMouseOut, hideButton) => {
        if (isMouseOut) {
            // hide button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = hideButton;
            });
        } else {
            // show button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = false;
            });

            // show dialog
        }
    });

    // reset view
    ipcRenderer.on('reset-view', (event, ...args) => {
        console.log('reset view');
        resetView(...args);
    });

    // add dialog
    ipcRenderer.on('add-dialog', (event, name, text, nameColor) => {
        addDialog(name, text, nameColor);
    });
}

// set event
function setEvent() {
    // drag
    document.getElementById('img_button_drag').onmousedown = (ev) => {
        ev = ev || window.event;
        ev.preventDefault();

        let clientX = ev.clientX;
        let clientY = ev.clientY;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        document.onmousemove = () => {
            ipcRenderer.send('drag-window', clientX, clientY, windowWidth, windowHeight);
        };

        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
    };
}

// set button
function setButton() {
    document.getElementById('img_button_config').onclick = () => {
        ipcRenderer.send('create-window', 'config');
    };

    document.getElementById('img_button_pause').onclick = () => {
        scrolling = !scrolling;

        if (scrolling) {
            document.getElementById('img_button_pause').setAttribute('src', './img/ui/pause_white_24dp.svg');
            document.getElementById('img_button_pause').setAttribute('title', '暫停');
        } else {
            document.getElementById('img_button_pause').setAttribute('src', './img/ui/play_arrow_white_24dp.svg');
            document.getElementById('img_button_pause').setAttribute('title', '播放');
        }
    };

    document.getElementById('img_button_minimize').onclick = () => {
        ipcRenderer.send('minimize-window');
    };

    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-app');
    };
}

// add dialog
function addDialog(name, text, nameColor) {
    const mainDiv = document.getElementById('div_dialog');
    const div = document.createElement('div');
    const pName = document.createElement('p');
    const spanText = document.createElement('span');

    // set content
    pName.innerHTML = name;
    pName.style.fontWeight = 'bolder';
    nameColor ? (pName.style.color = nameColor) : null;
    spanText.innerHTML = text;

    // set div
    div.id = 'C' + new Date().getTime();
    setStyle(div);
    name !== '' ? div.append(pName) : null;
    div.append(spanText);

    // set main div
    mainDiv.append(div);

    // scroll
    if (scrolling) {
        setTimeout(() => {
            mainDiv.scrollTop = mainDiv.scrollHeight;
        }, 100);
    }
}

// set style
function setStyle(dialog) {
    const config = ipcRenderer.sendSync('get-config');

    dialog.style.color = config.dialog.color;
    dialog.style.fontSize = config.dialog.fontSize + 'rem';
    dialog.style.marginTop = config.dialog.spacing + 'rem';
    dialog.style.borderRadius = config.dialog.radius + 'rem';
    dialog.style.backgroundColor = config.dialog.backgroundColor;
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.indexWindow.alwaysOnTop);

    // set focusable
    ipcRenderer.send('set-focusable', config.indexWindow.focusable);

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        document.getElementById(value.id).hidden = config.indexWindow.hideButton;
    });

    // set dialog
    const dialogs = document.querySelectorAll('#div_dialog div');
    if (dialogs.length > 0) {
        dialogs.forEach((value) => {
            setStyle(document.getElementById(value.id));
        });

        document.getElementById(dialogs[0].id).style.marginTop = '0';
    }

    // show dialog

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.indexWindow.backgroundColor;

    // start/restart mouse out check interval
    clearInterval(mouseOutCheckInterval);
    mouseOutCheckInterval = setInterval(() => {
        ipcRenderer.send('mouse-out-check');
    }, 100);
}
