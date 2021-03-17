/*
    Creation Time: 2019 - Oct - 07
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {ExpandMoreRounded} from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import {IDialog} from "../../repository/dialog/interface";

import './style.scss';

interface IProps {
    onClick: () => void;
}

interface IState {
    dialog: IDialog | null;
}

class MoveDown extends React.Component<IProps, IState> {
    private ref: any;
    private visible: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: null,
        };
    }

    public setDialog(dialog: IDialog | null) {
        this.setState({
            dialog,
        });
    }

    public setVisible(visible: boolean) {
        if (!this.ref) {
            return;
        }
        if (visible && !this.visible) {
            this.ref.classList.add('visible');
            this.visible = true;
        } else if (!visible && this.ref) {
            this.ref.classList.remove('visible');
            this.visible = false;
        }
    }

    public addReaction(reaction: string) {
        if (this.ref) {
            const el = document.createElement('div');
            el.classList.add('offscreen-reaction');
            el.innerHTML = reaction;
            setTimeout(() => {
                el.remove();
            }, 1950);
            this.ref.appendChild(el);
        }
    }

    public render() {
        let unreadCounter = 0;
        const {dialog} = this.state;
        if (dialog) {
            if (dialog.readinboxmaxid !== dialog.topmessageid && !dialog.preview_me) {
                unreadCounter = dialog.unreadcount || 0;
            }
            return (<div ref={this.refHandler} className="move-down" onClick={this.props.onClick}>
                <Badge color="primary" badgeContent={unreadCounter}
                       classes={{root: 'move-down-badge'}}
                       invisible={Boolean(unreadCounter === 0)}>
                    <ExpandMoreRounded/>
                </Badge>
            </div>);
        } else {
            return null;
        }
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }
}

export default MoveDown;
