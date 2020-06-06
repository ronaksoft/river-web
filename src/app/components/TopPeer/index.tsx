/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import SearchRepo from "../../repository/search";
import TopPeerRepo, {C_TOP_PEER_LEN, TopPeerType} from "../../repository/topPeer";
import {ITopPeerItem} from "../../repository/topPeer/interface";
import Scrollbars from "react-custom-scrollbars";
import UserName from "../UserName";
import UserAvatar from "../UserAvatar";
import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import I18n from "../../services/i18n";
import {Link} from "react-router-dom";
import {IUser} from "../../repository/user/interface";
import {IGroup} from "../../repository/group/interface";
import {CloseRounded} from "@material-ui/icons";
import APIManager from "../../services/sdk";
import {TopPeerCategory} from "../../services/sdk/messages/chat.api.contacts_pb";
import {findIndex} from 'lodash';

import './style.scss';

interface IProps {
    onSelect?: (type: PeerType, item: IUser | IGroup) => void;
    type: TopPeerType;
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
        this.searchRepo.getSearchTopPeers(this.props.type, C_TOP_PEER_LEN, this.props.onlyUser).then((list) => {
            this.setState({
                list,
            });
        });
    }

    public render() {
        const {noTitle, hideIds} = this.props;
        const {list, visible, clear} = this.state;
        return (<div
            className={'top-peer' + ((!visible && !clear) ? ' hidden' : '') + (noTitle ? ' no-title' : '') + (clear ? ' clear-mode' : '')}>
            {noTitle !== true && <div className="top-peer-title">
                <div className="text">{I18n.t('general.people')}</div>
                <div className="clear"
                     onClick={this.toggleClearHandler}>{I18n.t(clear ? 'general.cancel' : 'general.clear')}</div>
            </div>}
            <Scrollbars autoHide={true} universal={true}>
                <div className="scroll-bar" style={{width: `${list.length * 64}px`}}>
                    {list.map((item, index) => {
                        if (!hideIds || (hideIds && hideIds.indexOf(item.item.id || '') === -1)) {
                            return (
                                <Link key={index} to={`/chat/${item.item.id}`}
                                      onClick={this.clickHandler(item)}>
                                    <div className="top-peer-item">
                                        <div className="remove" onClick={this.removeHandler(item)}><CloseRounded/></div>
                                        {this.getItem(item)}
                                    </div>
                                </Link>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            </Scrollbars>
        </div>);
    }

    private getItem(item: ITopPeerItem) {
        switch (item.type) {
            case PeerType.PEERUSER:
                return <>
                    <UserAvatar id={item.item.id || '0'} noDetail={true} className="top-peer-avatar"/>
                    <UserName id={item.item.id || '0'} noIcon={true} onlyFirstName={true} noDetail={true}
                              className="top-peer-name"/>
                </>;
            case PeerType.PEERGROUP:
                return <>
                    <GroupAvatar id={item.item.id || '0'} className="top-peer-avatar"/>
                    <GroupName id={item.item.id || '0'} noIcon={true} className="top-peer-name"/>
                </>;
            default:
                return null;
        }
    }

    private clickHandler = (item: ITopPeerItem) => (e: any) => {
        if (this.props.onSelect) {
            e.preventDefault();
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
            this.topPeerRepo.remove(this.props.type, item.item.id || '0');
        });
    }
}

export default TopPeer;
