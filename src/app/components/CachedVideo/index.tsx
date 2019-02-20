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
import {InputFileLocation} from '../../services/sdk/messages/chat.core.types_pb';

interface IProps {
    autoPlay?: boolean;
    className?: string;
    fileLocation: InputFileLocation.AsObject;
    onLoad?: () => void;
    searchTemp?: boolean;
    timeOut?: number;
}

interface IState {
    className: string;
    src?: string;
}

class CachedVideo extends React.PureComponent<IProps, IState> {
    private cachedFileService: CachedFileService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();
    }

    public componentDidMount() {
        this.cachedFileService.getFile(this.props.fileLocation, 0, this.props.searchTemp).then((src) => {
            setTimeout(() => {
                this.setState({
                    src,
                });
            }, this.props.timeOut || 0);
        });
    }

    public componentWillUnmount() {
        this.cachedFileService.unmountCache(this.props.fileLocation.fileid || '');
    }

    public render() {
        const {className, src} = this.state;
        return (
            <div className={className}>
                {src && <video onLoad={this.props.onLoad} autoPlay={this.props.autoPlay} controls={true}>
                    <source src={src}/>
                </video>}
            </div>
        );
    }
}

export default CachedVideo;
