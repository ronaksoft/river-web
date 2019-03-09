/*
    Creation Time: 2018 - Oct - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import UserRepo from '../../repository/user';
import {GetUniqueColor, TextColors} from '../UserAvatar';
import {VerifiedUserRounded} from '@material-ui/icons';
import Broadcaster from '../../services/broadcaster';

interface IProps {
    className?: string;
    defaultString?: string;
    id: string;
    noDetail?: boolean;
    onlyFirstName?: boolean;
    prefix?: string;
    uniqueColor?: boolean;
    unsafe?: boolean;
    username?: boolean;
    you?: boolean;
    youPlaceholder?: string;
}

interface IState {
    className: string;
    id: string;
    forceColor: boolean;
    prefix: string;
    user: IUser;
}

class UserName extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.userRepo = UserRepo.getInstance();

        this.state = {
            className: props.className || '',
            forceColor: this.userRepo.getBubbleMode() === '5',
            id: props.id,
            prefix: props.prefix || '',
            user: {},
        };

        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.getUser();
        this.eventReferences.push(this.broadcaster.listen('User_DB_Updated', this.getUser));
        this.eventReferences.push(this.broadcaster.listen('Theme_Changed', this.themeChangeHandler));
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.setState({
                id: newProps.id,
            }, () => {
                this.getUser();
            });
        }
    }

    public componentWillUnmount() {
        clearTimeout(this.tryTimeout);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {onlyFirstName, defaultString} = this.props;
        const {user, className, prefix} = this.state;
        const style = {
            color: 'auto',
            cursor: 'pointer',
        };
        if (this.props.uniqueColor === true && this.state.forceColor) {
            style.color = GetUniqueColor(`${user.firstname}${user.lastname}`, TextColors);
        }
        if (this.props.id === '2374') {
            return (
                <span className={className}
                      style={style}
                      onClick={this.clickHandler}><VerifiedUserRounded
                    style={{color: '#27AE60'}}/>{(user && user.id) ? (onlyFirstName ? prefix + user.firstname : `${prefix}${user.firstname} ${user.lastname}`) : (defaultString || '')}</span>
            );
        } else if (this.props.username === true) {
            return (
                <span className={className}
                      style={style}
                      onClick={this.clickHandler}>{(user && user.id && user.username && user.username.length > 0) ? `${prefix}${user.username}` : (defaultString || '')}</span>
            );
        } else {
            return (
                <span className={className}
                      style={style}
                      onClick={this.clickHandler}>{(user && user.id) ? (onlyFirstName ? prefix + user.firstname : `${prefix}${user.firstname} ${user.lastname}`) : (defaultString || '')}</span>
            );
        }
    }

    private getUser = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.ids.indexOf(this.state.id) === -1) {
            return;
        }
        if (this.props.you && this.userRepo.getCurrentUserId() === this.state.id) {
            this.setState({
                user: {
                    firstname: this.props.youPlaceholder || 'You',
                    id: this.userRepo.getCurrentUserId(),
                    lastname: '',
                },
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

    /* Click on user handler */
    private clickHandler = (e: any) => {
        const {user} = this.state;
        if (!user || this.props.noDetail === true) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        this.broadcastEvent('User_Dialog_Open', {
            id: user.id,
        });
    }

    /* Theme change handler */
    private themeChangeHandler = () => {
        this.setState({
            forceColor: (this.userRepo.getBubbleMode() === '5'),
        });
    }

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}

export default UserName;
