/*
    Creation Time: 2019 - April - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer, PeerType} from '../../services/sdk/messages/core.types_pb';
import {
    CloseRounded,
    ExpandLessRounded,
    ExpandMoreRounded,
    LabelOutlined,
    LabelRounded,
    PersonRounded,
    PersonOutlineRounded
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import MessageRepo from '../../repository/message';
import {IMessage} from '../../repository/message/interface';
import {clone, debounce} from 'lodash';
import i18n from '../../services/i18n';
import LabelRepo from "../../repository/label";
import {ILabel} from "../../repository/label/interface";
import Chip from "@material-ui/core/Chip";
import ChipInput from "material-ui-chip-input";
import Broadcaster from "../../services/broadcaster";
import LabelPopover from "../LabelPopover";
import GroupRepo from "../../repository/group";
import {IUser} from "../../repository/user/interface";
import UserPopover from "../UserPopover";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";

import './style.scss';

const searchLimit: number = 10;

const C_CHIP_TYPE = {
    LABEL: 1,
    USER: 2,
};

interface IProps {
    onFind: (id: number, text: string) => void;
    onClose: () => void;
}

interface IState {
    appliedSelectedLabelIds: number[];
    appliedSelectedUserIds: string[];
    currentId: number;
    focus: boolean;
    items: IMessage[];
    labelActive: boolean;
    labelAnchorEl: any;
    labelList: ILabel[];
    userActive: boolean;
    userAnchorEl: any;
    userList: IUser[];
    searchUserActive: boolean;
    next: boolean;
    prev: boolean;
}

class SearchMessage extends React.PureComponent<IProps, IState> {
    private teamId: string = '0';
    private ref: any = null;
    private searchRef: any = null;
    private labelPopoverRef: LabelPopover | undefined;
    private userPopoverRef: UserPopover | undefined;
    private visible: boolean = false;
    private messageRepo: MessageRepo;
    private readonly searchDebouncer: any;
    private hasMore: boolean = false;
    private text: string = '';
    private peer: InputPeer | null = null;
    private labelRepo: LabelRepo;
    private labelMap: { [key: number]: number } = {};
    private groupRepo: GroupRepo;
    private userMap: { [key: string]: number } = {};
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            appliedSelectedLabelIds: [],
            appliedSelectedUserIds: [],
            currentId: -1,
            focus: false,
            items: [],
            labelActive: false,
            labelAnchorEl: null,
            labelList: [],
            next: false,
            prev: false,
            searchUserActive: false,
            userActive: false,
            userAnchorEl: null,
            userList: [],
        };

        this.messageRepo = MessageRepo.getInstance();
        this.searchDebouncer = debounce(this.search, 512);
        this.labelRepo = LabelRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
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

    public setPeer(teamId: string, peer: InputPeer | null) {
        this.teamId = teamId;
        this.peer = peer;
        if (peer && peer.getType() === PeerType.PEERGROUP) {
            this.setState({
                appliedSelectedLabelIds: [],
                appliedSelectedUserIds: [],
                searchUserActive: true,
                userList: [],
            });
            this.userMap = {};
            this.getGroupMemberList();
        } else {
            this.setState({
                appliedSelectedLabelIds: [],
                appliedSelectedUserIds: [],
                searchUserActive: false,
                userList: [],
            });
        }
    }

    public render() {
        const {next, prev, labelActive, userActive, searchUserActive} = this.state;
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
                            value={this.mergeSelectedChips()}
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
                        <div className="search-filter">
                            <IconButton
                                onClick={this.labelOpenHandler}
                            >
                                {labelActive ? <LabelRounded/> : <LabelOutlined/>}
                            </IconButton>
                            {searchUserActive && <IconButton
                                onClick={this.userOpenHandler}
                            >
                                {userActive ? <PersonRounded/> : <PersonOutlineRounded/>}
                            </IconButton>}
                        </div>
                        <LabelPopover ref={this.labelPopoverRefHandler} labelList={this.state.labelList}
                                      onApply={this.labelPopoverApplyHandler}
                                      onCancel={this.labelPopoverCancelHandler}/>
                        <UserPopover ref={this.userPopoverRefHandler} userList={this.state.userList}
                                     onApply={this.userPopoverApplyHandler} closeAfterSelect={true}
                                     onCancel={this.userPopoverCancelHandler}/>
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

    private labelPopoverRefHandler = (ref: any) => {
        this.labelPopoverRef = ref;
    }

    private userPopoverRefHandler = (ref: any) => {
        this.userPopoverRef = ref;
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
        if (text.length === 0 && this.state.appliedSelectedLabelIds.length === 0 && this.state.appliedSelectedUserIds.length === 0) {
            this.reset();
            return;
        }
        this.messageRepo.search(this.teamId, peer.getId() || '', {
            keyword: text,
            labelIds: this.state.appliedSelectedLabelIds,
            limit: searchLimit,
            senderIds: this.state.appliedSelectedUserIds,
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
        this.messageRepo.search(this.teamId, peer.getId() || '', {
            before,
            keyword: this.text,
            labelIds: this.state.appliedSelectedLabelIds,
            limit: searchLimit,
            senderIds: this.state.appliedSelectedUserIds,
        }).then((res) => {
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

    private userOpenHandler = (e: any) => {
        if (!this.userPopoverRef) {
            return;
        }
        const rect = e.target.getBoundingClientRect();
        this.userPopoverRef.open({
            left: rect.left - 126,
            top: rect.top + 30,
        }, clone(this.state.appliedSelectedUserIds));
        this.setState({
            userActive: true,
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
        if (!value) {
            return <span/>;
        }
        if (value.type === C_CHIP_TYPE.LABEL) {
            if (this.labelMap.hasOwnProperty(value.id)) {
                const index = this.labelMap[value.id];
                const label = this.state.labelList[index];
                return (
                    <Chip key={key} avatar={<LabelRounded style={{color: label.colour}}/>} tabIndex={-1}
                          label={label.name}
                          onDelete={this.removeItemHandler(value)} className="chip"/>);
            }
        } else if (value.type === C_CHIP_TYPE.USER) {
            if (this.userMap.hasOwnProperty(value.id)) {
                const index = this.userMap[value.id];
                const user = this.state.userList[index];
                return (
                    <Chip key={key} avatar={<UserAvatar className="chip-avatar" id={user.id || '0'} noDetail={true}/>}
                          tabIndex={-1}
                          label={<UserName id={user.id || '0'} noDetail={true}/>}
                          onDelete={this.removeItemHandler(value)} className="chip"/>);
            }
        }
        return (<span/>);
    }

    private removeItemHandler = (value: { id: any, type: number }) => (e: any) => {
        const {appliedSelectedLabelIds, appliedSelectedUserIds} = this.state;
        if (value.type === C_CHIP_TYPE.LABEL) {
            const index = appliedSelectedLabelIds.indexOf(value.id);
            if (index > -1) {
                appliedSelectedLabelIds.splice(index, 1);
                this.setState({
                    appliedSelectedLabelIds,
                }, () => {
                    this.search(this.text);
                });
            }
        } else if (value.type === C_CHIP_TYPE.USER) {
            const index = appliedSelectedUserIds.indexOf(value.id);
            if (index > -1) {
                appliedSelectedUserIds.splice(index, 1);
                this.setState({
                    appliedSelectedUserIds,
                }, () => {
                    this.search(this.text);
                });
            }
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

    private userPopoverApplyHandler = (ids: string[]) => {
        this.setState({
            appliedSelectedUserIds: ids,
        }, () => {
            this.search(this.text);
        });
    }

    private userPopoverCancelHandler = () => {
        this.setState({
            userActive: false,
        });
    }

    private getGroupMemberList() {
        if (!this.peer) {
            return;
        }
        this.groupRepo.getFull(this.teamId, this.peer.getId() || '', undefined, true).then((res) => {
            if (!res.participantList) {
                return;
            }
            this.setState({
                userList: res.participantList.map((p, i) => {
                        this.userMap[p.userid || ''] = i;
                        return {
                            accesshash: p.accesshash,
                            firstname: p.firstname,
                            id: p.userid,
                            lastname: p.lastname,
                            photo: p.photo,
                            username: p.lastname,
                        };
                    }
                ),
            });
        });
    }

    private mergeSelectedChips(): any[] {
        const {appliedSelectedUserIds, appliedSelectedLabelIds} = this.state;
        return [...appliedSelectedUserIds.map(o => ({
            id: o,
            type: C_CHIP_TYPE.USER
        })), ...appliedSelectedLabelIds.map(o => ({
            id: o,
            type: C_CHIP_TYPE.LABEL
        }))];
    }
}

export default SearchMessage;
