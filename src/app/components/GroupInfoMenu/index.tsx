import * as React from 'react';
import {IContact} from '../../repository/contact/interface';
import {CloseRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import SDK from '../../services/sdk';
import GroupRepo from '../../repository/group';
import {IGroup} from '../../repository/group/interface';

import './style.css';

interface IProps {
    peer: InputPeer | null;
    onClose?: () => void;
    onCreate?: (contacts: IContact[], title: string) => void;
}

interface IState {
    group: IGroup | null;
    page: string;
    peer: InputPeer | null;
    title: string;
}

class GroupInfoMenu extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);

        this.state = {
            group: null,
            page: '1',
            peer: props.peer,
            title: '',
        };

        this.groupRepo = GroupRepo.getInstance();
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        //
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
        const {page} = this.state;
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
                        <div className="info">
                            <div className="avatar">
                                hey
                            </div>
                            <div className="title">
                                bio bio
                            </div>
                        </div>
                        <div className="contact-box">
                            hey
                        </div>
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
            window.console.log(res);
            this.setState({
                group: res,
            });
        }).catch((err) => {
            window.console.log(err);
        });

        this.sdk.getFullGroup(peer).then((res) => {
            window.console.log(res);
        }).catch((err) => {
            window.console.log(err);
        });
    }
}

export default GroupInfoMenu;
