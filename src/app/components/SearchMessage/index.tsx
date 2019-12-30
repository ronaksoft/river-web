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
    ExpandLessRounded,
    CloseRounded,
    LabelOutlined,
    LabelRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import MessageRepo from '../../repository/message';
import {IMessage} from '../../repository/message/interface';
import {debounce, clone} from 'lodash';
import i18n from '../../services/i18n';
import LabelRepo from "../../repository/label";
import {ILabel} from "../../repository/label/interface";
import Chip from "@material-ui/core/Chip";
import ChipInput from "material-ui-chip-input";
import Broadcaster from "../../services/broadcaster";
import LabelPopover from "../LabelPopover";

import './style.scss';

const searchLimit: number = 10;

interface IProps {
    onFind: (id: number, text: string) => void;
    onClose: () => void;
}

interface IState {
    appliedSelectedLabelIds: number[];
    currentId: number;
    focus: boolean;
    items: IMessage[];
    labelActive: boolean;
    labelAnchorEl: any;
    labelList: ILabel[];
    next: boolean;
    prev: boolean;
}

class SearchMessage extends React.PureComponent<IProps, IState> {
    private ref: any = null;
    private searchRef: any = null;
    private labelPopoverRef: LabelPopover | undefined;
    private visible: boolean = false;
    private messageRepo: MessageRepo;
    private readonly searchDebouncer: any;
    private hasMore: boolean = false;
    private text: string = '';
    private peer: InputPeer | null = null;
    private labelRepo: LabelRepo;
    private labelMap: { [key: number]: number } = {};
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            appliedSelectedLabelIds: [],
            currentId: -1,
            focus: false,
            items: [],
            labelActive: false,
            labelAnchorEl: null,
            labelList: [],
            next: false,
            prev: false,
        };

        this.messageRepo = MessageRepo.getInstance();
        this.searchDebouncer = debounce(this.search, 512);
        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('keydown', this.keyDownHandler, true);
        this.getLabelList();
        this.eventReferences.push(this.broadcaster.listen('Label_DB_Updated', this.getLabelList));
    }

    public componentWillUnmount() {
        window.removeEventListener('keydown', this.keyDownHandler, true);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
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
        const {next, prev, appliedSelectedLabelIds, labelActive} = this.state;
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
                        <ChipInput
                            id="message-search"
                            placeholder={i18n.t('chat.search_messages')}
                            className="search-chip-input"
                            value={appliedSelectedLabelIds}
                            chipRenderer={this.chipRenderer}
                            fullWidth={true}
                            onUpdateInput={this.searchChangeHandler}
                            onDelete={this.removeItemHandler}
                            classes={{
                                'chip': 'chip-chip',
                                'chipContainer': 'chip-container',
                                'input': 'chip-input',
                                'inputRoot': 'chip-input-root',
                                'label': 'chip-label',
                                'root': 'chip-root',
                            }}
                            onKeyUp={this.searchKeyUpHandler}
                            variant="outlined"
                            inputRef={this.searchRefHandler}
                        />
                        <div className="search-label">
                            <IconButton
                                onClick={this.labelOpenHandler}
                            >
                                {labelActive ? <LabelRounded/> : <LabelOutlined/>}
                            </IconButton>
                        </div>
                        <LabelPopover ref={this.labelPopoverRefHandler} labelList={this.state.labelList}
                                      onApply={this.labelPopoverApplyHandler}
                                      onCancel={this.labelPopoverCancelHandler}/>
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

    private labelPopoverRefHandler = (ref: any) => {
        this.labelPopoverRef = ref;
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
            appliedSelectedLabelIds: [],
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
        if (text.length === 0 && this.state.appliedSelectedLabelIds.length === 0) {
            this.reset();
            return;
        }
        this.messageRepo.search(peer.getId() || '', {
            keyword: text,
            labelIds: this.state.appliedSelectedLabelIds,
            limit: searchLimit
        }).then((res) => {
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

    private labelOpenHandler = (e: any) => {
        if (!this.labelPopoverRef) {
            return;
        }
        const rect = e.target.getBoundingClientRect();
        this.labelPopoverRef.open({
            left: rect.left - 126,
            top: rect.top + 30,
        }, clone(this.state.appliedSelectedLabelIds));
        this.setState({
            labelActive: true,
        });
    }

    private getLabelList = () => {
        this.labelRepo.search({}).then((res) => {
            res.forEach((item, key) => {
                this.labelMap[item.id || 0] = key;
            });
            this.setState({
                labelList: res,
            });
        });
    }


    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        if (this.labelMap.hasOwnProperty(value)) {
            const index = this.labelMap[value];
            const label = this.state.labelList[index];
            return (
                <Chip key={key} avatar={<LabelRounded style={{color: label.colour}}/>} tabIndex={-1} label={label.name}
                      onDelete={this.removeItemHandler(value)} className="chip"/>);
        }
        return (<span/>);
    }

    private removeItemHandler = (id: number) => (e: any) => {
        const {appliedSelectedLabelIds} = this.state;
        const index = appliedSelectedLabelIds.indexOf(id);
        if (index > -1) {
            appliedSelectedLabelIds.splice(index, 1);
            this.setState({
                appliedSelectedLabelIds,
            }, () => {
                this.search(this.text);
            });
        }
    }

    private labelPopoverApplyHandler = (ids: number[]) => {
        this.setState({
            appliedSelectedLabelIds: ids,
        }, () => {
            this.search(this.text);
        });
    }

    private labelPopoverCancelHandler = () => {
        this.setState({
            labelActive: false,
        });
    }

    private searchRefHandler = (ref: any) => {
        this.searchRef = ref;
    }
}

export default SearchMessage;
