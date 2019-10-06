/*
    Creation Time: 2019 - Oct - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';

import Dialog from "../Dialog";
import SettingsMenu from "../SettingsMenu";
import ContactMenu from "../ContactMenu";
import {IDialog} from "../../repository/dialog/interface";

interface IProps {
    className?: string;
    cancelIsTyping: (id: string) => void;
    onContextMenu?: (cmd: string, dialog: IDialog) => void;
    onSettingsClose?: (e: any) => void;
    onSettingsAction?: (cmd: 'logout') => void;
    updateMessages?: (keep?: boolean) => void;
    onSettingsReloadDialog?: (peerIds: string[]) => void;
    onSubPlaceChange?: (sub: string, subChild: string) => void;
    dialogRef: (ref: Dialog) => void;
    settingsRef: (ref: SettingsMenu) => void;
}

interface IState {
    className: string;
    leftMenu: string;
    selectedDialogId: string;
}

class LiveDate extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: '',
            leftMenu: 'chat',
            selectedDialogId: 'null',
        };
    }

    public componentDidMount() {
        //
    }

    public componentWillUnmount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        //
    }

    public setMenu(mene: string) {
        this.setState({
            leftMenu: mene,
        });
    }

    public render() {
        return (
            <span className={this.state.className}>{this.leftMenuRender()}</span>
        );
    }

    private leftMenuRender = () => {
        const {leftMenu, selectedDialogId} = this.state;
        switch (leftMenu) {
            default:
            case 'chat':
                return (<Dialog ref={this.dialogRefHandler} selectedId={selectedDialogId}
                                cancelIsTyping={this.props.cancelIsTyping}
                                onContextMenu={this.props.onContextMenu}/>);
            case 'settings':
                return (<SettingsMenu ref={this.settingsMenuRefHandler}
                                      updateMessages={this.props.updateMessages}
                                      onClose={this.props.onSettingsClose}
                                      onAction={this.props.onSettingsAction}
                                      onReloadDialog={this.props.onSettingsReloadDialog}/>);
            case 'contact':
                return (<ContactMenu/>);
        }
    }

    private dialogRefHandler = (ref: any) => {
        this.props.dialogRef(ref);
    }

    private settingsMenuRefHandler = (ref: any) => {
        this.props.settingsRef(ref);
    }
}

export default LiveDate;
