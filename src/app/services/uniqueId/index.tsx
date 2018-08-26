export default class UniqueId {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UniqueId();
        }

        return this.instance;
    }

    private static instance: UniqueId;
    private lastId: any = {};

    private constructor() {
    }

    public setLastId(domain: string, lastId: number) {
        this.lastId[domain] = lastId;
    }

    public getId(domain: string, prefix ?: string): string {
        let id = this.lastId[domain] || 0;
        this.lastId[domain] = ++id;
        if (prefix) {
            return prefix + String(id);
        } else {
            return String(id);
        }
    }
}
