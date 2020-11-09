/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import GroupRepo, {GroupDBUpdated} from '../../repository/group';
import {IGroup} from '../../repository/group/interface';
import {TextAvatar} from '../UserAvatar';
import AvatarService, {AvatarSrcUpdated} from '../../services/avatarService';
import {find} from 'lodash';
import Broadcaster from '../../services/broadcaster';
import {GetDbFileName} from "../../repository/file";

import './style.scss';

interface IProps {
    className?: string;
    id: string;
    forceReload?: boolean;
    teamId: string;
}

interface IState {
    className: string;
    group: IGroup | null;
    id: string;
    photo?: string;
}

class GroupAvatar extends React.PureComponent<IProps, IState> {
    private groupRepo: GroupRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private avatarService: AvatarService;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: null,
            id: props.id
        };

        this.groupRepo = GroupRepo.getInstance();
        this.avatarService = AvatarService.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.getGroup();
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.getGroup));
        this.eventReferences.push(this.broadcaster.listen(AvatarSrcUpdated, this.getGroupPhoto));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id || this.props.forceReload) {
            this.tryTimeout = 0;
            clearTimeout(this.tryTimeout);
            this.setState({
                id: newProps.id,
            }, () => {
                this.getGroup();
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
        const {group, photo, className} = this.state;
        return (
            <span className={'qac ' + className}>{(group && photo) ?
                <img className="avatar-image" src={photo} alt="avatar" draggable={false}
                     onError={this.imgErrorHandler}/> : <TextAvatar fname={(group ? group.title : undefined)}/>}
            </span>
        );
    }

    private getGroup = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.ids.indexOf(`${this.props.teamId}_${this.state.id}`) === -1) {
            return;
        }

        this.groupRepo.get(this.props.teamId, this.state.id).then((group) => {
            if (!this.mounted) {
                return;
            }
            if (group) {
                this.setState({
                    group,
                });
                this.getAvatarPhoto(group);
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
                    this.getGroup();
                }, 1000);
            } else {
                this.setState({
                    photo: undefined,
                });
            }
        });
    }

    /* Get group picture AKA avatar */
    private getAvatarPhoto(group: IGroup) {
        if (group && group.photo && group.photo.photosmall.fileid && group.photo.photosmall.fileid !== '0') {
            if (this.state.group && group.id !== this.state.group.id) {
                this.avatarService.resetRetries(group.id || '');
            }
            this.getAvatar(group.teamid || '0', group.id || '', GetDbFileName(group.photo.photosmall.fileid, group.photo.photosmall.clusterid));
        } else {
            this.setState({
                photo: undefined,
            });
        }
    }

    /* Get group photo */
    private getGroupPhoto = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }
        let item: any = null;
        if (data && data.items.length > 0) {
            item = find(data.items, {id: this.state.id});
        }
        if (item) {
            this.getAvatar(item.teamid, item.id, item.fileName);
        }
    }

    /* Get avatar */
    private getAvatar(teamId: string, id: string, fileName: string) {
        this.avatarService.getAvatar(teamId, id, fileName).then((photo) => {
            if (photo !== '') {
                this.setState({
                    photo,
                });
            }
        }).catch((err) => {
            window.console.log('group avatar err:', err);
        });
    }

    /* Img error handler */
    private imgErrorHandler = () => {
        const {group} = this.state;
        if (group && group.photo && group.photo.photosmall.fileid && group.photo.photosmall.fileid !== '0') {
            const fileName = GetDbFileName(group.photo.photosmall.fileid, group.photo.photosmall.clusterid);
            this.avatarService.remove(group.id || '', fileName).then(() => {
                this.getAvatar(group.teamid || '0', group.id || '', fileName);
            });
        }
    }
}

export default GroupAvatar;
