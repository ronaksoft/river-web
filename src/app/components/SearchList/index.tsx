/*
    Creation Time: 2018 - Dec - 23
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {AutoSizer, Index, List} from 'react-virtualized';
import {IContact} from '../../repository/contact/interface';
import {clone, debounce, differenceBy, differenceWith, findIndex} from 'lodash';
import UserAvatar, {TextAvatar} from '../UserAvatar';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import {NotInterestedRounded} from '@material-ui/icons';
import {IDialog} from '../../repository/dialog/interface';
import SearchRepo from '../../repository/search';
import {IDialogWithContact} from '../../repository/search/interface';
import {PeerType} from '../../services/sdk/messages/core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {categorizeContact} from '../ContactList';

import './style.css';
import Scrollbars from 'react-custom-scrollbars';

interface ISeachItem {
    contact?: IContact;
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
}

interface IState {
    inputPeers: ISeachItem[];
    page: string;
    scrollIndex: number;
    selectedInputPeers: ISeachItem[];
    title: string;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

class SearchList extends React.Component<IProps, IState> {
    private inputPeerRes: IDialogWithContact = {dialogs: [], contacts: []};
    private list: List;
    private searchRepo: SearchRepo;
    private defaultInputPeer: IDialogWithContact;
    private readonly searchDebounce: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            inputPeers: [],
            page: '1',
            scrollIndex: -1,
            selectedInputPeers: [],
            title: '',
        };

        this.searchRepo = SearchRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        // Gets all contacts on mount
        this.getDefault();
    }

    public render() {
        const {inputPeers, scrollIndex, selectedInputPeers} = this.state;
        return (
            <div className="search-list">
                <div className="search-input-container">
                    <ChipInput
                        label="Search"
                        value={selectedInputPeers}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeItemHandler}
                        // @ts-ignore
                        classes={{}}
                    />
                </div>
                <div className="search-list-container">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <Scrollbars
                                autoHide={true}
                                style={{
                                    height: height + 'px',
                                    width: width + 'px',
                                }}
                                onScroll={this.handleScroll}
                            >
                                <List
                                    ref={this.refHandler}
                                    rowHeight={this.getHeight}
                                    rowRenderer={this.rowRender}
                                    rowCount={inputPeers.length}
                                    overscanRowCount={0}
                                    scrollToIndex={scrollIndex}
                                    width={width}
                                    height={height}
                                    className="search-container"
                                    noRowsRenderer={this.noRowsRenderer}
                                    style={listStyle}
                                />
                            </Scrollbars>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list.Grid) {
            this.list.Grid.handleScrollEvent({scrollTop});
        }
    }

    /* Chip renderer for select input */
    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        if (!value) {
            return (<span/>);
        }
        if (value.mode === 'contact' && value.contact) {
            return (<Chip key={key} avatar={<UserAvatar id={value.contact.id} noDetail={true}/>} tabIndex={-1}
                          label={<UserName id={value.contact.id} noDetail={true} unsafe={true}/>}
                          onDelete={this.removeItemHandler.bind(this, value)} className="chip"/>);
        } else if (value.mode === 'dialog' && value.dialog) {
            if (value.dialog.peertype === PeerType.PEERUSER || value.dialog.peertype === PeerType.PEERSELF) {
                return (<Chip key={key} avatar={<UserAvatar id={value.dialog.peerid} noDetail={true}/>} tabIndex={-1}
                              label={<UserName id={value.dialog.peerid} noDetail={true} unsafe={true}/>}
                              onDelete={this.removeItemHandler.bind(this, value)} className="chip"/>);
            } else if (value.dialog.peertype === PeerType.PEERGROUP) {
                return (<Chip key={key} avatar={<GroupAvatar id={value.dialog.peerid}/>} tabIndex={-1}
                              label={<GroupName id={value.dialog.peerid} className="group-name"/>}
                              onDelete={this.removeItemHandler.bind(this, value)} className="chip"/>);
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
                         onClick={this.addItemHandler.bind(this, inputPeer)}>
                        <span className="avatar">
                            {inputPeer.contact.avatar ?
                                <img
                                    src={inputPeer.contact.avatar}/> : TextAvatar(inputPeer.contact.firstname, inputPeer.contact.lastname)}
                        </span>
                        <span className="name">{`${inputPeer.contact.firstname} ${inputPeer.contact.lastname}`}</span>
                        <span className="phone">{inputPeer.contact.phone ? inputPeer.contact.phone : 'no phone'}</span>
                    </div>
                );
            }
        } else if (inputPeer.mode === 'dialog' && inputPeer.dialog) {
            return (
                <div style={style} key={index} className="search-item"
                     onClick={this.addItemHandler.bind(this, inputPeer)}>
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERUSER || inputPeer.dialog.peertype === PeerType.PEERSELF) &&
                    <UserAvatar className="avatar" id={inputPeer.dialog.target_id || ''} noDetail={true}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERUSER || inputPeer.dialog.peertype === PeerType.PEERSELF) &&
                    <UserName className="name" id={inputPeer.dialog.target_id || ''} noDetail={true}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupAvatar className="avatar" id={inputPeer.dialog.target_id || ''}/>}
                    {Boolean(inputPeer.dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupName className="name" id={inputPeer.dialog.target_id || ''}/>}
                    <span className="phone">{inputPeer.dialog.preview}</span>
                </div>
            );
        } else if (inputPeer.mode === 'label' && inputPeer.label) {
            return (<div style={style} key={index} className="category-item">{inputPeer.label}</div>);
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <NotInterestedRounded/>
                no result!
            </div>
        );
    }

    /* Get all contacts */
    private getDefault() {
        this.searchRepo.search({}).then((res) => {
            this.defaultInputPeer = res;
            this.inputPeerRes = clone(res);
            this.setState({
                inputPeers: this.getTrimmedList([]),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
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
            this.setState({
                inputPeers: this.getTrimmedList(this.state.selectedInputPeers),
            });
        }
    }

    /* For debouncing the query in order to have best performance */
    private search = (text: string) => {
        this.searchRepo.search({keyword: text, limit: 12}).then((res) => {
            this.inputPeerRes = clone(res || []);
            this.setState({
                inputPeers: this.getTrimmedList(this.state.selectedInputPeers),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    /* Add item to selectedInputPeers */
    private addItemHandler = (inputPeer: ISeachItem) => {
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
            this.setState({
                inputPeers: this.getTrimmedList(selectedInputPeers),
                selectedInputPeers,
            }, () => {
                this.dispatchContactChange();
                this.list.recomputeRowHeights();
            });
        }
    }

    /* Remove item from selectedInputPeers */
    private removeItemHandler = (inputPeer: ISeachItem) => {
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
            this.setState({
                inputPeers: this.getTrimmedList(selectedInputPeers),
                selectedInputPeers,
            }, () => {
                this.dispatchContactChange();
                this.list.recomputeRowHeights();
            });
        }
    }

    /* Removes the selected items from the list */
    private getTrimmedList(selectedInputPeers: ISeachItem[]) {
        const items: ISeachItem[] = [];
        if (this.inputPeerRes.dialogs.length > 0) {
            items.push({
                label: 'Chats',
                mode: 'label',
            });
        }
        differenceWith(this.inputPeerRes.dialogs, selectedInputPeers, (i1, i2) => {
            return i1.peerid === i2.id;
        }).sort((i1, i2) => {
            if (!i1.last_update || !i2.last_update) {
                return 0;
            }
            return i2.last_update - i1.last_update;
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
                label: 'Contacts',
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
    private getHeight = (param: Index): number => {
        const inputPeer = this.state.inputPeers[param.index];
        if (inputPeer.mode === 'dialog') {
            return 64;
        } else if (inputPeer.mode === 'contact' && inputPeer.contact) {
            if (inputPeer.contact.category) {
                return 40;
            } else {
                return 64;
            }
        } else {
            return 40;
        }
    }
}

export default SearchList;
