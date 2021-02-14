const {ipcRenderer, shell} = require('electron');

function init() {
    window.isElectron = true;
    window.isNewElectron = true;
    window.ipcRenderer = ipcRenderer;
    window.electronShell = shell;
}

init();
