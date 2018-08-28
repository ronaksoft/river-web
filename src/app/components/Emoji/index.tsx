import * as React from 'react';
import {Picker} from 'emoji-mart';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';

interface IProps {
    onSelect?: (data: any) => void;
    anchorEl: any;
}

interface IState {
    anchorEl: any;
}

class Emoji extends React.Component<IProps, IState> {
    private eventReferences: any[] = [];
    private inArea: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            anchorEl: null,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            anchorEl: newProps.anchorEl,
        }, () => {
            if (newProps.anchorEl) {
                this.addClickEvent();
            } else {
                this.removeClickEvent();
            }
        });
    }

    public render() {
        const open = Boolean(this.state.anchorEl);
        const pos = this.getPosition(this.state.anchorEl);
        return (
            <div className="emoji-container" hidden={!open} style={pos}>
                <div className="emoji-wrapper" onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
                    <Picker custom={[]} onSelect={this.addEmoji} showPreview={false}/>
                </div>
            </div>
        );
    }

    private getPosition(el: any) {
        if (!el) {
            return;
        }
        return {
            left: el.offsetLeft,
            top: el.offsetTop,
        };
    }

    private addEmoji = (data: any) => {
        if (typeof this.props.onSelect === 'function') {
            this.props.onSelect(data);
        }
    }

    private onEnter = () => {
        this.inArea = true;
    }

    private onLeave = () => {
        this.inArea = false;
    }

    private addClickEvent() {
        const fn = this.onArea.bind(this);
        this.eventReferences.push(fn);
        document.addEventListener('click', fn);
    }

    private removeClickEvent() {
        this.eventReferences.forEach((fn) => {
            document.removeEventListener('click', fn);
        });
    }

    private onArea() {
        if (!this.inArea && this.state.anchorEl) {
            this.setState({
                anchorEl: null,
            }, () => {
                this.removeClickEvent();
            });
        }
    }
}

export default Emoji;