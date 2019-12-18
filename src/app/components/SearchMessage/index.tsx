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
import {debounce, clone, isEqual} from 'lodash';
import i18n from '../../services/i18n';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import LabelRepo from "../../repository/label";
import {ILabel} from "../../repository/label/interface";
import Scrollbars from "react-custom-scrollbars";
import Chip from "@material-ui/core/Chip";
import ChipInput from "material-ui-chip-input";

import './style.scss';
import Broadcaster from "../../services/broadcaster";

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
    labelAnchorEl: any;
    labelList: ILabel[];
    next: boolean;
    prev: boolean;
    selectedLabelIds: number[];
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
            labelAnchorEl: null,
            labelList: [],
            next: false,
            prev: false,
            selectedLabelIds: [],
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
        const {next, prev, labelAnchorEl, labelList, appliedSelectedLabelIds} = this.state;
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
                        />
                    </div>
                    <div className="search-label">
                        <IconButton
                            onClick={this.labelOpenHandler}
                        >
                            {appliedSelectedLabelIds.length === 0 ? <LabelOutlined/> : <LabelRounded/>}
                        </IconButton>
                    </div>
                    <div className="search-action">
                        <IconButton
                            onClick={this.closeSearchHandler}
                        >
                            <CloseRounded/>
                        </IconButton>
                    </div>
                </div>
                <Popover anchorEl={labelAnchorEl}
                         open={Boolean(labelAnchorEl)}
                         onClose={this.labelCloseHandler}
                         anchorOrigin={{
                             horizontal: "center",
                             vertical: "bottom",
                         }}
                         className="search-label-popover"
                >
                    <div className="search-label-container">
                        <div className="search-label-list" style={{height: this.getLabelListHeight()}}>
                            <Scrollbars
                                autoHide={true}
                                hideTracksWhenNotNeeded={true}
                                universal={true}
                                autoHeight={true}
                            >
                                {labelList.map((label) => {
                                    return (<div key={label.id}
                                                 className={'label-item' + (this.isLabelSelected(label.id || 0) ? ' selected' : '')}
                                                 onClick={this.toggleLabelHandler(label.id || 0)}>
                                        <div className="label-icon">
                                            <LabelRounded style={{color: label.colour}}/>
                                        </div>
                                        <div className="label-name">{label.name}</div>
                                    </div>);
                                })}
                            </Scrollbars>
                        </div>
                        <div className="search-label">
                            <Button fullWidth={true}
                                    variant="outlined" color="secondary" size="small"
                                    onClick={this.labelApplyHandler}
                                    disabled={isEqual(appliedSelectedLabelIds, this.state.selectedLabelIds)}
                            >{i18n.t('general.apply')}</Button>
                        </div>
                    </div>
                </Popover>
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }

    // private searchRefHandler = (ref: any) => {
    //     this.searchRef = ref;
    // }

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
            selectedLabelIds: [],
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
        this.setState({
            labelAnchorEl: e.currentTarget,
            selectedLabelIds: clone(this.state.appliedSelectedLabelIds),
        });
    }

    private labelCloseHandler = () => {
        this.setState({
            labelAnchorEl: null,
            selectedLabelIds: clone(this.state.appliedSelectedLabelIds),
        });
    }

    private getLabelListHeight() {
        let height = this.state.labelList.length * 28;
        if (height > 150) {
            height = 150;
        }
        return `${height}px`;
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

    private toggleLabelHandler = (id: number) => (e: any) => {
        const {selectedLabelIds} = this.state;
        const index = selectedLabelIds.indexOf(id);
        if (index > -1) {
            selectedLabelIds.splice(index, 1);
        } else {
            selectedLabelIds.push(id);
        }
        this.setState({
            selectedLabelIds,
        }, () => {
            this.forceUpdate();
        });
    }

    private isLabelSelected(id: number) {
        return this.state.selectedLabelIds.indexOf(id) > -1;
    }

    private labelApplyHandler = () => {
        this.setState({
            appliedSelectedLabelIds: clone(this.state.selectedLabelIds),
        }, () => {
            this.search(this.text);
        });
        this.labelCloseHandler();
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
}

export default SearchMessage;
