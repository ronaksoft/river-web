/*
    Creation Time: 2018 - Dec - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IDialogWithContact} from './interface';
import DialogRepo from '../dialog';
import UserRepo from '../user';
import GroupRepo from '../group';

export default class SearchRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SearchRepo();
        }

        return this.instance;
    }

    private static instance: SearchRepo;

    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;

    public constructor() {
        this.dialogRepo = DialogRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
    }

    public searchIds({skip, limit, keyword}: any): Promise<string[]> {
        const promises: any[] = [];
        limit = limit || 12;
        promises.push(this.userRepo.getManyCache(true, {limit, keyword}));
        promises.push(this.groupRepo.getManyCache({limit, keyword}));
        return new Promise<string[]>((resolve, reject) => {
            const ids: { [key: string]: boolean } = {};
            Promise.all(promises).then((arrRes) => {
                arrRes.forEach((res) => {
                    res.forEach((item: any) => {
                        if (!ids.hasOwnProperty(item.id)) {
                            ids[item.id] = true;
                        }
                    });
                });
                resolve(Object.keys(ids));
            }).catch(reject);
        });
    }

    public search({skip, limit, keyword}: any): Promise<IDialogWithContact> {
        const promises: any[] = [];
        limit = limit || 12;
        skip = skip || 0;
        promises.push(this.userRepo.getManyCache(true, {limit, keyword}));
        promises.push(this.groupRepo.getManyCache({limit, keyword}));
        return new Promise<IDialogWithContact>((resolve, reject) => {
            const ids: { [key: string]: boolean } = {};
            Promise.all(promises).then((arrRes) => {
                arrRes.forEach((res) => {
                    res.forEach((item: any) => {
                        if (!ids.hasOwnProperty(item.id)) {
                            ids[item.id] = true;
                        }
                    });
                });
                this.dialogRepo.findInArray(Object.keys(ids), skip, limit).then((res) => {
                    resolve({
                        contacts: arrRes[0] || [],
                        dialogs: res,
                    });
                });
            }).catch(reject);
        });
    }
}
