import {IDialogWithContact} from './interface';
import DialogRepo from '../dialog';
import UserRepo from '../user';
import GroupRepo from '../group';
import ContactRepo from '../contact';


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
    private contactRepo: ContactRepo;
    private groupRepo: GroupRepo;

    public constructor() {
        this.dialogRepo = DialogRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.contactRepo = ContactRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
    }

    public search({skip, limit, keyword}: any): Promise<IDialogWithContact> {
        const promises: any[] = [];
        limit = limit || 12;
        skip = skip || 0;
        promises.push(this.userRepo.getManyCache({limit, keyword}));
        promises.push(this.contactRepo.getManyCache({limit, keyword}));
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
                        contacts: arrRes[1] || [],
                        dialogs: res,
                    });
                });
            }).catch(reject);
        });
    }
}
