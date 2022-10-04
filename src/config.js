'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setEvent();
    setIPC();
    setButton();
});

// set view
function setView() {
    showConfig();
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

    // background color
    document.getElementById('color_background_color').oninput = () => {
        document.getElementById('span_background_color').innerText = document
            .getElementById('color_background_color')
            .value.toString()
            .toUpperCase();
    };

    // background transparency
    document.getElementById('range_background_transparency').oninput = () => {
        document.getElementById('span_background_transparency').innerText = document.getElementById(
            'range_background_transparency'
        ).value;
    };

    // dialog color
    document.getElementById('color_dialog_color').oninput = () => {
        document.getElementById('span_dialog_color').innerText = document
            .getElementById('color_dialog_color')
            .value.toString()
            .toUpperCase();
    };

    // dialog transparency
    document.getElementById('range_dialog_transparency').oninput = () => {
        document.getElementById('span_dialog_transparency').innerText = document.getElementById(
            'range_dialog_transparency'
        ).value;
    };
}

// set IPC
function setIPC() {
    ipcRenderer.on('send-data', (event, elements) => {
        document.getElementById(elements[0]).checked = true;

        document.querySelectorAll('.setting_page').forEach((value) => {
            document.getElementById(value.id).hidden = true;
        });
        document.getElementById(elements[1]).hidden = false;
    });
}

// set button
function setButton() {
    // page
    document.getElementById('button_radio_window').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            document.getElementById(value.id).hidden = true;
        });
        document.getElementById('div_window').hidden = false;
    };

    document.getElementById('button_radio_font').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            document.getElementById(value.id).hidden = true;
        });
        document.getElementById('div_font').hidden = false;
    };

    document.getElementById('button_radio_about').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            document.getElementById(value.id).hidden = true;
        });
        document.getElementById('div_about').hidden = false;
    };

    // upper
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // bug report
    document.getElementById('a_bug_report').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
    };

    // github
    document.getElementById('a_github').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-helper-node-v2"');
    };

    // bahamut
    document.getElementById('a_bahamut').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
    };

    // donate
    document.getElementById('a_donate').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://www.patreon.com/user?u=8274441"');
    };

    // lower
    // default
    document.getElementById('button_save_default_config').onclick = () => {
        saveDefaultConfig();
    };

    // save
    document.getElementById('button_save_config').onclick = () => {
        saveConfig();
    };
}

// get config
function showConfig() {
    const config = ipcRenderer.sendSync('get-config');
    const version = ipcRenderer.sendSync('get-version');

    // window
    document.getElementById('checkbox_top').checked = config.indexWindow.alwaysOnTop;

    document.getElementById('checkbox_focusable').checked = config.indexWindow.focusable;

    document.getElementById('checkbox_hide_button').checked = config.indexWindow.hideButton;

    document.getElementById('checkbox_hide_dialog').checked = config.indexWindow.hideDialog;
    document.getElementById('input_hide_dialog').value = config.indexWindow.hideDialogTimeout;

    document.getElementById('span_background_color').innerText = config.indexWindow.backgroundColor.slice(0, 7);
    document.getElementById('color_background_color').value = config.indexWindow.backgroundColor.slice(0, 7);

    document.getElementById('span_background_transparency').innerText = parseInt(
        config.indexWindow.backgroundColor.slice(7),
        16
    );
    document.getElementById('range_background_transparency').value = parseInt(
        config.indexWindow.backgroundColor.slice(7),
        16
    );

    // font
    document.getElementById('input_font_size').value = config.dialog.fontSize;

    document.getElementById('input_dialog_spacing').value = config.dialog.spacing;

    document.getElementById('input_dialog_radius').value = config.dialog.radius;

    document.getElementById('span_dialog_color').innerText = config.dialog.backgroundColor.slice(0, 7);
    document.getElementById('color_dialog_color').value = config.dialog.backgroundColor.slice(0, 7);

    document.getElementById('span_dialog_transparency').innerText = parseInt(
        config.dialog.backgroundColor.slice(7),
        16
    );
    document.getElementById('range_dialog_transparency').value = parseInt(config.dialog.backgroundColor.slice(7), 16);

    // about
    document.getElementById('span_version').innerText = version;
}

// save config
function saveConfig() {
    let config = ipcRenderer.sendSync('get-config');

    // window
    config.indexWindow.alwaysOnTop = document.getElementById('checkbox_top').checked;

    config.indexWindow.focusable = document.getElementById('checkbox_focusable').checked;

    config.indexWindow.hideButton = document.getElementById('checkbox_hide_button').checked;

    config.indexWindow.hideDialog = document.getElementById('checkbox_hide_dialog').checked;
    config.indexWindow.hideDialogTimeout = parseInt(document.getElementById('input_hide_dialog').value);

    config.indexWindow.backgroundColor = document
        .getElementById('color_background_color')
        .value.toString()
        .toUpperCase();

    let pt = parseInt(document.getElementById('range_background_transparency').value).toString(16).toUpperCase();
    config.indexWindow.backgroundColor += '' + pt.length < 2 ? '0' + '' + pt : pt;

    // font
    config.dialog.fontSize = document.getElementById('input_font_size').value;

    config.dialog.spacing = document.getElementById('input_dialog_spacing').value;

    config.dialog.radius = document.getElementById('input_dialog_radius').value;

    config.dialog.backgroundColor = document.getElementById('color_dialog_color').value.toString().toUpperCase();

    let dt = parseInt(document.getElementById('range_dialog_transparency').value).toString(16).toUpperCase();
    config.dialog.backgroundColor += '' + dt.length < 2 ? '0' + '' + dt : dt;

    // set config
    ipcRenderer.sendSync('set-config', config);

    // reset view
    ipcRenderer.send('send-index', 'reset-view', config);

    // change UI text
    ipcRenderer.send('change-ui-text');

    // notification
    ipcRenderer.send('send-index', 'show-notification', '設定已儲存');
}

// save default config
function saveDefaultConfig() {
    // set default config
    const config = ipcRenderer.sendSync('set-default-config');

    // reset config
    showConfig();

    // reset view
    ipcRenderer.send('send-index', 'reset-view', config);

    // change UI text
    ipcRenderer.send('change-ui-text');
}
