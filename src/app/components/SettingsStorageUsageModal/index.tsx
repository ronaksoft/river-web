/*
    Creation Time: 2019 - May - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {StorageRounded, DeleteForeverRounded} from '@material-ui/icons';
import StorageUsageService, {IDialogInfo} from '../../services/storageUsageService';
import UserAvatar from '../UserAvatar';
import {PeerType} from '../../services/sdk/messages/chat.core.types_pb';
import GroupAvatar from '../GroupAvatar';
import UserName from '../UserName';
import GroupName from '../GroupName';
import {getHumanReadableSize} from '../MessageFile';
import IconButton from '@material-ui/core/IconButton/IconButton';

import './style.css';

interface IProps {
    onDone?: () => void;
}

interface IState {
    list: IDialogInfo[];
    open: boolean;
}

class SettingsStorageUsageModal extends React.Component<IProps, IState> {
    private storageUsageService: StorageUsageService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            list: [],
            open: false,
        };
        this.storageUsageService = StorageUsageService.getInstance();
    }

    public componentDidMount() {
        //
    }

    public openDialog() {
        this.setState({
            open: true,
        }, () => {
            this.getUsage();
        });
    }

    public render() {
        const {open, list} = this.state;
        return (
            <SettingsModal open={open} title="Storage Usage"
                           icon={<StorageRounded/>}
                           onClose={this.modalCloseHandler}>
                <div className="storage-usage">
                    {list.map((item, key) => {
                        return (<div key={key} className="storage-item">
                            <div className="icon-container">
                                {item.peerType === PeerType.PEERUSER &&
                                <UserAvatar className="avatar" id={item.peerId || ''}/>}
                                {item.peerType === PeerType.PEERGROUP &&
                                <GroupAvatar className="avatar" id={item.peerId || ''}/>}
                            </div>
                            <div className="info-container">
                                <div className="name-row">
                                    {item.peerType === PeerType.PEERUSER &&
                                    <UserName className="name" id={item.peerId || ''}/>}
                                    {item.peerType === PeerType.PEERGROUP &&
                                    <GroupName className="name" id={item.peerId || ''}/>}
                                </div>
                                <div className="size-row">{getHumanReadableSize(item.totalSize)}</div>
                            </div>
                            <div className="action-container">
                                <IconButton onClick={this.clearByIdHandler.bind(this, item.peerId || '')}>
                                    <DeleteForeverRounded/>
                                </IconButton>
                            </div>
                        </div>);
                    })}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
        });
    }

    private clearByIdHandler = (id: string) => {
        window.console.log(id);
    }

    private getUsage() {
        this.storageUsageService.compute().then((list) => {
            window.console.log(list);
            this.setState({
                list,
            });
        });
    }
}

export default SettingsStorageUsageModal;
