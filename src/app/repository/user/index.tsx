import DB from '../../services/db/user';
import {IUser} from './interface';
import {differenceBy, find, merge} from 'lodash';
import * as faker from "faker";

export default class UserRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserRepo();
        }

        return this.instance;
    }

    private static instance: UserRepo;

    private dbService: DB;
    private db: any;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public create(user: IUser) {
        this.db.put(user);
    }

    public createMany(users: IUser[]) {
        return this.db.bulkDocs(users);
    }

    public get(id: number): Promise<IUser> {
        const user = this.dbService.getUser(id);
        if (user) {
            return Promise.resolve(user);
        }
        return this.db.get(String(id)).then((u: IUser) => {
            this.dbService.setUser(u);
            return u;
        });
    }

    public importBulk(users: IUser[]): Promise<any> {
        users = users.map((msg) => {
            msg._id = String(msg.id);
            return msg;
        });
        return this.upsert(users);
    }

    public upsert(users: IUser[]): Promise<any> {
        const ids = users.map((user) => {
            this.dbService.setUser(user);
            return user._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            let createItems: IUser[] = differenceBy(users, result.docs, '_id');
            createItems = createItems.map((item) => {
                item.avatar = faker.image.avatar();
                return item;
            });
            // @ts-ignore
            const updateItems: IUser[] = result.docs;
            updateItems.map((user: IUser) => {
                const t = find(users, {_id: user._id});
                return merge(t, user);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }
}
