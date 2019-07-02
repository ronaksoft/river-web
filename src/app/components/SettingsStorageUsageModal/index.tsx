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
import {DeleteForeverRounded, StorageRounded} from '@material-ui/icons';
import StorageUsageService, {IDialogInfo, IFileWithId, IStorageProgress} from '../../services/storageUsageService';
import UserAvatar from '../UserAvatar';
import {PeerType} from '../../services/sdk/messages/chat.core.types_pb';
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

import './style.css';

interface IProps {
    onDone?: (peerIds: string[]) => void;
}

interface IState {
    confirmOpen: boolean;
    list: IDialogInfo[];
    loading: boolean;
    loadingProgress?: { percent: number, filesTotal: number };
    open: boolean;
    progress: { percent: number, filesTotal: number };
    selectedDialog?: IDialogInfo;
    selectedDialogs: { [key: number]: boolean };
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
        const {loading, loadingProgress, open, list, selectedDialog, progress, confirmOpen} = this.state;
        return (
            <React.Fragment>
                <SettingsModal open={open} title="Storage Usage"
                               icon={<StorageRounded/>}
                               onClose={this.modalCloseHandler}>
                    {!loading && <div className="storage-usage">
                        <div className="info-btn">
                            <Button color="secondary" fullWidth={true} variant="contained"
                                    onClick={this.clearCacheHandler}>
                                Clear Cache ({getHumanReadableSize(this.state.totalSize)})
                            </Button>
                        </div>
                        {list.map((item, key) => {
                            return (<div key={key} className="storage-item">
                                <div className="icon-container"
                                     onClick={this.clearByIdHandler.bind(this, item.peerId || '')}>{this.getAvatar(item)}</div>
                                <div className="info-container"
                                     onClick={this.clearByIdHandler.bind(this, item.peerId || '')}>
                                    <div className="name-row">{this.getName(item)}</div>
                                    <div className="size-row">
                                        {getHumanReadableSize(item.totalSize)}
                                        <span className="bullet"/>
                                        {item.totalFile} {item.totalFile === 1 ? 'file' : 'files'}
                                    </div>
                                </div>
                                <div className="checkbox-container">
                                    <Checkbox
                                        color="primary"
                                        checked={this.isDialogChecked(item.peerId)}
                                        onChange={this.checkDialogItem.bind(this, item.peerId)}
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
                        <div className="progress-info-container">{`Scanning ${progress.filesTotal} files...`}</div>
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
                                            onChange={this.checkItem.bind(this, key)}
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
                                            {selectedDialog.mediaTypes[key].totalFile} {selectedDialog.mediaTypes[key].totalFile === 1 ? 'file' : 'files'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="info-btn">
                            <Button color="secondary" fullWidth={true} variant="contained"
                                    onClick={this.clearCacheHandler}>
                                Clear Cache ({getHumanReadableSize(this.state.totalSelectedSize)})
                            </Button>
                        </div>
                    </div>
                </SettingsModal>}
                <OverlayDialog
                    open={confirmOpen}
                    onClose={this.confirmCloseHandler}
                    className="confirm-dialog"
                    disableEscapeKeyDown={Boolean(loadingProgress)}
                    disableBackdropClick={Boolean(loadingProgress)}
                >
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogContent className="cache-dialog-content">
                        {!loadingProgress && <DialogContentText>
                            All media will stay in River cloud and can be re-downloaded, <br/>If you need it again.
                        </DialogContentText>}
                        {loadingProgress && <LinearProgress variant="determinate" value={loadingProgress.percent}/>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.confirmCloseHandler} color="secondary"
                                disabled={Boolean(loadingProgress)}>Cancel</Button>
                        <Button onClick={this.confirmAcceptHandler} color="primary" autoFocus={true}
                                disabled={Boolean(loadingProgress)}>Yes</Button>
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
        this.storageUsageService.compute(this.computeProgress).then((list) => {
            let totalSize: number = 0;
            const selectedDialogs: { [key: number]: boolean } = {};
            list.forEach((item) => {
                totalSize += item.totalSize;
                selectedDialogs[item.peerId] = true;
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

    private clearByIdHandler = (id: string) => {
        const {list} = this.state;
        const index = findIndex(list, {peerId: id});
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
                return <UserName className="name" id={info.peerId}/>;
            case PeerType.PEERGROUP:
                return <GroupName className="name" id={info.peerId}/>;
            default:
                return '';
        }
    }

    private getAvatar(info: IDialogInfo) {
        switch (info.peerType) {
            case PeerType.PEERUSER:
                return <UserAvatar className="avatar" id={info.peerId}/>;
            case PeerType.PEERGROUP:
                return <GroupAvatar className="avatar" id={info.peerId}/>;
            default:
                return '';
        }
    }

    private isChecked(type: number | string) {
        const {selectedMediaTypes} = this.state;
        return selectedMediaTypes.hasOwnProperty(type);
    }

    private checkItem = (type: number | string) => {
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

    private isDialogChecked(id: string) {
        const {selectedDialogs} = this.state;
        return selectedDialogs.hasOwnProperty(id);
    }

    private checkDialogItem = (id: string) => {
        const {selectedDialogs} = this.state;
        if (!selectedDialogs.hasOwnProperty(id)) {
            selectedDialogs[id] = true;
        } else {
            delete selectedDialogs[id];
        }
        this.setState({
            selectedDialogs,
            totalSize: this.computeSelectedDialogSize(selectedDialogs),
        });
    }

    private getMediaTypeTitle(type: string) {
        switch (parseInt(type, 10)) {
            case C_MESSAGE_TYPE.Audio:
                return 'Audio';
            case C_MESSAGE_TYPE.File:
                return 'File';
            case C_MESSAGE_TYPE.Picture:
                return 'Photo';
            case C_MESSAGE_TYPE.Video:
                return 'Video';
            case C_MESSAGE_TYPE.Voice:
                return 'Voice';
            default:
                return 'Other';
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
            if (selectedDialogs.hasOwnProperty(item.peerId)) {
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
        const peerIds: string[] = [];
        if (selectedDialog) {
            const index = findIndex(list, {peerId: selectedDialog.peerId});
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
            peerIds.push(selectedDialog.peerId);
        } else {
            const keys: number[] = [];
            const ids = Object.keys(selectedDialogs);
            list.filter((o) => {
                return ids.indexOf(o.peerId) > -1;
            }).forEach((info, index) => {
                keys.push(index);
                peerIds.push(info.peerId);
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
                this.props.onDone(peerIds);
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
