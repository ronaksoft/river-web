/*
    Creation Time: 2018 - Aug - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {Picker} from 'emoji-mart';
import PopUpMenu from '../PopUpMenu';
import {cloneDeep, throttle} from 'lodash';
import {
    AttachFileRounded,
    ClearRounded,
    DeleteRounded,
    ForwardRounded,
    KeyboardVoiceRounded,
    LockRounded,
    SendRounded,
    SentimentSatisfiedRounded,
    StopRounded,
} from '@material-ui/icons';
import {IconButton} from '@material-ui/core';
import UserAvatar from '../UserAvatar';
import RTLDetector from '../../services/utilities/rtl_detector';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import {C_MSG_MODE} from './consts';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import * as core_types_pb from '../../services/sdk/messages/core.types_pb';
import {
    GroupFlags,
    GroupParticipant,
    InputPeer,
    MessageEntityType,
    PeerType,
    TypingAction
} from '../../services/sdk/messages/core.types_pb';
import GroupRepo from '../../repository/group';
// @ts-ignore
import {Mention, MentionsInput} from 'react-mentions';
import ContactRepo from '../../repository/contact';
import SDK from '../../services/sdk';
import {IContact} from '../../repository/contact/interface';
import {IGroup} from '../../repository/group/interface';
import DialogRepo from '../../repository/dialog';
import {IDraft} from '../../repository/dialog/interface';
// @ts-ignore
import Recorder from 'opus-recorder/dist/recorder.min';
import VoicePlayer from '../VoicePlayer';
import {to4bitResolution} from './utils';
import {measureNodeHeight} from './measureHeight';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';

interface IProps {
    onAction: (cmd: string) => void;
    onBulkAction: (cmd: string) => void;
    onMessage: (text: string, {mode, message, entities}?: any) => void;
    onPreviewMessageChange?: (previewMessage: IMessage | undefined, previewMessageMode: number) => void;
    onTyping?: (typing: TypingAction) => void;
    peer: InputPeer | null;
    previewMessage?: IMessage;
    previewMessageMode?: number;
    ref?: (ref: any) => void;
    selectable: boolean;
    selectableDisable: boolean;
    text?: string;
    userId?: string;
    onVoice: (voice: Blob, waveform: number[], duration: number, {mode, message}?: any) => void;
    onFileSelected: (file: File) => void;
}

interface IState {
    disableAuthority: number;
    emojiAnchorEl: any;
    peer: InputPeer | null;
    previewMessage: IMessage | null;
    previewMessageHeight: number;
    previewMessageMode: number;
    rtl: boolean;
    selectable: boolean;
    selectableDisable: boolean;
    textareaValue: string;
    userId: string;
    voiceMode: 'lock' | 'down' | 'up' | 'play';
}

interface IMentions {
    display: string;
    id: string;
    index: number;
    plainTextIndex: number;
    type?: string;
}

const defaultMentionInputStyle = {
    input: {
        border: 'none',
        height: '20px',
        maxHeight: '100px',
        minHeight: '20px',
        outline: 'none',
        overflow: 'auto',
        position: 'relative',
    },
};

class TextInput extends React.Component<IProps, IState> {
    private mentionContainer: any = null;
    private textarea: any = null;
    private typingThrottle: any = null;
    private typingTimeout: any = null;
    private rtlDetector: RTLDetector;
    private rtlDetectorThrottle: any = null;
    private groupRepo: GroupRepo;
    private contactRepo: ContactRepo;
    private dialogRepo: DialogRepo;
    private lastLines: number = 1;
    private sdk: SDK;
    private mentions: IMentions[] = [];
    private lastMentionsCount: number = 0;
    private inputsRef: any = null;
    private waveRef: any = null;
    private canvasRef: any = null;
    private canvasCtx: CanvasRenderingContext2D | null = null;
    private inputsMode: 'voice' | 'text' | 'attachment' | 'default' = 'default';
    private recorder: Recorder;
    private timerRef: any = null;
    private timerInterval: any = null;
    private timerDuration: number = 0;
    private voiceMouseIn: boolean = false;
    private bars: number[] = [];
    private maxBarVal: number = 0;
    private canvasConfig: { height: number, width: number, barWidth: number, barSpace: number, totalWith: number, ratio: number, maxBars: number, color: string } = {
        barSpace: 1,
        barWidth: 2,
        color: '#1A1A1A',
        height: 0,
        maxBars: 200,
        ratio: 1,
        totalWith: 4,
        width: 0,
    };
    private voice: Blob;
    private voicePlayerRef: VoicePlayer;
    private voiceCanceled: boolean = false;
    private fileInputRef: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            disableAuthority: 0x0,
            emojiAnchorEl: null,
            peer: props.peer,
            previewMessage: props.previewMessage || null,
            previewMessageHeight: 0,
            previewMessageMode: props.previewMessageMode || C_MSG_MODE.Normal,
            rtl: false,
            selectable: props.selectable,
            selectableDisable: props.selectableDisable,
            textareaValue: '',
            userId: props.userId || '',
            voiceMode: 'up',
        };

        if (this.props.ref) {
            this.props.ref(this);
        }

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 1000);

        this.groupRepo = GroupRepo.getInstance();
        this.contactRepo = ContactRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.sdk = SDK.getInstance();

        this.checkAuthority();

        // @ts-ignore
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    public componentDidMount() {
        window.addEventListener('Group_DB_Updated', this.checkAuthority);
        window.addEventListener('mouseup', this.windowMouseUp);
        window.addEventListener('resize', this.windowResizeHandler);
        window.addEventListener('Theme_Changed', this.windowResizeHandler);
        this.initDraft(null, this.state.peer, 0, null);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.previewMessageMode === C_MSG_MODE.Edit && newProps.previewMessage) {
            // this.textarea.value = newProps.previewMessage.body;
            this.setState({
                textareaValue: newProps.previewMessage.body || '',
            }, () => {
                if (this.textarea) {
                    this.detectRTL(this.textarea.value);
                }
                this.computeLines();
            });
        } else {
            this.initDraft(this.state.peer, newProps.peer, this.state.previewMessageMode, this.state.previewMessage);
        }
        this.setState({
            previewMessage: newProps.previewMessage || null,
            previewMessageMode: newProps.previewMessageMode || C_MSG_MODE.Normal,
            selectable: newProps.selectable,
            selectableDisable: newProps.selectableDisable,
            userId: newProps.userId || '',
        }, () => {
            this.animatePreviewMessage();
            this.focus('.mention textarea');
        });
        if (this.state.peer !== newProps.peer) {
            this.setState({
                peer: newProps.peer,
            }, () => {
                this.checkAuthority();
            });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('Group_DB_Updated', this.checkAuthority);
        window.removeEventListener('mouseup', this.windowMouseUp);
        window.removeEventListener('resize', this.windowResizeHandler);
        window.removeEventListener('Theme_Changed', this.windowResizeHandler);
    }

    public render() {
        const {previewMessage, previewMessageMode, previewMessageHeight, selectable, selectableDisable, disableAuthority, textareaValue, voiceMode} = this.state;

        if (!selectable && disableAuthority !== 0x0) {
            if (disableAuthority === 0x1) {
                return (<div className="input-placeholder">
                    You are no longer in this group
                    <span className="btn"
                          onClick={this.props.onAction.bind(this, 'remove_dialog')}>Delete and Exit</span>
                </div>);
            } else if (disableAuthority === 0x2) {
                return (<div className="input-placeholder">Group is deactivated</div>);
            } else {
                return '';
            }
        } else {
            return (
                <div className="write">
                    <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                           onChange={this.fileChangeHandler}/>
                    {(!selectable && previewMessage) &&
                    <div className="previews" style={{height: previewMessageHeight + 'px'}}>
                        <div className="preview-container">
                            <div
                                className={'preview-message-wrapper ' + this.getPreviewCN(previewMessageMode, previewMessage.senderid || '')}>
                                <span className="preview-bar"/>
                                {Boolean(previewMessageMode === C_MSG_MODE.Reply) && <div className="preview-message">
                                    <UserName className="preview-message-user" id={previewMessage.senderid || ''}
                                              you={true}/>
                                    <div className="preview-message-body">
                                        <div className={'inner ' + (previewMessage.rtl ? 'rtl' : 'ltr')}
                                        >{previewMessage.body}</div>
                                    </div>
                                </div>}
                                {Boolean(previewMessageMode === C_MSG_MODE.Edit) && <div className="preview-message">
                                    <div className="preview-message-user">Edit message</div>
                                </div>}
                            </div>
                        </div>
                        <div className="preview-clear">
                        <span onClick={this.clearPreviewMessage.bind(this, false)}>
                            <IconButton aria-label="Delete" className="btn-clear">
                                <ClearRounded/>
                            </IconButton>
                        </span>
                        </div>
                    </div>}
                    <div ref={this.mentionContainerRefHandler} className="suggestion-list-container"/>
                    {Boolean(!selectable) &&
                    <div ref={this.inputsRefHandler} className={`inputs mode-${this.inputsMode}`}>
                        <div className="user">
                            <UserAvatar id={this.state.userId} className="user-avatar"/>
                        </div>
                        <div className={'input ' + (this.state.rtl ? 'rtl' : 'ltr')}>
                            <div className="textarea-container">
                                <MentionsInput value={textareaValue}
                                               onChange={this.handleChange}
                                               inputRef={this.textareaRefHandler}
                                               onKeyUp={this.sendMessage}
                                               onKeyDown={this.inputKeyDown}
                                               allowSpaceInQuery={true}
                                               className="mention"
                                               placeholder="Type your message here..."
                                               style={defaultMentionInputStyle}
                                               suggestionsPortalHost={this.mentionContainer}
                                >
                                    <Mention
                                        trigger="@"
                                        type="mention"
                                        data={this.searchMention}
                                        className="mention-item"
                                        renderSuggestion={this.renderSuggestion}
                                    />
                                </MentionsInput>
                            </div>
                            <div className="emoji-wrapper">
                                <span className="icon" onClick={this.emojiHandleClick}>
                                    <SentimentSatisfiedRounded/>
                                </span>
                                <PopUpMenu anchorEl={this.state.emojiAnchorEl} onClose={this.emojiHandleClose}>
                                    <Picker custom={[]} onSelect={this.emojiSelect} native={true} showPreview={false}/>
                                </PopUpMenu>
                            </div>
                        </div>
                        <div className="voice-recorder">
                            {Boolean(this.inputsMode === 'voice' && voiceMode !== 'play') && <React.Fragment>
                                <div className="timer">
                                    <span className="bulb"/>
                                    <span ref={this.timerRefHandler}>00:00</span>
                                </div>
                                <div className="preview">
                                    <canvas ref={this.canvasRefHandler}/>
                                </div>
                                <div className="cancel" onClick={this.voiceCancelHandler}>
                                    Cancel
                                </div>
                            </React.Fragment>}
                            {Boolean(this.inputsMode === 'voice' && voiceMode === 'play') && <React.Fragment>
                                <div className="play-remove" onClick={this.voiceCancelHandler}>
                                    <DeleteRounded/>
                                </div>
                                <VoicePlayer ref={this.voicePlayerRefHandler} className="play-frame" maxValue={255.0}/>
                            </React.Fragment>}
                        </div>
                        <div className="input-actions">
                            <div className="icon voice" onMouseDown={this.voiceMouseDownHandler}
                                 onMouseUp={this.voiceMouseUpHandler} onMouseEnter={this.voiceMouseEnterHandler}
                                 onMouseLeave={this.voiceMouseLeaveHandler} onClick={this.voiceMouseClickHandler}>
                                {this.getVoiceIcon()}
                                <div className={'lock-wrapper' + (this.state.voiceMode === 'lock' ? ' show' : '')}>
                                    <LockRounded/>
                                </div>
                            </div>
                            <div className="icon attachment" onClick={this.openFileDialog}>
                                <AttachFileRounded/>
                            </div>
                            <div className="icon send" onClick={this.submitMessage}>
                                <SendRounded/>
                            </div>
                        </div>
                    </div>}
                    {Boolean(selectable && !previewMessage) && <div className="actions">
                        <div className="left-action">
                            <Tooltip
                                title="Close"
                                placement="top"
                            >
                                <IconButton aria-label="Close" onClick={this.props.onBulkAction.bind(this, 'close')}>
                                    <ClearRounded/>
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="right-action">
                            <Tooltip
                                title="Remove"
                                placement="top"
                            >
                                <IconButton aria-label="Remove" onClick={this.props.onBulkAction.bind(this, 'remove')}
                                            disabled={selectableDisable}>
                                    <DeleteRounded/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Forward"
                                placement="top"
                            >
                                <IconButton aria-label="Forward" onClick={this.props.onBulkAction.bind(this, 'forward')}
                                            disabled={selectableDisable}>
                                    <ForwardRounded/>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>}
                </div>
            );
        }
    }

    private getVoiceIcon() {
        switch (this.state.voiceMode) {
            case 'lock':
                return (<React.Fragment>
                    <StopRounded/>
                    <span ref={this.waveRefHandler} className="wave"/>
                </React.Fragment>);
            case 'play':
                return (<React.Fragment>
                    <SendRounded/>
                </React.Fragment>);
            default:
                return (<React.Fragment>
                    <span ref={this.waveRefHandler} className="wave"/>
                    <KeyboardVoiceRounded/>
                </React.Fragment>);
        }
    }

    private getPreviewCN(mode: number, senderid: string) {
        if (mode === C_MSG_MODE.Edit) {
            return 'edit';
        } else if (mode === C_MSG_MODE.Reply && senderid === this.props.userId) {
            return 'reply-you';
        } else if (mode === C_MSG_MODE.Reply && senderid !== this.props.userId) {
            return 'reply';
        }
        return '';
    }

    private submitMessage = () => {
        const {previewMessage, previewMessageMode} = this.state;
        if (this.props.onMessage) {
            if (this.props.onMessage) {
                const entities = this.generateEntities();
                if (previewMessageMode === C_MSG_MODE.Normal) {
                    this.props.onMessage(this.textarea.value, {
                        entities,
                    });
                } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                    const message = cloneDeep(previewMessage);
                    this.props.onMessage(this.textarea.value, {
                        entities,
                        message,
                        mode: previewMessageMode,
                    });
                    this.clearPreviewMessage(true);
                }
            }
        }
        this.textarea.value = '';
        this.mentions = [];
        this.lastMentionsCount = 0;
        this.setState({
            emojiAnchorEl: null,
            textareaValue: '',
        }, () => {
            this.computeLines();
        });
        if (this.state.previewMessageMode !== C_MSG_MODE.Edit) {
            this.setTyping(TypingAction.TYPINGACTIONCANCEL);
        }
    }

    private sendMessage = (e: any) => {
        const {previewMessage, previewMessageMode} = this.state;
        const text = e.target.value;
        this.rtlDetectorThrottle(text);
        let cancelTyping = false;
        if (e.key === 'Enter' && !e.shiftKey) {
            cancelTyping = true;
            setTimeout(() => {
                if (this.mentions.length !== this.lastMentionsCount) {
                    this.lastMentionsCount = this.mentions.length;
                    return;
                }
                if (this.props.onMessage) {
                    const entities = this.generateEntities();
                    if (previewMessageMode === C_MSG_MODE.Normal) {
                        this.props.onMessage(text, {
                            entities,
                        });
                    } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                        const message = cloneDeep(previewMessage);
                        this.props.onMessage(text, {
                            entities,
                            message,
                            mode: previewMessageMode,
                        });
                        this.clearPreviewMessage(true);
                    }
                }
                this.textarea.value = '';
                this.mentions = [];
                this.lastMentionsCount = 0;
                this.setState({
                    emojiAnchorEl: null,
                    textareaValue: '',
                }, () => {
                    this.computeLines();
                });
            }, 10);
        }
        if (e.key === 'Tab') {
            if (this.mentions.length !== this.lastMentionsCount) {
                this.lastMentionsCount = this.mentions.length;
                return;
            }
        }
        if (this.state.previewMessageMode !== C_MSG_MODE.Edit) {
            if (cancelTyping) {
                this.setTyping(TypingAction.TYPINGACTIONCANCEL);
            } else {
                this.setTyping(TypingAction.TYPINGACTIONTYPING);
            }
        }
    }

    private mentionContainerRefHandler = (value: any) => {
        this.mentionContainer = value;
    }

    private textareaRefHandler = (value: any) => {
        this.textarea = value;
    }

    private inputKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    private emojiHandleClick = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({
            emojiAnchorEl: event.currentTarget,
        });
    }

    private emojiSelect = (data: any) => {
        this.setState({
            textareaValue: this.state.textareaValue + data.native,
        }, () => {
            this.computeLines();
        });
    }

    private emojiHandleClose = () => {
        this.setState({
            emojiAnchorEl: null,
        });
    }

    private detectRTL = (text: string) => {
        const rtl = this.rtlDetector.direction(text);
        this.setState({
            rtl,
        });
    }

    private clearPreviewMessage = (removeDraft?: boolean) => {
        this.setState({
            previewMessageHeight: 0,
        });
        if (removeDraft && this.state.peer) {
            this.dialogRepo.removeDraft(this.state.peer.getId() || '');
        }
        setTimeout(() => {
            this.setState({
                previewMessage: null,
                previewMessageMode: C_MSG_MODE.Normal,
                voiceMode: 'up',
            });
            this.setInputMode('default');
            if (this.props.onPreviewMessageChange) {
                this.props.onPreviewMessageChange(undefined, C_MSG_MODE.Normal);
            }
        }, 102);
    }

    private animatePreviewMessage() {
        setTimeout(() => {
            const el = document.querySelector('.write .previews .preview-message-wrapper');
            if (el && this.state.previewMessage) {
                const targetEl = document.querySelector('.write .previews');
                if (targetEl) {
                    this.setState({
                        previewMessageHeight: (el.clientHeight + 8)
                    });
                } else {
                    this.setState({
                        previewMessageHeight: 0,
                    });
                }
            } else {
                this.setState({
                    previewMessageHeight: 0,
                });
            }
        }, 50);
    }

    /* Focus on elem by query */
    private focus(query: string) {
        const elem: any = document.querySelector(query);
        if (elem) {
            elem.focus();
        }
    }

    /* Check authority for composing message and etc. */
    private checkAuthority = (data?: any) => {
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        if (data && data.detail.ids.indexOf(peer.getId()) === -1) {
            return;
        }
        if (peer.getType() === PeerType.PEERGROUP) {
            this.groupRepo.get(peer.getId() || '').then((res) => {
                if (res.flagsList.indexOf(GroupFlags.GROUPFLAGSNONPARTICIPANT) > -1) {
                    this.setState({
                        disableAuthority: 0x1,
                    });
                } else if (res.flagsList.indexOf(GroupFlags.GROUPFLAGSDEACTIVATED) > -1) {
                    this.setState({
                        disableAuthority: 0x2,
                    });
                } else {
                    this.setState({
                        disableAuthority: 0x0,
                    });
                }
            });
        } else {
            this.setState({
                disableAuthority: 0x0,
            });
        }
    }

    /* Textarea change handler */
    private handleChange = (value: any, a: any, b: any, mentions: IMentions[]) => {
        this.mentions = mentions;
        this.setState({
            textareaValue: value.target.value,
        }, () => {
            this.computeLines();
        });
    }

    /* Compute line height based on break lines */
    private computeLines() {
        let lines = 1;
        const nodeInfo = measureNodeHeight(this.textarea, 12, false, 1, 5);
        if (nodeInfo) {
            lines = nodeInfo.rowCount;
        } else {
            lines = this.textarea.value.split('\n').length;
        }
        if (lines < 1) {
            lines = 1;
        }
        if (lines > 5) {
            lines = 5;
        }
        if (this.textarea && this.lastLines !== lines) {
            this.textarea.classList.remove('_1-line', '_2-line', '_3-line', '_4-line', '_5-line');
            this.textarea.classList.add(`_${lines}-line`);
            this.lastLines = lines;
        }
        if (this.textarea.value.length === 0) {
            if (this.inputsMode !== 'default') {
                this.setInputMode('default');
            }
        } else {
            if (this.inputsMode !== 'text') {
                this.setInputMode('text');
            }
        }
    }

    /* Search mention in group */
    private searchMention = (keyword: string, callback: any) => {
        const {peer} = this.state;
        if (!peer) {
            callback([]);
            return;
        }
        if (peer.getType() !== PeerType.PEERGROUP) {
            callback([]);
            return;
        }
        // Search engine
        const searchParticipant = (word: string, participants: GroupParticipant.AsObject[]) => {
            const users: any[] = [];
            const reg = new RegExp(word, "i");
            const userId = this.sdk.getConnInfo().UserID;
            for (const [i, participant] of participants.entries()) {
                if (userId !== participant.userid &&
                    (reg.test(`${participant.firstname} ${participant.lastname}`) ||
                        (participant.username && reg.test(participant.username)))) {
                    users.push({
                        display: participant.username ? `@${participant.username}` : `${participant.firstname} ${participant.lastname}`,
                        id: participant.userid,
                        index: i,
                        username: participant.username,
                    });
                }
                if (users.length >= 7) {
                    break;
                }
            }
            callback(users);
        };
        // Get from server if participants were not in group
        const getRemoteGroupFull = () => {
            this.sdk.groupGetFull(peer).then((res) => {
                const group: IGroup = res.group;
                group.participantList = res.participantsList;
                if (res && res.participantsList) {
                    searchParticipant(keyword, res.participantsList);
                }
                this.groupRepo.importBulk([group]);
                const contacts: IContact[] = [];
                res.participantsList.forEach((list) => {
                    contacts.push({
                        accesshash: list.accesshash,
                        firstname: list.firstname,
                        id: list.userid,
                        lastname: list.lastname,
                        temp: true,
                        username: list.username,
                    });
                });
                this.contactRepo.importBulk(contacts);
            }).catch(() => {
                callback([]);
            });
        };
        this.groupRepo.get(peer.getId() || '').then((group) => {
            if (group && group.participantList) {
                searchParticipant(keyword, group.participantList);
            } else {
                getRemoteGroupFull();
            }
        }).catch(() => {
            getRemoteGroupFull();
        });
    }

    /* Suggestion renderer */
    private renderSuggestion = (a: any, b: any, c: any, d: any, focused: any) => {
        return (<div className={'inner ' + (focused ? 'focused' : '')}>
            <div className="avatar">
                <UserAvatar id={a.id} noDetail={true}/>
            </div>
            <div className="info">
                <UserName id={a.id} className="name" unsafe={true} noDetail={true}/>
                {Boolean(a.username) && <span className="username">{a.username}</span>}
            </div>
        </div>);
    }

    /* Generate entities for message */
    private generateEntities(): core_types_pb.MessageEntity[] | null {
        if (this.mentions.length === 0) {
            return null;
        }
        const entities: core_types_pb.MessageEntity[] = [];
        this.mentions.forEach((mention) => {
            const entity = new core_types_pb.MessageEntity();
            entity.setOffset(mention.plainTextIndex);
            entity.setLength(mention.display.length);
            entity.setType(MessageEntityType.MESSAGEENTITYTYPEMENTION);
            entity.setUserid(mention.id);
            entities.push(entity);
        });
        return entities;
    }

    /* Checks draft for save and restore */
    private initDraft(oldPeer: InputPeer | null, newPeer: InputPeer | null, mode: number, message: IMessage | null) {
        if (!newPeer) {
            return;
        }
        if (oldPeer === newPeer) {
            return;
        }
        if (oldPeer && oldPeer.getId() === newPeer.getId()) {
            return;
        }

        if (oldPeer) {
            const oldPeerObj = oldPeer.toObject();
            const draft: IDraft = {
                message: !message ? undefined : message,
                mode,
                peerid: oldPeerObj.id || '',
                text: this.state.textareaValue,
            };
            if (draft.text.length > 0 || (mode && mode !== C_MSG_MODE.Normal)) {
                this.dialogRepo.saveDraft(draft);
            } else {
                this.dialogRepo.removeDraft(oldPeerObj.id || '');
            }
        }

        const newPeerObj = newPeer.toObject();
        this.dialogRepo.getDraft(newPeerObj.id || '').then((res) => {
            if (res) {
                if (res.message && res.mode !== C_MSG_MODE.Normal) {
                    this.changePreviewMessage(res.text, res.mode, res.message, () => {
                        this.animatePreviewMessage();
                    });
                } else {
                    this.changePreviewMessage(res.text, C_MSG_MODE.Normal, null);
                }
            } else {
                this.changePreviewMessage('', C_MSG_MODE.Normal, null);
            }
        }).catch(() => {
            this.changePreviewMessage('', C_MSG_MODE.Normal, null);
        });
    }

    /* Modify textarea and preview message */
    private changePreviewMessage(text: string, mode: number | undefined, msg: IMessage | null, callback?: any) {
        this.setState({
            previewMessage: msg,
            previewMessageMode: mode || C_MSG_MODE.Normal,
            textareaValue: text,
        }, () => {
            if (this.props.onPreviewMessageChange) {
                this.props.onPreviewMessageChange(!this.state.previewMessage ? undefined : this.state.previewMessage, this.state.previewMessageMode);
            }
            if (callback) {
                callback();
            }
            this.computeLines();
        });
    }

    /* Inputs ref handler */
    private inputsRefHandler = (ref: any) => {
        this.inputsRef = ref;
    }

    /* Wave ref handler */
    private waveRefHandler = (ref: any) => {
        this.waveRef = ref;
    }

    /* Canvas ref handler */
    private canvasRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
        this.canvasRef = ref;
        this.canvasCtx = ref.getContext('2d');
        if (this.canvasCtx) {
            // this.canvasCtx.scale(2, 2);
            setTimeout(this.windowResizeHandler, 10);
        }
    }

    /* Voice Player ref handler */
    private voicePlayerRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
        this.voicePlayerRef = ref;
    }

    /* Timer ref handler */
    private timerRefHandler = (ref: any) => {
        this.timerRef = ref;
    }

    /* On record voice start handler */
    private voiceRecord() {
        if (!this.recorder) {
            this.initRecorder();
        }
        this.setInputMode('voice');
        this.bars = [];
        this.maxBarVal = 0;
        this.recorder.start().then(() => {
            this.startTimer();
            const audioAnalyser = this.recorder.audioContext.createAnalyser();
            audioAnalyser.minDecibels = -100;
            audioAnalyser.fftSize = 256;
            audioAnalyser.smoothingTimeConstant = 0.1;

            this.recorder.sourceNode.connect(audioAnalyser);
            const data = new Uint8Array(audioAnalyser.frequencyBinCount);

            const loop = () => {
                if (this.inputsMode !== 'voice') {
                    return;
                }
                if (this.state.voiceMode !== 'lock' && this.state.voiceMode !== 'down') {
                    return;
                }
                audioAnalyser.getByteFrequencyData(data); // get current data
                this.visualize(data, () => {
                    loop();
                });
            };
            loop();
        });
    }

    /* On record voice end handler */
    private voiceRecordEnd = () => {
        this.stopTimer();
        try {
            this.recorder.stop();
        } catch (e) {
            window.console.log(e);
        }
    }

    /* Voice anchor mouse down handler */
    private voiceMouseDownHandler = () => {
        if (this.state.voiceMode !== 'lock' && this.state.voiceMode !== 'play') {
            this.voiceMouseIn = true;
            this.setState({
                voiceMode: 'down',
            });
            this.voiceRecord();
        }
    }

    /* Voice anchor mouse up handler */
    private voiceMouseUpHandler = (e: any) => {
        if (this.state.voiceMode !== 'lock' && this.state.voiceMode !== 'play') {
            e.stopPropagation();
            this.setState({
                voiceMode: 'up',
            });
            this.voiceMouseIn = false;
            this.voiceRecordEnd();
            this.setInputMode('default');
        }
    }

    /* Voice anchor mouse Enter handler */
    private voiceMouseEnterHandler = () => {
        if (!this.voiceMouseIn) {
            return;
        }
        if (this.state.voiceMode !== 'down') {
            this.setState({
                voiceMode: 'down',
            });
        }
    }

    /* Voice anchor mouse down handler */
    private voiceMouseLeaveHandler = () => {
        if (!this.voiceMouseIn) {
            return;
        }
        if (this.state.voiceMode !== 'lock') {
            this.setState({
                voiceMode: 'lock',
            });
        }
    }

    /* Voice anchor mouse down handler */
    private voiceMouseClickHandler = () => {
        if (this.state.voiceMode === 'lock') {
            this.voiceRecordEnd();
            this.setState({
                voiceMode: 'play',
            });
        } else if (this.state.voiceMode === 'play') {
            this.sendVoice();
        }
    }

    /* Send voice */
    private sendVoice() {
        const {previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        this.props.onVoice(this.voice, to4bitResolution(this.bars), this.timerDuration, {
            message,
            mode: previewMessageMode,
        });
        this.clearPreviewMessage(true);
    }

    /* Window click handler */
    private windowMouseUp = () => {
        if (!this.voiceMouseIn) {
            return;
        }
        this.voiceMouseIn = false;
    }

    /* Window resize handler */
    private windowResizeHandler = () => {
        const el = document.querySelector('.write .inputs .voice-recorder .preview, .write .inputs .voice-recorder .play-preview');
        if (el) {
            this.canvasConfig.height = el.clientHeight - 4;
            this.canvasConfig.width = el.clientWidth;
            this.canvasConfig.totalWith = this.canvasConfig.barWidth + this.canvasConfig.barSpace;
            this.canvasConfig.ratio = (this.canvasConfig.height - 1) / 255.0;
            this.canvasConfig.maxBars = Math.floor(this.canvasConfig.width / (this.canvasConfig.barWidth + this.canvasConfig.barSpace));
            const htmlEl = document.querySelector('html');
            if (htmlEl) {
                this.canvasConfig.color = htmlEl.getAttribute('theme') === 'light' ? '#1A1A1A' : '#E6E6E6';
            }
            if (this.canvasRef && this.canvasCtx) {
                this.canvasCtx.canvas.height = (this.canvasConfig.height);
                this.canvasCtx.canvas.width = (this.canvasConfig.width);
            }
        }
    }

    /* Voice record cancel handler */
    private voiceCancelHandler = () => {
        this.voiceCanceled = true;
        this.voiceRecordEnd();
        this.setInputMode('default');
        this.setState({
            voiceMode: 'up',
        });
    }

    /* Set input mode */
    private setInputMode(mode: 'voice' | 'text' | 'attachment' | 'default') {
        if (!this.inputsRef) {
            return;
        }
        this.inputsRef.classList.remove('mode-voice', 'mode-text', 'mode-attachment', 'mode-default');
        this.inputsRef.classList.add(`mode-${mode}`);
        this.inputsMode = mode;
    }

    private visualize = (arr: Uint8Array, callback: () => void) => {
        if (!this.waveRef) {
            return;
        }
        const len = arr.length;
        const step = Math.floor(len / 10);
        let val = 0;
        for (let i = 0; i < 10; i++) {
            val += arr[i * step];
        }
        val = val / 10;
        this.bars.push(val);
        if (val > this.maxBarVal) {
            this.maxBarVal = val;
        }
        val = this.normalize(val);
        this.waveRef.style.height = val + 'px';
        this.waveRef.style.width = val + 'px';
        this.displayBars(callback);
    }

    /* Initialize opus recorder and bind listeners */
    private initRecorder() {
        this.recorder = new Recorder({
            encoderPath: '/recorder/encoderWorker.min.js',
            maxFramesPerPage: 16,
            monitorGain: 0,
            numberOfChannels: 1,
            recordingGain: 1,
            reuseWorker: true,
            wavBitDepth: 16,
        });

        this.recorder.loadWorker();

        this.recorder.ondataavailable = (typedArray: any) => {
            if (this.voiceCanceled) {
                this.voiceCanceled = false;
                return;
            }
            this.voice = new Blob([typedArray], {type: 'audio/ogg'});
            if (this.state.voiceMode === 'play') {
                this.computeFinalBars();
                this.voicePlayerRef.setData({
                    bars: this.bars,
                    duration: this.timerDuration,
                    state: 'pause',
                    voice: this.voice,
                });
            } else if (this.state.voiceMode === 'up') {
                this.computeFinalBars();
                this.sendVoice();
            }
        };
    }

    /* Normalize the wave amount */
    private normalize(x: number) {
        if (x < 30) {
            x = 30;
        }
        if (x > 100) {
            x = 100;
        }
        return Math.floor(x);
    }

    /* Start voice recorder timer */
    private startTimer() {
        clearInterval(this.timerInterval);
        this.timerDuration = 0;
        this.displayTimer();
        this.timerInterval = setInterval(() => {
            this.timerDuration += 0.2;
            this.displayTimer();
            this.setTyping(TypingAction.TYPINGACTIONRECORDINGVOICE);
        }, 200);
    }

    /* Start voice recorder timer */
    private stopTimer() {
        clearInterval(this.timerInterval);
        this.setTyping(TypingAction.TYPINGACTIONCANCEL);
    }

    /* Display voice recorder timer */
    private displayTimer() {
        if (!this.timerRef) {
            return;
        }
        const duration = Math.floor(this.timerDuration);
        let sec: string | number = duration % 60;
        let min: string | number = Math.floor(duration / 60);
        if (sec < 10) {
            sec = `0${sec}`;
        }
        if (min < 10) {
            min = `0${min}`;
        }
        this.timerRef.innerHTML = `${min}:${sec}`;
        if (this.timerDuration > 0 && this.timerDuration < 0.5) {
            this.timerRef.parentElement.classList.add('blink');
        }
        if (this.timerDuration === 0) {
            this.timerRef.parentElement.classList.remove('blink');
        }
    }

    /* Display voice bars */
    private displayBars(callback?: () => void) {
        if (!this.canvasCtx) {
            if (callback) {
                requestAnimationFrame(callback);
            }
            return;
        }

        this.canvasCtx.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);

        let barHeight;
        let x = 0;

        let offset = 0;
        // Only display last fitting items
        if ((this.canvasConfig.width / (this.canvasConfig.totalWith * this.bars.length)) < 1) {
            offset = this.bars.length - this.canvasConfig.maxBars;
        }

        let normRatio = (255 / this.maxBarVal);
        if (normRatio > 3) {
            normRatio = 3;
        }
        for (let i = offset; i < this.bars.length; i++) {
            barHeight = Math.floor(this.bars[i] * this.canvasConfig.ratio * normRatio) + 1;

            this.canvasCtx.fillStyle = this.canvasConfig.color;
            this.canvasCtx.fillRect(x, this.canvasConfig.height - barHeight, this.canvasConfig.barWidth, this.canvasConfig.height);

            x += this.canvasConfig.totalWith;
        }
        setTimeout(() => {
            if (callback) {
                requestAnimationFrame(callback);
            }
        }, 50);
    }

    /* Compute final bars */
    private computeFinalBars() {
        const sampleCount = 200;
        const trimmedBars: number[] = [];
        const step = this.bars.length / sampleCount;
        const normRatio = 255 / this.maxBarVal;
        const getSampleAvg = (from: number, to: number) => {
            const count = 5;
            const sampleStep = (to - from) / count;
            let val = 0;
            for (let i = from; i < to; i += sampleStep) {
                val += this.bars[Math.floor(i)];
            }
            val = Math.floor((val / count) * normRatio);
            if (val > 255) {
                val = 255;
            }
            return val;
        };

        for (let i = 0, cnt = 0; i < this.bars.length && cnt < 200; i += step, cnt++) {
            trimmedBars.push(getSampleAvg(i, i + step));
        }

        this.bars = trimmedBars;
    }

    /* File input ref handler */
    private fileInputRefHandler = (ref: any) => {
        this.fileInputRef = ref;
    }

    /* Open file dialog */
    private openFileDialog = () => {
        if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    /* File change handler */
    private fileChangeHandler = (e: any) => {
        if (this.props.onFileSelected && e.currentTarget.files.length > 0) {
            this.props.onFileSelected(e.currentTarget.files[0]);
            if (this.fileInputRef) {
                this.fileInputRef.value = '';
            }
        }
    }

    /* Set typing */
    private setTyping(typing: TypingAction) {
        if (!this.props.onTyping) {
            return;
        }
        if (typing === TypingAction.TYPINGACTIONCANCEL) {
            this.props.onTyping(TypingAction.TYPINGACTIONCANCEL);
            if (this.typingThrottle !== null) {
                this.typingThrottle.cancel();
            }
            this.typingThrottle = null;
        } else {
            if (this.typingThrottle === null) {
                this.typingThrottle = throttle(() => {
                    if (this.props.onTyping) {
                        this.props.onTyping(typing);
                    } else {
                        if (this.typingThrottle !== null) {
                            this.typingThrottle.cancel();
                        }
                    }
                }, 5000);
            } else {
                this.typingThrottle();
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    if (this.typingThrottle !== null) {
                        this.typingThrottle.cancel();
                    }
                    if (this.props.onTyping) {
                        this.props.onTyping(TypingAction.TYPINGACTIONCANCEL);
                    }
                }, 5000);
            }
        }
    }

    // /* Is voice started */
    // private isVoiceStarted(data: Uint8Array) {
    //     return data.some((byte) => {
    //         return byte > 0;
    //     });
    // }

    // /* Insert at selection */
    // private insertAtCursor(text: string) {
    //     const textVal = this.state.textareaValue;
    //     // IE support
    //     // @ts-ignore
    //     if (document.selection) {
    //         this.textarea.focus();
    //         // @ts-ignore
    //         const sel: any = document.selection.createRange();
    //         sel.text = text;
    //         return sel.text;
    //     }
    //     // @ts-ignore
    //     else if (myField.selectionStart || myField.selectionStart === 0) {
    //         const startPos = this.textarea.selectionStart;
    //         const endPos = this.textarea.selectionEnd;
    //         return textVal.substring(0, startPos)
    //             + text
    //             + textVal.substring(endPos, textVal.length);
    //     } else {
    //         textVal += myValue;
    //     }
    // }
}

export default TextInput;
