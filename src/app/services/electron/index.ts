// @ts-ignore
const electron = require('electron');

export default class ElectronService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ElectronService();
        }

        return this.instance;
    }

    private static instance: ElectronService;

    private constructor() {
        window.console.log(electron.app.isReady());
    }
}
