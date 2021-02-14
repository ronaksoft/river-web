/*
    Creation Time: 2021 - Feb - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import * as React from 'react';
import {MenuItem, Select} from "@material-ui/core";
import i18n from "../../services/i18n";
import SettingsModal from "../SettingsModal";
import ElectronService from "../../services/electron";
import {CheckRounded} from "@material-ui/icons";

import './style.scss';

interface IScreen {
    appIcon?: string;
    displayId: string;
    id: string;
    name: string;
    thumbnail?: string;
}

interface IProps {
    onError?: (message: string) => void;
}

interface IState {
    list: IScreen[];
    loading: boolean;
    open: boolean;
    selectedId: string;
}

const mediaDevices = navigator.mediaDevices as any;

class ScreenCaptureModal extends React.Component<IProps, IState> {
    private electronService: ElectronService;
    private resolve: any = null;
    private reject: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            list: [],
            loading: false,
            open: false,
            selectedId: '_',
        };

        this.electronService = ElectronService.getInstance();
    }

    public open = (): Promise<MediaStream> => {
        if (!ElectronService.isElectron()) {
            return mediaDevices.getDisplayMedia({
                audio: true,
                video: true,
            });
        } else {
            this.setState({
                open: true,
            });
            return new Promise<MediaStream>((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.getScreen();
            }).catch((err) => {
                return Promise.reject();
            });
        }
    }

    public render() {
        const {open, selectedId, list} = this.state;
        const thumbnail = list.find(o => o.id === selectedId);
        return (
            <SettingsModal open={open} title={i18n.t('call.screen_list')} onClose={this.closeHandler}
                           noScrollbar={true}>
                <div className="screen-capture-modal">
                    <div className="select-input">
                        <Select
                            value={selectedId}
                            onChange={this.selectChangeHandler}
                            margin="dense"
                            variant="outlined"
                            fullWidth={true}
                            classes={{
                                select: 'media-input-select',
                            }}
                        >
                            <MenuItem value="_">
                                <em>{i18n.t('general.none')}</em>
                            </MenuItem>
                            {list.map((option, key) => {
                                return (<MenuItem key={key} value={option.id}>{option.name}</MenuItem>);
                            })}
                        </Select>
                    </div>
                    {thumbnail && <>
                        <div className="screen-preview">
                            <img src={thumbnail.thumbnail} alt="preview"/>
                        </div>
                        <div className="screen-gap"/>
                        <div className="actions-bar">
                            <div className="add-action" onClick={this.doneHandler}>
                                <CheckRounded/>
                            </div>
                        </div>
                    </>}
                </div>
            </SettingsModal>
        );
    }

    private closeHandler = () => {
        this.setState({
            open: false,
        });
        if (this.reject) {
            this.reject();
            this.resolve = null;
            this.reject = null;
        }
    }

    private selectChangeHandler = (e: any) => {
        const id = e.target.value;
        this.setState({
            selectedId: id,
        });
    }

    private getScreen() {
        this.electronService.getScreenCaptureList().then((res) => {
            this.setState({
                list: res.list,
            });
        }).catch((err) => {
            this.electronService.screenCapturePermission();
        });
    }

    private doneHandler = () => {
        const {selectedId} = this.state;
        if (selectedId === '_') {
            this.closeHandler();
            return;
        }
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: selectedId,
                }
            } as any,
        }).then((stream) => {
            if (this.resolve) {
                this.resolve(stream);
                this.resolve = null;
                this.reject = null;
            }
            this.closeHandler();
        }).catch((err) => {
            if (this.reject) {
                this.reject(err);
                this.resolve = null;
                this.reject = null;
            }
            this.closeHandler();
        });
    }
}

export default ScreenCaptureModal;
