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
import UserRepo from '../../repository/user';
import {IUser} from '../../repository/user/interface';
import {UserStatus} from '../../services/sdk/messages/chat.core.types_pb';

interface IProps {
    className?: string;
    id: string;
    withLastSeen?: boolean;
}

interface IState {
    className: string;
    id: string;
    user: IUser;
    you: boolean;
}

class LastSeen extends React.Component<IProps, IState> {
    private interval: any = null;
    private riverTime: RiverTime;
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            user: {},
            you: false,
        };

        this.riverTime = RiverTime.getInstance();
        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
        this.runInterval();
        this.getUser();
        window.addEventListener('User_DB_Updated', this.getUser);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.setState({
                id: newProps.id,
            }, () => {
                this.getUser();
                this.runInterval();
            });
        }
    }

    public componentWillUnmount() {
        clearInterval(this.interval);
        window.removeEventListener('User_DB_Updated', this.getUser);
    }

    public render() {
        return (
            <span className={this.state.className}>{this.getStatus()}</span>
        );
    }

    private getStatus() {
        const {user} = this.state;
        if (this.state.you) {
            return 'online';
        } else if (this.riverTime.now() - (user.status_last_modified || 0) < 60 && user.status === UserStatus.USERSTATUSONLINE) {
            return 'online';
        } else if (!user.status_last_modified) {
            return `${this.props.withLastSeen ? 'last seen' : ''} recently`;
        } else {
            return `${this.props.withLastSeen ? 'last seen' : ''} ${TimeUtility.timeAgo(user.status_last_modified || 0)}`;
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

    private getUser = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.detail.ids.indexOf(this.state.id) === -1) {
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
}

export default LastSeen;
