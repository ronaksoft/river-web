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
import {C_TOP_PEER_LEN, TopPeerType} from "../../repository/topPeer";
import {ITopPeerItem} from "../../repository/topPeer/interface";
import Scrollbars from "react-custom-scrollbars";
import UserName from "../UserName";
import UserAvatar from "../UserAvatar";
import {PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import I18n from "../../services/i18n";
import {Link} from "react-router-dom";
import {IUser} from "../../repository/user/interface";
import {IGroup} from "../../repository/group/interface";

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

    constructor(props: IProps) {
        super(props);

        this.state = {
            list: [],
            visible: true,
        };

        this.searchRepo = SearchRepo.getInstance();
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
        const {list, visible} = this.state;
        return (<div className={'top-peer' + (!visible ? ' hidden' : '') + (noTitle ? ' no-title' : '')}>
            {noTitle !== true && <div className="top-peer-title">{I18n.t('general.people')}</div>}
            <Scrollbars
                autoHide={true}
                universal={true}
            >
                <div className="scroll-bar" style={{width: `${list.length * 64}px`}}>
                    {list.map((item, index) => {
                        if (!hideIds || (hideIds && hideIds.indexOf(item.item.id || '') === -1)) {
                            return (
                                <Link key={index} to={`/chat/${item.item.id}`}
                                      onClick={this.clickHandler(item)}>
                                    <div className="top-peer-item">
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
}

export default TopPeer;
