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

import './style.scss';

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
    onAction: (cmd: 'media' | 'music' | 'contact' | 'location' | 'file') => (e: any) => void;
    onClose?: () => void;
}

interface IState {
    currentCmd: string;
    open: boolean;
}

class SelectMedia extends React.Component<IProps, IState> {
    private readonly leaveDebounce: any;
    private canClose: boolean = true;
    private timeout: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            currentCmd: 'none',
            open: false,
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

    public toggle() {
        if (this.state.open) {
            this.clickAwayHandler();
            return;
        }
        this.setState({
            open: true,
        });
        this.canClose = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.canClose = true;
            this.timeout = false;
        }, 200);
    }

    public componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    public render() {
        const {open, currentCmd} = this.state;
        return (
            <ClickAwayListener onClickAway={this.clickAwayHandler}>
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
                                            onClick={this.props.onAction(item.cmd)}
                                            onMouseEnter={this.mouseEnterHandler(item.cmd)}
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
    private clickAwayHandler = () => {
        const {open} = this.state;
        if (open && this.canClose) {
            this.setState({
                open: false,
            });
            if (this.props.onClose) {
                this.props.onClose();
            }
        }
    }

    /* Mouse enter handler */
    private mouseEnterHandler = (cmd: string) => (e: any) => {
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
