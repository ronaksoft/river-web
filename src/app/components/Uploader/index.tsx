import * as React from 'react';
import Dropzone, {FileWithPreview} from 'react-dropzone';

import './style.css';
import {DragEvent} from "react";

interface IProps {
    items?: any[];
}

interface IState {
    items: any[];
    lastSelected: number;
    selected: number;
    show: boolean;
}

class Uploader extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            lastSelected: 0,
            selected: 0,
            show: true,
        };
    }

    // public componentWillReceiveProps(newProps: IProps) {
    //     this.setState({
    //         items: newProps.items,
    //         selectedId: newProps.selectedId,
    //     }, () => {
    //         this.list.recomputeRowHeights();
    //     });
    // }

    public render() {
        const {selected, lastSelected} = this.state;
        return (
            <div className="uploader-container">
                <div className="attachment-preview-container">
                    <Dropzone
                        onDrop={this.onDrop}
                        className="uploader-dropzone"
                        // disableClick={true}
                    >
                        <div className="slider-attachment">
                            {this.state.items.length > 0 && this.state.show && (
                                <div className={'slide' + (selected > lastSelected ? ' left' : ' right')}>
                                    <img className="front" src={this.state.items[selected].preview}/>
                                    {lastSelected !== selected && (
                                        <img className="back" src={this.state.items[lastSelected].preview}/>
                                    )}
                                </div>
                            )}
                        </div>
                    </Dropzone>
                </div>
                <div className="attachments-slide-container">
                    <div>
                        {this.state.items.map((file, index) => {
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
                        <div key="add-file" className="item add-file"/>
                    </div>
                </div>
            </div>
        );
    }

    private onDrop = (accepted: FileWithPreview[], rejected: FileWithPreview[], event: DragEvent<HTMLDivElement>) => {
        window.console.log(accepted, rejected, event);
        this.setState({
            items: accepted,
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
}

export default Uploader;