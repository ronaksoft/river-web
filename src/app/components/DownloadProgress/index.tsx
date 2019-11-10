/*
    Creation Time: 2019 - Feb - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {CloseRounded, CloudDownloadRounded} from '@material-ui/icons';
import ProgressBroadcaster from '../../services/progress';
import {IFileProgress} from '../../services/sdk/fileManager';
import {getHumanReadableSize} from '../MessageFile';

import './style.scss';

interface IProps {
    className?: string;
    id: number;
    fileSize: number;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', messageId: number) => void;
    onComplete?: (id: number) => void;
    hideSizeIndicator?: boolean;
}

interface IState {
    className: string;
    fileState: 'download' | 'progress';
}

class DownloadProgress extends React.PureComponent<IProps, IState> {
    private messageId: number = 0;
    private circleProgressRef: any = null;
    private mediaSizeRef: any = null;
    private progressBroadcaster: ProgressBroadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            fileState: props.id < 0 ? 'progress' : 'download',
        };

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.messageId = props.id;

        if (props.id < 0) {
            this.initProgress();
        }
    }

    public componentDidMount() {
        if (this.props.hideSizeIndicator !== true) {
            this.displayFileSize(-1);
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.messageId !== newProps.id) {
            this.messageId = newProps.id;
            this.initProgress();
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {className, fileState} = this.state;
        return (
            <div className={`download-progress-container ${className}`}>
                {Boolean(this.props.hideSizeIndicator !== true) &&
                <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>}
                <div className="media-action">
                    {Boolean(fileState === 'download') &&
                    <CloudDownloadRounded onClick={this.downloadFileHandler}/>}
                    {Boolean(fileState === 'progress') && <React.Fragment>
                        <div className="progress">
                            <svg viewBox='0 0 32 32'>
                                <circle ref={this.progressRefHandler} r='14' cx='16' cy='16'/>
                            </svg>
                        </div>
                        <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                    </React.Fragment>}
                </div>
            </div>
        );
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Download progress handler */
    private downloadProgressHandler = (progress: IFileProgress) => {
        if (this.props.hideSizeIndicator !== true) {
            if (this.props.id > 0) {
                this.displayFileSize(progress.download);
            } else {
                this.displayFileSize(progress.upload);
            }
        }
        if (!this.circleProgressRef) {
            return;
        }
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                fileState: 'download',
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 85;
        } else if (progress.state === 'complete') {
            v = 88;
            if (this.props.onComplete) {
                this.props.onComplete(this.props.id);
                return;
            }
        }
        if (v < 3) {
            v = 3;
        }
        this.circleProgressRef.style.strokeDasharray = `${v} 88`;
    }

    /* Download file handler */
    private downloadFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('download', this.props.id);
            this.setState({
                fileState: 'progress',
            }, () => {
                this.initProgress();
            });
        }
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        if (this.props.onAction) {
            if (this.props.id < 0) {
                this.props.onAction('cancel', this.props.id);
            } else {
                this.props.onAction('cancel_download', this.props.id);
            }
        }
    }

    /* Initialize progress bar */
    private initProgress() {
        if (this.state.fileState === 'progress' || this.props.id < 0) {
            this.removeAllListeners();
            this.eventReferences.push(this.progressBroadcaster.listen(this.props.id, this.downloadProgressHandler));
        } else {
            if (this.progressBroadcaster.isActive(this.props.id)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(this.props.id, this.downloadProgressHandler));
                });
            }
        }
    }

    /* File size ref handler */
    private mediaSizeRefHandler = (ref: any) => {
        this.mediaSizeRef = ref;
    }

    /* Display file size */
    private displayFileSize(loaded: number) {
        if (!this.mediaSizeRef) {
            return;
        }
        if (loaded <= 0) {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(this.props.fileSize)}`;
        } else {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(this.props.fileSize)}`;
        }
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }
}

export default DownloadProgress;
