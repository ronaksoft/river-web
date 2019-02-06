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
    ImageTwoTone,
    MovieTwoTone,
    HeadsetTwoTone,
    InsertDriveFileTwoTone
} from '@material-ui/icons';
import ClickAwayListener from '@material-ui/core/ClickAwayListener/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import {makeStyles} from '@material-ui/styles';

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

const items: any[] = [
    {
        cmd: 'photo',
        icon: <ImageTwoTone/>,
        title: 'Photo',
    },
    {
        cmd: 'video',
        icon: <MovieTwoTone/>,
        title: 'Video',
    },
    {
        cmd: 'music',
        icon: <HeadsetTwoTone/>,
        title: 'Music',
    },
    {
        cmd: 'file',
        icon: <InsertDriveFileTwoTone/>,
        title: 'File',
    },
];

interface IProps {
    onAction: (cmd: 'photo' | 'video' | 'music' | 'file') => void;
    onClose?: () => void;
    open: boolean;
}

interface IState {
    open: boolean;
}

class SelectMedia extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: props.open,
        };
    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            open: newProps.open,
        });
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {open} = this.state;
        return (
            <ClickAwayListener onClickAway={this.onClickAwayHandler}>
                <div className={'select-media ' + (open ? 'open' : '')}>
                    <div className="media-input-frame">
                        <div className="media-input-container">
                            {items.map((item, index) => {
                                return (
                                    <Tooltip key={index} title={item.title} placement="left"
                                             classes={tooltipClass}
                                             TransitionComponent={Zoom}>
                                        <div className={'media-item ' + item.cmd}
                                             onClick={this.props.onAction.bind(this, item.cmd)}>
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
}

export default SelectMedia;
