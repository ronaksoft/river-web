/*
    Creation Time: 2020 - March - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import Scrollbars from "react-custom-scrollbars";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import {PopoverPosition} from "@material-ui/core/Popover/Popover";
import {IUser} from "../../repository/user/interface";
import UserName from "../UserName";
import UserAvatar from "../UserAvatar";

import './style.scss';

interface IProps {
    onApply: (ids: string[]) => void;
    onCancel?: () => void;
    userList: IUser[];
    closeAfterSelect?: boolean;
}

interface IState {
    open: boolean;
    selectedUserIds: string[];
    userList: IUser[];
}

class UserPopover extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            userList: props.userList,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            selectedUserIds: [],
            userList: [],
        };
    }

    public open(pos: PopoverPosition, selectedIds: string[]) {
        this.setState({
            open: true,
            selectedUserIds: selectedIds,
        });
    }

    public render() {
        const {userList, open} = this.state;
        const height = this.getUserListHeight();
        return (
            <div className="search-user-popover">
                {open && <ClickAwayListener
                    onClickAway={this.userCloseHandler}
                >
                    <div className="search-user-container">
                        <div className="search-user-list" style={{height}}>
                            <Scrollbars
                                autoHide={true}
                                hideTracksWhenNotNeeded={true}
                                universal={true}
                                style={{height}}
                            >
                                {userList.map((user) => {
                                    if (!this.isUserSelected(user.id || '0')) {
                                        return (<div key={user.id}
                                                     className="user-item"
                                                     onClick={this.toggleUserHandler(user.id || '0')}>
                                            <div className="user-icon">
                                                <UserAvatar className="popover-user-avatar" id={user.id || '0'}
                                                            noDetail={true}/>
                                            </div>
                                            <div className="user-name">
                                                <UserName id={user.id || '0'} noDetail={true}/>
                                            </div>
                                        </div>);
                                    } else {
                                        return null;
                                    }
                                })}
                            </Scrollbars>
                        </div>
                    </div>
                </ClickAwayListener>}
            </div>
        );
    }

    private userCloseHandler = () => {
        this.setState({
            open: false,
        });
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    private getUserListHeight() {
        let height = (this.state.userList.length - this.state.selectedUserIds.length) * 28;
        if (height > 100) {
            height = 100;
        }
        return `${height}px`;
    }

    private toggleUserHandler = (id: string) => (e: any) => {
        const {selectedUserIds} = this.state;
        const index = selectedUserIds.indexOf(id);
        if (index > -1) {
            selectedUserIds.splice(index, 1);
        } else {
            selectedUserIds.push(id);
        }
        this.setState({
            selectedUserIds,
        }, () => {
            this.userApplyHandler();
        });
    }

    private isUserSelected(id: string) {
        return this.state.selectedUserIds.indexOf(id) > -1;
    }

    private userApplyHandler = () => {
        if (this.props.onApply) {
            this.props.onApply(this.state.selectedUserIds);
        }
        if (this.props.closeAfterSelect) {
            this.userCloseHandler();
        }
    }
}

export default UserPopover;
