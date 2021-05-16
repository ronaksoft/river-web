/*
    Creation Time: 2021 - April - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import APIManager from "../sdk";
import UserRepo from "../../repository/user";
import RiverTime from "../utilities/river_time";
import {throttle} from "lodash";
import {InputUser} from "../sdk/messages/core.types_pb";
import {EventBlur, EventFocus} from "../events";

export default class LastSeenService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new LastSeenService();
        }

        return this.instance;
    }

    private static instance: LastSeenService;
    private userIds: string[] = [];
    private userIdMap: { [key: string]: number } = {};
    private apiManager: APIManager;
    private userRepo: UserRepo;
    private riverTime: RiverTime;
    private interval: number = 15;
    private readonly intervalFn: any;
    private active: boolean = true;

    private constructor() {
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.riverTime = RiverTime.getInstance();
        this.intervalFn = throttle(this.getUsers, 15000);
        setTimeout(() => {
            this.interval = this.apiManager.getInstantSystemConfig().onlineupdateperiodinsec;
        }, 5000);
        window.addEventListener(EventFocus, this.windowFocusHandler);
        window.addEventListener(EventBlur, this.windowBlurHandler);
    }

    public add(userId: string) {
        if (!this.userIdMap.hasOwnProperty(userId)) {
            this.userIdMap[userId] = this.userIds.length;
            this.userIds.push(userId);
        }
        setTimeout(() => {
            this.intervalFn();
        }, 100);
    }

    public remove(userId: string) {
        if (this.userIdMap.hasOwnProperty(userId)) {
            let index = this.userIdMap[userId];
            if (this.userIds[index] !== userId) {
                index = this.userIds.indexOf(userId);
            }
            if (index > -1) {
                this.userIds.splice(index, 1);
            }
            delete this.userIdMap[userId];
        }
    }

    private getUsers = () => {
        if (!this.active) {
            return;
        }
        const toCheckInputs: InputUser[] = [];
        const now = this.riverTime.now();
        this.userRepo.getManyInstant(this.userIds).forEach((user) => {
            if (user && now - (user.last_modified || 0) > this.interval) {
                const inputUser = new InputUser();
                inputUser.setUserid(user.id);
                inputUser.setAccesshash(user.accesshash);
                toCheckInputs.push(inputUser);
            }
        });
        if (toCheckInputs.length > 0) {
            this.apiManager.getUser(toCheckInputs).then((res) => {
                this.userRepo.importBulk(false, res.usersList);
            });
        }
    }

    private windowFocusHandler = () => {
        this.active = true;
    }

    private windowBlurHandler = () => {
        this.active = false;
    }
}
