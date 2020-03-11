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
import {cloneDeep, sortBy, throttle, range} from 'lodash';
import {
    AttachFileRounded,
    ClearRounded,
    DeleteRounded,
    ForwardRounded,
    KeyboardVoiceRounded,
    LabelRounded,
    LockRounded,
    SendRounded,
    SentimentSatisfiedRounded,
    StopRounded,
    ViewModuleRounded,
    KeyboardRounded,
} from '@material-ui/icons';
import {IconButton} from '@material-ui/core';
import UserAvatar from '../UserAvatar';
import RTLDetector from '../../services/utilities/rtl_detector';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import {C_MSG_MODE} from './consts';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import {
    DraftMessage,
    GroupFlags,
    GroupParticipant,
    InputPeer,
    InputUser,
    MessageEntity,
    MessageEntityType,
    PeerType,
    TypingAction,
} from '../../services/sdk/messages/chat.core.types_pb';
import GroupRepo, {GroupDBUpdated} from '../../repository/group';
// @ts-ignore
import {Mention, MentionsInput} from 'react-mentions';
import UserRepo, {UserDBUpdated} from '../../repository/user';
import SDK from '../../services/sdk';
import {IUser} from '../../repository/user/interface';
import {IGroup} from '../../repository/group/interface';
import DialogRepo from '../../repository/dialog';
// @ts-ignore
import Recorder from 'opus-recorder/dist/recorder.min';
import VoicePlayer from '../VoicePlayer';
import {to4bitResolution} from './utils';
import {measureNodeHeight} from './measureHeight';
import {getMessageTitle} from '../Dialog/utils';
import XRegExp from 'xregexp';
import SelectMedia from '../SelectMedia';
import MediaPreview, {IMediaItem} from '../Uploader';
import ContactPicker from '../ContactPicker';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE, C_REPLY_ACTION} from '../../repository/message/consts';
import RiverTime from '../../services/utilities/river_time';
import Broadcaster from '../../services/broadcaster';
import MapPicker, {IGeoItem} from '../MapPicker';
import CachedPhoto from "../CachedPhoto";
import {getMediaInfo} from "../MessageMedia";
import i18n from '../../services/i18n';
import {IDialog} from "../../repository/dialog/interface";
import MessageRepo from "../../repository/message";
import {UpdateDraftMessageCleared} from "../../services/sdk/messages/chat.api.updates_pb";
import {emojiList} from "./emojis";
import {isMobile} from "../../services/utilities/localize";
import UniqueId from "../../services/uniqueId";
import {ReplyKeyboardMarkup} from "../../services/sdk/messages/chat.core.message.markups_pb";
import BotLayout from "../BotLayout";
import Scrollbars from "react-custom-scrollbars";
import {ThemeChanged} from "../SettingsMenu";
import {EventKeyUp, EventMouseUp, EventPaste, EventResize} from "../../services/events";

import 'emoji-mart/css/emoji-mart.css';
import './style.scss';

const limit = 9;
const emojiKey = 'emoji-mart.frequently';

// @[@yasaman](580637822969180) hi
const mentionize = (text: string, sortedEntities: Array<{ offset: number, length: number, val: string }>) => {
    sortedEntities.sort((i1, i2) => {
        if (i1.offset === undefined || i2.offset === undefined) {
            return 0;
        }
        return i1.offset - i2.offset;
    });
    const fn = (t1: string, t2: string, s: number, e: number) => {
        return t1.substr(0, s) + t2 + t1.substr(s + e, t1.length);
    };
    sortedEntities.forEach((en) => {
        text = fn(text, `@[${text.substr(en.offset, en.length)}](${en.val})`, en.offset, en.length);
    });
    return text;
};

interface IProps {
    getDialog: (id: string) => IDialog | null;
    onAction: (cmd: string, message?: IMessage) => (e?: any) => void;
    onBulkAction: (cmd: string) => (e?: any) => void;
    onClearDraft?: (data: UpdateDraftMessageCleared.AsObject) => void;
    onContactSelected: (users: IUser[], caption: string, {mode, message}: any | undefined) => void;
    onMapSelected: (item: IGeoItem, {mode, message}: any | undefined) => void;
    onMediaSelected: (items: IMediaItem[], {mode, message}: any | undefined) => void;
    onMessage: (text: string, {mode, message, entities}: any | undefined) => void;
    onPreviewMessageChange?: (previewMessage: IMessage | undefined, previewMessageMode: number) => void;
    onTyping?: (typing: TypingAction) => void;
    onVoiceSend: (item: IMediaItem, {mode, message}: any | undefined) => void;
    onVoiceStateChange?: (state: 'lock' | 'down' | 'up' | 'play') => void;
    onBotButtonAction?: (cmd: number, data: any) => void;
    peer: InputPeer | null;
    previewMessage?: IMessage;
    previewMessageMode?: number;
    userId?: string;
    onFocus?: () => void;
}

interface IState {
    botKeyboard: boolean;
    disableAuthority: number;
    emojiAnchorEl: any;
    isBot: boolean;
    mediaInputMode: 'media' | 'music' | 'contact' | 'location' | 'file' | 'none';
    peer: InputPeer | null;
    previewMessage: IMessage | null;
    previewMessageHeight: number;
    previewMessageMode: number;
    rtl: boolean;
    selectable: boolean;
    selectableDisable: boolean;
    textareaValue: string;
    uploadPreviewOpen: boolean;
    user: IUser | null;
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
        maxHeight: '350px',
        minHeight: '20px',
        outline: 'none',
        overflow: 'auto',
        position: 'relative',
    },
};

export const C_TYPING_INTERVAL = 5000;

const textBoxClasses: string[] = range(1, 13).map(o => `_${o}-line`);

interface IKeyboardLayout {
    layout: ReplyKeyboardMarkup.AsObject | undefined;
    msgId: number;
}

class ChatInput extends React.Component<IProps, IState> {
    private mentionContainer: any = null;
    private textarea: any = null;
    private typingThrottle: any = null;
    private typingTimeout: any = null;
    private rtlDetector: RTLDetector;
    private readonly rtlDetectorThrottle: any = null;
    private groupRepo: GroupRepo;
    private userRepo: UserRepo;
    private dialogRepo: DialogRepo;
    private messageRepo: MessageRepo;
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
    private voice: Blob | undefined;
    private voicePlayerRef: VoicePlayer | undefined;
    private voiceCanceled: boolean = false;
    private fileInputRef: any = null;
    private mediaPreviewRef: MediaPreview | undefined;
    private contactPickerRef: ContactPicker | undefined;
    private mapPickerRef: MapPicker | undefined;
    private riverTime: RiverTime;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private lastMessage: IMessage | null = null;
    private rtl: boolean = localStorage.getItem('river.lang') === 'fa' || false;
    private readonly isMobileView: boolean = false;
    private preventMessageSend: boolean = false;
    private preventMessageSendTimeout: any = null;
    private emojiMap: { [key: string]: number } = {};
    private isMobileBrowser = isMobile();
    private callerId: number = UniqueId.getRandomId();
    private selectMediaRef: SelectMedia | undefined;
    private botKeyboard: IKeyboardLayout | undefined;
    private firstLoad: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.userRepo = UserRepo.getInstance();

        this.state = {
            botKeyboard: false,
            disableAuthority: 0x0,
            emojiAnchorEl: null,
            isBot: false,
            mediaInputMode: 'none',
            peer: props.peer,
            previewMessage: props.previewMessage || null,
            previewMessageHeight: 0,
            previewMessageMode: props.previewMessageMode || C_MSG_MODE.Normal,
            rtl: this.rtl,
            selectable: false,
            selectableDisable: false,
            textareaValue: '',
            uploadPreviewOpen: false,
            user: props.peer && props.peer.getType() === PeerType.PEERUSER ? this.userRepo.getInstant(props.peer.getId() || '') : null,
            voiceMode: 'up',
        };

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 250);

        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.sdk = SDK.getInstance();
        this.riverTime = RiverTime.getInstance();

        // @ts-ignore
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.broadcaster = Broadcaster.getInstance();

        this.isMobileView = (window.innerWidth < 600);

        emojiList.forEach((emoji, index) => {
            this.emojiMap[emoji.n] = index;
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.checkAuthority));
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.checkAuthority));
        this.eventReferences.push(this.broadcaster.listen(ThemeChanged, this.windowResizeHandler));
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
        window.addEventListener(EventMouseUp, this.windowMouseUp);
        window.addEventListener(EventKeyUp, this.windowKeyUp);
        window.addEventListener(EventResize, this.windowResizeHandler);
        window.addEventListener(EventPaste, this.windowPasteHandler);
        this.checkAuthority();
        this.initDraft(null, this.props.peer, 0, null);
    }

    public setPeer(peer: InputPeer | null) {
        if (peer && this.state.peer !== peer) {
            this.firstLoad = true;
            this.botKeyboard = undefined;
            this.preventMessageSend = false;
            if (this.state.voiceMode === 'lock' || this.state.voiceMode === 'down') {
                this.voiceCancelHandler();
            }
            const user = peer.getType() === PeerType.PEERUSER ? this.userRepo.getInstant(peer.getId() || '') : null;
            this.setState({
                disableAuthority: 0x0,
                peer,
                user,
            }, () => {
                this.checkAuthority();
            });
            if (peer.getType() === PeerType.PEERUSER && !user) {
                this.userRepo.get(peer.getId() || '').then((res) => {
                    this.setState({
                        user: res,
                    });
                });
            }
            if (this.state.selectable) {
                this.props.onBulkAction('close')();
            }
        } else if (this.state.peer !== peer) {
            this.setState({
                peer: null,
                user: null,
            });
        }
    }

    public setParams(peer: InputPeer | null, previewMessageMode?: number, previewMessage?: IMessage) {
        if ((previewMessageMode === C_MSG_MODE.Edit || previewMessageMode === C_MSG_MODE.Reply) && this.state.selectable) {
            this.setInputMode('default');
            if (this.props.onPreviewMessageChange) {
                this.props.onPreviewMessageChange(undefined, C_MSG_MODE.Normal);
            }
            return;
        }
        if (this.state.previewMessageMode === C_MSG_MODE.Edit && previewMessageMode === C_MSG_MODE.Normal) {
            this.setState({
                textareaValue: '',
            }, () => {
                this.computeLines();
            });
        }
        if (previewMessageMode === C_MSG_MODE.Edit && previewMessage) {
            const text = this.modifyBody(previewMessage.body || '', previewMessage.entitiesList);
            this.setState({
                textareaValue: text,
            }, () => {
                if (this.textarea) {
                    this.detectRTL(this.textarea.value);
                }
                this.computeLines();
            });
        } else {
            this.initDraft(this.state.peer, peer, this.state.previewMessageMode, this.state.previewMessage);
        }
        this.setState({
            previewMessage: previewMessage || null,
            previewMessageMode: previewMessageMode || C_MSG_MODE.Normal,
        }, () => {
            this.animatePreviewMessage();
            if (previewMessageMode === C_MSG_MODE.Edit || previewMessageMode === C_MSG_MODE.Reply) {
                this.focus();
            }
        });
        if (peer && this.state.peer !== peer) {
            this.firstLoad = true;
            this.botKeyboard = undefined;
            this.preventMessageSend = false;
            if (this.state.voiceMode === 'lock' || this.state.voiceMode === 'down') {
                this.voiceCancelHandler();
            }
            const user = peer.getType() === PeerType.PEERUSER ? this.userRepo.getInstant(peer.getId() || '') : null;
            this.setState({
                peer,
                user,
            }, () => {
                this.checkAuthority();
            });
            if (peer.getType() === PeerType.PEERUSER && !user) {
                this.userRepo.get(peer.getId() || '').then((res) => {
                    this.setState({
                        user: res,
                    });
                });
            }
            if (this.state.selectable) {
                this.props.onBulkAction('close')();
            }
        } else if (this.state.peer !== peer) {
            this.setState({
                peer: null,
                user: null,
            });
        }
    }

    public setSelectable(enable: boolean, disable: boolean) {
        if (enable !== this.state.selectable || disable !== this.state.selectableDisable) {
            this.setState({
                selectable: enable,
                selectableDisable: disable,
            });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener(EventMouseUp, this.windowMouseUp);
        window.removeEventListener(EventKeyUp, this.windowKeyUp);
        window.removeEventListener(EventResize, this.windowResizeHandler);
        window.removeEventListener(EventPaste, this.windowPasteHandler);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
        clearInterval(this.timerInterval);
        clearTimeout(this.typingTimeout);
        clearTimeout(this.preventMessageSendTimeout);
    }

    public focus() {
        setTimeout(() => {
            if (!this.textarea) {
                return;
            }
            this.textarea.focus();
            if (this.textarea.value) {
                this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
            }
        }, 100);
    }

    public openUploader(files: File[]) {
        if (this.mediaPreviewRef) {
            let media: any = '';
            files.forEach((file) => {
                const t = this.getUploaderInput(file.type);
                if (media !== t && media !== '') {
                    media = 'file';
                } else if (media !== 'file' || media === '') {
                    media = t;
                }
            });
            this.setState({
                mediaInputMode: media,
            }, () => {
                if (this.mediaPreviewRef) {
                    this.mediaPreviewRef.openDialog(files, Boolean(media === 'file'));
                }
            });
        }
    }

    public setLastMessage(message: IMessage | null) {
        if (message && this.lastMessage && this.lastMessage.id !== message.id) {
            this.checkAuthority();
        }
        this.lastMessage = message;
    }

    public checkDraft(newPeer?: InputPeer) {
        if (!this.state.peer && !newPeer) {
            return;
        }
        // @ts-ignore
        const newPeerObj = newPeer ? newPeer.toObject() : this.state.peer.toObject();
        const dialog = cloneDeep(this.props.getDialog(newPeerObj.id || ''));
        if (!dialog || !dialog.draft || !dialog.draft.peerid) {
            this.changePreviewMessage('', C_MSG_MODE.Normal, null);
            return;
        }
        if (dialog.draft.replyto) {
            this.messageRepo.get(dialog.draft.replyto, this.state.peer).then((msg) => {
                if (msg && dialog && dialog.draft) {
                    this.changePreviewMessage(dialog.draft.body || '', C_MSG_MODE.Reply, msg, () => {
                        this.animatePreviewMessage();
                    });
                } else if (dialog.draft) {
                    this.changePreviewMessage(dialog.draft.body || '', C_MSG_MODE.Normal, null);
                }
            });
        } else {
            this.changePreviewMessage(dialog.draft.body || '', C_MSG_MODE.Normal, null);
        }
    }

    public applyDraft() {
        if (this.state.peer) {
            this.initOldDraft(this.state.peer, this.state.previewMessageMode, this.state.previewMessage);
        }
    }

    public setBot(peer: InputPeer | null, isBot: boolean, data: IKeyboardLayout | undefined) {
        if (this.firstLoad && peer) {
            this.firstLoad = false;
            this.messageRepo.getLastIncomingMessage(peer.getId() || '').then((msg) => {
                if (msg) {
                    if ((!this.botKeyboard || (this.botKeyboard && this.botKeyboard.msgId < (msg.id || 0))) && msg.replymarkup === C_REPLY_ACTION.ReplyKeyboardMarkup) {
                        this.botKeyboard = {
                            layout: msg.replydata,
                            msgId: msg.id || 0
                        };
                        this.forceUpdate();
                    }
                }
            });
        }
        if ((this.botKeyboard && data && this.botKeyboard.msgId < data.msgId) || !this.botKeyboard) {
            const lastKeyboard = this.botKeyboard;
            if (!this.state.botKeyboard && lastKeyboard && data && lastKeyboard.msgId !== data.msgId) {
                this.toggleBotKeyboardHandler();
            }
            this.botKeyboard = data;
            let check = false;
            if (this.state.botKeyboard) {
                this.setState({
                    isBot,
                });
                check = true;
            } else if (this.state.isBot !== isBot) {
                this.setState({
                    isBot,
                });
                check = true;
            }
            if (!check && lastKeyboard !== data) {
                this.forceUpdate();
            }
        } else if (this.state.isBot !== isBot) {
            this.setState({
                isBot,
            });
        }
    }

    public render() {
        const {
            previewMessage, previewMessageMode, previewMessageHeight, selectable, selectableDisable,
            disableAuthority, textareaValue, voiceMode, user, botKeyboard,
        } = this.state;

        if (!selectable && disableAuthority !== 0x0) {
            if (disableAuthority === 0x1) {
                return (<div className="input-placeholder">
                    {i18n.t('input.you_are_no_longer_in_this_group')}
                    <span className="btn"
                          onClick={this.props.onAction('remove_dialog')}>{i18n.t('input.delete_and_exit')}</span>
                </div>);
            } else if (disableAuthority === 0x2) {
                return (<div className="input-placeholder">{i18n.t('input.group_is_deactivated')}</div>);
            } else if (disableAuthority === 0x3) {
                return (<div className="input-placeholder">
                    <span className="btn"
                          onClick={this.startBotHandler}>{i18n.t('bot.start_bot')}</span>
                </div>);
            } else {
                return '';
            }
        } else if (!selectable && user && user.blocked) {
            return (<div className="input-placeholder" onClick={this.unblockHandler}>
                <span className="btn">{i18n.t('general.unblock')}</span></div>);
        } else {
            const isBot = this.state.isBot && this.botKeyboard && Boolean(this.botKeyboard.layout);
            return (
                <div className="chat-input">
                    <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                           onChange={this.fileChangeHandler} multiple={true} accept={this.getFileType()}/>
                    <MediaPreview ref={this.mediaPreviewRefHandler} accept={this.getFileType()}
                                  onDone={this.mediaPreviewDoneHandler}/>
                    <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactImportDoneHandler}/>
                    <MapPicker ref={this.mapPickerRefHandler} onDone={this.mapDoneDoneHandler}/>
                    {(!selectable && previewMessage) &&
                    <div className="previews" style={{height: previewMessageHeight + 'px'}}>
                        <div className="preview-container">
                            <div
                                className={'preview-message-wrapper ' + this.getPreviewCN(previewMessageMode, previewMessage.senderid || '')}>
                                <span className="preview-bar"/>
                                {this.getThumbnail()}
                                {Boolean(previewMessageMode === C_MSG_MODE.Reply) && <div className="preview-message">
                                    <UserName className="preview-message-user" id={previewMessage.senderid || ''}
                                              you={true}/>
                                    <div className="preview-message-body">
                                        <div className={'inner ' + (previewMessage.rtl ? 'rtl' : 'ltr')}
                                        >{getMessageTitle(previewMessage).text}</div>
                                    </div>
                                </div>}
                                {Boolean(previewMessageMode === C_MSG_MODE.Edit) && <div className="preview-message">
                                    <div className="preview-message-user">{i18n.t('input.edit_message')}</div>
                                </div>}
                            </div>
                        </div>
                        <div className="preview-clear">
                        <span onClick={this.clearPreviewMessage(false)}>
                            <IconButton className="btn-clear">
                                <ClearRounded/>
                            </IconButton>
                        </span>
                        </div>
                    </div>}
                    <div ref={this.mentionContainerRefHandler} className="suggestion-list-container"/>
                    {Boolean(!selectable) && <>
                        <div ref={this.inputsRefHandler} className={`inputs mode-${this.inputsMode}`}>
                            <div className="user">
                                <UserAvatar id={this.props.userId || ''} className="user-avatar"/>
                            </div>
                            <div className={'input' + (this.state.rtl ? ' rtl' : ' ltr') + (isBot ? ' is-bot' : '')}>
                                <div className="textarea-container">
                                    <MentionsInput value={textareaValue}
                                                   onChange={this.handleChange}
                                                   inputRef={this.textareaRefHandler}
                                                   onKeyUp={this.inputKeyUpHandler}
                                                   onKeyDown={this.inputKeyDownHandler}
                                                   allowSpaceInQuery={true}
                                                   className="mention"
                                                   placeholder={this.isMobileView ? i18n.t('input.type') : i18n.t('input.type_your_message_here')}
                                                   style={defaultMentionInputStyle}
                                                   suggestionsPortalHost={this.mentionContainer}
                                                   spellCheck={true}
                                                   onFocus={this.props.onFocus}
                                    >
                                        <Mention
                                            trigger="@"
                                            type="mention"
                                            data={this.searchMentionHandler}
                                            className="mention-item"
                                            renderSuggestion={this.renderMentionSuggestion}
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
                                </div>
                                <div className={'emoji-wrapper' + (isBot ? ' is-bot' : '')}>
                                    {isBot && <span className="icon" onClick={this.toggleBotKeyboardHandler}>
                                        {botKeyboard ? <KeyboardRounded/> : <ViewModuleRounded/>}
                                </span>}
                                    <span className="icon" onClick={this.emojiHandleClick}>
                                    <SentimentSatisfiedRounded/>
                                </span>
                                    <PopUpMenu anchorEl={this.state.emojiAnchorEl} onClose={this.emojiHandleClose}>
                                        <Picker custom={[]} onSelect={this.emojiSelect} native={true}
                                                showPreview={false}/>
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
                                    <div className="cancel"
                                         onClick={this.voiceCancelHandler}>{i18n.t('general.cancel')}</div>
                                </React.Fragment>}
                                {Boolean(this.inputsMode === 'voice' && voiceMode === 'play') && <React.Fragment>
                                    <div className="play-remove" onClick={this.voiceCancelHandler}>
                                        <DeleteRounded/>
                                    </div>
                                    <VoicePlayer ref={this.voicePlayerRefHandler} className="play-frame"
                                                 maxValue={255.0}/>
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
                                <div className="icon attachment" onClick={this.openSelectMediaHandler}>
                                    <AttachFileRounded/>
                                    <SelectMedia ref={this.selectMediaRefHandler} onClose={this.selectMediaCloseHandler}
                                                 onAction={this.selectMediaActionHandler}/>
                                </div>
                                <div className="icon send" onClick={this.submitMessage}>
                                    <SendRounded/>
                                </div>
                            </div>
                        </div>
                        {isBot && botKeyboard && <div className="bot-keyboard">
                            {this.renderBotKeyboard()}
                        </div>}
                    </>}
                    {Boolean(selectable && !previewMessage) && <div className="actions">
                        <div className="left-action">
                            <Tooltip
                                title={i18n.t('input.close')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('close')}>
                                    <ClearRounded/>
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="right-action">
                            <Tooltip
                                title={i18n.t('chat.labels')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('labels')}
                                            disabled={selectableDisable}>
                                    <LabelRounded/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={i18n.t('input.remove')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('remove')}
                                            disabled={selectableDisable}>
                                    <DeleteRounded/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={i18n.t('input.forward')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('forward')}
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

    // add mention entities
    private modifyBody(text: string, entities?: MessageEntity.AsObject[]) {
        if (!entities) {
            return text;
        }
        if (entities.some(o => o.type === MessageEntityType.MESSAGEENTITYTYPEMENTION)) {
            text = mentionize(text, entities.filter(o => o.type === MessageEntityType.MESSAGEENTITYTYPEMENTION).map(o => {
                return {
                    length: o.length || 0,
                    offset: o.offset || 0,
                    val: o.userid || '',
                };
            }));
        }
        return text;
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
        const text = this.textarea.value || '';
        if (this.props.onMessage) {
            const entities = this.generateEntities();
            if (previewMessageMode === C_MSG_MODE.Normal) {
                this.removeDraft(true).finally(() => {
                    this.props.onMessage(text, {
                        entities,
                    });
                    this.checkFocus();
                });
            } else {
                this.clearPreviewMessage(true, () => {
                    const message = cloneDeep(previewMessage);
                    this.props.onMessage(text, {
                        entities,
                        message,
                        mode: previewMessageMode,
                    });
                    this.checkFocus();
                })();
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

    private inputKeyUpHandler = (e: any) => {
        const {previewMessage, previewMessageMode} = this.state;
        const text = e.target.value;
        this.rtlDetectorThrottle(text);
        let cancelTyping = false;
        if (e.key === 'Enter' && !e.shiftKey) {
            cancelTyping = true;
            setTimeout(() => {
                if (this.preventMessageSend) {
                    return;
                }
                if (this.props.onMessage) {
                    const entities = this.generateEntities();
                    if (previewMessageMode === C_MSG_MODE.Normal) {
                        this.removeDraft(true).finally(() => {
                            this.props.onMessage(text, {
                                entities,
                            });
                            this.checkFocus();
                        });
                    } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                        this.clearPreviewMessage(true, () => {
                            const message = cloneDeep(previewMessage);
                            this.props.onMessage(text, {
                                entities,
                                message,
                                mode: previewMessageMode,
                            });
                            this.checkFocus();
                        })();
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
            } else if (text.length > 0) {
                this.setTyping(TypingAction.TYPINGACTIONTYPING);
            }
        }
    }

    private mentionContainerRefHandler = (ref: any) => {
        this.mentionContainer = ref;
    }

    private textareaRefHandler = (ref: any) => {
        this.textarea = ref;
    }

    private inputKeyDownHandler = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
        } else if (e.keyCode === 38 && this.lastMessage &&
            this.lastMessage.senderid === this.props.userId &&
            this.state.previewMessageMode !== C_MSG_MODE.Edit &&
            this.textarea.value === '') {
            const message = this.lastMessage;
            if ((this.riverTime.now() - (message.createdon || 0)) < 86400 &&
                (message.fwdsenderid === '0' || !message.fwdsenderid) &&
                (message.messagetype === C_MESSAGE_TYPE.Normal || (message.messagetype || 0) === 0)) {
                e.preventDefault();
                if (this.props.onAction) {
                    this.props.onAction('edit', message)();
                }
            }
        } else if (e.keyCode === 27) {
            this.clearPreviewMessage(false)();
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
            this.focus();
        });
    }

    private emojiHandleClose = () => {
        this.setState({
            emojiAnchorEl: null,
        });
    }

    private detectRTL = (text: string) => {
        if (text.length === 0) {
            this.setState({
                rtl: this.rtl,
            });
            return;
        }
        const rtl = this.rtlDetector.direction(text);
        this.setState({
            rtl,
        });
    }

    private clearPreviewMessage = (removeDraft?: boolean, cb?: any) => (e?: any) => {
        this.setState({
            previewMessageHeight: 0,
        });
        setTimeout(() => {
            this.setState({
                previewMessage: null,
                previewMessageMode: C_MSG_MODE.Normal,
                voiceMode: 'up',
            }, () => {
                this.voiceStateChange();
            });
            this.setInputMode('default');
            if (this.props.onPreviewMessageChange) {
                this.props.onPreviewMessageChange(undefined, C_MSG_MODE.Normal);
            }
        }, 102);
        this.removeDraft(removeDraft).finally(() => {
            if (cb) {
                cb();
            }
        });
    }

    private removeDraft(removeDraft?: boolean) {
        if (removeDraft && this.state.peer) {
            const dialog = this.props.getDialog(this.state.peer.getId() || '');
            if (dialog && dialog.draft && dialog.draft.peerid) {
                if (this.props.onClearDraft && this.state.peer) {
                    this.props.onClearDraft({
                        peer: this.state.peer.toObject(),
                        ucount: 1,
                    });
                }
                return this.sdk.clearDraft(this.state.peer).then(() => {
                    if (this.state.peer) {
                        return this.dialogRepo.upsert([{
                            draft: {},
                            peerid: this.state.peer.getId() || '',
                        }]);
                    } else {
                        return Promise.resolve();
                    }
                });
            } else {
                return Promise.resolve();
            }
        } else {
            return Promise.resolve();
        }
    }

    private animatePreviewMessage() {
        setTimeout(() => {
            const el = document.querySelector('.chat-input .previews .preview-message-wrapper');
            if (el && this.state.previewMessage) {
                const targetEl = document.querySelector('.chat-input .previews');
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

    /* Check authority for composing message and etc. */
    private checkAuthority = (data?: any) => {
        const {peer, user} = this.state;
        if (!peer) {
            return;
        }
        if (data && data.ids.indexOf(peer.getId()) === -1) {
            return;
        }
        if (peer.getType() === PeerType.PEERGROUP) {
            this.groupRepo.get(peer.getId() || '').then((res) => {
                if (res) {
                    if ((res.flagsList || []).indexOf(GroupFlags.GROUPFLAGSNONPARTICIPANT) > -1) {
                        this.setState({
                            disableAuthority: 0x1,
                        });
                    } else if ((res.flagsList || []).indexOf(GroupFlags.GROUPFLAGSDEACTIVATED) > -1) {
                        this.setState({
                            disableAuthority: 0x2,
                        });
                    } else {
                        this.setState({
                            disableAuthority: 0x0,
                        });
                    }
                } else {
                    this.setState({
                        disableAuthority: 0x0,
                    });
                }
            });
        } else {
            if ((user && user.isbot && !user.is_bot_started) && (!this.lastMessage || (this.lastMessage && this.lastMessage.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory))) {
                this.setState({
                    disableAuthority: 0x3,
                });
            } else {
                this.setState({
                    disableAuthority: 0x0,
                });
            }
        }
    }

    /* Textarea change handler */
    private handleChange = (value: any, a: any, b: any, mentions: IMentions[]) => {
        if (this.mentions.length !== mentions.length) {
            clearTimeout(this.preventMessageSendTimeout);
            this.preventMessageSend = true;
            this.preventMessageSendTimeout = setTimeout(() => {
                this.preventMessageSend = false;
            }, 500);
        }
        this.mentions = mentions;
        this.setState({
            textareaValue: value.target.value,
        }, () => {
            this.computeLines();
        });
    }

    /* Compute line height based on break lines */
    private computeLines() {
        if (!this.textarea) {
            return;
        }
        let lines = 1;
        const nodeInfo = measureNodeHeight(this.textarea, 12312, false, 1, 12);
        if (nodeInfo) {
            lines = nodeInfo.rowCount;
        } else {
            lines = this.textarea.value.split('\n').length;
        }
        if (lines < 1) {
            lines = 1;
        }
        if (lines > 12) {
            lines = 12;
        }
        if (this.textarea && this.lastLines !== lines) {
            this.textarea.classList.remove(...textBoxClasses);
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
    private searchMentionHandler = (keyword: string, callback: any) => {
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
                group.photogalleryList = res.photogalleryList;
                group.hasUpdate = false;
                if (res && res.participantsList) {
                    searchParticipant(keyword, res.participantsList);
                }
                this.groupRepo.importBulk([group]);
                const contacts: IUser[] = [];
                res.participantsList.forEach((list) => {
                    contacts.push({
                        accesshash: list.accesshash,
                        firstname: list.firstname,
                        id: list.userid,
                        lastname: list.lastname,
                        username: list.username,
                    });
                });
                this.userRepo.importBulk(false, contacts);
            }).catch(() => {
                callback([]);
            });
        };
        this.groupRepo.get(peer.getId() || '').then((group) => {
            if (group && group.participantList && !group.hasUpdate) {
                searchParticipant(keyword, group.participantList);
            } else {
                getRemoteGroupFull();
            }
        }).catch(() => {
            getRemoteGroupFull();
        });
    }

    /* Mention suggestion renderer */
    private renderMentionSuggestion = (a: any, b: any, c: any, d: any, focused: any) => {
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
    private generateEntities(): MessageEntity[] | null {
        const entities: MessageEntity[] = [];
        if (this.mentions.length > 0) {
            this.mentions.filter((m) => {
                return m.id.indexOf(':') === -1 && m.id.indexOf('/') === -1;
            }).forEach((mention) => {
                const entity = new MessageEntity();
                entity.setOffset(mention.plainTextIndex);
                entity.setLength(mention.display.length);
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEMENTION);
                entity.setUserid(mention.id);
                entities.push(entity);
            });
            this.mentions.filter((c) => {
                return c.id.indexOf('/') === 0;
            }).forEach((command) => {
                const entity = new MessageEntity();
                entity.setOffset(command.plainTextIndex);
                entity.setLength(command.display.length);
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEBOTCOMMAND);
                entities.push(entity);
            });
        }
        if (this.textarea) {
            XRegExp.forEach(this.textarea.value, /\bhttps?:\/\/\S+/, (match) => {
                const entity = new MessageEntity();
                entity.setOffset(match.index);
                entity.setLength(match[0].length);
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEURL);
                entity.setUserid('');
                entities.push(entity);
            });
            const hashTagReg = XRegExp('#[\\p{L}_]+');
            XRegExp.forEach(this.textarea.value, hashTagReg, (match) => {
                const entity = new MessageEntity();
                entity.setOffset(match.index);
                entity.setLength(match[0].length);
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEHASHTAG);
                entity.setUserid('');
                entities.push(entity);
            });
        }
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
            this.initOldDraft(oldPeer, mode, message);
        }

        this.checkDraft(newPeer);
    }

    private initOldDraft(oldPeer: InputPeer, mode: number, message: IMessage | null) {
        const oldPeerObj = oldPeer.toObject();
        const draftMessage: DraftMessage.AsObject = {
            body: this.state.textareaValue,
            date: this.riverTime.now(),
            entitiesList: message ? message.entitiesList : undefined,
            peerid: oldPeerObj.id || '',
            peertype: message ? message.peertype : undefined,
            replyto: message ? message.id : undefined,
        };
        if ((draftMessage.body || '').length > 0 || (mode && mode !== C_MSG_MODE.Normal)) {
            this.sdk.saveDraft(oldPeer, draftMessage.body || '', draftMessage.replyto, draftMessage.entitiesList).then(() => {
                this.dialogRepo.lazyUpsert([{
                    draft: draftMessage,
                    peerid: oldPeerObj.id || '',
                }]);
            });
        } else {
            const oldDialog = cloneDeep(this.props.getDialog(oldPeerObj.id || ''));
            if (oldDialog && oldDialog.draft && oldDialog.draft.peerid) {
                if (this.props.onClearDraft && this.state.peer) {
                    this.props.onClearDraft({
                        peer: this.state.peer.toObject(),
                        ucount: 1,
                    });
                }
                this.sdk.clearDraft(oldPeer).then(() => {
                    this.dialogRepo.lazyUpsert([{
                        draft: {},
                        peerid: oldPeerObj.id || '',
                    }]);
                });
            }
        }
    }

    /* Modify textarea and preview message */
    private changePreviewMessage(text: string, mode: number | undefined, msg: IMessage | null, callback?: any) {
        text = this.modifyBody(text, msg ? msg.entitiesList : []);
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
        if (mode === C_MSG_MODE.Normal || !msg) {
            this.clearPreviewMessage()();
        }
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
        if (!this.recorder || !this.recorder.start) {
            return;
        }
        this.setInputMode('voice');
        this.bars = [];
        this.maxBarVal = 0;
        try {
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
        } catch (e) {
            clearInterval(this.timerInterval);
            clearTimeout(this.typingTimeout);
            this.timerDuration = 0;
        }
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
            }, () => {
                this.voiceStateChange();
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
            }, () => {
                this.voiceStateChange();
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
            }, () => {
                this.voiceStateChange();
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
            }, () => {
                this.voiceStateChange();
            });
        }
    }

    /* Voice anchor mouse down handler */
    private voiceMouseClickHandler = () => {
        if (this.state.voiceMode === 'lock') {
            this.voiceRecordEnd();
            this.setState({
                voiceMode: 'play',
            }, () => {
                this.voiceStateChange();
            });
        } else if (this.state.voiceMode === 'play') {
            this.sendVoice();
        }
    }

    /* Send voice */
    private sendVoice() {
        if (this.timerDuration >= 1 && this.voice) {
            const {previewMessage, previewMessageMode} = this.state;
            const message = cloneDeep(previewMessage);
            const item: IMediaItem = {
                duration: this.timerDuration,
                file: this.voice,
                fileType: 'audio/ogg',
                mediaType: 'voice',
                name: `voice_${Math.floor(Date.now() / 1000)}.ogg`,
                waveform: to4bitResolution(this.bars),
            };
            this.props.onVoiceSend(item, {
                message,
                mode: previewMessageMode,
            });
        } else {
            this.stopTimer();
        }
        this.clearPreviewMessage(true)();
    }

    /* Window click handler */
    private windowMouseUp = () => {
        if (!this.voiceMouseIn) {
            return;
        }
        this.voiceMouseIn = false;
    }

    /* Window key up handler */
    private windowKeyUp = (e: any) => {
        if (this.state.selectable && e.keyCode === 27) {
            this.props.onBulkAction('close')();
        }
    }

    /* Window resize handler */
    private windowResizeHandler = () => {
        const el = document.querySelector('.chat-input .inputs .voice-recorder .preview, .chat-input .inputs .voice-recorder .play-preview');
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
        }, () => {
            this.voiceStateChange();
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
            if (this.state.voiceMode === 'play' && this.voicePlayerRef) {
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
        clearTimeout(this.typingTimeout);
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
        if (this.typingThrottle !== null) {
            this.typingThrottle.cancel();
        }
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
        if (e.currentTarget.files.length > 0) {
            const files: File[] = [];
            for (let i = 0; i < e.currentTarget.files.length; i++) {
                files.push(e.currentTarget.files[i]);
            }
            switch (this.state.mediaInputMode) {
                case 'media':
                case 'music':
                    if (this.mediaPreviewRef) {
                        this.mediaPreviewRef.openDialog(files);
                    }
                    break;
                case 'file':
                    if (this.mediaPreviewRef) {
                        this.mediaPreviewRef.openDialog(files, true);
                    }
                    break;
            }
            if (this.fileInputRef) {
                this.fileInputRef.value = '';
            }
        }
    }

    /* Set typing */
    private setTyping(typing: TypingAction) {
        if (!this.props.onTyping || (this.props.peer && (this.props.peer.getId() === this.props.userId || this.props.peer.getId() === '2374'))) {
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
                }, C_TYPING_INTERVAL);
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
                }, C_TYPING_INTERVAL);
            }
        }
    }

    /* Open SelectMedia handler */
    private openSelectMediaHandler = (e: any) => {
        e.stopPropagation();
        if (this.selectMediaRef) {
            this.selectMediaRef.toggle();
        }
    }

    /* SelectMedia close handler */
    private selectMediaCloseHandler = () => {
        //
    }

    private selectMediaActionHandler = (mode: 'media' | 'music' | 'file' | 'contact' | 'location') => (e: any) => {
        this.setState({
            mediaInputMode: mode,
        }, () => {
            switch (mode) {
                case 'media':
                case 'music':
                case 'file':
                    this.openFileDialog();
                    break;
                case 'contact':
                    if (this.contactPickerRef) {
                        this.contactPickerRef.openDialog();
                    }
                    break;
                case 'location':
                    if (this.mapPickerRef) {
                        this.mapPickerRef.openDialog();
                    }
                    break;
            }
        });
    }

    private mediaPreviewRefHandler = (ref: any) => {
        this.mediaPreviewRef = ref;
    }

    private contactPickerRefHandler = (ref: any) => {
        this.contactPickerRef = ref;
    }

    private mapPickerRefHandler = (ref: any) => {
        this.mapPickerRef = ref;
    }

    private getFileType = () => {
        const {mediaInputMode} = this.state;
        switch (mediaInputMode) {
            case 'media':
                return 'image/png,image/jpeg,image/jpg,image/gif,image/webp,video/webm,video/mp4';
            case 'music':
                return "audio/mp4,audio/ogg,audio/mp3";
            case 'file':
            default:
                return '*';
        }
    }

    private getUploaderInput(mimeType: string) {
        switch (mimeType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/gif':
            case 'image/webp':
            case 'video/webm':
            case 'video/mp4':
                return 'media';
            case 'audio/mp4':
            case 'audio/ogg':
            case 'audio/mp3':
                return 'music';
            default:
                return 'file';
        }
    }

    /* Send media handler */
    private mediaPreviewDoneHandler = (items: IMediaItem[]) => {
        const {mediaInputMode, previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        switch (mediaInputMode) {
            case 'media':
            case 'music':
            case 'file':
                if (this.props.onMediaSelected) {
                    this.props.onMediaSelected(items, {
                        message,
                        mode: previewMessageMode,
                    });
                }
                break;
        }
        this.clearPreviewMessage(true)();
    }

    /* Send contact handler */
    private contactImportDoneHandler = (users: IUser[], caption: string) => {
        const {previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        if (this.props.onContactSelected) {
            this.props.onContactSelected(users, caption, {
                message,
                mode: previewMessageMode,
            });
        }
        this.clearPreviewMessage(true)();
    }

    private mapDoneDoneHandler = (data: IGeoItem) => {
        const {previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        if (this.props.onMapSelected) {
            this.props.onMapSelected(data, {
                message,
                mode: previewMessageMode,
            });
        }
        this.clearPreviewMessage(true)();
    }

    private getThumbnail() {
        const {previewMessage} = this.state;
        if (!previewMessage) {
            return '';
        }
        switch (previewMessage.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
                const info = getMediaInfo(previewMessage);
                return (
                    <div className="preview-thumbnail">
                        <CachedPhoto className="thumbnail" fileLocation={info.thumbFile}/>
                    </div>
                );
            default:
                return '';
        }
    }

    private voiceStateChange() {
        if (this.props.onVoiceStateChange) {
            this.props.onVoiceStateChange(this.state.voiceMode);
        }
    }

    /* Search emoji */
    private searchEmojiHandler = (keyword: string, callback: any) => {
        const emojis: any[] = [];
        keyword = keyword.toLowerCase();
        if (keyword && keyword !== '') {
            for (let i = 0; i < emojiList.length && emojis.length < limit; i++) {
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
            if (freq) {
                const freqData = JSON.parse(freq);
                let freqList: Array<{ cnt: number, val: string }> = [];
                Object.keys(freqData).forEach((key) => {
                    freqList.push({
                        cnt: freqData[key],
                        val: key,
                    });
                });
                freqList = sortBy(freqList, 'cnt').reverse();
                for (let i = 0; i < freqList.length && emojis.length < limit; i++) {
                    const emoji = this.emojiMap[freqList[i].val];
                    if (emoji) {
                        emojis.push({
                            display: emojiList[emoji].d,
                            id: `:${emojiList[emoji].n}`,
                            index: i,
                        });
                    }
                }
            }
            for (let i = 0; i < limit && emojis.length < limit; i++) {
                emojis.push({
                    display: emojiList[i].d,
                    id: `:${emojiList[i].n}`,
                    index: i,
                });
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
        const {isBot, user} = this.state;
        if (!isBot || !user) {
            callback([]);
            return;
        }
        const fn = (u: IUser) => {
            if (u && u.botinfo && u.botinfo.botcommandsList.length > 0) {
                const reg = new RegExp(keyword, "i");
                callback(u.botinfo.botcommandsList.filter(o => {
                    return reg.test(o.command || '');
                }).slice(0, 7).map((c, i) => {
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
        if (user && user.botinfo) {
            fn(user);
        } else {
            this.userRepo.getFull(user.id || '', undefined, undefined, true).then((res) => {
                fn(res);
            });
        }
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

    /* Window paste handler */
    private windowPasteHandler = (e: any) => {
        if (e.clipboardData && e.clipboardData.items) {
            const files: any[] = [];
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                const item = e.clipboardData.items[i];
                if (item.kind === 'file') {
                    files.push(item.getAsFile());
                }
            }
            if (files.length > 0) {
                this.openUploader(files);
            }
        }
    }

    private checkFocus() {
        if (this.textarea && this.isMobileBrowser) {
            this.textarea.focus();
        }
    }

    private unblockHandler = () => {
        const {user} = this.state;
        if (!user) {
            return;
        }
        const inputUser = new InputUser();
        inputUser.setUserid(user.id || '');
        inputUser.setAccesshash(user.accesshash || '');
        this.sdk.accountUnblock(inputUser).then(() => {
            user.blocked = false;
            this.setState({
                user,
            });
        });
    }

    private getUser = (data?: any) => {
        const {user} = this.state;
        if ((data && user && (data.callerId === this.callerId || data.ids.indexOf(user.id || '') === -1)) || !user) {
            return;
        }
        this.userRepo.get(user.id || '').then((res) => {
            this.setState({
                user: res,
            });
        });
    }

    private selectMediaRefHandler = (ref: any) => {
        this.selectMediaRef = ref;
    }

    private startBotHandler = () => {
        this.props.onAction('start_bot')();
        const {user} = this.state;
        if (user) {
            user.is_bot_started = true;
            this.setState({
               user,
            }, () => {
                this.checkAuthority();
            });
        }
    }

    private toggleBotKeyboardHandler = () => {
        this.setState({
            botKeyboard: !this.state.botKeyboard,
        });
    }

    private renderBotKeyboard() {
        if (!this.botKeyboard || !this.botKeyboard.layout) {
            return '';
        }
        let height = this.botKeyboard.layout.rowsList.length * 32 + 4;
        if (height > 110) {
            height = 110;
            return (<div style={{height: `${height}px`}}>
                <Scrollbars
                    hideTracksWhenNotNeeded={false}
                    universal={true}>
                    <BotLayout rows={(this.botKeyboard ? this.botKeyboard.layout.rowsList : undefined)}
                               prefix="keyboard-bot" onAction={this.props.onBotButtonAction}/>
                </Scrollbars>
            </div>);
        }
        return (<BotLayout rows={(this.botKeyboard ? this.botKeyboard.layout.rowsList : undefined)}
                           prefix="keyboard-bot" onAction={this.props.onBotButtonAction}/>);
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

export default ChatInput;
