import UserDB from '../services/db/user';
import MessageDB from '../services/db/user_message';
import DialogDB from '../services/db/dialog';

export default class MainRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MainRepo();
        }

        return this.instance;
    }

    private static instance: MainRepo;

    private userDB: UserDB;
    private messageDB: MessageDB;
    private dialogDB: DialogDB;

    private constructor() {
        this.userDB = UserDB.getInstance().getDB();
        this.messageDB = MessageDB.getInstance().getDB();
        this.dialogDB = DialogDB.getInstance().getDB();
    }

    public destroyDB(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.userDB.destroy());
        // @ts-ignore
        promises.push(this.messageDB.destroy());
        // @ts-ignore
        promises.push(this.dialogDB.destroy());
        return Promise.all(promises);
    }
}
