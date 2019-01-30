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

interface IProps {
    className?: string;
    fileLocation: InputFileLocation.AsObject;
}

interface IState {
    className: string;
    src?: string;
}

class CachedPhoto extends React.Component<IProps, IState> {
    private cachedFileService: CachedFileService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
        };

        this.cachedFileService = CachedFileService.getInstance();
    }

    public componentDidMount() {
        this.cachedFileService.getFile(this.props.fileLocation, 0).then((src) => {
            this.setState({
                src,
            });
        });
    }

    public componentWillUnmount() {
        this.cachedFileService.unmountCache(this.props.fileLocation.fileid || '');
    }

    public render() {
        const {className, src} = this.state;
        return (
            <div className={className}>
                {src && <img src={src}/>}
            </div>
        );
    }
}

export default CachedPhoto;
