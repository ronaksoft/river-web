/*
    Creation Time: 2020 - June - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import DB from '../../services/db/team';
import APIManager from "../../services/sdk";
import {ITeam} from "./interface";
import {DexieTeamDB} from "../../services/db/dexie/team";
import {cloneDeep} from "lodash";

const C_TEAM_TTL = 60 * 60 * 12;

export default class TeamRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new TeamRepo();
        }

        return this.instance;
    }

    private static instance: TeamRepo;

    private dbService: DB;
    private db: DexieTeamDB;
    private apiManager: APIManager;
    private teamTtl: number = 0;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
    }

    public get(id: string): Promise<ITeam | undefined> {
        return this.db.teams.get(id);
    }

    public getCachedTeam(earlyResponse?: (teamList: ITeam[]) => void): Promise<ITeam[]> {
        if (earlyResponse) {
            this.db.teams.toArray().then((res) => {
                earlyResponse(res);
            });
        }
        const d = Date.now() - this.teamTtl;
        if (d < C_TEAM_TTL) {
            return this.db.teams.toArray();
        }
        return this.apiManager.accountGetTeams().then((res) => {
            this.teamTtl = Date.now();
            this.createMany(cloneDeep(res.teamsList));
            return res.teamsList;
        });
    }

    public list(skip: number, limit: number, callback: (list: ITeam[]) => void): Promise<ITeam[]> {
        this.db.teams.offset(skip).limit(limit).toArray().then((res) => {
            if (callback) {
                callback(res);
            }
        });
        return this.apiManager.accountGetTeams().then((res) => {
            this.createMany(res.teamsList);
            return res.teamsList;
        });
    }

    public createMany(teams: ITeam[]) {
        return this.db.teams.bulkPut(teams);
    }
}
