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
import {GetUniqueColor, SecondaryColors} from '../UserAvatar';

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
    prefix: string;
    user: IUser;
}

class UserName extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            prefix: props.prefix || '',
            user: {},
        };

        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
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
            });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('User_DB_Updated', this.getUser);
    }

    public render() {
        const {onlyFirstName, defaultString} = this.props;
        const {user, className, prefix} = this.state;
        const style = {
            color: 'auto',
            cursor: 'pointer',
        };
        if (this.props.uniqueColor === true) {
            style.color = GetUniqueColor(`${user.firstname}${user.lastname}`, SecondaryColors);
        }
        if (this.props.username === true) {
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

        if (data && data.detail.ids.indexOf(this.state.id) === -1) {
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

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}

export default UserName;
