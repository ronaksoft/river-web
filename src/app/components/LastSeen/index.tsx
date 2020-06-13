/*
    Creation Time: 2019 - March - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
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

interface IProps {
    className?: string;
    id: string;
    withLastSeen?: boolean;
}

interface IState {
    className: string;
    group: IGroup;
    id: string;
    user: IUser;
    you: boolean;
}

class LastSeen extends React.PureComponent<IProps, IState> {
    private interval: any = null;
    private riverTime: RiverTime;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: {},
            id: props.id,
            user: {},
            you: false,
        };

        this.riverTime = RiverTime.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.runInterval();
        this.getData();
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.getGroup));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.setState({
                id: newProps.id,
            }, () => {
                this.getData();
                this.runInterval();
            });
        }
    }

    public componentWillUnmount() {
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
        if (this.state.id.indexOf('-') === 0) {
            const {group} = this.state;
            return i18n.tf('status.members', String(localize(group.participants || 0)));
        } else {
            const {user} = this.state;
            if (this.state.you || (this.riverTime.now() - (user.status_last_modified || 0) < 60 && user.status === UserStatus.USERSTATUSONLINE)) {
                return (<span className="online">{i18n.t('status.online')}</span>);
            } else if (!user.status_last_modified) {
                return `${this.props.withLastSeen ? i18n.t('status.last_seen') : ''} ${i18n.t('status.recently')}`;
            } else {
                return `${this.props.withLastSeen ? i18n.t('status.last_seen') : ''} ${TimeUtility.timeAgo(user.status_last_modified || 0)}`;
            }
        }
    }

    private getIntervalTime(time: number) {
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
        if (this.state.id.indexOf('-') === 0) {
            this.getGroup();
        } else {
            this.getUser();
        }
    }

    private getUser = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.ids.indexOf(this.state.id) === -1) {
            return;
        }

        if (this.userRepo.getCurrentUserId() === this.state.id) {
            this.setState({
                you: true,
            });
            return;
        }

        this.userRepo.get(this.state.id).then((user) => {
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
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.ids.indexOf(this.state.id) === -1) {
            return;
        }

        this.groupRepo.get(this.state.id).then((group) => {
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
}

export default LastSeen;
