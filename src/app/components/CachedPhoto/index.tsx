/*
    Creation Time: 2019 - Jan - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import CachedFileService from '../../services/cachedFileService';
import {InputFileLocation} from '../../services/sdk/messages/chat.core.types_pb';
import {CSSProperties} from 'react';

interface IProps {
    blur?: number;
    className?: string;
    fileLocation: InputFileLocation.AsObject;
    onClick?: (e: any) => void;
    onLoad?: () => void;
    searchTemp?: boolean;
    style?: CSSProperties;
    tempFile?: Blob;
}

interface IState {
    className: string;
    src?: string;
}

class CachedPhoto extends React.Component<IProps, IState> {
    private cachedFileService: CachedFileService;
    private lastFileId: string;
    private lastBlur: number;
    private retries: number = 0;
    private tryTimeout: any = null;
    private mounted: boolean = true;
    private tempFileSrc: string | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();

        if (this.props.fileLocation) {
            this.lastFileId = this.props.fileLocation.fileid || '';
        } else {
            this.lastFileId = '';
        }
        this.lastBlur = this.props.blur || 0;
    }

    public componentDidMount() {
        this.getFile();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.fileLocation && (this.lastFileId !== newProps.fileLocation.fileid || (newProps.blur || 0) !== this.lastBlur)) {
            this.lastFileId = newProps.fileLocation.fileid || '';
            this.lastBlur = newProps.blur || 0;
            this.retries = 0;
            this.getFile();
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.tryTimeout);
        if (this.props.fileLocation) {
            this.cachedFileService.unmountCache(this.props.fileLocation.fileid || '');
        }
        if (this.tempFileSrc) {
            URL.revokeObjectURL(this.tempFileSrc);
            this.tempFileSrc = null;
        }
    }

    public render() {
        const {className, src} = this.state;
        return (
            <div className={className} style={this.props.style} onClick={this.props.onClick}>
                {Boolean(src) &&
                <img src={src} alt="" onLoad={this.props.onLoad} onError={this.imgErrorHandler} draggable={false}/>}
            </div>
        );
    }

    /* Get file from cached storage */
    private getFile = () => {
        if (this.props.tempFile) {
            if (this.tempFileSrc) {
                URL.revokeObjectURL(this.tempFileSrc);
            }
            this.tempFileSrc = URL.createObjectURL(this.props.tempFile);
            this.setState({
                src: this.tempFileSrc,
            });
            return;
        }
        if (this.tempFileSrc) {
            URL.revokeObjectURL(this.tempFileSrc);
            this.tempFileSrc = null;
        }
        clearTimeout(this.tryTimeout);
        const timeout = setTimeout(() => {
            this.getFile();
        }, 1000);
        this.cachedFileService.getFile(this.props.fileLocation, '', 0, 'image/jpeg', this.props.searchTemp, this.props.blur).then((src) => {
            if (!this.mounted) {
                return;
            }
            clearTimeout(timeout);
            if (!src || src === '') {
                throw Error('bad src');
            } else {
                this.setState({
                    src,
                });
            }
        }).catch((err) => {
            if (!this.mounted) {
                return;
            }
            clearTimeout(timeout);
            if (this.retries < 10) {
                this.retries++;
                this.tryTimeout = setTimeout(() => {
                    this.getFile();
                }, 500);
            } else {
                this.setState({
                    src: undefined,
                });
            }
        });
    }

    /* Img error handler */
    private imgErrorHandler = () => {
        this.cachedFileService.remove(this.props.fileLocation.fileid || '').then(() => {
            if (!this.mounted) {
                return;
            }
            this.retries = 0;
            this.getFile();
        });
    }
}

export default CachedPhoto;
