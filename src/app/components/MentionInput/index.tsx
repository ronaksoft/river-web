/*
    Creation Time: 2020 - May - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {GroupParticipant, InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
// @ts-ignore
import {Mention, MentionsInput} from 'react-mentions';
import {orderBy, uniqBy} from "lodash";
import GroupRepo from "../../repository/group";
import UserRepo from "../../repository/user";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import {emojiList} from "../ChatInput/emojis";
import {IUser} from "../../repository/user/interface";
import {currentUserId} from "../../services/sdk";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import i18n from '../../services/i18n';

import './style.scss';

export interface IMention {
    display: string;
    id: string;
    index: number;
    plainTextIndex: number;
    type?: string;
}

interface IProps {
    className?: string;
    inputRef: (ref: any) => void;
    suggestionsPortalHost: any;
    onChange: (value: any, a: any, b: any, mentions: IMention[]) => void;
    onKeyUp?: (e: any) => void;
    onKeyDown?: (e: any) => void;
    onFocus?: (e: any) => void;
    placeholder: string;
    style?: any;
    value: string;
    peer: InputPeer | null;
    isBot: boolean;
    teamId: string;
}

interface IState {
    value: string;
}

const emojiLimit = 32;
const emojiKey = C_LOCALSTORAGE.EmojiMartFrequency;

const emojiMap: { [key: string]: number } = {};
emojiList.forEach((emoji, index) => {
    emojiMap[emoji.n] = index;
});

// @[@yasaman](580637822969180) hi
export const mentionize = (text: string, sortedEntities: Array<{ offset: number, length: number, val: string }>) => {
    sortedEntities.sort((i1, i2) => {
        if (i1.offset === undefined || i2.offset === undefined) {
            return 0;
        }
        return i2.offset - i1.offset;
    });
    const fn = (t1: string, t2: string, s: number, e: number) => {
        return t1.substr(0, s) + t2 + t1.substr(s + e, t1.length);
    };
    sortedEntities.forEach((en) => {
        text = fn(text, `@[${text.substr(en.offset, en.length)}](${en.val})`, en.offset, en.length);
    });
    return text;
};

class MentionInput extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            value: props.value,
        };
    }

    private userRepo: UserRepo;
    private groupRepo: GroupRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
    }

    public render() {
        const {value} = this.state;
        return (
            <MentionsInput value={value}
                           onChange={this.props.onChange}
                           inputRef={this.props.inputRef}
                           onKeyUp={this.props.onKeyUp}
                           onKeyDown={this.props.onKeyDown}
                           allowSpaceInQuery={true}
                           className={this.props.className || ''}
                           placeholder={this.props.placeholder}
                           style={this.props.style}
                           suggestionsPortalHost={this.props.suggestionsPortalHost}
                           spellCheck={true}
                           onFocus={this.props.onFocus}
            >
                <Mention
                    trigger="@"
                    type="mention"
                    data={this.searchMentionHandler}
                    renderSuggestion={this.renderMentionSuggestion}
                    className="mention-item"
                />
                <Mention
                    trigger=":"
                    type="emoji"
                    data={this.searchEmojiHandler}
                    renderSuggestion={this.renderEmojiSuggestion}
                    style={{border: 'none'}}
                    onAdd={this.emojiAddHandler}
                />
                <Mention
                    trigger="/"
                    type="emoji"
                    data={this.searchBotCommandHandler}
                    renderSuggestion={this.renderBotCommandSuggestion}
                    style={{border: 'none'}}
                />
            </MentionsInput>
        );
    }

    /* Search mention in group */
    private searchMentionHandler = (keyword: string, callback: any) => {
        const {peer} = this.props;
        if (!peer) {
            callback([]);
            return;
        }
        if (peer.getType() !== PeerType.PEERGROUP) {
            callback([]);
            return;
        }
        // Search engine
        const searchParticipant = (word: string, participants: Partial<GroupParticipant.AsObject>[]) => {
            participants.unshift({
                accesshash: '',
                firstname: 'all',
                lastname: '',
                userid: 'all',
                username: 'all',
            });
            const users: any[] = [];
            const reg = new RegExp(word.replace('\\', ''), "i");
            let exactMatchIndex: number = -1;
            for (const [i, participant] of participants.entries()) {
                if (currentUserId !== participant.userid &&
                    (reg.test(`${participant.firstname} ${participant.lastname}`) ||
                        (participant.username && reg.test(participant.username)))) {
                    users.push({
                        display: participant.username ? `@${participant.username} ` : `${participant.firstname} ${participant.lastname} `,
                        id: participant.userid,
                        index: i,
                        username: participant.username,
                    });
                    if (word === participant.username) {
                        exactMatchIndex = users.length - 1;
                    }
                }
                if (users.length >= 32) {
                    break;
                }
            }
            if (users.length > 1 && exactMatchIndex > 0) {
                const hold = users[exactMatchIndex];
                users[exactMatchIndex] = users[0];
                users[0] = hold;
            }
            callback(uniqBy(users, 'id'));
        };
        this.groupRepo.getFull(this.props.teamId, peer.getId() || '', undefined, true).then((group) => {
            if (group && group.participantList && group.participantList.length > 0) {
                searchParticipant(keyword, group.participantList);
            } else {
                this.groupRepo.getFull(this.props.teamId, peer.getId() || '').then((remoteGroup) => {
                    if (remoteGroup && remoteGroup.participantList && remoteGroup.participantList.length > 0) {
                        searchParticipant(keyword, remoteGroup.participantList);
                    } else {
                        callback([]);
                    }
                });
            }
        });
    }

    /* Mention suggestion renderer */
    private renderMentionSuggestion = (a: any, b: any, c: any, d: any, focused: any) => {
        return (<div className={'inner ' + (focused ? 'focused' : '')}>
            <div className="avatar">
                <UserAvatar id={a.id} noDetail={true}/>
            </div>
            <div className="info">
                {a.id === 'all' ? <span className="name">{i18n.t('general.all')}</span> :
                    <UserName id={a.id} className="name" unsafe={true} noDetail={true} noIcon={true}/>}
                {Boolean(a.username) && <span className="username">{a.username}</span>}
            </div>
        </div>);
    }

    /* Search emoji */
    private searchEmojiHandler = (keyword: string, callback: any) => {
        const emojis: any[] = [];
        keyword = keyword.toLowerCase();
        if (keyword && keyword !== '') {
            for (let i = 0; i < emojiList.length && emojis.length < emojiLimit; i++) {
                if (emojiList[i] && emojiList[i].n.indexOf(keyword) > -1) {
                    emojis.push({
                        display: emojiList[i].d,
                        id: `:${emojiList[i].n}`,
                        index: i,
                    });
                }
            }
        } else {
            const freq = localStorage.getItem(emojiKey);
            const freqCheckList: string[] = [];
            if (freq) {
                const freqData = JSON.parse(freq);
                let freqList: Array<{ cnt: number, val: string }> = [];
                Object.keys(freqData).forEach((key) => {
                    freqList.push({
                        cnt: freqData[key],
                        val: key,
                    });
                });
                freqList = orderBy(freqList, 'cnt', 'desc').reverse();
                for (let i = 0; i < freqList.length && emojis.length < emojiLimit; i++) {
                    const emoji = emojiMap[freqList[i].val];
                    if (emoji) {
                        emojis.push({
                            display: emojiList[emoji].d,
                            id: `:${emojiList[emoji].n}`,
                            index: i,
                        });
                        freqCheckList.push(emojiList[emoji].n);
                    }
                }
            }
            for (let i = 0; i < emojiLimit && emojis.length < emojiLimit; i++) {
                if (freqCheckList.indexOf(emojiList[i].n) === -1) {
                    emojis.push({
                        display: emojiList[i].d,
                        id: `:${emojiList[i].n}`,
                        index: i,
                    });
                }
            }
        }
        callback(emojis);
    }

    /* Emoji suggestion renderer */
    private renderEmojiSuggestion = (a: any, b: any, c: any, d: any, focused: any) => {
        return (<div className={'inner ' + (focused ? 'focused' : '')}>
            <div className="emoji-display">{a.display}</div>
            <div className="info">
                <div className="name">{a.id}</div>
            </div>
        </div>);
    }

    /* Inline emoji add handler */
    private emojiAddHandler = (d: string) => {
        d = d.substr(1);
        const freq = localStorage.getItem(emojiKey);
        if (freq) {
            const freqData = JSON.parse(freq);
            if (freqData.hasOwnProperty(d)) {
                freqData[d]++;
            } else {
                freqData[d] = 1;
            }
            localStorage.setItem(emojiKey, JSON.stringify(freqData));
        } else {
            const item: any = {};
            item[d] = 1;
            localStorage.setItem(emojiKey, JSON.stringify(item));
        }
    }

    /* Search bot command */
    private searchBotCommandHandler = (keyword: string, callback: any) => {
        const {isBot, peer} = this.props;
        if (!isBot || !peer) {
            callback([]);
            return;
        }
        const fn = (u: IUser) => {
            if (u && u.botinfo && u.botinfo.botcommandsList.length > 0) {
                const reg = new RegExp(keyword, "i");
                callback(u.botinfo.botcommandsList.filter(o => {
                    return reg.test(o.command || '');
                }).map((c, i) => {
                    const command = (c.command || '').indexOf('/') === 0 ? (c.command || '') : `/${(c.command || '')}`;
                    return {
                        desc: c.description,
                        display: command,
                        id: command,
                        index: i,
                        listDisplay: command.substr(1)
                    };
                }));
            } else {
                callback([]);
            }
        };
        this.userRepo.getFull(peer.getId() || '', undefined, undefined, true).then((res) => {
            fn(res);
        });
        return;
    }

    /* Bot command suggestion renderer */
    private renderBotCommandSuggestion = (a: any, b: any, c: any, d: any, focused: any) => {
        return (<div className={'inner ' + (focused ? 'focused' : '')}>
            <div className="bot-command-display">
                <div className="command-container">
                    <span className="command">/</span><span className="command-name">{a.listDisplay}</span>
                </div>
            </div>
            <div className="info">
                <div className="name">{a.desc}</div>
            </div>
        </div>);
    }
}

export default MentionInput;
