import * as React from 'react';
import {IContact} from '../../repository/contact/interface';
import {CloseRounded, CheckRounded, EditRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
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

import './style.css';


// Todo: add member, kick member, promote member and etc.
interface IProps {
    peer: InputPeer | null;
    onClose?: () => void;
    onCreate?: (contacts: IContact[], title: string) => void;
}

interface IState {
    group: IGroup | null;
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
            group: null,
            page: '1',
            participants: [],
            peer: props.peer,
            title: '',
            titleEdit: false,
        };

        this.groupRepo = GroupRepo.getInstance();
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
        const {group, page, title, titleEdit} = this.state;
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
                                    </div>
                                );
                            })}
                        </div>}
                        {/*<div className="contact-box">
                            hey
                        </div>*/}
                    </div>
                </div>
            </div>
        );
    }

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
            window.console.log(err);
            this.loading = false;
        });
    }

    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: e.currentTarget.value,
        });
    }

    private onTitleEditHandler = () => {
        this.setState({
            titleEdit: true,
        });
    }

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
        if (group.title !== title) {
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
}

export default GroupInfoMenu;
