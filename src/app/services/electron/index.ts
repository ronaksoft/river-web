let ElectronSrv: any;
// @ts-ignore
const fs = require('fs');
if (fs && fs.existsSync) {
    const electron = require('electron');

    ElectronSrv = class ElectronService {
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
    };
}

export default ElectronSrv;
