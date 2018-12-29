import DB from '../../services/db/user';
import {IGroup} from './interface';
import {differenceBy, find, merge, uniqBy} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';
import {IContact} from '../contact/interface';

export default class GroupRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GroupRepo();
        }

        return this.instance;
    }

    private static instance: GroupRepo;

    private dbService: DB;
    private db: DexieUserDB;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public create(group: IGroup) {
        return this.db.groups.put(group);
    }

    public createMany(group: IGroup[]) {
        return this.db.groups.bulkPut(group);
    }

    public get(id: string): Promise<IGroup> {
        const group = this.dbService.getGroup(id);
        if (group) {
            return Promise.resolve(group);
        }
        return this.db.groups.get(id).then((g: IGroup) => {
            if (g) {
                this.dbService.setGroup(g);
            }
            return g;
        });
    }

    public getManyCache({keyword, limit}: any): Promise<IContact[]> {
        if (!keyword) {
            return this.db.groups.limit(limit || 100).toArray();
        }
        return this.db.groups
            .where('title').startsWithIgnoreCase(keyword).limit(limit || 12).toArray();
    }

    public importBulk(groups: IGroup[]): Promise<any> {
        const tempGroup = uniqBy(groups, 'id');
        return this.upsert(tempGroup);
    }

    public upsert(groups: IGroup[]): Promise<any> {
        const ids = groups.map((group) => {
            return group.id || '';
        });
        return this.db.groups.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IGroup[] = differenceBy(groups, result, 'id');
            const updateItems: IGroup[] = result;
            updateItems.map((group: IGroup) => {
                const t = find(groups, {id: group.id});
                return merge(group, t);
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setGroup(item);
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent('Group_DB_Updated', {ids});
            return res;
        });
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
