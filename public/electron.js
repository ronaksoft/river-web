/* tslint:disable */
const {app, BrowserWindow, shell, ipcMain, Menu, systemPreferences, nativeTheme} = require('electron');
const isDev = require('electron-is-dev');
const {download} = require('electron-dl');
const contextMenu = require('electron-context-menu');
const unusedFilename = require('unused-filename');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

const C_LOAD_URL = 'https://web.river.im';
const C_LOAD_URL_KEY = 'load_url';

let mainWindow;
let sizeMode = 'desktop';
let firstTimeLoad = false;

if (isDev) {
    require('electron-debug')();
}

const callReact = (cmd, params) => {
    mainWindow.webContents.send(cmd, params);
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
}

// Dark theme on macOS
if (process.platform === 'darwin') {
    systemPreferences.appLevelAppearance = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
            systemPreferences.appLevelAppearance = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        }
    );
}

contextMenu({});

createWindow = (forceShow) => {
    firstTimeLoad = true;
    mainWindow = new BrowserWindow({
        backgroundColor: '#27AE60',
        minWidth: 316,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js',
            webSecurity: false,
        },
        height: 860,
        width: 1280,
        simpleFullscreen: true,
        vibrancy: 'dark',
        darkTheme: true,
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : store.get(C_LOAD_URL_KEY, C_LOAD_URL),
    );

    if (isDev) {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
        } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS)
            .then(name => {
                console.log(`Added Extension: ${name}`);
            })
            .catch(err => {
                console.log('An error occurred: ', err);
            });

        installExtension(REDUX_DEVTOOLS)
            .then(name => {
                console.log(`Added Extension: ${name}`);
            })
            .catch(err => {
                console.log('An error occurred: ', err);
            });
    }

    mainWindow.once('ready-to-show', () => {
        if (process.platform !== 'darwin') {
            mainWindow.setMenuBarVisibility(false);
        }

        if (!forceShow) {
            mainWindow.show();
        }

        ipcMain.on('open-external-window', (event, arg) => {
            shell.openExternal(arg);
        });
    });

    if (forceShow) {
        mainWindow.show();
    }

    mainWindow.on('resize', () => {
        const width = mainWindow.getBounds().width;
        if (width < 600 && sizeMode !== 'responsive') {
            sizeMode = 'responsive';
            callReact('sizeMode', sizeMode)
        } else if (width >= 600 && sizeMode !== 'desktop') {
            sizeMode = 'desktop';
            callReact('sizeMode', sizeMode)
        }
    });
};

const generateMenu = () => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    click() {
                        callReact('about', app.getVersion());
                    },
                    label: 'About',
                },
                {role: 'quit'},
                {type: 'separator'},
                {
                    click() {
                        callReact('settings', {});
                    },
                    label: 'Preferences',
                },
                {type: 'separator'},
                {
                    click() {
                        callReact('logout', {});
                    },
                    label: 'Log Out',
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteandmatchstyle'},
                {role: 'delete'},
                {role: 'selectall'},
            ],
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'},
                {type: 'separator'},
                {role: 'toggledevtools'},
            ],
        },
        {
            role: 'help',
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on('ready', () => {
    createWindow();
    generateMenu();
});

app.on('window-all-closed', (e) => {
    mainWindow = null;
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow(firstTimeLoad);
    }
});

ipcMain.on('load-page', (event, arg) => {
    mainWindow.loadURL(arg);
});

ipcMain.on('fnCall', (e, arg) => {
    switch (arg.cmd) {
        case 'download':
            try {
                const savePath = `${app.getPath('downloads')}/${arg.data.fileName}`;
                const filePath = unusedFilename.sync(savePath);
                let fileName = arg.data.fileName;
                try {
                    fileName = filePath.split('/').pop();
                } catch (e) {
                    fileName = arg.data.fileName;
                }
                download(BrowserWindow.getFocusedWindow(), arg.data.url, {
                    filename: fileName,
                    openFolderWhenDone: true,
                })
                    .then((dl) => {
                        callReact('fnCallback', {
                            cmd: 'download',
                            reqId: arg.reqId,
                            data: {
                                path: dl.getSavePath(),
                            },
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            } catch (err) {
                console.error(err);
            }
            break;
        case 'revealFile':
            shell.showItemInFolder(arg.data.path);
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            break;
        case 'previewFile':
            mainWindow.previewFile(arg.data.path);
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            break;
        case 'setBadgeCounter':
            app.badgeCount = arg.data.counter;
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            break;
        case 'toggleMenuBar':
            mainWindow.setMenuBarVisibility(!mainWindow.isMenuBarVisible());
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: mainWindow.isMenuBarVisible(),
                },
            });
            break;
        case 'getLoadUrl':
            callReact('fnCallback', {
                cmd: 'loadUrl',
                reqId: arg.reqId,
                data: {
                    url: store.get(C_LOAD_URL_KEY, C_LOAD_URL),
                },
            });
            break;
        case 'setLoadUrl':
            store.set(C_LOAD_URL_KEY, arg.data.url);
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            setTimeout(() => {
                app.relaunch();
            }, 500);
            break;
    }
});


