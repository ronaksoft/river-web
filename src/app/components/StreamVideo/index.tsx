/*
    Creation Time: 2019 - Feb - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {convertBlobToArrayBuffer, IFileBuffer} from "../../services/sdk/fileManager";
import FileRepo from "../../repository/file";
import BufferProgressBroadcaster from "../../services/bufferProgress";
import {InputFileLocation} from "../../services/sdk/messages/core.types_pb";
import {transformMimeType} from "./helper";
import {SetOptional} from "type-fest";

interface IProps {
    msgId: number;
    fileLocation: SetOptional<InputFileLocation.AsObject, 'version'>;
    onStartDownload: (msgId: number) => void;
    autoPlay?: boolean;
    className?: string;
    mimeType?: string;
    size?: number;
    onLoad?: () => void;
    onPlay?: () => void;
    onError?: (err: any) => void;
}

interface IState {
    className: string;
    src?: string;
}

const C_MAX_CHUNK_SIZE = 10;
const C_CHUNK_BUFFER_TRIGGER_LEN = 5;

class StreamVideo extends React.PureComponent<IProps, IState> {
    private videoRef: HTMLVideoElement | undefined;
    private fileRepo: FileRepo;
    private readonly mediaSource: MediaSource;
    private sourceBuffer: SourceBuffer | undefined;
    private parts: IFileBuffer[] = [];
    private inProgress: boolean = false;
    private bufferProgressBroadcaster: BufferProgressBroadcaster;
    private eventReferences: any[] = [];
    private completed: boolean = false;
    private firstTime: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.fileRepo = FileRepo.getInstance();
        this.mediaSource = new MediaSource();

        this.bufferProgressBroadcaster = BufferProgressBroadcaster.getInstance();
    }

    public componentDidMount() {
        this.eventReferences.push(this.bufferProgressBroadcaster.listen(this.props.msgId, this.bufferHandler));
        this.getFile();
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {className} = this.state;
        return (
            <div className={className}>
                <video ref={this.videoRefHandler} onLoad={this.props.onLoad} onPlay={this.props.onPlay}
                       autoPlay={this.props.autoPlay}
                       controls={true} onError={this.props.onError}/>
            </div>
        );
    }

    private videoRefHandler = (ref: any) => {
        this.videoRef = ref;
    }

    /* Get file from cached storage */
    private getFile() {
        if (!this.videoRef) {
            return;
        }
        this.videoRef.src = URL.createObjectURL(this.mediaSource);
        this.mediaSource.addEventListener('sourceopen', this.sourceOpenHandler, {once: true});
    }

    private sourceOpenHandler = () => {
        if (!this.videoRef) {
            return;
        }
        const {mimeType, msgId} = this.props;
        const mime = transformMimeType(mimeType || 'video/mp4');
        URL.revokeObjectURL(this.videoRef.src);
        this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);
        this.props.onStartDownload(msgId);
    }

    private bufferHandler = (data: IFileBuffer) => {
        if (!this.sourceBuffer) {
            return;
        }
        if (data.cache) {
            if (this.props.onError) {
                this.props.onError('already_downloaded');
            }
            return;
        }
        this.parts.push(data);
        if (data.completed) {
            this.completed = true;
        }
        if (this.firstTime) {
            this.firstTime = false;
            if (data.part !== 1) {
                this.loadFromDb(data.part);
                this.inProgress = true;
            }
        }
        if (!this.inProgress) {
            this.updateEndHandler();
        }
    }

    private updateEndHandler = (end?: boolean) => {
        if (end) {
            if (this.mediaSource.readyState === 'open') {
                this.mediaSource.endOfStream();
            }
        }
        this.inProgress = false;
        if (!this.completed && this.parts.length < C_CHUNK_BUFFER_TRIGGER_LEN) {
            return;
        }
        if (!this.sourceBuffer || this.parts.length === 0) {
            return;
        }
        const chunkSize = Math.min(this.parts.length, C_MAX_CHUNK_SIZE);
        const firstBuffer = this.parts[0];
        const lastBuffer = this.parts[chunkSize - 1];
        if (firstBuffer && lastBuffer) {
            this.parts.splice(0, chunkSize);
            this.inProgress = true;
            const id = this.props.fileLocation.fileid || '0';
            this.fileRepo.getTempsRangeById(id, firstBuffer.part, lastBuffer.part).then((res) => {
                if (res.length > 0) {
                    return convertBlobToArrayBuffer(new Blob(res.map(o => o.data), {type: res[0].data.type}));
                } else {
                    throw Error('not found');
                }
            }).then((buf) => {
                if (this.sourceBuffer) {
                    this.sourceBuffer.appendBuffer(buf);
                    this.sourceBuffer.onupdateend = () => {
                        this.updateEndHandler(lastBuffer.completed);
                    };
                }
            }).catch(() => {
                this.updateEndHandler();
            });
        } else {
            this.inProgress = false;
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

    private loadFromDb(part: number) {
        for (let i = part - 1; i > 0; i--) {
            this.parts.unshift({
                cache: false,
                completed: false,
                part: i,
            });
        }
        this.updateEndHandler();
    }
}

export default StreamVideo;
