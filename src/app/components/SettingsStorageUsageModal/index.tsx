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
import {DeleteForeverRounded, DataUsageRounded} from '@material-ui/icons';
import StorageUsageService, {IDialogInfo, IFileWithId, IStorageProgress} from '../../services/storageUsageService';
import UserAvatar from '../UserAvatar';
import {PeerType} from '../../services/sdk/messages/core.types_pb';
import GroupAvatar from '../GroupAvatar';
import UserName from '../UserName';
import GroupName from '../GroupName';
import {getHumanReadableSize} from '../MessageFile';
import {findIndex, throttle} from 'lodash';
import Checkbox from '@material-ui/core/Checkbox';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import OverlayDialog from '@material-ui/core/Dialog/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import i18n from "../../services/i18n";
import {localize} from '../../services/utilities/localize';
import {IPeer} from "../../repository/dialog/interface";
import {GetPeerNameByPeer} from "../../repository/dialog";

import './style.scss';

interface IProps {
    onDone?: (peerIds: IPeer[]) => void;
}

interface IState {
    confirmOpen: boolean;
    list: IDialogInfo[];
    loading: boolean;
    loadingProgress?: { percent: number, filesTotal: number };
    open: boolean;
    progress: { percent: number, filesTotal: number };
    selectedDialog?: IDialogInfo;
    selectedDialogs: { [key: string]: boolean };
    selectedMediaTypes: { [key: number]: boolean };
    totalSelectedSize: number;
    totalSize: number;
}

class SettingsStorageUsageModal extends React.Component<IProps, IState> {
    private storageUsageService: StorageUsageService;
    private readonly progressThrottle: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmOpen: false,
            list: [],
            loading: false,
            open: false,
            progress: {
                filesTotal: 0,
                percent: 0,
            },
            selectedDialogs: {},
            selectedMediaTypes: {},
            totalSelectedSize: 0,
            totalSize: 0,
        };
        this.storageUsageService = StorageUsageService.getInstance();

        this.progressThrottle = throttle(this.displayProgress, 100);
    }

    public openDialog() {
        this.setState({
            open: true,
        }, () => {
            this.getUsage();
        });
    }

    public render() {
        const {loading, loadingProgress, open, list, selectedDialog, progress, confirmOpen} = this.state;
        return (
            <React.Fragment>
                <SettingsModal open={open} title={i18n.t('settings.storage_usage')}
                               icon={<DataUsageRounded/>}
                               onClose={this.modalCloseHandler}>
                    {!loading && <div className="storage-usage">
                        <div className="info-btn">
                            <Button color="secondary" fullWidth={true} variant="contained"
                                    onClick={this.clearCacheHandler}>
                                {i18n.tf('settings.clear_cache_param', getHumanReadableSize(this.state.totalSize))}
                            </Button>
                        </div>
                        {list.map((item, key) => {
                            return (<div key={key} className="storage-item">
                                <div className="icon-container"
                                     onClick={this.clearByIdHandler(item.peer)}>{this.getAvatar(item)}</div>
                                <div className="info-container"
                                     onClick={this.clearByIdHandler(item.peer)}>
                                    <div className="name-row">{this.getName(item)}</div>
                                    <div className="size-row">
                                        {getHumanReadableSize(item.totalSize)}
                                        <span className="bullet"/>
                                        {localize(item.totalFile)} {item.totalFile === 1 ? i18n.t('settings.file') : i18n.t('settings.files2')}
                                    </div>
                                </div>
                                <div className="checkbox-container">
                                    <Checkbox
                                        color="primary"
                                        checked={this.isDialogChecked(item.peer)}
                                        onChange={this.checkDialogItem(item.peer)}
                                        classes={{
                                            checked: 'checkbox-checked',
                                            root: 'checkbox',
                                        }}
                                    />
                                </div>
                            </div>);
                        })}
                    </div>}
                    {loading && <div className="storage-usage">
                        <div className="progress-bar-container">
                            <LinearProgress variant="determinate" value={progress.percent}/>
                        </div>
                        <div
                            className="progress-info-container">{i18n.tf('settings.scanning_files', String(progress.filesTotal))}</div>
                    </div>}
                </SettingsModal>
                {selectedDialog && <SettingsModal open={Boolean(open)} title={this.getName(selectedDialog)}
                                                  icon={<DeleteForeverRounded/>}
                                                  onClose={this.infoModalCloseHandler}
                                                  height={this.getModalHeight(selectedDialog)}>
                    <div className="dialog-info-container">
                        {Object.keys(selectedDialog.mediaTypes).sort().map((key) => {
                            return (
                                <div key={key} className="info-item">
                                    <div className="checkbox-container">
                                        <Checkbox
                                            color="primary"
                                            checked={this.isChecked(key)}
                                            onChange={this.checkItem(key)}
                                            classes={{
                                                checked: 'checkbox-checked',
                                                root: 'checkbox',
                                            }}
                                        />
                                    </div>
                                    <div className="info-container">
                                        <div className="title-row">{this.getMediaTypeTitle(key)}</div>
                                        <div className="size-row">
                                            {getHumanReadableSize(selectedDialog.mediaTypes[key].totalSize)}
                                            <span className="bullet"/>
                                            {selectedDialog.mediaTypes[key].totalFile} {selectedDialog.mediaTypes[key].totalFile === 1 ? i18n.t('settings.file') : i18n.t('settings.files2')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="info-btn">
                            <Button color="secondary" fullWidth={true} variant="contained"
                                    onClick={this.clearCacheHandler}>{i18n.tf('settings.clear_cache_param', getHumanReadableSize(this.state.totalSelectedSize))}</Button>
                        </div>
                    </div>
                </SettingsModal>}
                <OverlayDialog
                    open={confirmOpen}
                    onClose={this.confirmCloseHandler}
                    className="confirm-dialog"
                    disableEscapeKeyDown={Boolean(loadingProgress)}
                    disableBackdropClick={Boolean(loadingProgress)}
                    classes={{
                        paper: 'confirm-dialog-paper'
                    }}
                >
                    <DialogTitle>{i18n.t('general.are_you_sure')}</DialogTitle>
                    <DialogContent className="cache-dialog-content">
                        {!loadingProgress && <DialogContentText>
                            {i18n.t('settings.clear_cache_confirm_text')}<br/>{i18n.t('settings.clear_cache_confirm_text2')}
                        </DialogContentText>}
                        {loadingProgress && <LinearProgress variant="determinate" value={loadingProgress.percent}/>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.confirmCloseHandler} color="secondary"
                                disabled={Boolean(loadingProgress)}>{i18n.t('general.cancel')}</Button>
                        <Button onClick={this.confirmAcceptHandler} color="primary" autoFocus={true}
                                disabled={Boolean(loadingProgress)}>{i18n.t('general.yes')}</Button>
                    </DialogActions>
                </OverlayDialog>
            </React.Fragment>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            list: [],
            open: false,
            progress: {
                filesTotal: 0,
                percent: 0,
            },
        });
    }

    private infoModalCloseHandler = () => {
        this.setState({
            selectedDialog: undefined,
        });
    }

    private getUsage() {
        if (this.state.loading) {
            return;
        }
        this.setState({
            loading: true
        });
        this.storageUsageService.compute('all', this.computeProgress).then((list) => {
            let totalSize: number = 0;
            const selectedDialogs: { [key: string]: boolean } = {};
            list.forEach((item) => {
                totalSize += item.totalSize;
                selectedDialogs[GetPeerNameByPeer(item.peer)] = true;
            });
            this.setState({
                list,
                loading: false,
                selectedDialogs,
                totalSize,
            });
        });
    }

    private computeProgress = (e: IStorageProgress) => {
        this.progressThrottle(e);
    }

    private clearByIdHandler = (peer: IPeer) => (e: any) => {
        const {list} = this.state;
        const index = findIndex(list, o => o.peer.id === peer.id && o.peer.peerType === peer.peerType);
        if (index > -1) {
            const selectedMediaTypes: { [key: number]: boolean } = {};
            Object.keys(list[index].mediaTypes).forEach((key) => {
                selectedMediaTypes[key] = true;
            });
            this.setState({
                selectedDialog: list[index],
                selectedMediaTypes,
                totalSelectedSize: list[index].totalSize,
            });
        }
    }

    private getName(info: IDialogInfo) {
        switch (info.peerType) {
            case PeerType.PEERUSER:
                return <UserName className="name" id={info.peer.id}/>;
            case PeerType.PEERGROUP:
                return <GroupName className="name" id={info.peer.id} teamId={info.teamId}/>;
            default:
                return null;
        }
    }

    private getAvatar(info: IDialogInfo) {
        switch (info.peerType) {
            case PeerType.PEERUSER:
                return <UserAvatar className="avatar" id={info.peer.id}/>;
            case PeerType.PEERGROUP:
                return <GroupAvatar className="avatar" id={info.peer.id} teamId={info.teamId}/>;
            default:
                return null;
        }
    }

    private isChecked(type: number | string) {
        const {selectedMediaTypes} = this.state;
        return selectedMediaTypes.hasOwnProperty(type);
    }

    private checkItem = (type: number | string) => (e: any) => {
        const {selectedMediaTypes} = this.state;
        if (!selectedMediaTypes.hasOwnProperty(type)) {
            selectedMediaTypes[type] = true;
        } else {
            delete selectedMediaTypes[type];
        }
        this.setState({
            selectedMediaTypes,
            totalSelectedSize: this.computeSelectedSize(selectedMediaTypes),
        });
    }

    private isDialogChecked(peer: IPeer) {
        const {selectedDialogs} = this.state;
        return selectedDialogs.hasOwnProperty(`${peer.id}_${peer.peerType}`);
    }

    private checkDialogItem = (peer: IPeer) => (e: any) => {
        const {selectedDialogs} = this.state;
        const peerName = GetPeerNameByPeer(peer);
        if (!selectedDialogs.hasOwnProperty(peerName)) {
            selectedDialogs[peerName] = true;
        } else {
            delete selectedDialogs[peerName];
        }
        this.setState({
            selectedDialogs,
            totalSize: this.computeSelectedDialogSize(selectedDialogs),
        });
    }

    private getMediaTypeTitle(type: string) {
        switch (parseInt(type, 10)) {
            case C_MESSAGE_TYPE.Audio:
                return i18n.t('settings.audios');
            case C_MESSAGE_TYPE.File:
                return i18n.t('settings.files');
            case C_MESSAGE_TYPE.Picture:
                return i18n.t('settings.photos');
            case C_MESSAGE_TYPE.Video:
                return i18n.t('settings.videos');
            case C_MESSAGE_TYPE.Voice:
                return i18n.t('settings.voices');
            default:
                return i18n.t('settings.other');
        }
    }

    private computeSelectedSize(selectedMediaTypes: { [key: number]: boolean }) {
        const {selectedDialog} = this.state;
        if (!selectedDialog) {
            return 0;
        }
        let totalSize: number = 0;
        Object.keys(selectedMediaTypes).forEach((key) => {
            if (selectedDialog.mediaTypes.hasOwnProperty(key)) {
                totalSize += selectedDialog.mediaTypes[key].totalSize;
            }
        });
        return totalSize;
    }

    private computeSelectedDialogSize(selectedDialogs: { [key: string]: boolean }) {
        const {list} = this.state;
        if (!list) {
            return 0;
        }
        let totalSize: number = 0;
        list.forEach((item) => {
            if (selectedDialogs.hasOwnProperty(`${item.peer.id}_${item.peer.peerType}`)) {
                totalSize += item.totalSize;
            }
        });
        return totalSize;
    }

    private getModalHeight(selectedDialog: IDialogInfo) {
        if (!selectedDialog) {
            return undefined;
        }
        return `${Object.keys(selectedDialog.mediaTypes).length * 49 + 44}px`;
    }

    private displayProgress = (e: IStorageProgress) => {
        this.setState({
            progress: {
                filesTotal: e.fileCount,
                percent: Math.floor((e.done / e.total) * 100),
            },
        });
    }

    private clearCacheHandler = () => {
        this.setState({
            confirmOpen: true,
        });
    }

    private confirmCloseHandler = () => {
        this.setState({
            confirmOpen: false,
        });
    }

    private confirmAcceptHandler = () => {
        const {selectedDialogs, selectedMediaTypes, selectedDialog, list} = this.state;
        const items: IFileWithId[] = [];
        const peers: IPeer[] = [];
        if (selectedDialog) {
            const index = findIndex(list, o => o.peer.id === selectedDialog.peer.id && o.peerType === selectedDialog.peer.peerType);
            Object.keys(selectedMediaTypes).forEach((key) => {
                if (selectedDialog.mediaTypes.hasOwnProperty(key)) {
                    selectedDialog.mediaTypes[key].fileIds.forEach((item: IFileWithId) => {
                        items.push(item);
                    });
                    delete list[index].mediaTypes[key];
                }
            });
            if (Object.keys(list[index].mediaTypes).length === 0) {
                list.splice(index, 1);
            }
            peers.push(selectedDialog.peer);
        } else {
            const keys: number[] = [];
            const ids = Object.keys(selectedDialogs);
            list.filter((o) => {
                return ids.indexOf(GetPeerNameByPeer(o.peer)) > -1;
            }).forEach((info, index) => {
                keys.push(index);
                peers.push(info.peer);
                Object.keys(info.mediaTypes).forEach((key) => {
                    info.mediaTypes[key].fileIds.forEach((item: IFileWithId) => {
                        items.push(item);
                    });
                });
            });
            keys.reverse().forEach((key) => {
                list.splice(key, 1);
            });
        }
        this.storageUsageService.clearCache(items, this.clearStorageProgressHandler).then(() => {
            this.setState({
                confirmOpen: false,
                list,
                loadingProgress: undefined,
                open: Boolean(list.length !== 0),
                selectedDialog: undefined,
                selectedMediaTypes: {},
            });
            if (this.props.onDone) {
                this.props.onDone(peers);
            }
        });
    }

    private clearStorageProgressHandler = (e: IStorageProgress) => {
        this.setState({
            loadingProgress: {
                filesTotal: e.fileCount,
                percent: Math.floor((e.done / e.total) * 100),
            },
        });
    }
}

export default SettingsStorageUsageModal;
