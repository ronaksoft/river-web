/*
    Creation Time: 2018 - Oct - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {SettingsRounded, ChatRounded, AccountCircleRounded} from "@material-ui/icons";
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import i18n from '../../services/i18n';
import {localize} from '../../services/utilities/localize';

import './style.css';

let items: any[] = [];

interface IProps {
    selected: string;
    onSelect?: (item: string) => void;
    unreadCounter: number;
}

interface IState {
    selected: string;
    unreadCounter: number;
}

class BottomBar extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            selected: props.selected,
            unreadCounter: props.unreadCounter,
        };

        items = [{
            icon: <AccountCircleRounded/>,
            page: 'contact',
            title: i18n.t('general.contacts'),
        }, {
            badge: true,
            icon: <ChatRounded/>,
            page: 'chat',
            title: i18n.t('general.chats'),
        }, {
            icon: <SettingsRounded/>,
            page: 'settings',
            title: i18n.t('general.settings'),
        }];
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            selected: newProps.selected,
            unreadCounter: newProps.unreadCounter,
        });
    }

    public render() {
        const {selected, unreadCounter} = this.state;
        return (
            <div className="chat-bottom-bar">
                {items.map((item, index) => {
                    return (
                        <Tooltip
                            key={index}
                            title={item.title}
                            placement="top"
                            enterDelay={1000}
                        >
                            <a onClick={this.onClickHandler.bind(this, item.page)}
                               className={item.page === selected ? 'active' : ''}>

                                {Boolean(item.badge) && <Badge color="primary" badgeContent={localize(unreadCounter)}
                                                               invisible={Boolean(unreadCounter === 0)}>{item.icon}</Badge>}
                                {!Boolean(item.badge) && <span>{item.icon}</span>}
                                <span className="title">{item.title}</span>
                            </a>
                        </Tooltip>);
                })}
            </div>
        );
    }

    private onClickHandler = (item: string) => {
        if (this.props.onSelect) {
            this.props.onSelect(item);
        }
    }
}

export default BottomBar;
