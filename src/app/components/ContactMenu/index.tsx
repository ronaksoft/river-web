import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {IContact} from '../../repository/contact/interface';
import ContactRepo from '../../repository/contact';
import {debounce} from 'lodash';

import './style.css';
import {Link} from 'react-router-dom';

interface IProps {
    id?: number;
}

interface IState {
    id?: number;
    contacts: IContact[];
    selectedId: string;
    scrollIndex: number;
}

class ContactMenu extends React.Component<IProps, IState> {
    // @ts-ignore
    private list: any;
    private contactRepo: ContactRepo;
    private searchDebounce: any;
    private defaultContact: IContact[];

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            scrollIndex: -1,
            selectedId: '-1',
        };

        this.contactRepo = ContactRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        this.contactRepo.getAll().then((res) => {
            this.defaultContact = res;
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
        const {contacts, scrollIndex} = this.state;
        return (
            <div className="contacts">
                <div className="search-container">
                    <input placeholder="search..." onChange={this.searchChangeHandler}/>
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
            </div>
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const contact = this.state.contacts[index];
        return (
            <div style={style} key={index} className="contact-item">
                <Link to={`/conversation/${contact.id}`}>
                    <span className="avatar">
                        {contact.avatar && <img src={contact.avatar}/>}
                    </span>
                    <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                    <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
                </Link>
            </div>
        );
    }

    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.setState({
                contacts: this.defaultContact,
            });
        }
    }

    private search = (text: string) => {
        this.contactRepo.getManyCache({keyword: text, limit: 12}).then((res) => {
            this.setState({
                contacts: res,
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }
}

export default ContactMenu;