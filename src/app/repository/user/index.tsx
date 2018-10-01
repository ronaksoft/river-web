import DB from '../../services/db/user';
import {IUser} from './interface';
import {differenceBy, find, merge} from 'lodash';

export default class UserRepo {
    private dbService: DB;
    private db: any;

    public constructor() {
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
        return this.db.get(id);
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
            return user._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IUser[] = differenceBy(users, result.docs, '_id');
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
