'use strict';

// electron
const { ipcRenderer } = require('electron');

function setDragElement(element) {
    let clientX = 0,
        clientY = 0,
        windowWidth = 0,
        windowHeight = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup:
        clientX = e.clientX;
        clientY = e.clientY;
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        // call a function when mouse button is released:
        document.onmouseup = closeDragElement;

        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // set the window's new position:
        ipcRenderer.send('drag-window', clientX, clientY, windowWidth, windowHeight);
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// module exports
module.exports = {
    setDragElement,
};
