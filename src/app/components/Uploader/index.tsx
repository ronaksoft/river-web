/*
    Creation Time: 2018 - Feb - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dropzone, {FileWithPreview} from 'react-dropzone';
import {DragEvent} from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {AddRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    accept: string;
}

interface IState {
    dialogOpen: boolean;
    items: FileWithPreview[];
    lastSelected: number;
    selected: number;
    show: boolean;
}

class MediaPreview extends React.Component<IProps, IState> {
    // @ts-ignore
    private previewRefs: { [key: number]: string } = {};

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialogOpen: false,
            items: [],
            lastSelected: 0,
            selected: 0,
            show: true,
        };
    }

    // public componentWillReceiveProps(newProps: IProps) {
    //     //
    // }

    public openDialog(items: File[]) {
        this.setState({
            dialogOpen: true,
            items,
        }, () => {
            this.generatePreview();
        });
    }

    public render() {
        const {items, selected, lastSelected, dialogOpen} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="uploader-dialog"
            >
                <div className="uploader-container">
                    <div className="attachment-preview-container">
                        <Dropzone
                            onDrop={this.onDrop}
                            className="uploader-dropzone"
                            // disableClick={true}
                            accept={this.props.accept}
                        >
                            <div className="slider-attachment">
                                {items.length > 0 && this.state.show && (
                                    <div className={'slide' + (selected > lastSelected ? ' left' : ' right')}>
                                        <img className="front" src={items[selected].preview}/>
                                        {lastSelected !== selected && (
                                            <img className="back" src={items[lastSelected].preview}/>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Dropzone>
                    </div>
                    <div className="attachments-slide-container">
                        <div className="attachment-items">
                            {items.length > 0 && items.map((file, index) => {
                                return (
                                    <div key={index}
                                         className={'item' + (selected === index ? ' selected' : '')}
                                         onClick={this.selectImage.bind(this, index)}
                                    >
                                        <div className="preview"
                                             style={{backgroundImage: 'url(' + file.preview + ')'}}/>
                                    </div>
                                );
                            })}
                            <div key="add-file" className="item add-file">
                                <AddRounded/>
                                <span className="text">Add Media</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }

    private onDrop = (accepted: FileWithPreview[], rejected: FileWithPreview[], event: DragEvent<HTMLDivElement>) => {
        window.console.log(accepted, rejected, event);
        // @ts-ignore
        this.setState({
            items: [...this.state.items, accepted],
        });
    }

    private selectImage = (index: number) => {
        if (this.state.selected === index) {
            return;
        }
        this.setState({
            lastSelected: this.state.selected,
            selected: index,
            show: false,
        }, () => {
            this.setState({
                show: true,
            });
        });
    }

    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
        });
    }

    private generatePreview() {
        const {items} = this.state;
        items.map((item, index) => {
            if (!item.preview) {
                item.preview = URL.createObjectURL(item);
                this.previewRefs[index] = item.preview;
            }
            return items;
        });
        this.setState({
            items,
        });
    }
}

export default MediaPreview;
