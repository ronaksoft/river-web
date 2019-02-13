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
import CachedVideo from '../CachedVideo';

import './style.css';

const C_MAX_WIDTH = 800;
const C_MAX_HEIGHT = 600;
const C_CONTAINER_RATIO = C_MAX_HEIGHT / C_MAX_WIDTH;

interface ISize {
    height: string;
    width: string;
}

interface IProps {
    className?: string;
}

interface IState {
    className: string;
    dialogOpen: boolean;
    doc: IDocument | null;
    size?: ISize;
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
        const {doc, size} = this.state;
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
                                <div ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                     style={size ? size : {}}>
                                    <CachedPhoto className="picture" fileLocation={item.fileLocation}/>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            case 'video':
                return (<div className="video-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <div ref={this.pictureWrapperRefHandler} className="video-wrapper hide"
                                     style={size ? size : {}}>
                                    {item.thumbFileLocation && <div className="thumbnail">
                                        <CachedPhoto fileLocation={item.thumbFileLocation}/>
                                    </div>}
                                    <CachedVideo className="video" fileLocation={item.fileLocation} autoPlay={false}
                                                 timeOut={200}/>
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
        const {doc, size} = this.state;
        if (!size || !doc || !doc.rect || doc.items.length === 0 || (doc.type === 'video' && !doc.items[0].thumbFileLocation)) {
            return '';
        }
        if (this.state.dialogOpen && !this.animated) {
            this.animated = true;
            setTimeout(() => {
                this.animateInFloatPicture(size);
            }, 10);
        }
        const fileLocation: any = doc.type === 'video' ? doc.items[0].thumbFileLocation : doc.items[0].fileLocation;
        return (<div ref={this.floatPictureRefHandler} className="float-picture" style={{
            height: `${doc.rect.height}px`,
            left: `${doc.rect.left}px`,
            top: `${doc.rect.top}px`,
            width: `${doc.rect.width}px`,
        }}>
            <CachedPhoto className="picture" fileLocation={fileLocation}/>
        </div>);
    }

    private floatPictureRefHandler = (ref: any) => {
        this.floatPictureRef = ref;
    }

    private animateInFloatPicture(size: ISize) {
        const showMedia = () => {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            if (this.floatPictureRef) {
                this.floatPictureRef.classList.add('hide');
            }
        };
        if (!this.floatPictureRef) {
            showMedia();
            return;
        }
        this.floatPictureRef.style.height = size.height;
        this.floatPictureRef.style.width = size.width;
        this.floatPictureRef.style.top = `50%`;
        this.floatPictureRef.style.left = `50%`;
        this.floatPictureRef.style.transform = `translate(-50%, -50%)`;
        this.floatPictureRef.style.borderRadius = `0`;
        setTimeout(() => {
            showMedia();
        }, 300);
    }

    private animateOutFloatPicture(callback: any) {
        const {doc} = this.state;
        if (!this.floatPictureRef || !doc || doc.items.length === 0) {
            callback();
            return;
        }
        const el = document.querySelector(`.bubble-wrapper .bubble.b_${doc.items[0].id}`);
        if (!el) {
            callback();
            return;
        }
        if (this.pictureWrapperRef) {
            this.pictureWrapperRef.classList.add('hide');
        }
        if (this.floatPictureRef) {
            this.floatPictureRef.classList.remove('hide');
        }
        const rect = el.getBoundingClientRect();
        this.floatPictureRef.style.height = `${rect.height}px`;
        this.floatPictureRef.style.width = `${rect.width}px`;
        this.floatPictureRef.style.top = `${rect.top}px`;
        this.floatPictureRef.style.left = `${rect.left}px`;
        this.floatPictureRef.style.transform = ``;
        this.floatPictureRef.style.borderRadius = ``;
        setTimeout(() => {
            callback();
        }, 300);
    }

    private dialogCloseHandler = () => {
        const closeDialog = () => {
            this.setState({
                dialogOpen: false,
                size: undefined,
            });
            this.animated = false;
        };
        const {doc} = this.state;
        if (doc && (doc.type === 'picture' || doc.type === 'video')) {
            this.animateOutFloatPicture(() => {
                closeDialog();
            });
        } else {
            closeDialog();
        }
    }

    private dialogOpen = (doc: IDocument) => {
        this.setState({
            dialogOpen: true,
            doc,
        }, () => {
            if (doc.type === 'picture' || doc.type === 'video') {
                this.calculateImageSize();
            }
        });
    }

    private documentReadyHandler = (doc: IDocument) => {
        this.dialogOpen(doc);
    }

    private calculateImageSize() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        let height = (doc.items[0].height || 1);
        let width = (doc.items[0].width || 1);
        const ratio = height / width;
        if (ratio > C_CONTAINER_RATIO) {
            if (height > C_MAX_HEIGHT) {
                height = C_MAX_HEIGHT;
                width = C_MAX_HEIGHT / ratio;
            }
        } else {
            if (width > C_MAX_WIDTH) {
                width = C_MAX_WIDTH;
                height = C_MAX_WIDTH * ratio;
            }
        }
        this.setState({
            size: {
                height: `${height}px`,
                width: `${width}px`,
            }
        });
    }
}

export default DocumentViewer;
