/*
    Creation Time: 2018 - Nov - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IContact} from '../../repository/contact/interface';
import {CloseRounded, CheckRounded, EditRounded, MoreVert, AddRounded, PersonAddRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer, InputUser} from '../../services/sdk/messages/core.types_pb';
import SDK from '../../services/sdk';
import GroupAvatar from '../GroupAvatar';
import {IGroup} from '../../repository/group/interface';
import GroupRepo from '../../repository/group';
import TimeUtility from '../../services/utilities/time';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import {IUser} from '../../repository/user/interface';
import {TextAvatar} from '../UserAvatar';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {findIndex, trimStart} from 'lodash';
import Dialog from '@material-ui/core/Dialog/Dialog';

import './style.css';
import ContactList from '../ContactList';

// Todo: add member, kick member, promote member and etc.
interface IProps {
    peer: InputPeer | null;
    onClose?: () => void;
    onCreate?: (contacts: IContact[], title: string) => void;
}

interface IState {
    addMemberDialogEnable: boolean;
    currentUser: IUser | null;
    group: IGroup | null;
    moreAnchorEl: any;
    page: string;
    participants: IUser[];
    peer: InputPeer | null;
    title: string;
    titleEdit: boolean;
}

class GroupInfoMenu extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private sdk: SDK;
    private loading: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            addMemberDialogEnable: false,
            currentUser: null,
            group: null,
            moreAnchorEl: null,
            page: '1',
            participants: [],
            peer: props.peer,
            title: '',
            titleEdit: false,
        };

        // Group Repository singleton
        this.groupRepo = GroupRepo.getInstance();
        // SDK singleton
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        this.getGroup();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.peer === newProps.peer) {
            return;
        }
        this.setState({
            peer: newProps.peer,
        }, () => {
            this.getGroup();
        });
    }

    public render() {
        const {addMemberDialogEnable, group, page, title, titleEdit, moreAnchorEl} = this.state;
        return (
            <div className="group-info-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                aria-label="Close"
                                aria-haspopup="true"
                                onClick={this.props.onClose}
                            >
                                <CloseRounded/>
                            </IconButton>
                            <label>Group Info</label>
                        </div>
                        {group && <div className="info kk-card">
                            <div className="avatar">
                                <GroupAvatar id={group.id || ''}/>
                            </div>
                            <div className="title">
                                {!titleEdit && <div className="form-control">
                                    <div className="inner">{group.title}</div>
                                    <div className="action">
                                        <IconButton
                                            aria-label="Edit title"
                                            onClick={this.onTitleEditHandler}
                                        >
                                            <EditRounded/>
                                        </IconButton>
                                    </div>
                                </div>}
                                {titleEdit &&
                                <FormControl fullWidth={true} className="title-edit">
                                    <InputLabel htmlFor="adornment-title">Title</InputLabel>
                                    <Input
                                        id="adornment-title"
                                        type="text"
                                        value={title}
                                        onChange={this.onTitleChangeHandler}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="Confirm changes"
                                                    onClick={this.onTitleConfirmHandler}
                                                >
                                                    {Boolean(group.title === title) ? <CloseRounded/> :
                                                        <CheckRounded/>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>}
                            </div>
                            <div className="created-on">
                                Created {TimeUtility.dynamicDate(group.createdon || 0)}
                            </div>
                        </div>}
                        {group && <div className="participant kk-card">
                            <label>{group.participants} participants</label>
                            {this.state.participants.map((contact, index) => {
                                return (
                                    <div key={index} className="contact-item">
                                        <span className="avatar">{contact.avatar ? <img
                                            src={contact.avatar}/> : TextAvatar(contact.firstname, contact.lastname)}</span>
                                        <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                                        <span
                                            className="username">{contact.username ? contact.username : 'no username'}</span>
                                        <div className="more" onClick={this.moreOpenHandler.bind(this, contact)}>
                                            <MoreVert/>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="add-member" onClick={this.addMemberDialogOpenHandler}>
                                <AddRounded/> Add member
                            </div>
                        </div>}
                        {/*<div className="contact-box">
                            hey
                        </div>*/}
                    </div>
                </div>
                <Menu
                    anchorEl={moreAnchorEl}
                    open={Boolean(moreAnchorEl)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                >
                    {this.contextMenuItem()}
                </Menu>
                <Dialog
                    open={addMemberDialogEnable}
                    onClose={this.addMemberDialogCloseHandler}
                    className="add-member-dialog"
                >
                    <div className="dialog-content">
                        <div className="dialog-header">
                            <PersonAddRounded/> Add member
                        </div>
                        <ContactList/>
                    </div>
                </Dialog>
            </div>
        );
    }

    /* Gets the group from repository and FullGroup from server */
    private getGroup() {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        this.groupRepo.get(peer.getId() || '').then((res) => {
            this.setState({
                group: res,
                title: res.title || '',
            });
        });

        if (this.loading) {
            return;
        }
        this.loading = true;
        this.sdk.groupGetFull(peer).then((res) => {
            this.groupRepo.importBulk([res.group]);
            this.setState({
                group: res.group,
                participants: res.usersList,
            });
            this.loading = false;
        }).catch((err) => {
            this.loading = false;
        });
    }

    /* On title change will be set on state */
    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: trimStart(e.currentTarget.value),
        });
    }

    /* On titleEdit will be set on state */
    private onTitleEditHandler = () => {
        this.setState({
            titleEdit: true,
        });
    }

    /* If title have any difference from previous one it commit the changes to server
    *  otherwise it rollback all changes */
    private onTitleConfirmHandler = () => {
        const {group, title, peer} = this.state;
        if (!peer || this.loading) {
            return;
        }
        if (!group) {
            this.setState({
                titleEdit: false,
            });
            return;
        }
        if (title.length > 0 && group.title !== title) {
            this.loading = true;
            this.sdk.groupEditTitle(peer, title).then(() => {
                group.title = title;
                this.setState({
                    group,
                    titleEdit: false,
                });
                this.loading = false;
            }).catch((err) => {
                this.setState({
                    title: group.title || '',
                    titleEdit: false,
                });
                this.loading = false;
            });
        } else {
            this.setState({
                titleEdit: false,
            });
            return;
        }
    }

    /* Decides what content the participants' "more" menu must have */
    private contextMenuItem() {
        const menuItems = [{
            cmd: 'remove',
            title: 'Remove',
        }, {
            cmd: 'promote',
            title: 'Promote',
        }];
        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler.bind(this, item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    /* Decide what action should be done on current user */
    private moreCmdHandler = (cmd: string) => {
        const {peer, currentUser, participants} = this.state;
        if (!peer || !currentUser) {
            return;
        }
        const user = new InputUser();
        user.setUserid(currentUser.id || '');
        user.setAccesshash('');
        this.moreCloseHandler();
        switch (cmd) {
            case 'remove':
                this.sdk.groupRemoveMember(peer, user).then(() => {
                    const index = findIndex(participants, {id: currentUser.id});
                    if (index > -1) {
                        participants.splice(index, 1);
                        this.setState({
                            participants,
                        });
                    }
                });
                break;
            case'promote':
                break;
        }
    }

    /* Opens participants' "more" menu
    *  and sets the current user */
    private moreOpenHandler = (user: IUser, e: any) => {
        this.setState({
            currentUser: user,
            moreAnchorEl: e.currentTarget,
        });
    }

    /* Closes participants more menu */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
        });
    }

    /* Opens the add member dialog */
    private addMemberDialogOpenHandler = () => {
        this.setState({
            addMemberDialogEnable: true,
        });
    }

    /* Closes the add member dialog */
    private addMemberDialogCloseHandler = () => {
        this.setState({
            addMemberDialogEnable: false,
        });
    }
}

export default GroupInfoMenu;
