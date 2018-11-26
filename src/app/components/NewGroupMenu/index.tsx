import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {IContact} from '../../repository/contact/interface';
import ContactRepo from '../../repository/contact';
import {debounce, findIndex, differenceBy, clone, trimStart} from 'lodash';
import UserAvatar, {TextAvatar} from '../UserAvatar';
import {KeyboardBackspaceRounded, ArrowForwardRounded, CheckRounded} from '@material-ui/icons';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import TextField from '@material-ui/core/TextField';

import './style.css';

interface IProps {
    id?: number;
    onClose?: () => void;
    onCreate?: (contacts: IContact[], title: string) => void;
}

interface IState {
    id?: number;
    contacts: IContact[];
    page: string;
    selectedContacts: IContact[];
    scrollIndex: number;
    title: string;
}

class NewGroupMenu extends React.Component<IProps, IState> {
    private contactsRes: IContact[] = [];
    // @ts-ignore
    private list: any;
    private contactRepo: ContactRepo;
    private searchDebounce: any;
    private defaultContact: IContact[];

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            page: '1',
            scrollIndex: -1,
            selectedContacts: [],
            title: '',
        };

        this.contactRepo = ContactRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        this.contactRepo.getAll().then((res) => {
            this.defaultContact = res;
            this.contactsRes = clone(res);
            this.setState({
                contacts: res,
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            id: newProps.id || 0,
        });
    }

    public render() {
        const {contacts, page, scrollIndex, selectedContacts, title} = this.state;
        return (
            <div className="new-group-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <KeyboardBackspaceRounded onClick={this.props.onClose}/> Create a New Group
                        </div>
                        <div className="input-container">
                            <ChipInput
                                label="Search contacts"
                                value={selectedContacts}
                                chipRenderer={this.chipRenderer}
                                fullWidth={true}
                                onUpdateInput={this.searchChangeHandler}
                                onDelete={this.removeMemberHandler}
                            />
                        </div>
                        <div className="contact-box">
                            <AutoSizer>
                                {({width, height}: any) => (
                                    <List
                                        ref={this.refHandler}
                                        rowHeight={64}
                                        rowRenderer={this.rowRender}
                                        rowCount={contacts.length}
                                        overscanRowCount={0}
                                        scrollToIndex={scrollIndex}
                                        width={width - 2}
                                        height={height}
                                        className="contact-container"
                                    />
                                )}
                            </AutoSizer>
                        </div>
                        {Boolean(selectedContacts.length > 0) && <div className="actions-bar">
                            <div className="add-action" onClick={this.onNextHandler}>
                                <ArrowForwardRounded/>
                            </div>
                        </div>}
                    </div>
                    <div className="page page-2">
                        <div className="menu-header">
                            <KeyboardBackspaceRounded onClick={this.onPrevHandler}/> Group setting
                        </div>
                        <div className="input-container">
                            <TextField
                                label="Group title"
                                fullWidth={true}
                                value={title}
                                inputProps={{
                                    maxLength: 32,
                                }}
                                onChange={this.onTitleChangeHandler}
                            />
                        </div>
                        {Boolean(title.length > 0) && <div className="actions-bar no-bg">
                            <div className="add-action" onClick={this.onCreateHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        return (<Chip key={key} avatar={<UserAvatar id={value.id}/>} tabIndex={-1} label={<UserName id={value.id}/>}
                      onDelete={this.removeMemberHandler.bind(this, value)} style={{margin: '0 3px 3px 0'}}/>);
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const contact = this.state.contacts[index];
        return (
            <div style={style} key={index} className="contact-item" onClick={this.addMemberHandler.bind(this, contact)}>
                <span className="avatar">
                    {contact.avatar ? <img src={contact.avatar}/> : TextAvatar(contact.firstname, contact.lastname)}
                </span>
                <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
            </div>
        );
    }

    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.contactsRes = clone(this.defaultContact);
            this.setState({
                contacts: this.getTrimmedList(this.state.selectedContacts),
            });
        }
    }

    private search = (text: string) => {
        this.contactRepo.getManyCache({keyword: text, limit: 12}).then((res) => {
            this.contactsRes = clone(res || []);
            this.setState({
                contacts: this.getTrimmedList(this.state.selectedContacts),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    private addMemberHandler = (contact: IContact) => {
        const {selectedContacts} = this.state;
        if (findIndex(selectedContacts, {id: contact.id || ''}) === -1) {
            selectedContacts.push(contact);
            this.setState({
                contacts: this.getTrimmedList(selectedContacts),
                selectedContacts,
            });
        }
    }

    private removeMemberHandler = (contact: IContact) => {
        const {selectedContacts} = this.state;
        if (!selectedContacts) {
            return;
        }
        const index = findIndex(selectedContacts, {id: contact.id || ''});
        if (index > -1) {
            selectedContacts.splice(index, 1);
            this.setState({
                contacts: this.getTrimmedList(selectedContacts),
                selectedContacts,
            });
        }
    }

    private getTrimmedList(selectedContacts: IContact[]) {
        return differenceBy(this.contactsRes, selectedContacts, 'id');
    }

    private onNextHandler = () => {
        const {selectedContacts} = this.state;
        if (!selectedContacts) {
            return;
        }
        this.setState({
            page: '2',
        });
        // if (this.props.onClose) {
        //     this.props.onClose();
        // }
        // if (this.props.onCreate) {
        //     this.props.onCreate(selectedContacts);
        // }
    }

    private onPrevHandler = () => {
        this.setState({
            page: '1',
        });
    }

    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: trimStart(e.currentTarget.value),
        });
    }

    private onCreateHandler = () => {
        const {selectedContacts, title} = this.state;
        if (!selectedContacts) {
            return;
        }
        if (this.props.onClose) {
            this.props.onClose();
        }
        if (this.props.onCreate) {
            this.props.onCreate(selectedContacts, title);
        }
    }
}

export default NewGroupMenu;
