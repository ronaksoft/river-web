/*
    Creation Time: 2020 - June - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {CloseRounded, ArrowDownwardRounded} from '@material-ui/icons';
import ProgressBroadcaster from '../../services/progress';
import {IFileProgress} from '../../services/sdk/fileManager';
import {getHumanReadableSize} from '../MessageFile';
import {InputFileLocation} from "../../services/sdk/messages/core.types_pb";

import './style.scss';

interface IProps {
    fileLocation: InputFileLocation.AsObject;
    className?: string;
    fileSize?: number;
    onAction?: (cmd: 'cancel' | 'download') => void;
    onComplete?: () => void;
    hideSizeIndicator?: boolean;
}

interface IState {
    className: string;
    fileState: 'download' | 'progress';
}

class FileDownloadProgress extends React.PureComponent<IProps, IState> {
    public static getUid(fileLocation: InputFileLocation.AsObject) {
        return `${fileLocation.fileid}_${fileLocation.clusterid}`;
    }

    private circleProgressRef: any = null;
    private mediaSizeRef: any = null;
    private progressBroadcaster: ProgressBroadcaster;
    private readonly uid: string = '';
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            fileState: 'download',
        };

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.uid = FileDownloadProgress.getUid(props.fileLocation);
    }

    public componentDidMount() {
        this.initProgress();
        if (this.props.hideSizeIndicator !== true) {
            this.displayFileSize(-1);
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {className, fileState} = this.state;
        return (
            <div className={`file-download-progress-container ${className}`}>
                {Boolean(this.props.hideSizeIndicator !== true) &&
                <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>}
                <div className="media-action">
                    {Boolean(fileState === 'download') &&
                    <ArrowDownwardRounded onClick={this.downloadFileHandler}/>}
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
            this.displayFileSize(progress.download);
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
                this.props.onComplete();
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
            this.props.onAction('download');
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
            this.props.onAction('cancel');
        }
    }

    /* Initialize progress bar */
    private initProgress = () => {
        if (this.state.fileState === 'progress') {
            this.removeAllListeners();
            this.eventReferences.push(this.progressBroadcaster.listen(this.uid, this.downloadProgressHandler));
        } else {
            if (this.progressBroadcaster.isActive(this.uid)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(this.uid, this.downloadProgressHandler));
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
        const {fileSize} = this.props;
        if (fileSize === undefined) {
            return;
        }
        if (loaded <= 0) {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(fileSize)}`;
        } else {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(fileSize)}`;
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

export default FileDownloadProgress;
