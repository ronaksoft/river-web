/*
    Creation Time: 2018 - Aug - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';

import './style.scss';

interface IProps {
    anchorEl: any;
    onClose: () => void;
}

interface IState {
    anchorEl: any;
}

class PopUpMenu extends React.Component<IProps, IState> {
    private eventReferences: any[] = [];
    private inArea: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            anchorEl: null,
        };
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
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
            <div className="kk-pop-up-menu-container" hidden={!open} style={pos}>
                <div className="kk-pop-up-menu-wrapper" onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
                    {this.props.children}
                </div>
            </div>
        );
    }

    private getPosition(el: any) {
        if (!el) {
            return {};
        }

        return {
            left: el.offsetLeft,
            top: el.offsetTop,
        };
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
            if (typeof this.props.onClose === 'function') {
                this.props.onClose();
            }
        }
    }
}

export default PopUpMenu;
