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
import {BookmarkRounded} from '@material-ui/icons';
import AvatarService from '../../services/avatarService';
import {find} from 'lodash';

import './style.css';
import RiverLogo from '../RiverLogo';

const DefaultColors = [
    '#30496B',
    '#B6C1D4',
    '#476892',
    '#3D3949',
    '#FBCA88',
    '#ABE5E6',
    '#F32F8E',
    '#DA1FF2',
    '#7D6AE7',
    '#239FE9',
    '#FD5A49',
];

const SecondaryColors = [
    '#30B8D2',
    '#EC68B1',
    '#59355D',
    '#6772A4',
    '#EF69AD',
    '#7062F0',
    '#B236D0',
    '#4C15D0',
    '#56A2D5',
    '#44D5F3',
    '#FDDC98',
];

const defaultGradients: string[] = [];

DefaultColors.forEach((color, index) => {
    defaultGradients.push(`linear-gradient(45deg,${color},${SecondaryColors[index]})`);
});

const sumChars = (str: string): number => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }

    return sum;
};

const hexToRgb = (hex: string): any => {
    if (hex.charAt && hex.charAt(0) === '#') {
        hex = removeHash(hex);
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return {r, g, b};
};

const removeHash = (hex: string) => {
    const arr = hex.split('');
    arr.shift();
    return arr.join('');
};

const contrast = (hex: string) => {
    const rgb = hexToRgb(hex);
    const o = Math.round(((parseInt(rgb.r, 10) * 299) + (parseInt(rgb.g, 10) * 587) + (parseInt(rgb.b, 10) * 114)) / 1000);
    return (o <= 180) ? '#fff' : '#333';
};

const GetUniqueColor = (str: string, list: string[]) => {
    return list[sumChars(str) % list.length];
};

const TextAvatar = (fname?: string, lname?: string) => {
    const str = fname || '' + lname || '';
    let name = 'NA';
    if (fname && lname) {
        name = fname.substr(0, 1) + lname.substr(0, 1);
    } else if (fname && !lname) {
        name = fname.substr(0, 2);
    } else if (!fname && lname) {
        name = lname.substr(0, 2);
    }
    name = name.toLocaleUpperCase();
    const background = GetUniqueColor(str, defaultGradients);
    const color = contrast(background.split(',')[2].substr(0, 6));
    const style = {
        background,
        color,
    };
    return (<span className="text-avatar" style={style}><span className="inner">{name}</span></span>);
};

interface IProps {
    className?: string;
    id: string;
    noDetail?: boolean;
    savedMessages?: boolean;
}

interface IState {
    className: string;
    id: string;
    photo?: string;
    user: IUser;
}

class UserAvatar extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private avatarService: AvatarService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            id: props.id,
            user: {}
        };

        this.userRepo = UserRepo.getInstance();
        this.avatarService = AvatarService.getInstance();
    }

    public componentDidMount() {
        if (!this.props.savedMessages) {
            this.getUser();
            window.addEventListener('User_DB_Updated', this.getUser);
            window.addEventListener('Avatar_SRC_Updated', this.getUserPhoto);
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (!this.props.savedMessages && this.state.id !== newProps.id) {
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
        if (!this.props.savedMessages) {
            window.removeEventListener('User_DB_Updated', this.getUser);
            window.removeEventListener('Avatar_SRC_Updated', this.getUserPhoto);
        }
    }

    public render() {
        const {user, className, photo} = this.state;
        if (this.props.savedMessages) {
            return (
                <span className={'saved-messages-avatar ' + className}>
                    <BookmarkRounded/>
                </span>
            );
        } else if (this.state.id === '2374') {
            return (
                <span className={'avatar-official ' + className}>
                    <RiverLogo height="100%" width="100%"/>
                </span>
            );
        } else {
            return (
                <span className={className} onClick={this.clickHandler}>{(user && photo) ?
                    <img className="avatar-image" src={photo}/> : TextAvatar(user.firstname, user.lastname)}</span>
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

        this.userRepo.get(this.state.id).then((user) => {
            if (user) {
                this.setState({
                    user,
                });
                this.getAvatarPhoto(user);
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

    /* Get profile picture AKA avatar */
    private getAvatarPhoto(user: IUser) {
        if (user && user.photo && user.photo.photosmall.fileid && user.photo.photosmall.fileid !== '0') {
            if (user.id !== this.state.user.id) {
                this.avatarService.resetRetries(user.id || '');
            }
            this.avatarService.getAvatar(user.id || '', user.photo.photosmall.fileid).then((photo) => {
                if (photo !== '') {
                    this.setState({
                        photo,
                    });
                }
            }).catch(() => {
                //
            });
        }
    }

    /* Get user photo */
    private getUserPhoto = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }
        let item: any = null;
        if (data && data.detail.items.length > 0) {
            item = find(data.detail.items, {id: this.state.id});
        }
        if (item) {
            this.avatarService.getAvatar(item.id, item.fileId).then((photo) => {
                if (photo !== '') {
                    this.setState({
                        photo,
                    });
                }
            }).catch(() => {
                //
            });
        }
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

export default UserAvatar;
export {TextAvatar, DefaultColors, SecondaryColors, GetUniqueColor};
