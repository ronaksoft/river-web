import * as React from 'react';
import Dropzone, {ImageFile} from 'react-dropzone';

import './style.css';
import {DragEvent} from "react";

interface IProps {
    items?: any[];
}

interface IState {
    items: any[];
    selected: number;
}

class Uploader extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            selected: 0,
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
        const {selected} = this.state;
        return (
            <div className="uploader-container">
                <div className="attachment-preview-container">
                    <Dropzone
                        onDrop={this.onDrop}
                        className="uploader-dropzone"
                        // disableClick={true}
                    >
                        {this.state.items.length && <img src={this.state.items[selected].preview}/>}
                    </Dropzone>
                </div>
                <div className="attachments-slide-container">
                    {this.state.items.length > 0 ?
                        (
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
                            </div>
                        ) : null
                    }
                </div>
            </div>
        );
    }

    private onDrop = (accepted: ImageFile[], rejected: ImageFile[], event: DragEvent<HTMLDivElement>) => {
        window.console.log(accepted, rejected, event);
        this.setState({
            items: accepted,
        });
    }

    private selectImage = (index: number) => {
        this.setState({
            selected: index,
        });
    }
}

export default Uploader;