/* eslint-disable */
const path = require('path');
const {app, BrowserWindow, shell, ipcMain, Menu, systemPreferences, nativeTheme, screen, desktopCapturer} = require('electron');
const isDev = require('electron-is-dev');
const {download} = require('electron-dl');
const contextMenu = require('electron-context-menu');
const unusedFilename = require('unused-filename');
const lodash = require('lodash');
const fs = require('fs');
const {
    hasScreenCapturePermission,
    hasPromptedForPermission,
    openSystemPreferences,
} = require('mac-screen-capture-permissions');
const Store = require('electron-store');
const store = new Store();

const C_APP_VERSION = '0.36.0';

const C_LOAD_URL = 'https://web.river.im';
const C_LOAD_URL_KEY = 'load_url';
const C_WINDOW_CONFIG = 'window_config';
const C_PROTOCOL = 'rvr';
const C_PROTOCOL_REGEX = new RegExp(`${C_PROTOCOL}:\/\/`);

const MIN_WIDTH = 316;
const MIN_HEIGHT = 480;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 860;
const BOUNDS_TOLERANCE = 100;

let mainWindow;
let sizeMode = 'desktop';
let firstTimeLoad = false;
let windowConfig = store.get(C_WINDOW_CONFIG, {});
let deepLinkUrl = '';
let webAppReady = false;

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

const getDeepLink = (url) => {
    if (C_PROTOCOL_REGEX.test(url)) {
        deepLinkUrl = url;
        return true;
    } else {
        return false;
    }
};

const callDeepLink = () => {
    if (webAppReady && deepLinkUrl !== '') {
        callReact('deepLink', deepLinkUrl);
        deepLinkUrl = '';
    }
};

if (process.platform !== 'darwin') {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.exit();
    } else {
        app.on('second-instance', (event, argv) => {
            if (getDeepLink(argv.slice(1))) {
                callDeepLink();
            }
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
} else {
    // app.disableHardwareAcceleration();
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

const createWindow = (forceShow) => {
    let windowIcon = undefined;
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
            contextIsolation: false,
            preload: path.join(__dirname, '/preload.js'),
            webSecurity: false,
            backgroundThrottling: true,
            v8CacheOptions: 'bypassHeatCheck',
            sandbox: true,
        },
        height: 860,
        width: 1280,
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

    getDeepLink(process.argv.slice(1));

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
            callReact('sizeMode', sizeMode);
        } else if (width >= 600 && sizeMode !== 'desktop') {
            sizeMode = 'desktop';
            callReact('sizeMode', sizeMode);
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
    deepLinkUrl = '';
    webAppReady = false;
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow(firstTimeLoad);
    }
});

if (!app.isDefaultProtocolClient(C_PROTOCOL)) {
    // Define custom protocol handler. Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient(C_PROTOCOL);
}

app.on('will-finish-launching', function () {
    // Protocol handler for osx
    app.on('open-url', function (event, url) {
        if (getDeepLink(url)) {
            event.preventDefault();
            callDeepLink();
        }
    });
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
                        fs.stat(dl.getSavePath(), (err, stat) => {
                            callReact('fnCallback', {
                                cmd: 'download',
                                reqId: arg.reqId,
                                data: {
                                    lastModified: stat.mtime.toISOString(),
                                    path: dl.getSavePath(),
                                },
                            });
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
            fs.stat(arg.data.path, (err, stat) => {
                const ok = err ? false : !(arg.data.lastModified && arg.data.lastModified !== stat.mtime.toISOString());
                callReact('fnCallback', {
                    cmd: 'bool',
                    reqId: arg.reqId,
                    data: {
                        bool: ok,
                    },
                });
                if (ok) {
                    shell.showItemInFolder(arg.data.path);
                }
            });
            break;
        case 'previewFile':
            fs.stat(arg.data.path, (err, stat) => {
                const ok = err ? false : !(arg.data.lastModified && arg.data.lastModified !== stat.mtime.toISOString());
                callReact('fnCallback', {
                    cmd: 'bool',
                    reqId: arg.reqId,
                    data: {
                        bool: ok,
                    },
                });
                if (ok) {
                    mainWindow.previewFile(arg.data.path);
                }
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
        case 'askForMediaAccess':
            systemPreferences.askForMediaAccess(arg.data.deviceType).then((res) => {
                callReact('fnCallback', {
                    cmd: 'bool',
                    reqId: arg.reqId,
                    data: {
                        bool: res,
                    },
                });
            }).catch((err) => {
                callReact('fnCallback', {
                    cmd: 'error',
                    reqId: arg.reqId,
                    data: {
                        error: err,
                    },
                });
            });
            break;
        case 'screenCapturePermission':
            if (hasPromptedForPermission()) {
                if (systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
                    openSystemPreferences();
                }
            } else {
                hasScreenCapturePermission();
            }
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            break;
        case 'getScreenCaptureList':
            desktopCapturer.getSources({
                types: ['window', 'screen'],
                thumbnailSize: {height: 320, width: 568},
            }).then((list) => {
                callReact('fnCallback', {
                    cmd: 'screenCaptureList',
                    reqId: arg.reqId,
                    data: {
                        list: list.map((item) => {
                            return {
                                appIcon: item.appIcon ? item.appIcon.toDataURL() : undefined,
                                displayId: item.display_id,
                                id: item.id,
                                name: item.name,
                                thumbnail: item.thumbnail ? item.thumbnail.toDataURL() : undefined,
                            };
                        }),
                    },
                });
            }).catch((err) => {
                callReact('fnCallback', {
                    cmd: 'error',
                    reqId: arg.reqId,
                    data: {
                        error: err,
                    },
                });
            });
            break;
        case 'getVersion':
            callReact('fnCallback', {
                cmd: 'version',
                reqId: arg.reqId,
                data: {
                    version: C_APP_VERSION,
                },
            });
            break;
        case 'focus':
            if (mainWindow) {
                mainWindow.focus();
            }
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            break;
        case 'ready':
            webAppReady = true;
            callReact('fnCallback', {
                cmd: 'bool',
                reqId: arg.reqId,
                data: {
                    bool: true,
                },
            });
            callDeepLink();
            break;
    }
});