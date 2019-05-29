/* tslint:disable */
const {app, BrowserWindow, shell, ipcMain, Menu} = require('electron');
const isDev = require('electron-is-dev');
const {download} = require('electron-dl');
const contextMenu = require('electron-context-menu');

let mainWindow;
let sizeMode = 'desktop';

if (isDev) {
    require('electron-debug')();
}

const callReact = (cmd, params) => {
    mainWindow.webContents.send(cmd, params);
};

contextMenu({});

createWindow = () => {
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
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `https://web.river.im`,
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

    mainWindow.webContents.executeJavaScript(`
        var path = require('path');
        module.paths.push(path.resolve('node_modules'));
        module.paths.push(path.resolve('../node_modules'));
        module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
        module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
        module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
        module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
        path = undefined;
    `);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        ipcMain.on('open-external-window', (event, arg) => {
            shell.openExternal(arg);
        });
    });

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

generateMenu = () => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    click() {
                        callReact('about', {});
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
            ],
        }
        , {
            role: 'help',
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on('ready', () => {
    createWindow();
    generateMenu();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('load-page', (event, arg) => {
    mainWindow.loadURL(arg);
});

ipcMain.on('fnCall', (e, arg) => {
    switch (arg.cmd) {
        case 'download':
            try {
                download(BrowserWindow.getFocusedWindow(), arg.data.url, {
                    filename: arg.data.fileName,
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
            } catch (e) {
                console.error(err);
            }
            break;
        case 'revealFile':
            shell.showItemInFolder(arg.data.path);
            break;
        case 'previewFile':
            mainWindow.previewFile(arg.data.path);
            break;
    }
});


