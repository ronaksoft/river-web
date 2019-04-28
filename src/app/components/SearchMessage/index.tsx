/*
    Creation Time: 2019 - April - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {
    ExpandMoreRounded,
    ExpandLessRounded, CloseRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import TextField from '@material-ui/core/TextField/TextField';
import MessageRepo from '../../repository/message';
import {IMessage} from '../../repository/message/interface';
import {debounce} from 'lodash';

import './style.css';

interface IProps {
    onFind: (id: number) => void;
    peer: InputPeer | null;
}

interface IState {
    currentId: number;
    focus: boolean;
    items: IMessage[];
    next: boolean;
    prev: boolean;
}

class SearchMessage extends React.PureComponent<IProps, IState> {
    private ref: any = null;
    private visible: boolean = false;
    private messageRepo: MessageRepo;
    private readonly searchDebouncer: any;
    private lastPeerId: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            currentId: -1,
            focus: false,
            items: [],
            next: false,
            prev: false,
        };

        this.messageRepo = MessageRepo.getInstance();
        this.searchDebouncer = debounce(this.search, 512);
        if (props.peer) {
            this.lastPeerId = props.peer.getId() || '';
        }
    }

    public componentDidMount() {
        window.addEventListener('keydown', this.keyDownHandler, true);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.peer && (newProps.peer.getId() || '') !== this.lastPeerId) {
            this.reset();
            this.lastPeerId = newProps.peer.getId() || '';
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('keydown', this.keyDownHandler, true);
    }

    public render() {
        const {focus, next, prev} = this.state;
        return (
            <div ref={this.refHandler} className="search-message">
                <div className="search-box">
                    <div className="search-action">
                        <IconButton
                            onClick={this.prevResultHandler}
                            disabled={!prev}
                        >
                            <ExpandLessRounded/>
                        </IconButton>
                    </div>
                    <div className="search-action">
                        <IconButton
                            onClick={this.nextResultHandler}
                            disabled={!next}
                        >
                            <ExpandMoreRounded/>
                        </IconButton>
                    </div>
                    <div className="search-input">
                        <TextField
                            label="Search Messages"
                            margin="none"
                            className={'input' + (focus ? ' focus' : '')}
                            fullWidth={true}
                            rowsMax={2}
                            inputProps={{
                                maxLength: 32,
                            }}
                            onFocus={this.searchFocusHandler}
                            onBlur={this.searchBlurHandler}
                            onChange={this.searchChangeHandler}
                        />
                    </div>
                    <div className="search-action">
                        <IconButton
                            onClick={this.closeSearchHandler}
                        >
                            <CloseRounded/>
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }

    private keyDownHandler = (e: any) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.keyCode) {
                case 70:
                    e.preventDefault();
                    this.toggleVisible();
                    break;
                case 27:
                    this.toggleVisible();
                    break;
            }
        }
    }

    private reset() {
        this.setState({
            items: [],
            next: false,
            prev: false,
        });
    }

    private toggleVisible() {
        if (!this.ref) {
            return;
        }
        if (this.visible) {
            this.ref.classList.remove('visible');
            this.visible = false;
            this.reset();
        } else {
            this.ref.classList.add('visible');
            this.visible = true;
        }
    }

    private prevResultHandler = () => {
        const {items} = this.state;
        let {currentId} = this.state;
        currentId++;
        if (items.length > currentId) {
            this.setState({
                currentId,
                next: currentId > 0,
                prev: (items.length - 1) > currentId,
            });
            this.props.onFind(items[currentId].id || 0);
        }
    }

    private nextResultHandler = () => {
        const {items} = this.state;
        let {currentId} = this.state;
        currentId--;
        if (items.length > 0 && currentId > -1) {
            this.setState({
                currentId,
                next: currentId > 0,
                prev: (items.length - 1) > currentId,
            });
            this.props.onFind(items[currentId].id || 0);
        }
    }

    private searchChangeHandler = (e: any) => {
        const {peer} = this.props;
        if (!peer) {
            return;
        }
        const text = e.target.value;
        this.searchDebouncer(text);
    }

    private search = (text: string) => {
        const {peer} = this.props;
        if (!peer) {
            return;
        }
        text = text.toLowerCase();
        this.messageRepo.search(peer.getId() || '', {keyword: text, limit: 10}).then((res) => {
            if (res.length > 0) {
                this.props.onFind(res[0].id || 0);
                this.setState({
                    currentId: 0,
                    items: res,
                    next: false,
                    prev: res.length > 1,
                });
            } else {
                this.setState({
                    currentId: -1,
                    items: [],
                    next: false,
                    prev: false,
                });
            }
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private searchFocusHandler = () => {
        this.setState({
            focus: true,
        });
    }

    private searchBlurHandler = (e: any) => {
        if (e.currentTarget.value.length === 0) {
            this.setState({
                focus: false,
            });
        }
    }

    private closeSearchHandler = () => {
        this.toggleVisible();
    }
}

export default SearchMessage;
