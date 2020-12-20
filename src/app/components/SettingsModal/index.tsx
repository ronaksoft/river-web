/*
    Creation Time: 2019 - April - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {
    AppsRounded,
    CloseRounded,
} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import ResizeObserver from "resize-observer-polyfill";
import {isProd} from "../../../App";

import './style.scss';

interface IProps {
    fit?: boolean;
    height?: string;
    icon?: any;
    noScrollbar?: boolean;
    onClose?: () => void;
    onDone?: () => void;
    open: boolean;
    title: any;
    autoHeight?: boolean;
    minHeight?: number;
    maxHeight?: number;
}

interface IState {
    className?: string;
    open: boolean;
}

class SettingsModal extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            open: props.open,
        };
    }

    private readonly resizeObserver: ResizeObserver | undefined;
    private autoHeight: number = 0;
    private ref: any;
    private resizeTries: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: props.open,
        };

        if (props.autoHeight && !props.noScrollbar) {
            this.resizeObserver = new ResizeObserver(this.resizeHandler);
        }
    }

    public componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    public render() {
        const {icon, title, noScrollbar, fit} = this.props;
        const {open} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.props.onClose}
                className={'settings-modal' + (fit ? ' fit' : '')}
                classes={{
                    paper: 'settings-modal-paper'
                }}
            >
                <React.Fragment>
                    <div className="settings-modal-header">
                        <div className="modal-close">
                            <CloseRounded onClick={this.props.onClose}/>
                        </div>
                        <div className={'modal-title' + (this.props.onDone ? ' with-icon' : '')}>{title}</div>
                        {this.props.onDone && <div className="modal-icon" onClick={this.props.onDone}>
                            {icon || <AppsRounded/>}
                        </div>}
                    </div>
                    {Boolean(!noScrollbar) &&
                    <div className="setting-content" ref={this.scrollWrapperRefHandler}
                         style={{height: this.autoHeight ? `${this.autoHeight}px` : this.props.height}}>
                        <Scrollbars
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {this.props.children}
                        </Scrollbars>
                    </div>}
                    {Boolean(noScrollbar) && <div className="setting-content" style={{height: this.props.height}}>
                        {this.props.children}
                    </div>}
                </React.Fragment>
            </Dialog>
        );
    }

    private scrollWrapperRefHandler = (ref: any) => {
        if (!ref || !this.props.autoHeight) {
            return;
        }
        this.ref = ref;
        try {
            const el = (ref as HTMLElement)?.firstElementChild?.firstElementChild?.firstElementChild;
            if (this.resizeObserver && el) {
                this.resizeObserver.observe(el);
            }
        } catch (e) {
            if (!isProd) {
                window.console.log(e);
            }
        }
    }

    private getMaxHeight() {
        if (!this.props.maxHeight) {
            return window.innerHeight - 32;
        }
        return Math.min(window.innerHeight - 32, this.props.maxHeight);
    }

    private resizeHandler = (e: any) => {
        // if (this.autoHeight) {
        //     return;
        // }
        if (this.resizeTries > 10) {
            return;
        }
        this.resizeTries++;
        setTimeout(() => {
            try {
                this.autoHeight = this.ref?.firstElementChild?.firstElementChild?.firstElementChild?.getBoundingClientRect().height;
                if (this.props.minHeight && this.autoHeight < this.props.minHeight) {
                    this.autoHeight = this.props.minHeight;
                }
                const maxHeight = this.getMaxHeight();
                if (this.autoHeight > maxHeight) {
                    this.autoHeight = maxHeight;
                }
                this.forceUpdate();
            } catch (e) {
                if (!isProd) {
                    window.console.log(e);
                }
            }
        }, 100);
    }
}

export default SettingsModal;
