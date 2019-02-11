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
    private pictureWrapperRef: any = null;
    private floatPictureRef: any = null;
    private animated: boolean = false;

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
                {this.getFloatObj()}
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
            case 'picture':
                return (<div className="picture-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <div ref={this.pictureWrapperRefHandler} className="picture-wrapper">
                                    <CachedPhoto className="picture" fileLocation={item.fileLocation}/>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            default:
                return '';
        }
    }

    private pictureWrapperRefHandler = (ref: any) => {
        this.pictureWrapperRef = ref;
    }

    private getFloatObj() {
        const {doc} = this.state;
        if (!doc || !doc.rect || doc.items.length === 0) {
            return '';
        }
        if (this.state.dialogOpen && !this.animated) {
            this.animated = true;
            setTimeout(() => {
                this.animateFloatPicture();
            }, 10);
        }
        return (<div ref={this.floatPictureRefHandler} className="float-picture" style={{
            height: `${doc.rect.height}px`,
            left: `${doc.rect.left}px`,
            top: `${doc.rect.top}px`,
            width: `${doc.rect.width}px`,
        }}>
            <CachedPhoto className="picture" fileLocation={doc.items[0].fileLocation}/>
        </div>);
    }

    private floatPictureRefHandler = (ref: any) => {
        this.floatPictureRef = ref;
    }

    private animateFloatPicture() {
        if (!this.floatPictureRef || !this.pictureWrapperRef) {
            return;
        }
        const rect = this.pictureWrapperRef.getBoundingClientRect();
        this.floatPictureRef.style.height= `${rect.height}px`;
        this.floatPictureRef.style.left= `${rect.left}px`;
        this.floatPictureRef.style.top= `${rect.top}px`;
        this.floatPictureRef.style.width= `${rect.width}px`;
    }

    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
        });
        this.animated = false;
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
