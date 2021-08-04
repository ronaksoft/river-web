/*
    Creation Time: 2018 - Aug - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

/* eslint import/no-webpack-loader-syntax: off */
import React, {Suspense} from 'react';
import {cloneDeep, range, throttle, trimStart} from 'lodash';
import {
    AttachFileRounded,
    ClearRounded,
    DeleteRounded,
    ForwardRounded,
    GifRounded,
    KeyboardRounded,
    KeyboardVoiceRounded,
    LabelRounded,
    LockRounded,
    SendRounded,
    SentimentSatisfiedRounded,
    StopRounded,
    ViewModuleRounded,
} from '@material-ui/icons';
import UserAvatar from '../UserAvatar';
import RTLDetector from '../../services/utilities/rtl_detector';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import {C_MSG_MODE} from './consts';
import {
    DraftMessage,
    GroupFlags,
    InputPeer,
    InputUser,
    MediaType,
    MessageEntity,
    MessageEntityType,
    PeerType,
    TypingAction,
} from '../../services/sdk/messages/core.types_pb';
import GroupRepo, {GroupDBUpdated} from '../../repository/group';
import UserRepo, {UserDBUpdated} from '../../repository/user';
import APIManager from '../../services/sdk';
import {IUser} from '../../repository/user/interface';
import DialogRepo, {GetPeerName} from '../../repository/dialog';
// @ts-ignore
import Recorder from 'opus-recorder/dist/recorder.min';
import VoicePlayer from '../VoicePlayer';
import {to4bitResolution} from './utils';
import {measureNodeHeight} from './measureHeight';
import {getMessageTitle} from '../Dialog/utils';
import XRegExp from 'xregexp';
import SelectMedia from '../SelectMedia';
import {getUploaderInput, IMediaItem, IUploaderOptions} from '../Uploader';
import ContactPicker from '../ContactPicker';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE, C_REPLY_ACTION} from '../../repository/message/consts';
import RiverTime from '../../services/utilities/river_time';
import Broadcaster from '../../services/broadcaster';
import MapPicker, {IGeoItem} from '../MapPicker';
import CachedPhoto from "../CachedPhoto";
import {getDuration, getMediaInfo} from "../MessageMedia";
import i18n from '../../services/i18n';
import {IDialog} from "../../repository/dialog/interface";
import MessageRepo from "../../repository/message";
import {UpdateDraftMessageCleared} from "../../services/sdk/messages/updates_pb";
import {emojiList} from "./emojis";
import {isMobile} from "../../services/utilities/localize";
import UniqueId from "../../services/uniqueId";
import {ReplyKeyboardForceReply, ReplyKeyboardMarkup} from "../../services/sdk/messages/chat.messages.markups_pb";
import BotLayout from "../BotLayout";
import Scrollbars from "react-custom-scrollbars";
import {ThemeChanged} from "../SettingsMenu";
import {EventKeyUp, EventMouseUp, EventPaste, EventResize} from "../../services/events";
import MentionInput, {IMention, mentionize} from "../MentionInput";
import {getMessageIcon} from "../DialogMessage";
import {getMapLocation} from "../MessageLocation";
import {MediaContact, MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";
import {getHumanReadableSize} from "../MessageFile";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {IconButton, Popover, PopoverPosition, Tab, Tabs, Tooltip} from '@material-ui/core';
import {IGif} from "../../repository/gif/interface";
import {Sticker} from "../SVG/sticker";
import {getDefaultAudio} from "../SettingsMediaInput";
import {canEditMessage, isEditableMessageType} from "../Message";
import {Loading} from "../Loading";

import 'emoji-mart/css/emoji-mart.css';
import './style.scss';

const EmojiContainer = React.lazy(() => import('./emojiContainer'));
const GifPicker = React.lazy(() => import('../GifPicker'));

export type shiftArrow = 'up' | 'right' | 'down' | 'left' | 'cancel';

const codeBacktick = (text: string, sortedEntities: Array<{ offset: number, length: number, val: string }>) => {
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
        text = fn(text, '```' + text.substr(en.offset, en.length) + '```', en.offset, en.length);
    });
    return text;
};

/* Generate entities for message */
export const generateEntities = (text: string, mentions: IMention[]): { entities: MessageEntity[] | null, text: string } => {
    if (text === '') {
        return {entities: null, text: ''};
    }
    const entities: MessageEntity[] = [];
    // Code extractor
    const removeRange = (str: string, from: number, len: number) => {
        return str.substring(0, from) + str.substring(from + len);
    };
    const codeResult: any[] = [];
    const codeReg = XRegExp('```([\\s\\S]*?)```');
    const codeStarts: number[] = [];
    XRegExp.forEach(text, codeReg, (match, index) => {
        const start = match.index - (6 * index);
        const len = match[1].length;
        text = removeRange(text, start, 3);
        text = removeRange(text, start + len, 3);
        const entity = new MessageEntity();
        entity.setOffset(start);
        entity.setLength(len);
        entity.setType(MessageEntityType.MESSAGEENTITYTYPECODE);
        entity.setUserid('0');
        entities.push(entity);
        codeResult.push({
            len,
            start,
        });
        codeStarts.push(start);
    });
    // Make sure code stays un touched
    const underlineRange = (str: string, from: number, len: number) => {
        return str.substring(0, from) + range(len).map(o => '_') + str.substring(from + len);
    };
    let underlineText = text;
    if (codeResult.length > 0) {
        codeResult.forEach((r) => {
            underlineText = underlineRange(underlineText, r.start, r.len);
        });
    }
    XRegExp.forEach(underlineText, /(\bhttps?:\/\/\S+)|(\brvr:\/\/\S+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.com|\.org|\.net|\.im|\.ir))/, (match) => {
        const entity = new MessageEntity();
        entity.setOffset(match.index);
        entity.setLength(match[0].length);
        entity.setType(MessageEntityType.MESSAGEENTITYTYPEURL);
        entity.setUserid('0');
        entities.push(entity);
    });
    const hashTagReg = XRegExp('#[\\p{L}_]+');
    XRegExp.forEach(underlineText, hashTagReg, (match) => {
        const entity = new MessageEntity();
        entity.setOffset(match.index);
        entity.setLength(match[0].length);
        entity.setType(MessageEntityType.MESSAGEENTITYTYPEHASHTAG);
        entity.setUserid('0');
        entities.push(entity);
    });
    codeStarts.sort((a, b) => b - a);
    const getOffsetForCode = (strt: number) => {
        for (let i = 0; i < codeStarts.length; i++) {
            if (strt > codeStarts[i]) {
                return (codeStarts.length - i) * 6;
            }
        }
        return 0;
    };
    if (mentions.length > 0) {
        mentions.filter((m) => {
            return m.id.indexOf(':') === -1 && m.id.indexOf('/') === -1;
        }).forEach((mention) => {
            const entity = new MessageEntity();
            const offset = getOffsetForCode(mention.plainTextIndex);
            entity.setOffset(mention.plainTextIndex - offset);
            entity.setLength(mention.display.length);
            if (mention.id === 'all') {
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEMENTIONALL);
            } else {
                entity.setType(MessageEntityType.MESSAGEENTITYTYPEMENTION);
                entity.setUserid(mention.id);
            }
            entities.push(entity);
            underlineText = underlineRange(underlineText, mention.plainTextIndex - offset, mention.display.length);
        });
        mentions.filter((c) => {
            return c.id.indexOf('/') === 0;
        }).forEach((command) => {
            const entity = new MessageEntity();
            entity.setOffset(command.plainTextIndex);
            entity.setLength(command.display.length);
            entity.setType(MessageEntityType.MESSAGEENTITYTYPEBOTCOMMAND);
            entities.push(entity);
        });
    }
    const mentionReg = XRegExp(/\B@([a-zA-Z][\da-zA-Z]{4,31})/);
    XRegExp.forEach(underlineText, mentionReg, (match) => {
        const entity = new MessageEntity();
        entity.setOffset(match.index);
        entity.setLength(match[0].length);
        entity.setType(MessageEntityType.MESSAGEENTITYTYPEMENTION);
        entity.setUserid('0');
        entities.push(entity);
    });
    // const fn = (f: number, l: number, e: any) => {
    //     const entity = new MessageEntity();
    //     entity.setOffset(f);
    //     entity.setLength(l);
    //     entity.setType(e);
    //     entity.setUserid('');
    //     entities.push(entity);
    // };
    //
    // fn(5, 7, MessageEntityType.MESSAGEENTITYTYPEBOLD);
    // fn(6, 10, MessageEntityType.MESSAGEENTITYTYPEITALIC);
    // fn(7, 3, MessageEntityType.MESSAGEENTITYTYPEHASHTAG);
    // fn(10, 5, MessageEntityType.MESSAGEENTITYTYPEEMAIL);
    //  text = "hi this is kk and nice to meet you";
    return {entities, text};
};

export const canSendMessage = (text: string, mode: number, message: IMessage) => {
    return !(trimStart(text).length === 0 && (mode !== C_MSG_MODE.Edit ||
        (mode === C_MSG_MODE.Edit && message && (!message.messagetype || message.messagetype === C_MESSAGE_TYPE.Normal))));
};

enum HideInputReason {
    Empty = 0,
    NotAllowed = 1,
    OnlyAdmin = 2,
    NotTeamMember = 3,
};

export interface IMessageParam {
    entities?: MessageEntity[] | null;
    mode?: number;
    message?: IMessage | null;
    peer?: InputPeer | null;
}

interface IProps {
    getDialog: (peerName: string) => IDialog | null;
    onAction: (cmd: string, message?: IMessage) => (e?: any) => void;
    onBulkAction: (cmd: string) => (e?: any) => void;
    onClearDraft?: (data: Partial<UpdateDraftMessageCleared.AsObject>) => void;
    onFileSelect: (files: File[], options: IUploaderOptions) => void;
    onContactSelect: (users: IUser[], caption: string, params: IMessageParam) => void;
    onMapSelect: (item: IGeoItem, params: IMessageParam) => void;
    onTextSend: (text: string, params: IMessageParam) => void;
    onPreviewMessageChange?: (previewMessage: IMessage | undefined, previewMessageMode: number) => void;
    onTyping?: (typing: TypingAction) => void;
    onVoiceSend: (item: IMediaItem, params: IMessageParam) => void;
    onVoiceStateChange?: (state: 'lock' | 'down' | 'up' | 'play') => void;
    onBotButtonAction?: (cmd: number, data: any) => void;
    onMessageDrop?: (message: IMessage, caption: string, params: IMessageParam) => void;
    peer: InputPeer | null;
    previewMessage?: IMessage;
    previewMessageMode?: number;
    userId?: string;
    onFocus?: () => void;
    onGifSelect: (item: IGif, viaBotId?: string) => void;
    onChatClose: () => void;
    onShitKeyArrow: (arrow: shiftArrow) => void;
}

interface IState {
    botKeyboard: boolean;
    disableAuthority: number;
    droppedMessage: IMessage | null;
    inputMode: 'voice' | 'text' | 'attachment' | 'default';
    isBot: boolean;
    mediaInputMode: 'media' | 'audio' | 'contact' | 'location' | 'file' | 'none';
    peer: InputPeer | null;
    pickerAnchorPos: PopoverPosition | undefined;
    pickerTab: number;
    previewMessage: IMessage | null;
    previewMessageHeight: number;
    previewMessageMode: number;
    rtl: boolean;
    selectable: boolean;
    selectableDisable: boolean;
    selectableHasPending: boolean;
    textareaValue: string;
    uploadPreviewOpen: boolean;
    user: IUser | null;
    voiceMode: 'lock' | 'down' | 'up' | 'play';
    hideInput: boolean;
    hideInputReason: HideInputReason;
}

const mentionInputStyle = {
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
export const C_TYPING_INTERVAL_OFFSET = 2500;

const textBoxClasses: string[] = range(1, 13).map(o => `_${o}-line`);

interface IKeyboardBotData {
    data: ReplyKeyboardMarkup.AsObject | ReplyKeyboardForceReply.AsObject | undefined;
    mode: number;
    msgId: number;
}

class ChatInput extends React.Component<IProps, IState> {
    // teamId
    private teamId: string = '0';
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
    private apiManager: APIManager;
    private mentions: IMention[] = [];
    private lastMentionsCount: number = 0;
    private waveRef: any = null;
    private canvasRef: any = null;
    private canvasCtx: CanvasRenderingContext2D | null = null;
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
    private contactPickerRef: ContactPicker | undefined;
    private mapPickerRef: MapPicker | undefined;
    private riverTime: RiverTime;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private rtl: boolean = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';
    private preventMessageSend: boolean = false;
    private preventMessageSendTimeout: any = null;
    private emojiMap: { [key: string]: number } = {};
    private isMobileBrowser = isMobile();
    private callerId: number = UniqueId.getRandomId();
    private selectMediaRef: SelectMedia | undefined;
    private botKeyboard: IKeyboardBotData | undefined;
    private firstLoad: boolean = true;
    private microphonePermission: boolean = false;
    private startPosHold: number = 0;
    private recordingVoice: boolean = false;
    private loading: boolean = false;
    private selectWithArrow: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.userRepo = UserRepo.getInstance();

        const user = props.peer && (props.peer.getType() === PeerType.PEERUSER && props.peer.getType() === PeerType.PEEREXTERNALUSER) ? this.userRepo.getInstant(props.peer.getId() || '') : null;

        this.state = {
            botKeyboard: false,
            disableAuthority: 0x0,
            droppedMessage: null,
            hideInput: user ? (user.id === '2374' || user.deleted) : false,
            hideInputReason: HideInputReason.Empty,
            inputMode: 'default',
            isBot: false,
            mediaInputMode: 'none',
            peer: props.peer,
            pickerAnchorPos: undefined,
            pickerTab: 0,
            previewMessage: props.previewMessage || null,
            previewMessageHeight: 0,
            previewMessageMode: props.previewMessageMode || C_MSG_MODE.Normal,
            rtl: this.rtl,
            selectable: false,
            selectableDisable: false,
            selectableHasPending: false,
            textareaValue: '',
            uploadPreviewOpen: false,
            user,
            voiceMode: 'up',
        };

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 250);

        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.apiManager = APIManager.getInstance();
        this.riverTime = RiverTime.getInstance();

        // @ts-ignore
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.broadcaster = Broadcaster.getInstance();

        emojiList.forEach((emoji, index) => {
            this.emojiMap[emoji.n] = index;
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.checkAuthority()));
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.checkAuthority()));
        this.eventReferences.push(this.broadcaster.listen(ThemeChanged, this.windowResizeHandler));
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
        window.addEventListener(EventMouseUp, this.windowMouseUp);
        window.addEventListener(EventKeyUp, this.windowKeyUp);
        window.addEventListener(EventResize, this.windowResizeHandler);
        window.addEventListener(EventPaste, this.windowPasteHandler);
        this.checkAuthority()();
        this.initDraft(null, this.props.peer, 0, null);
    }

    public setPeer(teamId: string, peer: InputPeer | null) {
        this.teamId = teamId;
        if (peer && this.state.peer !== peer) {
            this.firstLoad = true;
            this.botKeyboard = undefined;
            this.preventMessageSend = false;
            if (this.typingThrottle) {
                this.typingThrottle.cancel();
            }
            if (this.state.voiceMode === 'lock' || this.state.voiceMode === 'down') {
                this.voiceCancelHandler();
            }
            const user = (peer.getType() === PeerType.PEERUSER || peer.getType() === PeerType.PEEREXTERNALUSER) ? this.userRepo.getInstant(peer.getId() || '') : null;
            this.setState({
                disableAuthority: 0x0,
                hideInput: user ? (user.id === '2374' || user.deleted) : false,
                hideInputReason: HideInputReason.NotAllowed,
                peer,
                user,
            }, () => {
                this.checkAuthority()();
            });
            if ((peer.getType() === PeerType.PEERUSER || peer.getType() === PeerType.PEEREXTERNALUSER) && !user) {
                this.userRepo.get(peer.getId() || '').then((res) => {
                    if (res) {
                        this.setState({
                            hideInput: res ? (res.id === '2374' || res.deleted) : false,
                            hideInputReason: HideInputReason.NotAllowed,
                            user: res,
                        });
                    }
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

    public setTeamId(teamId: string) {
        this.teamId = teamId;
    }

    public setParams(teamId: string, peer: InputPeer | null, previewMessageMode?: number, previewMessage?: IMessage) {
        this.teamId = teamId;
        if ((previewMessageMode === C_MSG_MODE.Edit || previewMessageMode === C_MSG_MODE.Reply) && this.state.selectable) {
            this.setInputMode('default');
            if (this.props.onPreviewMessageChange) {
                this.props.onPreviewMessageChange(undefined, C_MSG_MODE.Normal);
            }
            this.selectWithArrow = false;
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
            let text: string = '';
            if (!previewMessage.messagetype || previewMessage.messagetype === C_MESSAGE_TYPE.Normal) {
                text = this.modifyBody(previewMessage.body || '', previewMessage.entitiesList);
            } else if (isEditableMessageType(previewMessage.messagetype)) {
                text = this.modifyBody((previewMessage.mediadata as MediaDocument.AsObject).caption, (previewMessage.mediadata as MediaDocument.AsObject).entitiesList);
            }
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
                this.selectWithArrow = false;
            }
        });
        if (peer && this.state.peer !== peer) {
            this.selectWithArrow = false;
            this.firstLoad = true;
            this.botKeyboard = undefined;
            this.preventMessageSend = false;
            if (this.typingThrottle) {
                this.typingThrottle.cancel();
            }
            if (this.state.voiceMode === 'lock' || this.state.voiceMode === 'down') {
                this.voiceCancelHandler();
            }
            const user = (peer.getType() === PeerType.PEERUSER || peer.getType() === PeerType.PEEREXTERNALUSER) ? this.userRepo.getInstant(peer.getId() || '') : null;
            this.setState({
                hideInput: user ? (user.id === '2374' || user.deleted) : false,
                hideInputReason: HideInputReason.NotAllowed,
                peer,
                user,
            }, () => {
                this.checkAuthority()();
            });
            if ((peer.getType() === PeerType.PEERUSER || peer.getType() === PeerType.PEEREXTERNALUSER) && !user) {
                this.userRepo.get(peer.getId() || '').then((res) => {
                    if (res) {
                        this.setState({
                            hideInput: res ? (res.id === '2374' || res.deleted) : false,
                            hideInputReason: HideInputReason.NotAllowed,
                            user: res,
                        });
                    }
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

    public setSelectable(enable: boolean, disable: boolean, ids: string[]) {
        const hasPending = ids.some(o => parseInt(o, 10) < 0);
        if (enable !== this.state.selectable || disable !== this.state.selectableDisable) {
            this.clearPreviewMessage(false, () => {
                this.setState({
                    selectable: enable,
                    selectableDisable: disable,
                    selectableHasPending: hasPending,
                });
            })();
        } else if (hasPending !== this.state.selectableHasPending) {
            this.setState({
                selectableHasPending: hasPending,
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
        if (this.recorder) {
            this.recorder.close();
        }
        if (this.typingThrottle) {
            this.typingThrottle.cancel();
        }
        this.selectWithArrow = false;
    }

    public getUploaderOptions(): IUploaderOptions {
        return {
            accept: this.getFileType(),
            isFile: this.state.mediaInputMode === 'file',
            message: this.state.previewMessage,
            mode: this.state.previewMessageMode,
        };
    }

    public focus(pos?: number) {
        setTimeout(() => {
            if (!this.textarea) {
                return;
            }
            if (pos) {
                this.textarea.setSelectionRange(pos, pos);
            } else if (this.textarea.value && this.textarea.selectionStart === 0) {
                this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
            }
            this.textarea.focus();
        }, 100);
    }

    public updateLastMessage() {
        if (this.state.isBot && this.state.peer) {
            const peerObj = this.state.peer.toObject();
            const peerName = GetPeerName(peerObj.id, peerObj.type);
            const dialog = cloneDeep(this.props.getDialog(peerName));
            if (dialog) {
                this.messageRepo.getLastMessage(this.teamId, peerObj.id || '', peerObj.type || 0, 'in').then((message) => {
                    if ((message && message.id === dialog.topmessageid && message.replymarkup === C_REPLY_ACTION.ReplyKeyboardForceReply) && (!this.state.previewMessage || (this.state.previewMessageMode === C_MSG_MODE.Reply && this.state.previewMessage.id !== message.id))) {
                        this.props.onAction('reply', message)();
                    }
                    this.checkAuthority()();
                });
            }
        }
    }

    public checkDraft(newPeer?: InputPeer) {
        if (!this.state.peer && !newPeer) {
            return;
        }
        const newPeerObj = newPeer ? newPeer.toObject() : this.state.peer ? this.state.peer.toObject() : null;
        if (!newPeerObj) {
            return;
        }
        const dialog = cloneDeep(this.props.getDialog(GetPeerName(newPeerObj.id, newPeerObj.type)));
        if (!dialog || !dialog.draft || !dialog.draft.peerid) {
            this.changePreviewMessage('', C_MSG_MODE.Normal, null);
            return;
        }
        if (dialog.draft.replyto) {
            this.messageRepo.get(dialog.draft.replyto, this.state.peer, this.teamId).then((msg) => {
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

    public setBot(peer: InputPeer | null, isBot: boolean, data: IKeyboardBotData | undefined) {
        if (this.firstLoad && peer) {
            this.firstLoad = false;
            this.messageRepo.getLastMessage(this.teamId, peer.getId() || '', peer.getType() || 0, 'in').then((msg) => {
                this.checkAuthority(msg)();
                if (msg) {
                    if ((!this.botKeyboard || (this.botKeyboard && this.botKeyboard.msgId < (msg.id || 0))) && msg.replymarkup === C_REPLY_ACTION.ReplyKeyboardMarkup) {
                        this.botKeyboard = {
                            data: msg.replydata,
                            mode: C_REPLY_ACTION.ReplyKeyboardMarkup,
                            msgId: msg.id || 0,
                        };
                        this.forceUpdate();
                    }
                }
            });
        }
        if ((data && data.mode === C_REPLY_ACTION.ReplyKeyboardMarkup) && ((this.botKeyboard && this.botKeyboard.msgId < data.msgId) || !this.botKeyboard)) {
            const lastKeyboard = this.botKeyboard;
            if (!this.state.botKeyboard && (!lastKeyboard || (lastKeyboard && data && lastKeyboard.msgId !== data.msgId))) {
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
            if (this.botKeyboard) {
                this.botKeyboard.data = data ? data.data : undefined;
            }
            this.setState({
                isBot,
            });
        } else if (isBot) {
            if (this.botKeyboard) {
                this.botKeyboard.data = data ? data.data : undefined;
            }
            this.setState({
                isBot,
            });
        }
    }

    public loadMessage(id: number) {
        this.messageRepo.get(id).then((message) => {
            if (message) {
                let text = '';
                if (message.mediatype === MediaType.MEDIATYPEDOCUMENT) {
                    const info = getMediaInfo(message);
                    text = this.modifyBody(info.caption || '', info.entityList);
                } else {
                    text = this.modifyBody(message.body || '', message.entitiesList);
                }
                this.setState({
                    droppedMessage: message,
                    textareaValue: text,
                }, () => {
                    if (message && message.messagetype && message.messagetype !== C_MESSAGE_TYPE.Normal) {
                        this.animatePreviewMessage();
                    }
                    this.computeLines();
                });
            }
        });
    }

    public clearPreviewMessage = (removeDraft?: boolean, cb?: any) => (e?: any) => {
        if (this.state.previewMessageHeight > 0 || this.state.inputMode === 'voice') {
            this.setState({
                previewMessageHeight: 0,
            });
            setTimeout(() => {
                this.setState({
                    droppedMessage: null,
                    inputMode: 'default',
                    previewMessage: null,
                    previewMessageMode: C_MSG_MODE.Normal,
                    textareaValue: this.state.previewMessageMode === C_MSG_MODE.Edit ? '' : this.state.textareaValue,
                    voiceMode: 'up',
                }, () => {
                    this.voiceStateChange();
                });
                if (this.props.onPreviewMessageChange) {
                    this.props.onPreviewMessageChange(undefined, C_MSG_MODE.Normal);
                }
                this.loading = false;
            }, 102);
        } else {
            this.loading = false;
        }
        this.selectWithArrow = false;
        this.removeDraft(removeDraft).finally(() => {
            if (cb) {
                cb();
            }
        });
    }

    public render() {
        const {
            previewMessage, previewMessageMode, previewMessageHeight, selectable, selectableDisable,
            disableAuthority, user, botKeyboard, droppedMessage, inputMode,
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
                return null;
            }
        } else if (!selectable && user && user.blocked) {
            return (<div className="input-placeholder" onClick={this.unblockHandler}>
                <span className="btn">{i18n.t('general.unblock')}</span></div>);
        } else {
            const isBot = Boolean(this.state.isBot && this.botKeyboard && Boolean(this.botKeyboard.data));
            const hasPreviewMessage = Boolean(previewMessage || (droppedMessage && droppedMessage.messagetype && droppedMessage.messagetype !== C_MESSAGE_TYPE.Normal));
            const {selectableHasPending, hideInput} = this.state;
            if (hideInput && !selectable) {
                return <div className="input-placeholder">
                    <span className="notice">{this.getHideInputReasonContent()}</span>
                </div>;
            }
            return (
                <div className="chat-input">
                    {!hideInput && <>
                        <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                               onChange={this.fileChangeHandler} multiple={true} accept={this.getFileType()}/>
                        <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactImportDoneHandler}
                                       teamId={this.teamId}/>
                        <MapPicker ref={this.mapPickerRefHandler} onDone={this.mapDoneDoneHandler}/>
                    </>}
                    {(!selectable && hasPreviewMessage) &&
                    <div className="previews" style={{height: previewMessageHeight + 'px'}}>
                        <div className="preview-container">
                            <div
                                className={'preview-message-wrapper ' + this.getPreviewClassName()}>
                                <span className="preview-bar"/>
                                {this.getPreviewMessageThumbnail()}
                                {(previewMessageMode === C_MSG_MODE.Reply && previewMessage) &&
                                <div className="preview-message">
                                    <UserName className="preview-message-user" id={previewMessage.senderid || ''}
                                              you={true}/>
                                    <div className="preview-message-body">
                                        <div className={'inner ' + (previewMessage.rtl ? 'rtl' : 'ltr')}
                                        >{getMessageTitle(previewMessage, undefined, 196).text}</div>
                                    </div>
                                </div>}
                                {Boolean(previewMessageMode === C_MSG_MODE.Edit) && <div className="preview-message">
                                    <div className="preview-message-user">{i18n.t('input.edit_message')}</div>
                                </div>}
                                {this.getLabelMessagePreview()}
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
                        <div className={`inputs mode-${inputMode}`}>
                            <div className="user">
                                <UserAvatar id={this.props.userId || ''} className="user-avatar"/>
                            </div>
                            {this.getInputContent(isBot)}
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
                                <div className="icon send" onClick={this.sendHandler}>
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
                            {!selectableHasPending && <Tooltip
                                title={i18n.t('chat.labels')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('labels')}
                                            disabled={selectableDisable}>
                                    <LabelRounded/>
                                </IconButton>
                            </Tooltip>}
                            <Tooltip
                                title={i18n.t('input.remove')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('remove')}
                                            disabled={selectableDisable}>
                                    <DeleteRounded/>
                                </IconButton>
                            </Tooltip>
                            {!selectableHasPending && <Tooltip
                                title={i18n.t('input.forward')}
                                placement="top"
                            >
                                <IconButton onClick={this.props.onBulkAction('forward')}
                                            disabled={selectableDisable}>
                                    <ForwardRounded/>
                                </IconButton>
                            </Tooltip>}
                        </div>
                    </div>}
                </div>
            );
        }
    }

    private getHideInputReasonContent() {
        const {hideInputReason} = this.state;
        switch (hideInputReason) {
            case HideInputReason.OnlyAdmin:
                return i18n.t('general.only_admins_can_send_message');
            case HideInputReason.NotTeamMember:
                return i18n.t('general.not_a_team_member');
            default:
                return i18n.t('general.sending_message_is_not_allowed');
        }
    }

    private getInputContent(isBot: boolean) {
        const {inputMode, textareaValue, botKeyboard, voiceMode, pickerTab} = this.state;
        switch (inputMode) {
            default:
            case 'attachment':
                return null;
            case 'default':
            case 'text':
                return (
                    <div className={'input' + (this.state.rtl ? ' rtl' : ' ltr') + (isBot ? ' is-bot' : '')}>
                        <div className="textarea-container">
                            <MentionInput
                                peer={this.state.peer}
                                isBot={this.state.isBot || false}
                                value={textareaValue}
                                onChange={this.textInputChangeHandler}
                                inputRef={this.textareaRefHandler}
                                onKeyUp={this.inputKeyUpHandler}
                                onKeyDown={this.inputKeyDownHandler}
                                className="mention"
                                placeholder={i18n.t('input.type_your_message_here')}
                                style={mentionInputStyle}
                                suggestionsPortalHost={this.mentionContainer}
                                onFocus={this.props.onFocus}
                                teamId={this.teamId}
                            />
                        </div>
                        <div className={'picker-anchor' + (isBot ? ' is-bot' : '')}>
                            {isBot && <span className="icon" onClick={this.toggleBotKeyboardHandler}>
                                {botKeyboard ? <KeyboardRounded/> : <ViewModuleRounded/>}
                            </span>}
                            <span className="icon" onClick={this.emojiClickHandler}>
                                <Sticker/>
                            </span>
                            <Popover open={Boolean(this.state.pickerAnchorPos)} anchorReference="anchorPosition"
                                     anchorPosition={this.state.pickerAnchorPos} onClose={this.emojiCloseHandler}
                                     classes={{paper: 'picker-menu-paper'}} transitionDuration={0}
                            >
                                <Tabs variant="fullWidth" indicatorColor="primary" textColor="primary" centered={true}
                                      className="chat-input-popover-tabs" value={pickerTab}
                                      onChange={this.tabChangeHandler}>
                                    <Tab value={0} className="chat-input-tab emoji"
                                         icon={<SentimentSatisfiedRounded/>}/>
                                    <Tab value={1} className="chat-input-tab gif" icon={<GifRounded/>}/>
                                </Tabs>
                                {this.getPickerContent()}
                            </Popover>
                        </div>
                    </div>);
            case 'voice':
                return (
                    <div className="voice-recorder">
                        {Boolean(inputMode === 'voice' && voiceMode !== 'play') && <>
                            <div className="timer">
                                <span className="bulb"/>
                                <span ref={this.timerRefHandler}>00:00</span>
                            </div>
                            <div className="preview">
                                <canvas ref={this.canvasRefHandler}/>
                            </div>
                            <div className="cancel"
                                 onClick={this.voiceCancelHandler}>{i18n.t('general.cancel')}</div>
                        </>}
                        {Boolean(inputMode === 'voice' && voiceMode === 'play') && <>
                            <div className="play-remove" onClick={this.voiceCancelHandler}>
                                <DeleteRounded/>
                            </div>
                            <VoicePlayer ref={this.voicePlayerRefHandler} className="play-frame"
                                         max={255.0}/>
                        </>}
                    </div>);
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
        if (entities.some(o => o.type === MessageEntityType.MESSAGEENTITYTYPEMENTIONALL)) {
            text = mentionize(text, entities.filter(o => o.type === MessageEntityType.MESSAGEENTITYTYPEMENTIONALL).map(o => {
                return {
                    length: o.length || 0,
                    offset: o.offset || 0,
                    val: 'all',
                };
            }));
        }
        if (entities.some(o => o.type === MessageEntityType.MESSAGEENTITYTYPECODE)) {
            text = codeBacktick(text, entities.filter(o => o.type === MessageEntityType.MESSAGEENTITYTYPECODE).map(o => {
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
                return (<>
                    <StopRounded/>
                    <span ref={this.waveRefHandler} className="wave"/>
                </>);
            case 'play':
                return (<>
                    <SendRounded/>
                </>);
            default:
                return (<>
                    <span ref={this.waveRefHandler} className="wave"/>
                    <KeyboardVoiceRounded/>
                </>);
        }
    }

    private getPreviewClassName() {
        const {previewMessageMode, previewMessage} = this.state;
        if (previewMessageMode === C_MSG_MODE.Edit) {
            return 'edit';
        } else if (previewMessageMode === C_MSG_MODE.Reply && previewMessage && previewMessage.senderid === this.props.userId) {
            return 'reply-you';
        } else if (previewMessageMode === C_MSG_MODE.Reply && previewMessage && previewMessage.senderid !== this.props.userId) {
            return 'reply';
        }
        return 'loaded';
    }

    private sendHandler = () => {
        const {previewMessage, previewMessageMode} = this.state;
        const {entities, text} = generateEntities(this.textarea ? this.textarea.value : '', this.mentions);
        const droppedMessage = cloneDeep(this.state.droppedMessage);
        if (previewMessageMode === C_MSG_MODE.Normal) {
            this.clearPreviewMessage(true, () => {
                if (droppedMessage) {
                    if (this.props.onMessageDrop) {
                        this.props.onMessageDrop(droppedMessage, text, {
                            entities,
                        });
                    }
                } else {
                    this.props.onTextSend(text, {
                        entities,
                    });
                }
                this.checkFocus();
            })();
        } else {
            this.clearPreviewMessage(true, () => {
                const message = cloneDeep(previewMessage);
                if (droppedMessage) {
                    if (this.props.onMessageDrop) {
                        this.props.onMessageDrop(droppedMessage, text, {
                            entities,
                            message,
                            mode: previewMessageMode,
                        });
                    }
                } else {
                    this.props.onTextSend(text, {
                        entities,
                        message,
                        mode: previewMessageMode,
                    });
                }
                this.checkFocus();
            })();
        }
        this.textarea.value = '';
        this.mentions = [];
        this.lastMentionsCount = 0;
        this.setState({
            pickerAnchorPos: undefined,
            textareaValue: '',
        }, () => {
            this.computeLines();
        });
        if (this.state.previewMessageMode !== C_MSG_MODE.Edit) {
            this.setTyping(TypingAction.TYPINGACTIONCANCEL);
        }
    }

    private inputKeyUpHandler = (e: any) => {
        const textVal = e.target.value;
        const {previewMessage, previewMessageMode} = this.state;
        this.rtlDetectorThrottle(textVal);
        let cancelTyping = false;
        const droppedMessage = cloneDeep(this.state.droppedMessage);
        if (e.key === 'Enter' && !e.shiftKey) {
            cancelTyping = true;
            setTimeout(() => {
                if (this.preventMessageSend) {
                    return;
                }
                const {entities, text} = generateEntities(this.textarea ? this.textarea.value : '', this.mentions);
                if (previewMessageMode === C_MSG_MODE.Normal) {
                    this.clearPreviewMessage(true, () => {
                        if (droppedMessage) {
                            if (this.props.onMessageDrop) {
                                this.props.onMessageDrop(droppedMessage, text, {
                                    entities,
                                });
                            }
                        } else {
                            this.props.onTextSend(text, {
                                entities,
                            });
                        }
                        this.checkFocus();
                    })();
                } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                    this.clearPreviewMessage(true, () => {
                        const message = cloneDeep(previewMessage);
                        if (droppedMessage) {
                            if (this.props.onMessageDrop) {
                                this.props.onMessageDrop(droppedMessage, text, {
                                    entities,
                                    message,
                                    mode: previewMessageMode,
                                });
                            }
                        } else {
                            this.props.onTextSend(text, {
                                entities,
                                message,
                                mode: previewMessageMode,
                            });
                        }
                        this.checkFocus();
                    })();
                }
                this.textarea.value = '';
                this.mentions = [];
                this.lastMentionsCount = 0;
                this.setState({
                    pickerAnchorPos: undefined,
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
            } else if (textVal.length > 0) {
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
        const textVal = e.target.value;
        const {previewMessageMode} = this.state;
        if ((e.shiftKey && textVal.length === 0) || (e.key === 'Escape' && this.selectWithArrow)) {
            this.handleShiftArrowKeys(e.keyCode);
            return;
        }
        if (e.key === 'Escape' && textVal.length === 0 && this.props.onChatClose && previewMessageMode === C_MSG_MODE.Normal && !this.selectWithArrow) {
            this.props.onChatClose();
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
        } else if (e.keyCode === 38 && this.state.peer && this.state.previewMessageMode !== C_MSG_MODE.Edit && this.textarea.value === '') {
            const peerObj = this.state.peer.toObject();
            this.messageRepo.getLastMessage(this.teamId, peerObj.id || '', peerObj.type || 0, 'out').then((message) => {
                if (message && canEditMessage(message, this.riverTime.now())) {
                    e.preventDefault();
                    if (this.props.onAction) {
                        this.props.onAction('edit', message)();
                    }
                }
            });
        } else if (e.keyCode === 27) {
            this.clearPreviewMessage(false)();
        }
    }

    private handleShiftArrowKeys(code: number) {
        // 37 <
        // 38 ^
        // 39 >
        // 40 v
        switch (code) {
            case 37:
                this.props.onShitKeyArrow('left');
                break;
            case 38:
                this.props.onShitKeyArrow('up');
                this.selectWithArrow = true;
                break;
            case 39:
                this.props.onShitKeyArrow('right');
                break;
            case 40:
                this.props.onShitKeyArrow('down');
                break;
            case 27:
                this.props.onShitKeyArrow('cancel');
                this.selectWithArrow = false;
                break;
        }
    }

    private emojiClickHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        const pos = e.target.getBoundingClientRect();
        this.setState({
            pickerAnchorPos: {
                left: pos.left - 318,
                top: pos.top - 446,
            },
        });
    }

    private emojiSelectHandler = (data: any) => {
        const pos = this.insertAtCursor(data.native);
        this.computeLines();
        this.focus(pos);
    }

    private emojiCloseHandler = () => {
        this.setState({
            pickerAnchorPos: undefined,
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
        if (rtl !== this.state.rtl) {
            this.setState({
                rtl,
            });
        }
    }

    private removeDraft(removeDraft?: boolean) {
        if (removeDraft && this.state.peer) {
            const dialog = this.props.getDialog(GetPeerName(this.state.peer.getId(), this.state.peer.getType()));
            if (dialog && dialog.draft && dialog.draft.peerid) {
                if (this.props.onClearDraft && this.state.peer) {
                    this.props.onClearDraft({
                        peer: this.state.peer.toObject(),
                        ucount: 1,
                    });
                }
                return this.apiManager.clearDraft(this.state.peer).then(() => {
                    if (this.state.peer) {
                        return this.dialogRepo.upsert([{
                            draft: {},
                            peerid: this.state.peer.getId() || '0',
                            peertype: this.state.peer.getType() || 0,
                            teamid: this.teamId,
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
            if (el && (this.state.previewMessage || this.state.droppedMessage)) {
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
    private checkAuthority = (message?: IMessage) => (data?: any) => {
        const {peer, user} = this.state;
        if (!peer) {
            return;
        }
        if (data && data.ids.indexOf(`${this.teamId}_${peer.getId()}`) === -1) {
            return;
        }
        if (peer.getType() === PeerType.PEERGROUP) {
            this.groupRepo.get(this.teamId, peer.getId() || '').then((res) => {
                if (res) {
                    const flags = res.flagsList || [];
                    const hideInput = (flags.indexOf(GroupFlags.GROUPFLAGSADMINONLY) > -1 && flags.indexOf(GroupFlags.GROUPFLAGSADMIN) === -1);
                    if (flags.indexOf(GroupFlags.GROUPFLAGSNONPARTICIPANT) > -1) {
                        this.setState({
                            disableAuthority: 0x1,
                            hideInput,
                            hideInputReason: HideInputReason.OnlyAdmin,
                        });
                    } else if (flags.indexOf(GroupFlags.GROUPFLAGSDEACTIVATED) > -1) {
                        this.setState({
                            disableAuthority: 0x2,
                            hideInput,
                            hideInputReason: HideInputReason.OnlyAdmin,
                        });
                    } else {
                        this.setState({
                            disableAuthority: 0x0,
                            hideInput,
                            hideInputReason: HideInputReason.OnlyAdmin,
                        });
                    }
                } else {
                    this.setState({
                        disableAuthority: 0x0,
                        hideInput: false,
                        hideInputReason: HideInputReason.Empty,
                    });
                }
            });
        } else {
            if (user && user.isbot && !user.is_bot_started) {
                if (!message || message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    this.setState({
                        disableAuthority: 0x3,
                    });
                } else {
                    this.updateBotStatus(true);
                    this.setState({
                        disableAuthority: 0x0,
                    });
                }
            } else if (user && peer.getType() === PeerType.PEERUSER && this.teamId !== '0') {
                this.userRepo.isTeamMember(this.teamId, user.id).then((ok) => {
                    if (ok) {
                        this.setState({
                            disableAuthority: 0x0,
                        });
                    } else {
                        this.setState({
                            disableAuthority: 0x0,
                            hideInput: true,
                            hideInputReason: HideInputReason.NotTeamMember,
                        });
                    }
                });
            } else {
                this.setState({
                    disableAuthority: 0x0,
                });
            }
        }
    }

    /* Textarea change handler */
    private textInputChangeHandler = (e: any, a: any, b: any, mentions: IMention[]) => {
        if (this.mentions.length !== mentions.length) {
            clearTimeout(this.preventMessageSendTimeout);
            this.preventMessageSend = true;
            this.preventMessageSendTimeout = setTimeout(() => {
                this.preventMessageSend = false;
            }, 500);
        }
        this.mentions = mentions;
        this.startPosHold = 0;
        this.setState({
            textareaValue: e.target.value,
        }, () => {
            this.computeLines();
        });
        if (e.target.valueOf && e.target.value.length === 0) {
            this.setTyping(TypingAction.TYPINGACTIONCANCEL);
        }
    }

    /* Compute line height based on break lines */
    private computeLines() {
        if (!this.textarea) {
            return;
        }
        const {droppedMessage, inputMode, previewMessageMode} = this.state;
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
        if (!Boolean(droppedMessage) && previewMessageMode !== C_MSG_MODE.Edit && !canSendMessage(this.textarea.value, this.state.previewMessageMode, this.state.previewMessage)) {
            if (inputMode !== 'default') {
                this.setInputMode('default');
            }
        } else {
            if (inputMode !== 'text') {
                this.setInputMode('text');
            }
        }
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
        const draftMessage: Partial<DraftMessage.AsObject> = {
            body: this.textarea ? this.textarea.value : '',
            date: this.riverTime.now(),
            entitiesList: message ? message.entitiesList : undefined,
            peerid: oldPeerObj.id || '0',
            peertype: message ? message.peertype : undefined,
            replyto: message ? message.id : undefined,
        };
        if ((draftMessage.body || '').length > 0 || (mode && mode !== C_MSG_MODE.Normal)) {
            this.apiManager.saveDraft(oldPeer, draftMessage.body || '', draftMessage.replyto, draftMessage.entitiesList).then(() => {
                this.dialogRepo.lazyUpsert([{
                    draft: draftMessage,
                    peerid: oldPeerObj.id || '0',
                    peertype: oldPeerObj.type || 0,
                    teamid: this.teamId,
                }]);
            });
        } else {
            const oldDialog = cloneDeep(this.props.getDialog(GetPeerName(oldPeerObj.id, oldPeerObj.type)));
            if (oldDialog && oldDialog.draft && oldDialog.draft.peerid) {
                if (this.props.onClearDraft && this.state.peer) {
                    this.props.onClearDraft({
                        peer: this.state.peer.toObject(),
                        ucount: 1,
                    });
                }
                this.apiManager.clearDraft(oldPeer).then(() => {
                    this.dialogRepo.lazyUpsert([{
                        draft: {},
                        peerid: oldPeerObj.id || '0',
                        peertype: oldPeerObj.type || 0,
                        teamid: this.teamId,
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
        if (this.recordingVoice) {
            return;
        }
        if (!this.recorder) {
            this.initRecorder();
        }
        if (!this.recorder || !this.recorder.start) {
            return;
        }
        this.voiceCanceled = false;
        this.setInputMode('voice');
        this.bars = [];
        this.maxBarVal = 0;
        try {
            this.recorder.stop();
            this.recorder.start().then(() => {
                this.recordingVoice = true;
                this.startTimer();
                const audioAnalyser = this.recorder.audioContext.createAnalyser();
                audioAnalyser.minDecibels = -100;
                audioAnalyser.fftSize = 256;
                audioAnalyser.smoothingTimeConstant = 0.1;

                this.recorder.sourceNode.connect(audioAnalyser);
                const data = new Uint8Array(audioAnalyser.frequencyBinCount);

                const loop = () => {
                    if (this.state.inputMode !== 'voice') {
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
            this.checkMicrophonePermission().then((res) => {
                if (!res) {
                    return;
                }
                this.voiceMouseIn = true;
                this.setState({
                    voiceMode: 'down',
                }, () => {
                    this.voiceStateChange();
                });
                this.voiceRecord();
            });
        }
    }

    /* Voice anchor mouse up handler */
    private voiceMouseUpHandler = (e: any) => {
        if (!this.microphonePermission) {
            return;
        }
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
        if (!this.microphonePermission || !this.voiceMouseIn) {
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
        if (!this.microphonePermission || !this.voiceMouseIn) {
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
        if (!this.microphonePermission) {
            return;
        }
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
        if (!this.loading && this.timerDuration >= 1 && this.voice) {
            this.loading = true;
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
        }
        this.stopTimer();
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
        this.recordingVoice = false;
        this.voiceRecordEnd();
        this.stopTimer();
        this.setState({
            inputMode: 'default',
            voiceMode: 'up',
        }, () => {
            this.voiceStateChange();
        });
    }

    /* Set input mode */
    private setInputMode(mode: 'voice' | 'text' | 'attachment' | 'default') {
        this.setState({
            inputMode: mode,
        });
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
            encoderApplication: 2048,
            encoderPath: '/recorder/encoderWorker.min.js?v8',
            maxFramesPerPage: 40,
            monitorGain: 0,
            numberOfChannels: 1,
            recordingGain: 1,
            wavBitDepth: 16,
        });
        this.voiceCanceled = false;
        this.recorder.ondataavailable = (buff: ArrayBuffer) => {
            if (this.voiceCanceled) {
                this.voiceCanceled = false;
                this.clearPreviewMessage(true)();
                return;
            }
            this.voice = new Blob([buff], {type: 'audio/ogg'});
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

        this.recorder.onstop = () => {
            this.recordingVoice = false;
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
            const {previewMessage, previewMessageMode} = this.state;
            const files: File[] = [];
            for (let i = 0; i < e.currentTarget.files.length; i++) {
                files.push(e.currentTarget.files[i]);
            }
            switch (this.state.mediaInputMode) {
                case 'media':
                case 'audio':
                case 'file':
                    if (this.props.onFileSelect) {
                        this.props.onFileSelect(files, {
                            accept: this.getFileType(),
                            isFile: this.state.mediaInputMode === 'file',
                            message: previewMessage,
                            mode: previewMessageMode,
                        });
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

    private selectMediaActionHandler = (mode: 'media' | 'audio' | 'file' | 'contact' | 'location') => (e: any) => {
        this.setState({
            mediaInputMode: mode,
        }, () => {
            switch (mode) {
                case 'media':
                case 'audio':
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
                        this.mapPickerRef.openDialog(this.teamId, this.state.peer);
                    }
                    break;
            }
        });
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
                return 'image/png,image/jpeg,image/jpg,image/webp,image/gif,video/webm,video/mp4';
            case 'audio':
                return 'audio/mp4,audio/ogg,audio/mp3';
            case 'file':
            default:
                return undefined;
        }
    }

    /* Send contact handler */
    private contactImportDoneHandler = (users: IUser[], caption: string) => {
        const {previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        if (this.props.onContactSelect) {
            this.props.onContactSelect(users, caption, {
                message,
                mode: previewMessageMode,
            });
        }
        this.clearPreviewMessage(true)();
    }

    private mapDoneDoneHandler = (data: IGeoItem) => {
        const {previewMessage, previewMessageMode} = this.state;
        const message = cloneDeep(previewMessage);
        if (this.props.onMapSelect) {
            this.props.onMapSelect(data, {
                message,
                mode: previewMessageMode,
            });
        }
        this.clearPreviewMessage(true)();
    }

    private getPreviewMessageThumbnail() {
        const {previewMessage} = this.state;
        if (!previewMessage) {
            return null;
        }
        switch (previewMessage.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
            case C_MESSAGE_TYPE.Gif:
                const info = getMediaInfo(previewMessage);
                return (
                    <div className="preview-thumbnail">
                        <CachedPhoto className="thumbnail" fileLocation={info.thumbFile} mimeType="image/jpeg"/>
                    </div>
                );
            default:
                return null;
        }
    }

    private getLabelMessagePreview() {
        const {droppedMessage, previewMessage} = this.state;
        if (!droppedMessage) {
            return null;
        }
        const messageTitle = getMessageTitle(droppedMessage, true);
        const hasPreviewMessage = Boolean(previewMessage);
        if (droppedMessage.mediatype === MediaType.MEDIATYPEDOCUMENT) {
            const info = getMediaInfo(droppedMessage);
            return <>
                <div className={'preview-message' + (hasPreviewMessage ? ' label-message' : '')}>
                    <div
                        className={'preview-message-title' + (droppedMessage.messagetype === C_MESSAGE_TYPE.Picture ? ' large' : '')}>
                        {getMessageIcon(messageTitle.icon)}
                        {messageTitle.text}
                    </div>
                    {(droppedMessage.messagetype === C_MESSAGE_TYPE.Voice ||
                        droppedMessage.messagetype === C_MESSAGE_TYPE.VoiceMail ||
                        droppedMessage.messagetype === C_MESSAGE_TYPE.Video ||
                        droppedMessage.messagetype === C_MESSAGE_TYPE.Audio) &&
                    <div className="preview-message-body">
                        <div className="inner">{getDuration(info.duration || 0)}</div>
                    </div>}
                    {droppedMessage.messagetype === C_MESSAGE_TYPE.File &&
                    <div className="preview-message-body">
                        <div className="inner">{info.fileName} &bull; {getHumanReadableSize(info.size || 0)}</div>
                    </div>}
                </div>
                {Boolean(info && info.thumbFile && info.thumbFile.fileid !== '') && <div className="preview-thumbnail">
                    <CachedPhoto className="thumbnail" fileLocation={info.thumbFile} mimeType="image/jpeg"/>
                </div>}
            </>;
        } else {
            switch (droppedMessage.messagetype) {
                case C_MESSAGE_TYPE.Location:
                    const location = getMapLocation(droppedMessage);
                    return <div className={'preview-message' + (hasPreviewMessage ? ' label-message' : '')}>
                        <div className="preview-message-title">
                            {getMessageIcon(messageTitle.icon)}
                            {messageTitle.text}
                        </div>
                        <div className="preview-message-body">
                            <div className="inner">{`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</div>
                        </div>
                    </div>;
                case C_MESSAGE_TYPE.Contact:
                    const contact: MediaContact.AsObject = droppedMessage.mediadata;
                    return <div className={'preview-message' + (hasPreviewMessage ? ' label-message' : '')}>
                        <div className="preview-message-title">
                            {getMessageIcon(messageTitle.icon)}
                            {messageTitle.text}
                        </div>
                        <div className="preview-message-body">
                            <div className="inner">{`${contact.firstname} ${contact.lastname} | ${contact.phone}`}</div>
                        </div>
                    </div>;
            }
        }
        return null;
    }

    private voiceStateChange() {
        if (this.props.onVoiceStateChange) {
            this.props.onVoiceStateChange(this.state.voiceMode);
        }
    }

    /* Window paste handler */
    private windowPasteHandler = (e: any) => {
        if (e.clipboardData && e.clipboardData.items) {
            const {previewMessage, previewMessageMode} = this.state;
            const files: any[] = [];
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                const item = e.clipboardData.items[i];
                if (item.kind === 'file') {
                    files.push(item.getAsFile());
                }
            }
            if (files.length > 0 && this.props.onFileSelect) {
                this.props.onFileSelect(files, {
                    isFile: files.length === 1 ? getUploaderInput(files[0].type) === 'file' : true,
                    message: previewMessage,
                    mode: previewMessageMode,
                });
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
        this.apiManager.accountUnblock(inputUser).then(() => {
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
            if (res) {
                this.setState({
                    user: res,
                });
            }
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
                this.checkAuthority()();
            });
        }
    }

    private updateBotStatus(started: boolean) {
        const {user} = this.state;
        if (user) {
            user.is_bot_started = started;
            user.dont_update_last_modified = true;
            this.userRepo.importBulk(false, [user]);
        }
    }

    private toggleBotKeyboardHandler = () => {
        this.setState({
            botKeyboard: !this.state.botKeyboard,
        });
    }

    private renderBotKeyboard() {
        if (!this.botKeyboard || !this.botKeyboard.data || this.botKeyboard.mode !== C_REPLY_ACTION.ReplyKeyboardMarkup) {
            return null;
        }
        const layout = this.botKeyboard.data as ReplyKeyboardMarkup.AsObject;
        let height = layout.rowsList.length * 32 + 4;
        if (height > 110) {
            height = 110;
            return (<div style={{height: `${height}px`}}>
                <Scrollbars
                    hideTracksWhenNotNeeded={false}
                    universal={true}>
                    <BotLayout rows={layout.rowsList}
                               prefix="keyboard-bot" onAction={this.props.onBotButtonAction}/>
                </Scrollbars>
            </div>);
        }
        return (<BotLayout rows={layout.rowsList}
                           prefix="keyboard-bot" onAction={this.props.onBotButtonAction}/>);
    }

    // /* Is voice started */
    // private isVoiceStarted(data: Uint8Array) {
    //     return data.some((byte) => {
    //         return byte > 0;
    //     });
    // }

    /* Insert at selection */
    private insertAtCursor(text: string) {
        if (!this.textarea) {
            return undefined;
        }
        let pos: number = 0;
        let textVal: string = this.textarea.value;
        if (!this.startPosHold) {
            this.startPosHold = this.textarea.selectionStart;
        } else {
            this.textarea.setSelectionRange(this.startPosHold, this.startPosHold);
        }
        // IE support
        // @ts-ignore
        if (document.selection) {
            this.textarea.focus();
            // @ts-ignore
            const sel: any = document.selection.createRange();
            sel.text = text;
            textVal = sel.text;
        }
        // @ts-ignore
        else if (this.textarea.selectionStart || this.textarea.selectionStart === 0) {
            const startPos = this.textarea.selectionStart;
            const endPos = this.textarea.selectionEnd;
            textVal = textVal.substring(0, startPos)
                + text
                + textVal.substring(endPos, textVal.length);
            pos = startPos;
            this.startPosHold += text.length;
        } else {
            textVal += text;
        }
        this.textarea.value = textVal;
        this.setState({
            textareaValue: textVal,
        });
        return pos;
    }

    private checkMicrophonePermission() {
        if (!navigator.permissions) {
            return Promise.resolve(true);
        }
        if (this.microphonePermission) {
            return Promise.resolve(true);
        }
        return new Promise(resolve => {
            try {
                navigator.permissions.query(
                    {name: 'microphone'},
                ).then((permissionStatus) => {
                    switch (permissionStatus.state) {
                        case 'denied':
                            resolve(false);
                            return;
                        case 'granted':
                            resolve(true);
                            this.microphonePermission = true;
                            return;
                        case 'prompt':
                            navigator.mediaDevices.getUserMedia({audio: getDefaultAudio()}).then(() => {
                                resolve(true);
                                this.microphonePermission = true;
                                this.setState({
                                    inputMode: 'voice',
                                });
                            }).catch((err) => {
                                resolve(false);
                            });
                            return;
                    }
                }).catch(() => {
                    navigator.mediaDevices.getUserMedia({audio: getDefaultAudio()}).then(() => {
                        resolve(true);
                        this.microphonePermission = true;
                        this.setState({
                            inputMode: 'voice',
                        });
                    }).catch((err) => {
                        resolve(false);
                    });
                });
            } catch (e) {
                resolve(false);
            }
        });
    }

    private tabChangeHandler = (e: any, val: any) => {
        this.setState({
            pickerTab: val,
        });
    }

    private getPickerContent() {
        const {pickerTab, pickerAnchorPos, peer} = this.state;
        if (!pickerAnchorPos) {
            return <div className="picker-placeholder"/>;
        }
        switch (pickerTab) {
            default:
            case 0:
                const dark = (localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light') !== 'light';
                return <Suspense fallback={<Loading/>}>
                    <EmojiContainer onSelect={this.emojiSelectHandler} dark={dark}/>
                </Suspense>;
            case 1:
                return <Suspense fallback={<Loading/>}>
                    <GifPicker onSelect={this.gifPickerSelectHandler} inputPeer={peer}/>
                </Suspense>;
        }
    }

    private gifPickerSelectHandler = (item: IGif, viaBotId?: string) => {
        setTimeout(this.emojiCloseHandler, 100);
        this.props.onGifSelect(item, viaBotId);
    }
}

export default ChatInput;
