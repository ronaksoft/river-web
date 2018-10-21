import * as React from 'react';
import {ExitToAppRounded, SettingsRounded, ChatRounded, AccountCircleRounded} from "@material-ui/icons";

import './style.css';

interface IProps {
    selected: string;
    onSelect?: (item: string) => void;
}

interface IState {
    selected: string;
}

class BottomBar extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            selected: props.selected,
        };
    }

    // public componentDidMount() {
    // }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            selected: newProps.selected,
        });
    }

    public render() {
        const {selected} = this.state;
        const items: any[] = [{
            icon: <AccountCircleRounded/>,
            page: 'contact',
            title: 'Contacts',
        }, {
            icon: <ChatRounded/>,
            page: 'chat',
            title: 'Chats',
        }, {
            icon: <SettingsRounded/>,
            page: 'setting',
            title: 'Settings',
        }, {
            icon: <ExitToAppRounded/>,
            page: 'logout',
            title: 'Logout',
        }];
        return (
            <div className="bottom-bar">
                {items.map((item, index) => {
                    return (
                        <a onClick={this.onClickHandler.bind(this, item.page)} key={index}
                           className={item.page === selected ? 'active' : ''}>
                            {item.icon}
                            <span className="title">{item.title}</span>
                        </a>);
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