import MessageDB from '../../services/db/message';
import {IMessageHole} from './interface';
import {DexieMessageDB} from '../../services/db/dexie/message';
import Dexie from 'dexie';

export default class MessageHoleRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MessageHoleRepo();
        }

        return this.instance;
    }

    private static instance: MessageHoleRepo;

    private dbService: MessageDB;
    private db: DexieMessageDB;

    private constructor() {
        this.dbService = MessageDB.getInstance();
        this.db = this.dbService.getDB();
    }

    public hasHoles(peerId: string, min: number, max: number): Promise<boolean> {
        /*
            A : MinID <= msgMinID && MinID < msgMaxID && MaxID > msgMinID && MaxID >= msgMaxID ||
            B : MinID > msgMinID && MinID < msgMaxID && MaxID > msgMinID && MaxID > msgMaxID ||
            C : MinID < msgMinID && MinID < msgMaxID && MaxID > msgMinID && MaxID < msgMaxID ||
            D : MinID > msgMinID && MinID < msgMaxID && MaxID > msgMinID && MaxID < msgMaxID ||
        */
        return new Promise((resolve, reject) => {
            this.db.messageHoles
                .where('[peerid+min+max]').between([peerId, Dexie.minKey, max - 1], [peerId, min + 1, Dexie.maxKey], true, true)
                .or('[peerid+min+max]').between([peerId, Dexie.minKey, min], [peerId, min - 1, max], true, true)
                .or('[peerid+min+max]').between([peerId, min + 1, max + 1], [peerId, max, Dexie.maxKey], true, true)
                .or('[peerid+min+max]').between([peerId, min - 1, min - 1], [peerId, max + 1, max + 1], true, true)
                .count().then((res) => {
                resolve(res > 0);
            }).catch(reject);
        });
    }

    public getHoleType(messageHole: IMessageHole, min: number, max: number): number {
        if (messageHole.min <= min && messageHole.min < max && messageHole.max > min && messageHole.max >= max) {
            return 1;
        } else if (messageHole.min > min && messageHole.min < max && messageHole.max > min && messageHole.max > max) {
            return 2;
        } else if (messageHole.min < min && messageHole.min < max && messageHole.max > min && messageHole.max < max) {
            return 3;
        } else if (messageHole.min > min && messageHole.min < max && messageHole.max > min && messageHole.max < max) {
            return 4;
        } else {
            return 0;
        }
    }

    public getHoles(peerId: string, min: number, max: number): Promise<IMessageHole[]> {
        return this.db.messageHoles
            .where('[peerid+min+max]').between([peerId, Dexie.minKey, max - 1], [peerId, min + 1, Dexie.maxKey], true, true)
            .or('[peerid+min+max]').between([peerId, Dexie.minKey, min], [peerId, min - 1, max], true, true)
            .or('[peerid+min+max]').between([peerId, min + 1, max + 1], [peerId, max, Dexie.maxKey], true, true)
            .or('[peerid+min+max]').between([peerId, min - 1, min - 1], [peerId, max + 1, max + 1], true, true)
            .toArray().then((res) => {
                return res.map((hole) => {
                    hole.type = this.getHoleType(hole, min, max);
                    return hole;
                });
            });
    }
}
