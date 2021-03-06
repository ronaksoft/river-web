/*
    Creation Time: 2018 - Oct - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {IUser} from '../../repository/user/interface';
import UserRepo, {UserDBUpdated} from '../../repository/user';
import {BookmarkBorderRounded} from '@material-ui/icons';
import AvatarService, {AvatarSrcUpdated} from '../../services/avatarService';
import {find} from 'lodash';
import Broadcaster from '../../services/broadcaster';
import icon from '../../../asset/image/icon.png';
import {InputFileLocation, PeerType, UserStatus} from "../../services/sdk/messages/core.types_pb";
import RiverTime from "../../services/utilities/river_time";
import {DeletedUserLight} from "./svg";
import {GetDbFileName} from "../../repository/file";
import {FaceRounded} from '@material-ui/icons';
import CachedPhoto from "../CachedPhoto";
import {SetOptional} from "type-fest";

import './style.scss';

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

const TextDarkColors = [
    false,
    true,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    true,
];

const TextColors = [
    '#ca5650',
    '#d87b29',
    '#4e92cc',
    '#50b232',
    '#42b1a8',
    '#4e92cc',
    '#B236D0',
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

    return {b, g, r};
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

const GetUniqueColorIndex = (index: number, list: string[]) => {
    return list[index % list.length];
};

const TextAvatar = ({fname, lname, icon}: { fname?: string, lname?: string, icon?: any }) => {
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
    const index = sumChars(str);
    const background = GetUniqueColorIndex(index, defaultGradients);
    const isTextDark = TextDarkColors[index % TextDarkColors.length] || false;
    const color = contrast(background.split(',')[2].substr(0, 6));
    const style = {
        background,
        color,
    };
    return (<span className={'text-avatar' + (isTextDark ? ' dark-text' : '')} style={style}><span
        className="inner">{icon ? icon : name}</span></span>);
};

interface IProps {
    className?: string;
    id: string;
    noDetail?: boolean;
    savedMessages?: boolean;
    onlineIndicator?: boolean;
    forceReload?: boolean;
    peerType?: PeerType;
    big?: boolean;
}

interface IState {
    className: string;
    id: string;
    bigFileLocation?: SetOptional<InputFileLocation.AsObject, 'version'>;
    bigLoaded: boolean;
    photo?: string;
    user: IUser;
}

class UserAvatar extends React.PureComponent<IProps, IState> {
    private userRepo: UserRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private avatarService: AvatarService;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private mounted: boolean = true;
    private riverTime: RiverTime;
    private timeout: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            bigLoaded: true,
            className: props.className || '',
            id: props.id,
            user: {}
        };

        this.userRepo = UserRepo.getInstance();
        this.avatarService = AvatarService.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.riverTime = RiverTime.getInstance();
    }

    public componentDidMount() {
        if (!this.props.savedMessages) {
            this.getUser();
            this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
            this.eventReferences.push(this.broadcaster.listen(AvatarSrcUpdated, this.getUserPhoto));
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if ((!this.props.savedMessages && this.state.id !== newProps.id) || this.props.forceReload) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            clearTimeout(this.timeout);
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
        clearTimeout(this.timeout);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {peerType} = this.props;
        const {user, className, photo, bigFileLocation, bigLoaded} = this.state;
        if (this.props.savedMessages) {
            return (
                <div className={'uac saved-messages-avatar ' + className}>
                    <BookmarkBorderRounded/>
                </div>
            );
        } else if (this.state.id === '2374') {
            return (
                <div className={'uac avatar-official ' + className}>
                    <img src={icon} alt="avatar" draggable={false}/>
                </div>
            );
        } else if (user && user.deleted) {
            return (
                <div className={'uac user-deleted ' + className}>
                    <DeletedUserLight/>
                </div>
            );
        } else {
            return (
                <>
                    <div className={'uac' + (className ? ` ${className}` : '')}
                         onClick={this.clickHandler}>{(user && photo) ?
                        <img className="avatar-image" src={photo} alt={user.firstname || ''} draggable={false}
                             onError={this.imgErrorHandler}/> :
                        <TextAvatar fname={user.firstname} lname={user.lastname}/>}
                        {Boolean(bigFileLocation) &&
                        <CachedPhoto className={'big-avatar' + (bigLoaded ? ' loaded' : '')}
                                     fileLocation={bigFileLocation} mimeType="image/jpeg"
                                     onLoad={this.bigLoadHandler}/>}
                        {Boolean(peerType === PeerType.PEEREXTERNALUSER) && <div className="external-user-overlay">
                            <FaceRounded/>
                        </div>}
                    </div>
                    {this.getOnlineIndicator()}
                </>
            );
        }
    }

    private bigLoadHandler = () => {
        if (!this.state.bigLoaded) {
            setTimeout(() => {
                this.setState({
                    bigLoaded: true,
                });
            }, 300);
        }
    }

    private getUser = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }
        if (data && data.ids.indexOf(this.state.id) === -1) {
            return;
        }
        if (this.state.id === 'all') {
            this.setState({
                user: {
                    firstname: 'all',
                }
            });
        }

        this.userRepo.get(this.state.id).then((user) => {
            if (!this.mounted) {
                return;
            }
            if (user) {
                if (this.props.big) {
                    this.setState({
                        bigFileLocation: user.photo && user.photo.photobig ? user.photo.photobig : undefined,
                        user,
                    });
                } else {
                    this.setState({
                        user,
                    });
                }
                this.getAvatarPhoto(user);
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
            } else {
                this.setState({
                    bigFileLocation: undefined,
                    bigLoaded: false,
                    photo: undefined,
                });
            }
        });
    }

    /* Get profile picture AKA avatar */
    private getAvatarPhoto(user: IUser) {
        if (!this.mounted) {
            return;
        }
        if (user && user.photo && user.photo.photosmall.fileid && user.photo.photosmall.fileid !== '0') {
            if (user.id !== this.state.user.id) {
                this.avatarService.resetRetries(user.id || '');
            }
            this.getAvatar(user.id || '', GetDbFileName(user.photo.photosmall.fileid, user.photo.photosmall.clusterid));
        } else {
            this.setState({
                bigFileLocation: undefined,
                bigLoaded: false,
                photo: undefined,
            });
        }
    }

    /* Get user photo */
    private getUserPhoto = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }
        let item: any = null;
        if (data && data.items.length > 0) {
            item = find(data.items, {id: this.state.id});
        }
        if (item) {
            this.getAvatar(item.id, item.fileName);
        }
    }

    /* Get avatar from service */
    private getAvatar(id: string, fileName: string) {
        this.avatarService.getAvatar('0', id, fileName).then((photo) => {
            if (!this.mounted) {
                return;
            }
            if (photo !== '') {
                this.setState({
                    photo,
                });
            }
        }).catch(() => {
            //
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
        this.broadcaster.publish(name, data);
    }

    /* Img error handler */
    private imgErrorHandler = () => {
        const {user} = this.state;
        if (user && user.photo && user.photo.photosmall.fileid && user.photo.photosmall.fileid !== '0') {
            const fileName = GetDbFileName(user.photo.photosmall.fileid, user.photo.photosmall.clusterid);
            this.avatarService.remove(user.id || '', fileName).then(() => {
                this.getAvatar(user.id || '', fileName);
            });
        }
    }

    /* Online indicator content */
    private getOnlineIndicator() {
        if (!this.props.onlineIndicator) {
            return null;
        }

        const {user} = this.state;
        const lastSeen = user.status_last_modified || user.lastseen || 0;
        if (this.riverTime.now() - lastSeen < 60 && user.status === UserStatus.USERSTATUSONLINE) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.forceUpdate();
            }, 15000);
            return <div className="online-indicator"/>;
        }

        return null;
    }
}

export default UserAvatar;
export {TextAvatar, DefaultColors, SecondaryColors, TextColors, GetUniqueColor};
