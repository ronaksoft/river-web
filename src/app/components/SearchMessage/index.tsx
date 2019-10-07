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
import i18n from '../../services/i18n';

import './style.css';

const searchLimit: number = 10;

interface IProps {
    onFind: (id: number, text: string) => void;
    onClose: () => void;
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
    private searchRef: any = null;
    private visible: boolean = false;
    private messageRepo: MessageRepo;
    private readonly searchDebouncer: any;
    private hasMore: boolean = false;
    private text: string = '';
    private peer: InputPeer | null = null;

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
    }

    public componentDidMount() {
        window.addEventListener('keydown', this.keyDownHandler, true);
    }

    public componentWillUnmount() {
        window.removeEventListener('keydown', this.keyDownHandler, true);
    }

    public toggleVisible() {
        if (!this.ref) {
            return;
        }
        if (this.visible) {
            this.ref.classList.remove('visible');
            this.visible = false;
            this.reset();
            this.props.onClose();
        } else {
            this.ref.classList.add('visible');
            this.visible = true;
            if (this.searchRef) {
                this.searchRef.focus();
            }
        }
    }

    public setPeer(peer: InputPeer | null) {
        this.peer = peer;
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
                            inputRef={this.searchRefHandler}
                            label={i18n.t('chat.search_messages')}
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
                            onKeyUp={this.searchKeyUpHandler}
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

    private searchRefHandler = (ref: any) => {
        this.searchRef = ref;
    }

    private keyDownHandler = (e: any) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.keyCode) {
                case 70:
                    e.preventDefault();
                    this.toggleVisible();
                    break;
            }
        }
    }

    private reset() {
        this.text = '';
        this.hasMore = false;
        this.setState({
            currentId: -1,
            items: [],
            next: false,
            prev: false,
        });
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
            this.props.onFind(items[currentId].id || 0, this.text);
            if (this.hasMore && items.length - currentId <= 2) {
                this.searchMore((items[items.length - 1].id || 0) - 1);
            }
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
            this.props.onFind(items[currentId].id || 0, this.text);
        }
    }

    private searchChangeHandler = (e: any) => {
        const peer = this.peer;
        if (!peer) {
            return;
        }
        let text = e.target.value;
        text = text.toLowerCase();
        this.text = text;
        this.searchDebouncer(text);
    }

    private search = (text: string) => {
        const peer = this.peer;
        if (!peer) {
            return;
        }
        if (text.length === 0) {
            this.reset();
            return;
        }
        this.messageRepo.search(peer.getId() || '', {keyword: text, limit: searchLimit}).then((res) => {
            if (res.length > 0) {
                this.props.onFind(res[0].id || 0, this.text);
                this.setState({
                    currentId: 0,
                    items: res,
                    next: false,
                    prev: res.length > 1,
                });
                this.hasMore = res.length === searchLimit;
            } else {
                this.setState({
                    currentId: -1,
                    items: [],
                    next: false,
                    prev: false,
                });
                this.hasMore = false;
            }
        });
    }

    private searchMore = (before: number) => {
        const peer = this.peer;
        const {items} = this.state;
        if (!peer) {
            return;
        }
        this.messageRepo.search(peer.getId() || '', {keyword: this.text, limit: searchLimit, before}).then((res) => {
            if (res.length > 0) {
                items.push.apply(items, res);
                this.setState({
                    items,
                    prev: res.length > 1,
                });
                this.hasMore = res.length === searchLimit;
            } else {
                this.hasMore = false;
            }
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

    private searchKeyUpHandler = (e: any) => {
        switch (e.which) {
            case 38:
                e.preventDefault();
                this.prevResultHandler();
                break;
            case 40:
                e.preventDefault();
                this.nextResultHandler();
                break;
            case 13:
                this.searchDebouncer.cancel();
                this.search(this.text);
                break;
            case 27:
                if (this.visible) {
                    this.toggleVisible();
                }
                break;
        }
    }

    private closeSearchHandler = () => {
        this.toggleVisible();
    }
}

export default SearchMessage;
