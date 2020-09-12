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
import {kMerge} from "../../services/utilities/kDash";
import MessageRepo from "../message";
import i18n from "../../services/i18n";

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

    public getCachedTeam(earlyResponse?: (teamList: ITeam[]) => void, withCounter?: boolean, withPrivate?: boolean): Promise<ITeam[]> {
        const countFn = (teamList: ITeam[]) => {
            if (withPrivate) {
                teamList.unshift({
                    accesshash: '0',
                    creatorid: '0',
                    id: '0',
                    name: i18n.t('team.private'),
                    notify: true,
                    unread_counter: 0,
                });
            }
            const promises: any[] = [];
            teamList.forEach((team) => {
                promises.push(MessageRepo.getInstance().getUnreadCounterByTeam(team.id || '0'));
            });
            return Promise.all(promises).then((res) => {
                res.forEach((count, index) => {
                    teamList[index].unread_counter = count;
                });
                return teamList;
            });
        };
        return this.db.teams.toArray().then((res) => {
            if (earlyResponse) {
                earlyResponse(res);
            }
            const d = Date.now() - this.teamTtl;
            if (d < C_TEAM_TTL) {
                if (withCounter) {
                    return this.db.teams.toArray().then((tt) => {
                        return countFn(tt);
                    });
                } else {
                    return this.db.teams.toArray();
                }
            }
            return this.apiManager.accountGetTeams().then((teams) => {
                this.teamTtl = Date.now();
                teams.teamsList.map((team: ITeam) => {
                    const t = res.find(o => o.id === team.id);
                    if (t) {
                        team.unread_counter = t.unread_counter;
                        team.notify = t.notify;
                        team.count_unread = t.count_unread;
                    } else {
                        team.notify = true;
                        team.count_unread = true;
                    }
                    return team;
                });
                this.createMany(cloneDeep(teams.teamsList));
                if (withCounter) {
                    return countFn(teams.teamsList);
                } else {
                    return teams.teamsList;
                }
            });
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

    public update(team: ITeam) {
        return this.db.teams.get(team.id || '0').then((res) => {
            if (res) {
                team = kMerge(res, team);
                return this.db.teams.put(team);
            } else {
                return res;
            }
        });
    }
}
