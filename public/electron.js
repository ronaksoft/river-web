/* tslint:disable */
const path = require('path');
const {app, BrowserWindow, shell, ipcMain, Menu, systemPreferences, nativeTheme, screen} = require('electron');
const isDev = require('electron-is-dev');
const {download} = require('electron-dl');
const contextMenu = require('electron-context-menu');
const unusedFilename = require('unused-filename');
const lodash = require('lodash');
const Store = require('electron-store');
const store = new Store();

const C_LOAD_URL = 'https://web.river.im';
const C_LOAD_URL_KEY = 'load_url';
const C_WINDOW_CONFIG = 'window_config';

const MIN_WIDTH = 316;
const MIN_HEIGHT = 480;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 860;
const BOUNDS_TOLERANCE = 100;

let mainWindow;
let sizeMode = 'desktop';
let firstTimeLoad = false;
let windowConfig = store.get(C_WINDOW_CONFIG, {});

if (isDev) {
    require('electron-debug')();
}

// Thanks to signal project
function isVisible(window, bounds) {
    const boundsX = lodash.get(bounds, 'x') || 0;
    const boundsY = lodash.get(bounds, 'y') || 0;
    const boundsWidth = lodash.get(bounds, 'width') || DEFAULT_WIDTH;
    const boundsHeight = lodash.get(bounds, 'height') || DEFAULT_HEIGHT;

    // requiring BOUNDS_BUFFER pixels on the left or right side
    const rightSideClearOfLeftBound =
        window.x + window.width >= boundsX + BOUNDS_TOLERANCE;
    const leftSideClearOfRightBound =
        window.x <= boundsX + boundsWidth - BOUNDS_TOLERANCE;

    // top can't be offscreen, and must show at least BOUNDS_BUFFER pixels at bottom
    const topClearOfUpperBound = window.y >= boundsY;
    const topClearOfLowerBound =
        window.y <= boundsY + boundsHeight - BOUNDS_TOLERANCE;

    return (
        rightSideClearOfLeftBound &&
        leftSideClearOfRightBound &&
        topClearOfUpperBound &&
        topClearOfLowerBound
    );
}

const callReact = (cmd, params) => {
    mainWindow.webContents.send(cmd, params);
};

const resetConfig = () => {
    store.delete(C_LOAD_URL_KEY);
    store.delete(C_WINDOW_CONFIG);
};

if (!process.mas) {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.exit();
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
            }

            return true;
        });
    }
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
    let windowIcon;
    const OS = process.platform;
    if (OS === 'win32') {
        windowIcon = path.join(__dirname, 'build', 'icons', 'logo.ico');
    } else if (OS === 'linux') {
        windowIcon = path.join(__dirname, 'assets', 'icon.png');
    } else {
        windowIcon = path.join(__dirname, 'build', 'logo.png');
    }
    firstTimeLoad = true;
    const windowOptions = Object.assign({
        backgroundColor: '#27AE60',
        minWidth: 316,
        minHeight: 480,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            preload: path.join(__dirname, '/preload.js'),
            webSecurity: false,
            backgroundThrottling: false,
            contextIsolation: false,
        },
        height: 860,
        width: 1280,
        simpleFullscreen: true,
        vibrancy: 'dark',
        darkTheme: true,
        icon: windowIcon,
    }, lodash.pick(windowConfig, ['autoHideMenuBar', 'width', 'height', 'x', 'y']));

    if (!lodash.isNumber(windowOptions.width) || windowOptions.width < MIN_WIDTH) {
        windowOptions.width = DEFAULT_WIDTH;
    }
    if (!lodash.isNumber(windowOptions.height) || windowOptions.height < MIN_HEIGHT) {
        windowOptions.height = DEFAULT_HEIGHT;
    }
    if (!lodash.isBoolean(windowOptions.autoHideMenuBar)) {
        delete windowOptions.autoHideMenuBar;
    }

    const visibleOnAnyScreen = lodash.some(screen.getAllDisplays(), display => {
        if (!lodash.isNumber(windowOptions.x) || !lodash.isNumber(windowOptions.y)) {
            return false;
        }
        return isVisible(windowOptions, lodash.get(display, 'bounds'));
    });

    if (!visibleOnAnyScreen) {
        console.log('Location reset needed');
        delete windowOptions.x;
        delete windowOptions.y;
    }

    mainWindow = new BrowserWindow(windowOptions);

    function captureAndSaveWindowStats() {
        if (!mainWindow) {
            return;
        }

        const size = mainWindow.getSize();
        const position = mainWindow.getPosition();

        // so if we need to recreate the window, we have the most recent settings
        windowConfig = {
            maximized: mainWindow.isMaximized(),
            autoHideMenuBar: mainWindow.autoHideMenuBar,
            fullscreen: mainWindow.isFullScreen(),
            width: size[0],
            height: size[1],
            x: position[0],
            y: position[1],
        };

        store.set(C_WINDOW_CONFIG, windowConfig);
    }

    const debouncedCaptureStats = lodash.debounce(captureAndSaveWindowStats, 500);
    mainWindow.on('resize', debouncedCaptureStats);
    mainWindow.on('move', debouncedCaptureStats);

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : store.get(C_LOAD_URL_KEY, C_LOAD_URL));

    if (windowConfig && windowConfig.maximized) {
        mainWindow.maximize();
    }
    if (windowConfig && windowConfig.fullscreen) {
        mainWindow.setFullScreen(true);
    }

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
                {
                    click() {
                        resetConfig();
                    },
                    label: 'Reset To Default Configs',
                },
            ],
        },
        {
            role: 'help',
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on('ready', () => {
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.river.im');
    }
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