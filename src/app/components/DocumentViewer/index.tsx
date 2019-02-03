/*
    Creation Time: 2019 - Feb - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
// import {PersonAddRounded, SendRounded} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DocumentViewService, {IDocument} from '../../services/documentViewerService';
import CachedPhoto from '../CachedPhoto';

import './style.css';

interface IProps {
    className?: string;
}

interface IState {
    className: string;
    dialogOpen: boolean;
    doc: IDocument | null;
}

class DocumentViewer extends React.Component<IProps, IState> {
    private documentViewerService: DocumentViewService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            dialogOpen: false,
            doc: null,
        };

        this.documentViewerService = DocumentViewService.getInstance();
    }

    public componentDidMount() {
        this.documentViewerService.setDocumentReady(this.documentReadyHandler);
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {className, dialogOpen} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className={'document-viewer-dialog ' + className}
            >
                {this.getContent()}
            </Dialog>
        );
    }

    private getContent() {
        const {doc} = this.state;
        if (!doc) {
            return '';
        }
        switch (doc.type) {
            case 'avatar':
                return (<div className="avatar-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                {item.thumbFileLocation && <div className="thumbnail">
                                    <CachedPhoto fileLocation={item.thumbFileLocation}/>
                                </div>}
                                <div className="photo">
                                    <CachedPhoto fileLocation={item.fileLocation}/>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            default:
                return '';
        }
    }

    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
        });
    }

    private dialogOpen = (doc: IDocument) => {
        this.setState({
            dialogOpen: true,
            doc,
        });
    }

    private documentReadyHandler = (doc: IDocument) => {
        this.dialogOpen(doc);
    }
}

export default DocumentViewer;
