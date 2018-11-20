import DB from '../../services/db/user';
import {IUser} from './interface';
import {differenceBy, find, merge, uniqBy} from 'lodash';
import SDK from "../../services/sdk";
import {DexieUserDB} from '../../services/db/dexie/user';

export default class UserRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserRepo();
        }

        return this.instance;
    }

    private static instance: UserRepo;

    private dbService: DB;
    private db: DexieUserDB;
    private sdk: SDK;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
    }

    public getCurrentUserId(): string {
        return this.sdk.getConnInfo().UserID || '';
    }

    public create(user: IUser) {
        return this.db.users.put(user);
    }

    public createMany(users: IUser[]) {
        return this.db.users.bulkPut(users);
    }

    public get(id: string): Promise<IUser> {
        const user = this.dbService.getUser(id);
        if (user) {
            return Promise.resolve(user);
        }
        return this.db.users.get(id).then((u: IUser) => {
            this.dbService.setUser(u);
            return u;
        });
    }

    public importBulk(users: IUser[]): Promise<any> {
        const tempUsers = uniqBy(users, 'id');
        return this.upsert(tempUsers);
    }

    public upsert(users: IUser[]): Promise<any> {
        const ids = users.map((user) => {
            this.dbService.setUser(user);
            return user.id || '';
        });
        return this.db.users.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IUser[] = differenceBy(users, result, 'id');
            const updateItems: IUser[] = result;
            updateItems.map((user: IUser) => {
                const t = find(users, {id: user.id});
                return merge(user, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }
}
