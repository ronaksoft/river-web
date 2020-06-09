/*
    Creation Time: 2018 - Dec - 23
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import AutoSizer from "react-virtualized-auto-sizer";
import {IUser} from '../../repository/user/interface';
import {clone, debounce, differenceBy, differenceWith, findIndex} from 'lodash';
import UserAvatar from '../UserAvatar';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import {
    InsertDriveFileOutlined,
    LocationOnOutlined,
    NotInterestedRounded,
    PeopleOutlined,
    PhotoOutlined,
    RecordVoiceOverOutlined,
    SearchRounded,
    VideocamOutlined,
} from '@material-ui/icons';
import {IDialog} from '../../repository/dialog/interface';
import SearchRepo from '../../repository/search';
import {IDialogWithContact} from '../../repository/search/interface';
import {PeerType} from '../../services/sdk/messages/chat.core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {categorizeContact} from '../ContactList';
import Scrollbars from 'react-custom-scrollbars';
import {C_MESSAGE_ICON} from '../Dialog/utils';
import i18n from '../../services/i18n';
import {VariableSizeList} from "react-window";
import IsMobile from "../../services/isMobile";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import TopPeer from "../TopPeer";
import {TopPeerType} from "../../repository/topPeer";
import {IGroup} from "../../repository/group/interface";
import {InputAdornment} from "@material-ui/core";

import './style.scss';

interface ISearchItem {
    contact?: IUser;
    dialog?: IDialog;
    id?: string;
    label?: string;
    mode: 'contact' | 'dialog' | 'label';
}

export interface IInputPeer {
    accesshash: string;
    id: string;
    type: PeerType;
}

interface IProps {
    onChange?: (peerInputs: IInputPeer[]) => void;
    contactOnly?: boolean;
    selectedIds?: string[];
    enableTopPeer?: boolean;
    topPeerType?: TopPeerType;
}

interface IState {
    inputPeers: ISearchItem[];
    page: string;
    scrollIndex: number;
    selectedInputPeers: ISearchItem[];
    title: string;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

class SearchList extends React.Component<IProps, IState> {
    private inputPeerRes: IDialogWithContact = {dialogs: [], contacts: []};
    private list: VariableSizeList | undefined;
    private searchRepo: SearchRepo;
    private defaultInputPeer: IDialogWithContact = {contacts: [], dialogs: []};
    private readonly searchDebounce: any;
    private readonly userId: string = '';
    private readonly searchApi: any;
    private selectedIds: string[] = [];
    private readonly isMobile: boolean = false;
    private readonly hasScrollbar: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            inputPeers: [],
            page: '1',
            scrollIndex: -1,
            selectedInputPeers: [],
            title: '',
        };

        this.isMobile = IsMobile.isAny();
        this.hasScrollbar = getScrollbarWidth() > 0;

        this.searchRepo = SearchRepo.getInstance();
        if (props.contactOnly) {
            this.searchApi = this.searchRepo.searchUser;
        } else {
            this.searchApi = this.searchRepo.search;
        }
        this.searchDebounce = debounce(this.search, 512);
        this.userId = this.searchRepo.getCurrentUserId();
    }

    public componentDidMount() {
        // Gets all contacts on mount
        this.getDefault();
        if (this.props.selectedIds && this.props.selectedIds !== this.selectedIds) {
            this.selectedIds = this.props.selectedIds;
            this.getSelectedInputPeersFromUserId(this.props.selectedIds).then((selectedInputPeers) => {
                this.setState({
                    selectedInputPeers,
                });
            });
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.selectedIds && this.props.selectedIds !== this.selectedIds) {
            this.selectedIds = newProps.selectedIds;
            this.getSelectedInputPeersFromUserId(newProps.selectedIds).then((selectedInputPeers) => {
                this.setState({
                    selectedInputPeers,
                });
            });
        }
    }

    public render() {
        const {topPeerType, enableTopPeer} = this.props;
        const {selectedInputPeers} = this.state;
        const ids: string[] = [];
        selectedInputPeers.forEach((peer) => {
            if (peer.mode === 'contact' && peer.contact) {
                ids.push(peer.contact.id || '');
            } else if (peer.mode === 'dialog' && peer.dialog) {
                ids.push(peer.dialog.peerid || '');
            }
        });
        return (
            <div className="search-list">
                <div className="search-input-container">
                    <ChipInput
                        placeholder={i18n.t('chat.search')}
                        value={selectedInputPeers}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeItemHandler}
                        variant="outlined"
                        margin="dense"
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start" className="search-adornment">
                                    <SearchRounded/>
                                </InputAdornment>
                        }}
                        // @ts-ignore
                        classes={{}}
                    />
                </div>
                {enableTopPeer && <TopPeer type={topPeerType || TopPeerType.Search} hideIds={ids}
                                           onlyUser={this.props.contactOnly} onSelect={this.topPeerSelectHandler}/>}
                <div className="search-list-container">
                    {this.getWrapper()}
                </div>
            </div>
        );
    }

    private getWrapper() {
        const {inputPeers} = this.state;
        if (inputPeers.length === 0) {
            return (<div className="search-container">{this.noRowsRenderer()}</div>);
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <VariableSizeList
                                ref={this.refHandler}
                                itemSize={this.getHeight}
                                itemCount={inputPeers.length}
                                overscanCount={10}
                                width={width}
                                height={height}
                                className="search-container"
                            >{({index, style}) => {
                                return this.rowRender({index, style, key: index});
                            }}
                            </VariableSizeList>
                        )}
                    </AutoSizer>);
            } else {
                return (<AutoSizer>
                    {({width, height}: any) => (
                        <Scrollbars
                            autoHide={true}
                            style={{
                                height: height + 'px',
                                width: width + 'px',
                            }}
                            onScroll={this.handleScroll}
                            universal={true}
                        >
                            <VariableSizeList
                                ref={this.refHandler}
                                itemSize={this.getHeight}
                                itemCount={inputPeers.length}
                                overscanCount={10}
                                width={width}
                                height={height}
                                className="search-container"
                                style={listStyle}
                            >{({index, style}) => {
                                return this.rowRender({index, style, key: index});
                            }}
                            </VariableSizeList>
                        </Scrollbars>
                    )}
                </AutoSizer>);
            }
        }
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list) {
            this.list.scrollTo(scrollTop);
        }
    }

    /* Chip renderer for select input */
    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        if (!value) {
            return (<span/>);
        }
        if (value.mode === 'contact' && value.contact) {
            return (<Chip key={key} avatar={<UserAvatar id={value.contact.id} noDetail={true}
                                                        savedMessages={this.userId === value.contact.id}/>}
                          tabIndex={-1} label={<UserName id={value.contact.id} noDetail={true} unsafe={true}
                                                         you={this.userId === value.contact.id} noIcon={true}
                                                         youPlaceholder={i18n.t('general.saved_messages')}/>}
                          onDelete={this.removeItemHandler(value)} className="chip"/>);
        } else if (value.mode === 'dialog' && value.dialog) {
            if (value.dialog.peertype === PeerType.PEERUSER || value.dialog.peertype === PeerType.PEERSELF) {
                return (
                    <Chip key={key} avatar={<UserAvatar id={value.dialog.peerid} noDetail={true}
                                                        savedMessages={this.userId === value.dialog.peerid}/>}
                          tabIndex={-1} label={<UserName id={value.dialog.peerid} noDetail={true} unsafe={true}
                                                         you={this.userId === value.dialog.peerid}
                                                         youPlaceholder={i18n.t('general.saved_messages')}
                                                         noIcon={true}/>}
                          onDelete={this.removeItemHandler(value)} className="chip"/>);
            } else if (value.dialog.peertype === PeerType.PEERGROUP) {
                return (<Chip key={key} avatar={<GroupAvatar id={value.dialog.peerid}/>} tabIndex={-1}
                              label={<GroupName id={value.dialog.peerid} className="group-name"/>}
                              onDelete={this.removeItemHandler(value)} className="chip"/>);
            } else {
                return (<span/>);
            }
        } else {
            return (<span/>);
        }
    }

    /* Gets list element */
    private refHandler = (value: any) => {
        this.list = value;
    }

    /* Row renderer for list */
    private rowRender = ({index, key, parent, style}: any): any => {
        const inputPeer = this.state.inputPeers[index];
        if (inputPeer.mode === 'contact' && inputPeer.contact) {
            if (inputPeer.contact.category) {
                return (<div style={style} key={index} className="category-item">{inputPeer.contact.category}</div>);
            } else {
                return (
                    <div style={style} key={index} className="search-item"
                         onClick={this.addItemHandler(inputPeer)}>
                        <UserAvatar className="avatar" id={inputPeer.contact.id || ''}
                                    savedMessages={this.userId === inputPeer.contact.id}/>
                        <span className="name">{`${inputPeer.contact.firstname} ${inputPeer.contact.lastname}`}</span>
                        <span className="phone">{inputPeer.contact.phone ? inputPeer.contact.phone : 'no phone'}</span>
                    </div>
                );
            }
        } else if (inputPeer.mode === 'dialog' && inputPeer.dialog) {
            return (
                <div style={style} key={index} className="search-item"
                     onClick={this.addItemHandler(inputPeer)}>
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERUSER || inputPeer.dialog.peertype === PeerType.PEERSELF) &&
                    <UserAvatar className="avatar" id={inputPeer.dialog.peerid || ''} noDetail={true}
                                savedMessages={this.userId === inputPeer.dialog.peerid}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERUSER || inputPeer.dialog.peertype === PeerType.PEERSELF) &&
                    <UserName className="name" id={inputPeer.dialog.peerid || ''} noDetail={true}
                              you={this.userId === inputPeer.dialog.peerid}
                              youPlaceholder={i18n.t('general.saved_messages')}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupAvatar className="avatar" id={inputPeer.dialog.peerid || ''}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupName className="name" id={inputPeer.dialog.peerid || ''}/>}
                    <span
                        className="phone">{this.getIcon(inputPeer.dialog.preview_icon)}{inputPeer.dialog.preview}</span>
                </div>
            );
        } else if (inputPeer.mode === 'label' && inputPeer.label) {
            if (this.props.contactOnly) {
                return null;
            } else {
                return (<div style={style} key={index} className="category-item">{inputPeer.label}</div>);
            }
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <NotInterestedRounded/>
                {i18n.t('contact.no_result')}
            </div>
        );
    }

    /* Get all contacts */
    private getDefault() {
        this.searchApi({}).then((res: IDialogWithContact) => {
            this.defaultInputPeer = res;
            this.inputPeerRes = clone(res);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                inputPeers: this.getTrimmedList([]),
            });
        });
    }

    /* Searches the given string */
    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.inputPeerRes = clone(this.defaultInputPeer);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                inputPeers: this.getTrimmedList(this.state.selectedInputPeers),
            });
        }
    }

    /* For debouncing the query in order to have best performance */
    private search = (text: string) => {
        this.searchApi({keyword: text, limit: 12}).then((res: IDialogWithContact) => {
            this.inputPeerRes = clone(res || []);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                inputPeers: this.getTrimmedList(this.state.selectedInputPeers),
            });
        });
    }

    /* Add item to selectedInputPeers */
    private addItemHandler = (inputPeer: ISearchItem) => (e?: any) => {
        const {selectedInputPeers} = this.state;
        if (!selectedInputPeers || !inputPeer) {
            return;
        }
        let id = '';
        if (inputPeer.id) {
            id = inputPeer.id || '';
        } else {
            return;
        }
        if (findIndex(selectedInputPeers, {id}) === -1) {
            selectedInputPeers.push(inputPeer);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                inputPeers: this.getTrimmedList(selectedInputPeers),
                selectedInputPeers,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Remove item from selectedInputPeers */
    private removeItemHandler = (inputPeer: ISearchItem) => (e: any) => {
        const {selectedInputPeers} = this.state;
        if (!selectedInputPeers || !inputPeer) {
            return;
        }
        let id = '';
        if (inputPeer.id) {
            id = inputPeer.id || '';
        } else {
            return;
        }
        const index = findIndex(selectedInputPeers, {id});
        if (index > -1) {
            selectedInputPeers.splice(index, 1);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                inputPeers: this.getTrimmedList(selectedInputPeers),
                selectedInputPeers,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Removes the selected items from the list */
    private getTrimmedList(selectedInputPeers: ISearchItem[]) {
        const items: ISearchItem[] = [];
        if (this.inputPeerRes.dialogs.length > 0) {
            items.push({
                label: i18n.t('general.chats'),
                mode: 'label',
            });
        }
        differenceWith(this.inputPeerRes.dialogs, selectedInputPeers, (i1, i2) => {
            return i1.peerid === i2.id;
        }).sort((i1, i2) => {
            if (!i1.topmessageid || !i2.topmessageid) {
                return 0;
            }
            return i2.topmessageid - i1.topmessageid;
        });
        this.inputPeerRes.dialogs.forEach((item) => {
            items.push({
                dialog: item,
                id: item.peerid,
                mode: 'dialog',
            });
        });
        if (this.inputPeerRes.contacts.length > 0) {
            items.push({
                label: i18n.t('general.contacts'),
                mode: 'label',
            });
        }
        categorizeContact(differenceBy(this.inputPeerRes.contacts, selectedInputPeers, 'id')).forEach((item) => {
            items.push({
                contact: item,
                id: item.id,
                mode: 'contact',
            });
        });
        return differenceBy(items, selectedInputPeers, 'id');
    }

    /* Dispatch any changes on edit */
    private dispatchContactChange() {
        const {selectedInputPeers} = this.state;
        if (this.props.onChange) {
            const items: IInputPeer[] = [];
            selectedInputPeers.forEach((item) => {
                if (item.mode === 'contact' && item.contact) {
                    items.push({
                        accesshash: item.contact.accesshash || '',
                        id: item.contact.id || '',
                        type: PeerType.PEERUSER,
                    });
                } else if (item.mode === 'dialog' && item.dialog) {
                    items.push({
                        accesshash: item.dialog.accesshash || '',
                        id: item.dialog.peerid || '',
                        type: item.dialog.peertype || PeerType.PEERUSER,
                    });
                }
            });
            this.props.onChange(items);
        }
    }

    /* Get dynamic height */
    private getHeight = (index: number): number => {
        const inputPeer = this.state.inputPeers[index];
        if (inputPeer.mode === 'dialog') {
            return 64;
        } else if (inputPeer.mode === 'contact' && inputPeer.contact) {
            if (inputPeer.contact.category) {
                return 40;
            } else {
                return 64;
            }
        } else if (inputPeer.mode === 'label') {
            return 37;
        } else {
            if (this.props.contactOnly) {
                return 0;
            }
            return 64;
        }
    }

    /* Get dialog icon */
    private getIcon(icon?: number) {
        switch (icon) {
            case C_MESSAGE_ICON.Location:
                return (<LocationOnOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.File:
                return (<InsertDriveFileOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Video:
                return (<VideocamOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Contact:
                return (<PeopleOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Voice:
                return (<RecordVoiceOverOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Photo:
                return (<PhotoOutlined className="preview-icon"/>);
            default:
                return null;
        }
    }

    private getSelectedInputPeersFromUserId(ids: string[]) {
        if (ids.length === 0) {
            return Promise.resolve([]);
        }
        return this.searchRepo.searchUsersById(ids).then((res) => {
            return res.map((item): ISearchItem => {
                return {
                    contact: item,
                    id: item.id,
                    mode: 'contact',
                };
            });
        });
    }

    private topPeerSelectHandler = (type: PeerType, item: IUser | IGroup) => {
        if (type === PeerType.PEERUSER) {
            this.addItemHandler({
                contact: item as IUser,
                id: item.id,
                mode: 'contact',
            })();
        } else if (type === PeerType.PEERGROUP) {
            this.addItemHandler({
                dialog: {
                    accesshash: '0',
                    peerid: item.id,
                    peertype: PeerType.PEERGROUP,
                },
                id: item.id,
                mode: 'dialog',
            })();
        }
    }
}

export default SearchList;
