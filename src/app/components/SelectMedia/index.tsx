/*
    Creation Time: 2019 - Feb - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {
    ImageTwoTone, HeadsetTwoTone, InsertDriveFileTwoTone, PeopleOutlineRounded, PlaceTwoTone,
} from '@material-ui/icons';
import ClickAwayListener from '@material-ui/core/ClickAwayListener/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import {makeStyles} from '@material-ui/styles';
import {debounce} from 'lodash';
import i18n from '../../services/i18n';

import './style.css';

const tooltipClass: any = makeStyles({
    popper: {
        borderRadius: '50%',
        fontSize: 14,
    },
    tooltip: {
        borderRadius: '50%',
        fontSize: 14,
    }
});

let items: any[] = [];

interface IProps {
    onAction: (cmd: 'media' | 'music' | 'contact' | 'location' | 'file') => void;
    onClose?: () => void;
    open: boolean;
}

interface IState {
    currentCmd: string;
    open: boolean;
}

class SelectMedia extends React.Component<IProps, IState> {
    private readonly leaveDebounce: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            currentCmd: 'none',
            open: props.open,
        };

        this.leaveDebounce = debounce(this.leaveHandler, 256);

        items = [
            {
                cmd: 'media',
                icon: <ImageTwoTone/>,
                title: i18n.t('media.photo_video'),
            },
            {
                cmd: 'music',
                icon: <HeadsetTwoTone/>,
                title: i18n.t('media.audio'),
            },
            {
                cmd: 'contact',
                icon: <PeopleOutlineRounded/>,
                title: i18n.t('media.contact'),
            },
            {
                cmd: 'location',
                icon: <PlaceTwoTone/>,
                title: i18n.t('media.location'),
            },
            {
                cmd: 'file',
                icon: <InsertDriveFileTwoTone/>,
                title: i18n.t('media.file'),
            },
        ];
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            open: newProps.open,
        });
    }

    public render() {
        const {open, currentCmd} = this.state;
        return (
            <ClickAwayListener onClickAway={this.onClickAwayHandler}>
                <div className={'select-media ' + (open ? 'open' : '')}>
                    <div className="media-input-frame">
                        <div className={'media-input-container ' + currentCmd}>
                            {items.map((item, index) => {
                                return (
                                    <Tooltip key={index} title={item.title} placement="left"
                                             classes={tooltipClass}
                                             TransitionComponent={Zoom}>
                                        <div
                                            className={'media-item ' + item.cmd + (currentCmd === item.cmd ? ' selected' : '')}
                                            onClick={this.props.onAction.bind(this, item.cmd)}
                                            onMouseEnter={this.mouseEnterHandler.bind(this, item.cmd)}
                                            onMouseLeave={this.mouseLeaveHandler}>
                                            {item.icon}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ClickAwayListener>
        );
    }

    /* Click away handler */
    private onClickAwayHandler = () => {
        const {open} = this.state;
        if (open) {
            if (this.props.onClose) {
                this.props.onClose();
            }
        }
    }

    /* Mouse enter handler */
    private mouseEnterHandler = (cmd: string) => {
        this.leaveDebounce.cancel();
        if (this.state.currentCmd !== cmd) {
            this.setState({
                currentCmd: cmd,
            });
        }
    }

    /* Mouse leave handler */
    private mouseLeaveHandler = () => {
        this.leaveDebounce();
    }

    private leaveHandler = () => {
        if (this.state.currentCmd !== 'none') {
            this.setState({
                currentCmd: 'none',
            });
        }
    }
}

export default SelectMedia;
