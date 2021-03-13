/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import SearchRepo from "../../repository/search";
import TopPeerRepo, {C_TOP_PEER_LEN, TopPeerType} from "../../repository/topPeer";
import {ITopPeerItem} from "../../repository/topPeer/interface";
import Scrollbars from "react-custom-scrollbars";
import UserName from "../UserName";
import UserAvatar from "../UserAvatar";
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import I18n from "../../services/i18n";
import i18n from "../../services/i18n";
import {Link} from "react-router-dom";
import {IUser} from "../../repository/user/interface";
import {IGroup} from "../../repository/group/interface";
import {CloseRounded} from "@material-ui/icons";
import APIManager, {currentUserId} from "../../services/sdk";
import {findIndex} from 'lodash';
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import {TopPeerCategory} from "../../services/sdk/messages/contacts_pb";

import './style.scss';

interface IProps {
    onSelect?: (type: PeerType, item: IUser | IGroup) => void;
    type: TopPeerType;
    teamId: string;
    visible?: boolean;
    noTitle?: boolean;
    onlyUser?: boolean;
    hideIds?: string[];
}

interface IState {
    clear: boolean;
    list: ITopPeerItem[];
    visible: boolean;
}

class TopPeer extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.visible === undefined || props.visible === state.visible) {
            return null;
        }
        return {
            visible: props.visible,
        };
    }

    private searchRepo: SearchRepo;
    private topPeerRepo: TopPeerRepo;
    private apiManager: APIManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            clear: false,
            list: [],
            visible: true,
        };

        this.searchRepo = SearchRepo.getInstance();
        this.topPeerRepo = TopPeerRepo.getInstance();
        this.apiManager = APIManager.getInstance();
    }

    public componentDidMount(): void {
        this.reload();
    }

    public reload() {
        this.searchRepo.getSearchTopPeers(this.props.teamId, this.props.type, C_TOP_PEER_LEN, this.props.onlyUser).then((list) => {
            this.setState({
                list,
            });
        });
    }

    public render() {
        const {noTitle, hideIds, type} = this.props;
        const {list, visible, clear} = this.state;
        const filteredList = list.filter(item => !hideIds || (hideIds && hideIds.indexOf(item.item.id || '') === -1));
        if (filteredList.length === 0) {
            return null;
        }
        return (<div
            className={'top-peer' + ((!visible && !clear) ? ' hidden' : '') + (noTitle ? ' no-title' : '') + (clear ? ' clear-mode' : '')}>
            {noTitle !== true && <div className="top-peer-title">
                <div className="text"
                >{I18n.t(type === TopPeerType.Forward ? 'general.frequently_forwarded_to' : 'general.frequently_contacted')}</div>
                <div className="clear" onClick={this.toggleClearHandler}
                >{I18n.t(clear ? 'general.cancel' : 'general.clear')}</div>
            </div>}
            <Scrollbars autoHide={true} universal={true}>
                <div className="scroll-bar" style={{width: `${list.length * 64}px`}}>
                    {filteredList.map((item, index) => {
                        return (
                            <Link key={index} to={`/chat/${this.props.teamId}/${item.item.id}_${item.type}`}
                                  onClick={this.clickHandler(item)}>
                                <div className="top-peer-item">
                                    <div className="remove" onClick={this.removeHandler(item)}><CloseRounded/></div>
                                    {this.getItem(item)}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </Scrollbars>
        </div>);
    }

    private getItem(item: ITopPeerItem) {
        switch (item.type) {
            case PeerType.PEERUSER:
            case PeerType.PEEREXTERNALUSER:
                return <>
                    <UserAvatar id={item.item.id || '0'} noDetail={true} className="top-peer-avatar"
                                savedMessages={item.item.id === currentUserId}/>
                    <UserName id={item.item.id || '0'} noIcon={true} onlyFirstName={true} noDetail={true}
                              you={item.item.id === currentUserId} className="top-peer-name"
                              youPlaceholder={i18n.t('general.saved_messages')}/>
                </>;
            case PeerType.PEERGROUP:
                const group = item.item as IGroup;
                return <>
                    <GroupAvatar id={group.id || '0'} teamId={group.teamid || '0'} className="top-peer-avatar"/>
                    <GroupName id={group.id || '0'} teamId={group.teamid || '0'} noIcon={true}
                               className="top-peer-name"/>
                </>;
            default:
                return null;
        }
    }

    private clickHandler = (item: ITopPeerItem) => (e: any) => {
        if (this.props.onSelect || this.state.clear) {
            e.preventDefault();
        }
        if (this.props.onSelect) {
            this.props.onSelect(item.type, item.item);
        }
    }

    private toggleClearHandler = () => {
        this.setState({
            clear: !this.state.clear,
        });
    }

    private getTopPeerCategory(peerType: PeerType) {
        const {type} = this.props;
        if (type === TopPeerType.Search) {
            if (peerType === PeerType.PEERGROUP) {
                return TopPeerCategory.GROUPS;
            } else {
                return TopPeerCategory.USERS;
            }
        } else {
            return TopPeerCategory.FORWARDS;
        }
    }

    private removeHandler = (item: ITopPeerItem) => (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        const {list} = this.state;
        const inputPeer = new InputPeer();
        inputPeer.setId(item.item.id || '0');
        inputPeer.setType(item.type);
        if (item.type === PeerType.PEERGROUP) {
            inputPeer.setAccesshash('0');
        } else {
            inputPeer.setAccesshash((item.item as IUser).accesshash || '0');
        }
        const index = findIndex(list, (o) => {
            return o.item.id === item.item.id;
        });
        if (index > -1) {
            list.splice(index, 1);
            this.setState({
                list,
            });
        }
        this.apiManager.removeTopPeer(this.getTopPeerCategory(item.type), inputPeer).then((res) => {
            this.topPeerRepo.remove(this.props.teamId, this.props.type, item.item.id || '0', item.type);
        });
    }
}

export default TopPeer;
