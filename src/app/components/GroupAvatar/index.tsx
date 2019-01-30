/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import GroupRepo from '../../repository/group';
import {IGroup} from '../../repository/group/interface';
import {TextAvatar} from '../UserAvatar';
import AvatarService from '../../services/avatarService';
import {find} from 'lodash';

import './style.css';

interface IProps {
    className?: string;
    id: string;
}

interface IState {
    className: string;
    group: IGroup | null;
    id: string;
    photo?: string;
}

class GroupAvatar extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private tryTimeout: any = null;
    private tryCount: number = 0;
    private avatarService: AvatarService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            group: null,
            id: props.id
        };

        this.groupRepo = GroupRepo.getInstance();
        this.avatarService = AvatarService.getInstance();
    }

    public componentDidMount() {
        this.getGroup();
        window.addEventListener('Group_DB_Updated', this.getGroup);
        window.addEventListener('Avatar_SRC_Updated', this.getGroupPhoto);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.id !== newProps.id) {
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
        window.removeEventListener('Group_DB_Updated', this.getGroup);
        window.removeEventListener('Avatar_SRC_Updated', this.getGroupPhoto);
    }

    public render() {
        const {group, photo, className} = this.state;
        return (
            <span className={className}>{(group && photo) ?
                <img className="avatar-image" src={photo}/> : TextAvatar(group ? group.title : undefined)}</span>
        );
    }

    private getGroup = (data?: any) => {
        if (!this.state || this.state.id === '') {
            return;
        }

        if (data && data.detail.ids.indexOf(this.state.id) === -1) {
            return;
        }

        this.groupRepo.get(this.state.id).then((group) => {
            this.setState({
                group,
            });
            this.getAvatarPhoto(group);
        }).catch(() => {
            if (this.tryCount < 10) {
                this.tryCount++;
                this.tryTimeout = setTimeout(() => {
                    this.getGroup();
                }, 1000);
            }
        });
    }

    /* Get group picture AKA avatar */
    private getAvatarPhoto(group: IGroup) {
        if (group && group.photo && group.photo.photosmall.fileid && group.photo.photosmall.fileid !== '0') {
            if (this.state.group && group.id !== this.state.group.id) {
                this.avatarService.resetRetries(group.id || '');
            }
            this.avatarService.getAvatar(group.id || '', group.photo.photosmall.fileid).then((photo) => {
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

    /* Get group photo */
    private getGroupPhoto = (data?: any) => {
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
}

export default GroupAvatar;
