/*
    Creation Time: 2019 - Feb - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import CachedFileService from '../../services/cachedFileService';
import {InputFileLocation} from '../../services/sdk/messages/core.types_pb';

interface IProps {
    autoPlay?: boolean;
    className?: string;
    fileLocation: InputFileLocation.AsObject;
    md5?: string;
    mimeType?: string;
    onLoad?: () => void;
    onPlay?: () => void;
    searchTemp?: boolean;
    timeOut?: number;
}

interface IState {
    className: string;
    src?: string;
}

class CachedVideo extends React.PureComponent<IProps, IState> {
    private cachedFileService: CachedFileService;
    private retries: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();
    }

    public componentDidMount() {
        this.getFile();
    }

    public componentWillUnmount() {
        this.cachedFileService.unmountCache(this.props.fileLocation.fileid || '');
    }

    public render() {
        const {className, src} = this.state;
        return (
            <div className={className}>
                {src && <video onLoad={this.props.onLoad} onPlay={this.props.onPlay} autoPlay={this.props.autoPlay}
                               controls={true}
                               onError={this.videoErrorHandler}>
                    <source src={src}/>
                </video>}
            </div>
        );
    }

    /* Get file from cached storage */
    private getFile() {
        this.cachedFileService.getFile(this.props.fileLocation, this.props.md5 || '', 0, this.props.mimeType || 'video/mp4', this.props.searchTemp).then((src) => {
            setTimeout(() => {
                this.setState({
                    src,
                });
            }, this.props.timeOut || 0);
        }).catch(() => {
            if (this.retries < 10) {
                this.retries++;
                requestAnimationFrame(() => {
                    this.getFile();
                });
            }
        });
    }

    /* Video error handler */
    private videoErrorHandler = () => {
        this.cachedFileService.remove(this.props.fileLocation.fileid || '').then(() => {
            this.retries = 0;
            this.getFile();
        });
    }
}

export default CachedVideo;
