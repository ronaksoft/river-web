/*
    Creation Time: 2019 - Aug - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {DexieLabelDB} from './dexie/label';
import {ILabel} from "../../repository/label/interface";

export default class LabelDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new LabelDB();
        }

        return this.instance;
    }

    private static instance: LabelDB;
    private readonly db: DexieLabelDB;
    private labels: { [key: number]: ILabel } = {};

    private constructor() {
        this.db = new DexieLabelDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }

    public setLabel(label: ILabel) {
        this.labels[label.id || 0] = label;
    }

    public getLabel(id: number): ILabel | null {
        return this.labels[id];
    }

    public removeLabel(id: number) {
        delete this.labels[id];
    }
}
