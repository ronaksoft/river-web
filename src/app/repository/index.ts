/*
    Creation Time: 2018 - Oct - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import UserDB from '../services/db/user';
import MessageDB from '../services/db/message';
import DialogDB from '../services/db/dialog';
import FileDB from '../services/db/file';
import {DexieUserDB} from '../services/db/dexie/user';
import {DexieMessageDB} from '../services/db/dexie/message';
import {DexieDialogDB} from '../services/db/dexie/dialog';
import {DexieFileDB} from '../services/db/dexie/file';
import {DexieLabelDB} from "../services/db/dexie/label";
import {DexieMediaDB} from "../services/db/dexie/media";
import MediaDB from "../services/db/media";
import LabelDB from "../services/db/label";
import {DexieTopPeerDB} from "../services/db/dexie/top_peer";
import TopPeerDB from "../services/db/top_peer";
import {DexieGifDB} from "../services/db/dexie/gif";
import GifDB from "../services/db/gif";
import {DexieTeamDB} from "../services/db/dexie/team";
import TeamDB from "../services/db/team";
import {DexieCommandDB} from "../services/db/dexie/command";
import CommandDB from "../services/db/command";
import {InputPeer, PeerType} from "../services/sdk/messages/core.types_pb";
import UserRepo from "./user";

export const C_INFINITY = 10000000000;

export default class MainRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MainRepo();
        }

        return this.instance;
    }

    private static instance: MainRepo;

    private userDB: DexieUserDB;
    private messageDB: DexieMessageDB;
    private dialogDB: DexieDialogDB;
    private fileDB: DexieFileDB;
    private mediaDB: DexieMediaDB;
    private labelDB: DexieLabelDB;
    private topPeerDB: DexieTopPeerDB;
    private gifDB: DexieGifDB;
    private teamDB: DexieTeamDB;
    private commandDB: DexieCommandDB;
    private userRepo: UserRepo | undefined;

    private constructor() {
        this.userDB = UserDB.getInstance().getDB();
        this.messageDB = MessageDB.getInstance().getDB();
        this.dialogDB = DialogDB.getInstance().getDB();
        this.fileDB = FileDB.getInstance().getDB();
        this.mediaDB = MediaDB.getInstance().getDB();
        this.labelDB = LabelDB.getInstance().getDB();
        this.topPeerDB = TopPeerDB.getInstance().getDB();
        this.gifDB = GifDB.getInstance().getDB();
        this.teamDB = TeamDB.getInstance().getDB();
        this.commandDB = CommandDB.getInstance().getDB();

        // Repo
        setTimeout(() => {
            this.userRepo = UserRepo.getInstance();
        }, 127);
    }

    public destroyDB(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.userDB.delete());
        // @ts-ignore
        promises.push(this.messageDB.delete());
        // @ts-ignore
        promises.push(this.dialogDB.delete());
        // @ts-ignore
        promises.push(this.fileDB.delete());
        // @ts-ignore
        promises.push(this.mediaDB.delete());
        // @ts-ignore
        promises.push(this.labelDB.delete());
        // @ts-ignore
        promises.push(this.topPeerDB.delete());
        // @ts-ignore
        promises.push(this.gifDB.delete());
        // @ts-ignore
        promises.push(this.teamDB.delete());
        // @ts-ignore
        promises.push(this.commandDB.delete());
        return Promise.all(promises);
    }

    public destroyMessageRelatedDBs(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.messageDB.delete());
        // @ts-ignore
        promises.push(this.dialogDB.delete());
        return Promise.all(promises);
    }

    public destroyMediaRelatedDBs(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.mediaDB.delete());
        return Promise.all(promises);
    }

    public getInputPeerBy(id: string, type: PeerType): Promise<InputPeer> {
        const userRepo = this.userRepo;
        if (!userRepo) {
            return Promise.reject('user repo is not initialized');
        }
        return new Promise((resolve, reject) => {
            const inputPeer = new InputPeer();
            if (type === PeerType.PEERUSER) {
                userRepo.get(id).then((res) => {
                    if (res) {
                        inputPeer.setId(res.id);
                        inputPeer.setAccesshash(res.accesshash);
                        inputPeer.setType(PeerType.PEERUSER);
                        resolve(inputPeer);
                    } else {
                        reject();
                    }
                }).catch(reject);
            } else if (type === PeerType.PEERGROUP) {
                inputPeer.setId(id);
                inputPeer.setAccesshash('0');
                inputPeer.setType(PeerType.PEERGROUP);
                resolve(inputPeer);
            } else {
                reject();
            }
        });
    }
}
