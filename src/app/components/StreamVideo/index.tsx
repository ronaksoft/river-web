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
import {InputFileLocation} from "../../services/sdk/messages/chat.core.types_pb";

interface IProps {
    msgId: number;
    fileLocation: InputFileLocation.AsObject;
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

class StreamVideo extends React.PureComponent<IProps, IState> {
    private videoRef: HTMLVideoElement | undefined;
    private fileRepo: FileRepo;
    private mediaSource: MediaSource;
    private sourceBuffer: SourceBuffer | undefined;
    private buffers: IFileBuffer[] = [];
    private inProgress: boolean = false;
    private bufferProgressBroadcaster: BufferProgressBroadcaster;
    private eventReferences: any[] = [];

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
        this.bufferProgressBroadcaster.listen(this.props.msgId, this.bufferHandler);
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
        let mime = mimeType || 'video/mp4';
        switch (mimeType) {
            case 'video/mp4':
                mime = 'video/mp4; codecs="avc1.64001E,mp4a.40.2"';
                break;
            case 'video/webm':
                mime = 'video/webm; codecs="vorbis,vp8"';
                break;
        }
        URL.revokeObjectURL(this.videoRef.src);
        this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);
        this.props.onStartDownload(msgId);
    }

    private bufferHandler = (data: IFileBuffer) => {
        if (!this.sourceBuffer) {
            return;
        }
        this.buffers.push(data);
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
        if (!this.sourceBuffer || this.buffers.length === 0) {
            return;
        }
        const buffer = this.buffers.shift();
        if (buffer) {
            this.inProgress = true;
            const id = this.props.fileLocation.fileid || '0';
            this.fileRepo.getTemp(id, buffer.part).then((res) => {
                if (res) {
                    return convertBlobToArrayBuffer(res.data);
                } else {
                    throw Error('not found');
                }
            }).then((buf) => {
                if (this.sourceBuffer) {
                    this.sourceBuffer.appendBuffer(buf);
                    this.sourceBuffer.onupdateend = () => {
                        this.updateEndHandler(true);
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
}

export default StreamVideo;
