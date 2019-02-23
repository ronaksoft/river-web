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
    onLoad?: () => void;
    searchTemp?: boolean;
    style?: CSSProperties;
}

interface IState {
    className: string;
    src?: string;
}

class CachedPhoto extends React.PureComponent<IProps, IState> {
    private cachedFileService: CachedFileService;
    private lastFileId: string;
    private lastBlur: number;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();

        this.lastFileId = this.props.fileLocation.fileid || '';
        this.lastBlur = this.props.blur || 0;
    }

    public componentDidMount() {
        this.getFile();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.lastFileId !== newProps.fileLocation.fileid || (newProps.blur || 0) !== this.lastBlur) {
            this.lastFileId = newProps.fileLocation.fileid || '';
            this.lastBlur = newProps.blur || 0;
            this.getFile();
        }
    }

    public componentWillUnmount() {
        this.cachedFileService.unmountCache(this.props.fileLocation.fileid || '');
    }

    public render() {
        const {className, src} = this.state;
        return (
            <div className={className} style={this.props.style}>
                {src && <img src={src} onLoad={this.props.onLoad}/>}
            </div>
        );
    }

    /* Get file from cached storage */
    private getFile() {
        this.cachedFileService.getFile(this.props.fileLocation, 0, this.props.searchTemp, this.props.blur).then((src) => {
            this.setState({
                src,
            });
        });
    }
}

export default CachedPhoto;
