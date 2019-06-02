const {ipcRenderer, shell} = require('electron');

function init() {
    window.isElectron = true;
    window.ipcRenderer = ipcRenderer;
    window.electronShell = shell;
}

init();
