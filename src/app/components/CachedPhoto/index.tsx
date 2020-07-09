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
import {InputFileLocation} from '../../services/sdk/messages/core.types_pb';
import {CSSProperties} from 'react';
import {GetDbFileName} from "../../repository/file";

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

class CachedPhoto extends React.PureComponent<IProps, IState> {
    private cachedFileService: CachedFileService;
    private lastFileName: string;
    private lastBlur: number;
    private retries: number = 0;
    private tryTimeout: any = null;
    private mounted: boolean = true;
    private tempFileSrc: string | null = null;
    private lastSrc: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();

        if (this.props.fileLocation) {
            this.lastFileName = GetDbFileName(props.fileLocation.fileid, props.fileLocation.clusterid);
        } else {
            this.lastFileName = '';
        }
        this.lastBlur = this.props.blur || 0;
    }

    public componentDidMount() {
        this.getFile();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.fileLocation) {
            const fileName = GetDbFileName(newProps.fileLocation.fileid, newProps.fileLocation.clusterid);
            if (this.lastFileName !== fileName || (newProps.blur || 0) !== this.lastBlur) {
                this.lastFileName = fileName;
                this.lastBlur = newProps.blur || 0;
                this.retries = 0;
                this.getFile();
            }
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.tryTimeout);
        if (this.props.fileLocation) {
            this.cachedFileService.unmountCache(GetDbFileName(this.props.fileLocation.fileid, this.props.fileLocation.clusterid));
        }
        if (this.tempFileSrc) {
            URL.revokeObjectURL(this.tempFileSrc);
            this.tempFileSrc = null;
        }
    }

    public render() {
        const {className, src} = this.state;
        if (src && src.length > 0) {
            this.lastSrc = src;
        }
        return (
            <div className={className} style={this.props.style} onClick={this.props.onClick}
                 data-id={this.lastFileName}>
                {Boolean(src || this.lastSrc.length > 0) &&
                <img src={src || this.lastSrc} alt="" onLoad={this.props.onLoad} onError={this.imgErrorHandler} draggable={false}/>}
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
        this.cachedFileService.remove(GetDbFileName(this.props.fileLocation.fileid, this.props.fileLocation.clusterid)).then(() => {
            if (!this.mounted) {
                return;
            }
            this.retries = 0;
            this.getFile();
        });
    }
}

export default CachedPhoto;
