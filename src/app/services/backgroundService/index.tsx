/*
    Creation Time: 2019 - April - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileRepo from '../../repository/file/index';

export default class BackgroundService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new BackgroundService();
        }
        return this.instance;
    }

    private static instance: BackgroundService;

    private fileRepo: FileRepo;
    private lastUrlObject: string = '';
    private backgroundRef: any = null;
    private enable: boolean = false;

    public constructor() {
        this.fileRepo = FileRepo.getInstance();
    }

    /* Disable background service */
    public disable() {
        this.enable = false;
        if (this.backgroundRef) {
            this.backgroundRef.style.backgroundImage = '';
        }
    }

    /* Set background React reference (ref) */
    public setRef(ref: any) {
        this.backgroundRef = ref;
        if (this.enable && this.backgroundRef) {
            this.backgroundRef.style.backgroundImage = `url(${this.lastUrlObject})`;
        }
    }

    /* Get background picture */
    public setBackground(blob: Blob) {
        URL.revokeObjectURL(this.lastUrlObject);
        this.lastUrlObject = URL.createObjectURL(blob);
        this.enable = true;
        if (this.backgroundRef) {
            this.backgroundRef.style.backgroundImage = `url(${this.lastUrlObject})`;
        }
    }

    /* Get background picture */
    public getBackground(fileName: string, applyBackground?: boolean): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (fileName !== '0') {
                this.getLocalFile(fileName).then((res) => {
                    if (applyBackground) {
                        this.setBackground(res);
                    }
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    }

    /* Get local file */
    private getLocalFile(fileName: string): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.fileRepo.get(fileName).then((fileRes) => {
                if (fileRes) {
                    resolve(fileRes.data);
                } else {
                    reject();
                }
            }).catch(() => {
                reject();
            });
        });
    }
}
