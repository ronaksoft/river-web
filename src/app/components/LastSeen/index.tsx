/*
    Creation Time: 2019 - March - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import TimeUtility from '../../services/utilities/time';
import RiverTime from '../../services/utilities/river_time';
import UserRepo, {UserDBUpdated} from '../../repository/user';
import GroupRepo, {GroupDBUpdated} from '../../repository/group';
import {IUser} from '../../repository/user/interface';
import {UserStatus} from '../../services/sdk/messages/core.types_pb';
import Broadcaster from '../../services/broadcaster';
import {IGroup} from '../../repository/group/interface';
import i18n from "../../services/i18n";
import {localize} from "../../services/utilities/localize";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {LastSeenFormatChange} from "../SettingsMenu";
import LastSeenService from "../../services/lastSeenService";

interface IProps {
    className?: string;
    id: string;
    teamId: string;
    withLastSeen?: boolean;
}

interface IState {
    className: string;
    group: IGroup;
    user: IUser;
    you: boolean;
}

class LastSeen extends React.PureComponent<IProps, IState> {
    private interval: any = null;
    private riverTime: RiverTime;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private lastSeenService: LastSeenService;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private broadcaster: Broadcaster;
    private lastSeenFormat: string = localStorage.getItem(C_LOCALSTORAGE.LastSeenFormat) || 'estimated';
    private eventReferences: any[] = [];
    private lastId: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: {},
            user: {},
            you: false,
        };

        this.lastId = props.id;

        this.riverTime = RiverTime.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.lastSeenService = LastSeenService.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.runInterval();
        this.getData();
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.getGroup));
        this.eventReferences.push(this.broadcaster.listen(LastSeenFormatChange, this.updateLastSeenFormatHandler));
        if (this.props.id.indexOf('-') === -1) {
            this.lastSeenService.add(this.props.id);
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.lastId !== newProps.id) {
            this.lastSeenService.remove(this.lastId);
            if (this.props.id.indexOf('-') === -1) {
                this.lastSeenService.add(this.props.id);
            }
            this.lastId = newProps.id;
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.getData();
            this.runInterval();
        }
    }

    public componentWillUnmount() {
        if (this.lastId.indexOf('-') === -1) {
            this.lastSeenService.remove(this.lastId);
        }
        clearInterval(this.interval);
        clearTimeout(this.tryTimeout);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        return (
            <span className={this.state.className}>{this.getStatus()}</span>
        );
    }

    private getStatus() {
        if (this.props.id.indexOf('-') === 0) {
            const {group} = this.state;
            return i18n.tf('status.members', String(localize(group.participants || 0)));
        } else {
            const {user} = this.state;
            let lastSeen = user.status_last_modified || user.lastseen || 0;
            if (user.lastseen > user.status_last_modified) {
                lastSeen = user.lastseen;
            }
            if (user.deleted) {
                return <span className="force-upper-case">{i18n.t('status.rip')}</span>;
            } else if (this.state.you || (this.riverTime.now() - lastSeen < 60 && user.status === UserStatus.USERSTATUSONLINE)) {
                return (<span className="online">{i18n.t('status.online')}</span>);
            } else if (user.lastseen === 0) {
                return `${this.props.withLastSeen ? i18n.t('status.last_seen') : ''} ${i18n.t('status.recently_2')}`;
            } else if (this.lastSeenFormat === 'estimated') {
                return `${this.props.withLastSeen ? i18n.t('status.last_seen') : ''} ${TimeUtility.timeAgo(lastSeen)}`;
            } else {
                return `${this.props.withLastSeen ? i18n.t('status.last_seen') : ''} ${TimeUtility.exactTimeAgo(lastSeen)}`;
            }
        }
    }

    private getIntervalTime(time: number) {
        if (!time) {
            return -1;
        }
        const diff = this.riverTime.now() - time;
        if (diff < 86400) {
            return 10000;
        } else {
            return -1; // 3600000;
        }
    }

    private runInterval() {
        clearInterval(this.interval);
        const intervalTime = this.getIntervalTime(this.state.user.status_last_modified || 0);
        if (intervalTime === -1) {
            this.forceUpdate();
        } else {
            this.interval = setInterval(() => {
                this.forceUpdate();
            }, intervalTime);
        }
    }

    private getData() {
        if (this.props.id.indexOf('-') === 0) {
            this.getGroup();
        } else {
            this.getUser();
        }
    }

    private getUser = (data?: any) => {
        const {id} = this.props;
        if (!this.state || id === '') {
            return;
        }

        if (data && data.ids.indexOf(id) === -1) {
            return;
        }

        if (this.userRepo.getCurrentUserId() === id) {
            this.setState({
                you: true,
            });
            return;
        }

        this.userRepo.get(id).then((user) => {
            if (user) {
                this.setState({
                    user,
                    you: false,
                });
            } else {
                throw Error('not found');
            }
        }).catch(() => {
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getUser();
                }, 1000);
            }
        });
    }

    private getGroup = (data?: any) => {
        const {id} = this.props;
        if (!this.state || id === '') {
            return;
        }

        if (data && data.ids.indexOf(`${this.props.teamId}_${id}`) === -1) {
            return;
        }

        this.groupRepo.get(this.props.teamId, id).then((group) => {
            if (group) {
                this.setState({
                    group,
                    you: false,
                });
            } else {
                throw Error('not found');
            }
        }).catch(() => {
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getGroup();
                }, 1000);
            }
        });
    }

    private updateLastSeenFormatHandler = () => {
        this.lastSeenFormat = localStorage.getItem(C_LOCALSTORAGE.LastSeenFormat) || 'estimated';
        this.forceUpdate();
    }
}

export default LastSeen;
