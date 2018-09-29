import DB from '../../services/db/user';
import {IUser} from './interface';

export default class Conversation {
    private dbService: DB;
    private db: any;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public createUser(dialog: IUser) {
        this.db.put(dialog);
    }

    public createUsers(dialogs: IUser[]) {
        return this.db.bulkDocs(dialogs);
    }

    public getUser(id: number): Promise<IUser> {
        return this.db.get(id);
    }
}
