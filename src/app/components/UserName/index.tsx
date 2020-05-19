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
import UserRepo, {UserDBUpdated} from '../../repository/user';
import {GetUniqueColor, TextColors} from '../UserAvatar';
import {VerifiedUserRounded, MemoryRounded} from '@material-ui/icons';
import Broadcaster from '../../services/broadcaster';
import i18n from '../../services/i18n';
import {ThemeChanged} from "../SettingsMenu";

interface IProps {
    className?: string;
    defaultString?: string;
    id: string;
    noDetail?: boolean;
    onlyFirstName?: boolean;
    prefix?: string;
    postfix?: string;
    uniqueColor?: boolean;
    unsafe?: boolean;
    username?: boolean;
    you?: boolean;
    youPlaceholder?: string;
    onLoad?: (user?: IUser) => void;
    noIcon?: boolean;
    onClick?: (id: string) => void;
}

interface IState {
    className: string;
    id: string;
    forceColor: boolean;
    user: IUser;
}

class UserName extends React.PureComponent<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.userRepo = UserRepo.getInstance();

        this.state = {
            className: props.className || '',
            forceColor: this.userRepo.getBubbleMode() === '5',
            id: props.id,
            user: {},
        };

        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.getUser();
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
        this.eventReferences.push(this.broadcaster.listen(ThemeChanged, this.themeChangeHandler));
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
        this.mounted = false;
        clearTimeout(this.tryTimeout);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {onlyFirstName, defaultString, noIcon} = this.props;
        let {postfix, prefix} = this.props;
        prefix = prefix || '';
        postfix = postfix || '';
        const {user, className} = this.state;
        if (!user) {
            return (<span className={className} onClick={this.clickHandler}/>);
        }
        const style = {
            color: 'auto',
            cursor: 'pointer',
        };
        if (this.props.uniqueColor === true && this.state.forceColor) {
            style.color = GetUniqueColor(`${user.firstname}${user.lastname}`, TextColors);
        }
        if (this.props.username === true) {
            return (
                <span className={className}
                      style={style}
                      onClick={this.clickHandler}>{Boolean(noIcon !== true && user.official) &&
                <VerifiedUserRounded
                    style={{color: '#27AE60'}}/>}{Boolean(noIcon !== true && user.isbot) &&
                <MemoryRounded/>}{(user.id && user.username && user.username.length > 0) ? `${prefix}${user.username}${postfix}` : `${prefix}${defaultString}${postfix}`}</span>
            );
        } else {
            return (
                <span className={className}
                      style={style}
                      onClick={this.clickHandler}>{Boolean(noIcon !== true && user.official) &&
                <VerifiedUserRounded
                    style={{color: '#27AE60'}}/>}{Boolean(noIcon !== true && user.isbot) &&
                <MemoryRounded/>}{(user.id) ? (onlyFirstName ? prefix + user.firstname : `${prefix}${user.firstname} ${user.lastname}${postfix}`) : `${prefix}${defaultString}${postfix}`}</span>
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
                    firstname: this.props.youPlaceholder || (i18n.t('general.you') + (this.props.postfix || '')),
                    id: this.userRepo.getCurrentUserId(),
                    lastname: '',
                },
            }, () => {
                if (this.props.onLoad) {
                    this.props.onLoad(this.state.user);
                }
            });
            return;
        }

        this.userRepo.get(this.state.id).then((user) => {
            if (!this.mounted) {
                return;
            }
            if (user) {
                this.setState({
                    user,
                }, () => {
                    if (this.props.onLoad) {
                        this.props.onLoad(this.state.user);
                    }
                });
            } else {
                throw Error('not found');
            }
        }).catch(() => {
            if (!this.mounted) {
                return;
            }
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
        const {prefix, defaultString} = this.props;
        if (!user || this.props.noDetail === true) {
            return;
        }
        if (this.props.onClick) {
            this.props.onClick(user.id || '');
        }
        e.stopPropagation();
        e.preventDefault();
        this.broadcastEvent('User_Dialog_Open', {
            id: user.id,
            text: `${prefix}${defaultString}`,
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
