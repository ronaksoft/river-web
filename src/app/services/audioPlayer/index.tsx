/*
    Creation Time: 2019 - Jan - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileRepo, {GetDbFileName} from '../../repository/file';
import {clone} from 'lodash';
import {IMediaInfo} from '../../components/MessageMedia';
import MessageRepo from "../../repository/message";
import {IPeer} from "../../repository/dialog/interface";
import {GetPeerNameByPeer} from "../../repository/dialog";

export interface IAudioEvent {
    currentTime: number;
    currentTrack: number;
    music: boolean;
    progress: number;
    state: 'play' | 'pause' | 'seek_play' | 'seek_pause';
}

export interface IAudioInfo {
    fast: boolean;
    messageId: number;
    peer: IPeer;
    userId: string;
}

interface IAudioItem {
    downloaded: boolean;
    duration: number;
    event: IAudioEvent;
    fileName: string;
    fnQueue: { [key: number]: any };
    music?: IMediaInfo;
    peer: IPeer;
    userId: string;
}

export interface IPlaylistItem {
    downloaded: boolean;
    duration: number;
    event: IAudioEvent;
    fileName: string;
    id: number;
    music: IMediaInfo;
    peer: IPeer;
    userId: string;
}

export const C_INSTANT_AUDIO = -1;

export default class AudioPlayer {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new AudioPlayer();
        }

        return this.instance;
    }

    private static instance: AudioPlayer;

    private audio: HTMLAudioElement | undefined;
    private fnIndex: number = 0;
    private tracks: { [key: number]: IAudioItem } = {};
    private tracksPeerId: string = '';
    private listeners: { [key: number]: any } = {};
    private playlistUpdateListeners: { [key: number]: any } = {};
    private backUpTracks: { [key: number]: IAudioItem } = {};
    private voicePlaylist: number[] = [];
    private musicPlaylist: number[] = [];
    private currentTrack: number = 0;
    private playerInterval: any = null;
    private fileRepo: FileRepo;
    private messageRepo: MessageRepo;
    private lastObjectUrl: string = '';
    private playingFromPeerId: string | undefined;
    private fastEnable: boolean = false;
    private backUpPeerName: string = '';
    private errFn?: (info: IAudioInfo, err: any) => void;
    private updateDurationFn?: (info: IAudioInfo, duration: number) => void;
    private playTimeout: any = null;
    private pauseTimeout: any = null;
    private active: boolean = false;

    private constructor() {
        this.audio = document.createElement('audio');
        this.fileRepo = FileRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
    }

    /* Set instant audio file with blob
    *  This feature mainly being used in previewing recorded voice!
    * */
    public setInstantVoice(blob: Blob, callback?: any) {
        this.prepareInstantAudio(blob, callback);
    }

    public setActive(active: boolean) {
        this.active = active;
        if (!active && this.audio) {
            this.audio.src = '';
        }
    }

    public getMusicPlayList() {
        const data: IPlaylistItem[] = [];
        this.musicPlaylist.forEach((id) => {
            if (this.tracks.hasOwnProperty(id)) {
                const t = this.tracks[id];
                if (t.music) {
                    data.push({
                        downloaded: t.downloaded,
                        duration: t.duration,
                        event: t.event,
                        fileName: t.fileName,
                        id,
                        music: t.music,
                        peer: t.peer,
                        userId: t.userId,
                    });
                }
            }
        });
        return data;
    }

    public isPlaying(id: number) {
        if (this.tracks.hasOwnProperty(id)) {
            return (this.tracks[id].event.state === 'play' || this.tracks[id].event.state === 'seek_play');
        }
        return false;
    }

    public getCurrentTrack() {
        return this.currentTrack;
    }

    public isSongPlaying() {
        return this.isPlaying(this.currentTrack);
    }

    /* Add audio to playlist */
    public addToPlaylist(messageId: number, peer: IPeer, fileName: string, userId: string, downloaded: boolean, mediaInfo?: IMediaInfo) {
        if (messageId < 0) {
            return;
        }
        peer = clone(peer);
        if (this.playingFromPeerId && this.playingFromPeerId !== peer.id) {
            const peerName = GetPeerNameByPeer(peer);
            if (this.backUpPeerName !== peerName) {
                this.backUpTracks = {};
                this.backUpPeerName = peerName;
            }
            if (!this.backUpTracks.hasOwnProperty(messageId)) {
                this.backUpTracks[messageId] = {
                    downloaded,
                    duration: mediaInfo ? (mediaInfo.duration || 0) : 0,
                    event: {
                        currentTime: 0,
                        currentTrack: 0,
                        music: Boolean(mediaInfo) || false,
                        progress: 0,
                        state: 'pause',
                    },
                    fileName,
                    fnQueue: [],
                    music: mediaInfo,
                    peer,
                    userId,
                };
            } else {
                this.backUpTracks[messageId].downloaded = downloaded;
                this.backUpTracks[messageId].peer = peer;
                this.backUpTracks[messageId].fileName = fileName;
                this.backUpTracks[messageId].userId = userId;
                this.backUpTracks[messageId].music = mediaInfo;
                this.backUpTracks[messageId].event.music = Boolean(mediaInfo);
            }
        } else {
            if (this.tracksPeerId !== peer.id) {
                this.tracks = {};
                this.tracksPeerId = peer.id;
                this.voicePlaylist = [];
                this.musicPlaylist = [];
            }
            if (!this.tracks.hasOwnProperty(messageId)) {
                this.tracks[messageId] = {
                    downloaded,
                    duration: mediaInfo ? (mediaInfo.duration || 0) : 0,
                    event: {
                        currentTime: 0,
                        currentTrack: 0,
                        music: Boolean(mediaInfo),
                        progress: 0,
                        state: 'pause',
                    },
                    fileName,
                    fnQueue: [],
                    music: mediaInfo,
                    peer,
                    userId,
                };
                if (Boolean(mediaInfo)) {
                    this.musicPlaylist.push(messageId);
                    this.callUpdatePlaylistHandler();
                    if (this.musicPlaylist.length > 1) {
                        this.musicPlaylist.sort((a, b) => a - b);
                    }
                } else {
                    this.voicePlaylist.push(messageId);
                    if (this.voicePlaylist.length > 1) {
                        this.voicePlaylist.sort((a, b) => a - b);
                    }
                }
            } else {
                this.tracks[messageId].downloaded = downloaded;
                this.tracks[messageId].peer = peer;
                this.tracks[messageId].fileName = fileName;
                this.tracks[messageId].userId = userId;
                this.tracks[messageId].music = mediaInfo;
                this.tracks[messageId].event.music = Boolean(mediaInfo);
            }
        }
    }

    public removeFromPlaylist(messageId: number) {
        if (this.backUpTracks.hasOwnProperty(messageId)) {
            delete this.backUpTracks[messageId];
        }
        if (this.tracks.hasOwnProperty(messageId)) {
            if (this.tracks[messageId].event.music) {
                const index = this.musicPlaylist.indexOf(messageId);
                this.callUpdatePlaylistHandler();
                if (index > -1) {
                    this.musicPlaylist.splice(index, 1);
                }
            } else {
                const index = this.voicePlaylist.indexOf(messageId);
                if (index > -1) {
                    this.voicePlaylist.splice(index, 1);
                }
            }
            delete this.tracks[messageId];
        }
    }

    public clearPlaylist() {
        URL.revokeObjectURL(this.lastObjectUrl);
        this.tracks = {};
        this.voicePlaylist = [];
        // @ts-ignore
        this.audio = null;
    }

    /* Fast play rate */
    public fast(enable: boolean) {
        this.fastEnable = enable;
        if (this.fastEnable) {
            if (this.audio && !this.audio.paused) {
                this.audio.playbackRate = 2.0;
            }
        } else {
            if (this.audio && !this.audio.paused) {
                this.audio.playbackRate = 1.0;
            }
        }
    }

    /* Play audio */
    public play(messageId: number, force?: boolean) {
        // TODO: fix bad instant bug
        if (this.currentTrack !== messageId && messageId !== C_INSTANT_AUDIO) {
            URL.revokeObjectURL(this.lastObjectUrl);
            this.stop(this.currentTrack);
            return this.prepareTrack(messageId).then(() => {
                if (force) {
                    clearInterval(this.pauseTimeout);
                    clearInterval(this.playTimeout);
                }
            }).catch((err) => {
                if (err === 'not found') {
                    return this.messageRepo.get(messageId).then((res) => {
                        if (res && this.tracks[messageId] && res.mediadata && res.mediadata.doc && res.mediadata.doc.id) {
                            this.tracks[messageId].fileName = GetDbFileName(res.mediadata.doc.id, res.mediadata.doc.clusterid);
                            return this.prepareTrack(messageId);
                        } else {
                            throw Error('not found');
                        }
                    });
                } else {
                    throw err;
                }
            });
        } else {
            if (!this.audio) {
                return Promise.reject();
            }
            return this.audio.play().then(() => {
                if (!this.audio) {
                    return Promise.reject();
                }
                clearTimeout(this.playTimeout);
                this.playTimeout = null;
                if (this.fastEnable) {
                    this.audio.playbackRate = 2.0;
                } else {
                    this.audio.playbackRate = 1.0;
                }
                this.setState(messageId, 'play');
                this.startPlayerInterval();
                this.audio.onended = () => {
                    this.stopPlayerInterval();
                    this.setState(messageId, 'pause', 0);
                    if (messageId !== C_INSTANT_AUDIO) {
                        this.next(true);
                    }
                };
                return Promise.resolve();
            });
        }
    }

    /* Pause audio */
    public pause(messageId: number) {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
            this.setState(messageId, 'pause');
            this.stopPlayerInterval();
        } else {
            this.setState(messageId, 'pause');
            this.stopPlayerInterval();
        }
    }

    /* Stop audio */
    public stop(messageId: number) {
        if (this.audio) {
            if (!this.audio.paused) {
                this.audio.pause();
            }
            this.setState(messageId, 'pause', 0);
            this.playingFromPeerId = undefined;
            this.stopPlayerInterval();
        }
    }

    /* Seek audio to given ratio (0.0 ~ 1.0) */
    public seekTo(messageId: number, ratio: number) {
        if (this.audio && this.tracks.hasOwnProperty(messageId)) {
            this.audio.currentTime = this.tracks[messageId].duration * ratio;
            if (this.audio.paused) {
                this.setState(messageId, 'seek_pause', ratio);
            } else {
                this.setState(messageId, 'seek_play', ratio);
            }
        }
    }

    /* Next audio */
    public next(force?: boolean) {
        if (this.currentTrack > 0) {
            let index = this.voicePlaylist.indexOf(this.currentTrack);
            if (index > -1) {
                const nextIndex = index + 1;
                if (index > -1 && this.voicePlaylist.length > nextIndex) {
                    if (this.tracks.hasOwnProperty(this.voicePlaylist[nextIndex]) && this.tracks[this.voicePlaylist[nextIndex]].downloaded) {
                        this.play(this.voicePlaylist[nextIndex], force);
                    } else {
                        this.playingFromPeerId = undefined;
                    }
                } else {
                    this.playingFromPeerId = undefined;
                }
            } else {
                index = this.musicPlaylist.indexOf(this.currentTrack);
                const nextIndex = index + 1;
                if (index > -1 && this.musicPlaylist.length > nextIndex) {
                    if (this.tracks.hasOwnProperty(this.musicPlaylist[nextIndex]) && this.tracks[this.musicPlaylist[nextIndex]].downloaded) {
                        this.play(this.musicPlaylist[nextIndex], force);
                    } else {
                        this.playingFromPeerId = undefined;
                    }
                } else {
                    this.playingFromPeerId = undefined;
                }
            }
        }
    }

    /* Prev audio */
    public prev(force?: boolean) {
        if (this.currentTrack > 0) {
            let index = this.voicePlaylist.indexOf(this.currentTrack);
            if (index > -1) {
                const prevIndex = index - 1;
                if (index > -1 && prevIndex >= 0) {
                    if (this.tracks.hasOwnProperty(this.voicePlaylist[prevIndex]) && this.tracks[this.voicePlaylist[prevIndex]].downloaded) {
                        this.play(this.voicePlaylist[prevIndex], force);
                    }
                }
            } else {
                index = this.musicPlaylist.indexOf(this.currentTrack);
                const prevIndex = index - 1;
                if (index > -1 && prevIndex >= 0) {
                    if (this.tracks.hasOwnProperty(this.musicPlaylist[prevIndex]) && this.tracks[this.musicPlaylist[prevIndex]].downloaded) {
                        this.play(this.musicPlaylist[prevIndex], force);
                    }
                }
            }
        }
    }

    /* AudioPlayer event listener */
    public listen(messageId: number, fn: any): (() => void) | null {
        if (!messageId) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.tracks.hasOwnProperty(messageId)) {
            this.tracks[messageId] = {
                downloaded: false,
                duration: 0,
                event: {
                    currentTime: 0,
                    currentTrack: 0,
                    music: false,
                    progress: 0,
                    state: 'pause',
                },
                fileName: '',
                fnQueue: [],
                peer: {
                    id: '',
                    peerType: 0,
                },
                userId: '',
            };
            this.voicePlaylist.push(messageId);
            if (this.voicePlaylist.length > 1) {
                this.voicePlaylist.sort((a, b) => a - b);
            }
        }
        this.tracks[messageId].fnQueue[fnIndex] = fn;
        fn(this.tracks[messageId].event);
        return () => {
            if (this.tracks.hasOwnProperty(messageId)) {
                delete this.tracks[messageId].fnQueue[fnIndex];
            }
        };
    }

    /* AudioPlayer global event listener */
    public globalListen(fn: (info: IAudioInfo, e: IAudioEvent) => void): (() => void) | null {
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        this.listeners[fnIndex] = fn;
        return () => {
            if (this.listeners.hasOwnProperty(fnIndex)) {
                delete this.listeners[fnIndex];
            }
        };
    }

    /* Playlist update listener */
    public playlistUpdateListen(fn: () => void) {
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        this.playlistUpdateListeners[fnIndex] = fn;
        return () => {
            if (this.playlistUpdateListeners.hasOwnProperty(fnIndex)) {
                delete this.playlistUpdateListeners[fnIndex];
            }
        };
    }

    /* AudioPlayer remove track */
    public remove(id: number) {
        if (this.tracks.hasOwnProperty(id)) {
            delete this.tracks[id];
        }
    }

    /* Set audio err function */
    public setErrorFn(fn: (info: IAudioInfo, err: any) => void) {
        this.errFn = fn;
    }

    /* Set audio err function */
    public setUpdateDurationFn(fn: (info: IAudioInfo, duration: number) => void) {
        this.updateDurationFn = fn;
    }

    /* Get audio from database and prepare it for playing */
    private prepareTrack(messageId: number): Promise<any> {
        if (!this.tracks.hasOwnProperty(messageId)) {
            if (this.backUpTracks.hasOwnProperty(messageId)) {
                this.copyFromBackup();
                return this.prepareTrack(messageId);
            }
        }
        if (!this.tracks.hasOwnProperty(messageId) || !this.audio) {
            return Promise.reject('not found');
        }
        return new Promise((resolve, reject) => {
            const track = this.tracks[messageId];
            this.fileRepo.get(track.fileName).then((res) => {
                if (res) {
                    if (!this.audio) {
                        return;
                    }
                    this.audio.src = URL.createObjectURL(res.data);
                    this.lastObjectUrl = this.audio.src;
                    this.audio.onloadedmetadata = (e) => {
                        if (this.tracks.hasOwnProperty(messageId) && this.audio) {
                            if (this.tracks[messageId].duration === 0 && this.audio.duration > 0 && this.updateDurationFn) {
                                this.updateDurationFn({
                                    fast: false,
                                    messageId,
                                    peer: track.peer,
                                    userId: track.userId,
                                }, this.audio.duration);
                                setTimeout(() => {
                                    this.callUpdatePlaylistHandler();
                                }, 10);
                            }
                            this.tracks[messageId].duration = this.audio.duration;
                            if (this.tracks[messageId].music) {
                                // @ts-ignore
                                this.tracks[messageId].music.duration = Math.floor(this.audio.duration);
                            }
                        }
                    };
                    this.audio.onloadeddata = (e) => {
                        this.currentTrack = messageId;
                        this.play(messageId, true);
                        resolve();
                    };
                    this.audio.onerror = (err) => {
                        if (this.errFn) {
                            this.errFn({
                                fast: false,
                                messageId,
                                peer: track.peer,
                                userId: track.userId,
                            }, err);
                        }
                        reject(err);
                    };
                    this.audio.onpause = () => {
                        if (!this.active) {
                            return;
                        }
                        this.pauseTimeout = setTimeout(() => {
                            this.pause(messageId);
                        }, 100);
                    };
                    this.audio.onplay = () => {
                        if (!this.active) {
                            return;
                        }
                        this.playTimeout = setTimeout(() => {
                            this.play(messageId);
                        }, 100);
                    };
                    this.audio.load();
                } else {
                    if (this.errFn) {
                        this.errFn({
                            fast: false,
                            messageId,
                            peer: track.peer,
                            userId: track.userId,
                        }, Error('not found'));
                    }
                    reject('not found');
                }
            });
        });
    }

    /* Prepare instant audio */
    private prepareInstantAudio(blob: Blob, callback?: any) {
        if (!this.audio) {
            return;
        }
        this.audio.src = URL.createObjectURL(blob);
        this.audio.onloadedmetadata = () => {
            if (this.tracks.hasOwnProperty(C_INSTANT_AUDIO) && this.audio) {
                this.tracks[C_INSTANT_AUDIO].duration = this.audio.duration;
            }
        };
        this.audio.load();
        this.audio.onloadeddata = () => {
            this.currentTrack = C_INSTANT_AUDIO;
            if (callback) {
                callback();
            }
        };
    }

    /* Set audio state */
    private setState(messageId: number, state: 'none' | 'play' | 'pause' | 'seek_play' | 'seek_pause', progress?: number) {
        if (this.tracks.hasOwnProperty(messageId)) {
            if (state !== 'none') {
                this.tracks[messageId].event.state = state;
            } else {
                if (this.tracks[messageId].event.state === 'seek_play') {
                    this.tracks[messageId].event.state = 'play';
                } else if (this.tracks[messageId].event.state === 'seek_pause') {
                    this.tracks[messageId].event.state = 'pause';
                }
            }
            if (progress !== undefined) {
                this.tracks[messageId].event.progress = progress;
            }
            if (this.audio) {
                this.tracks[messageId].event.currentTime = this.audio.currentTime;
            }
            this.tracks[messageId].event.currentTrack = this.currentTrack;
            if (state === 'play') {
                this.playingFromPeerId = this.tracks[messageId].peer.id;
            }
            this.callHandlers(messageId, this.tracks[messageId].event, Boolean(state === 'play' || state === 'seek_play'));
        }
    }

    /* Call registered handlers */
    private callHandlers(messageId: number, event: IAudioEvent, opt?: boolean) {
        if (!this.tracks.hasOwnProperty(messageId)) {
            return;
        }
        const globalKeys = Object.keys(this.listeners);
        globalKeys.forEach((key) => {
            const fn = this.listeners[key];
            if (fn) {
                fn({
                    fast: this.fastEnable,
                    messageId,
                    peer: this.tracks[messageId].peer,
                    userId: this.tracks[messageId].userId,
                }, event, opt ? this.tracks[messageId].music : undefined);
            }
        });
        const keys = Object.keys(this.tracks[messageId].fnQueue);
        keys.forEach((key) => {
            const fn = this.tracks[messageId].fnQueue[key];
            if (fn) {
                fn(event);
            }
        });
    }

    /* Call update playlist handlers */
    private callUpdatePlaylistHandler() {
        const globalKeys = Object.keys(this.playlistUpdateListeners);
        globalKeys.forEach((key) => {
            const fn = this.playlistUpdateListeners[key];
            if (fn) {
                fn();
            }
        });
    }

    /* Start player interval */
    private startPlayerInterval() {
        clearInterval(this.playerInterval);
        this.playerInterval = setInterval(() => {
            if (!this.audio || !this.tracks.hasOwnProperty(this.currentTrack)) {
                return;
            }
            this.setState(this.currentTrack, 'none', this.audio.currentTime / this.tracks[this.currentTrack].duration);
        }, 100);
    }

    /* Stop player interval */
    private stopPlayerInterval() {
        clearInterval(this.playerInterval);
    }

    /* Copy track from backup (usually different peerId) */
    private copyFromBackup() {
        // @ts-ignore
        const keys: number[] = Object.keys(this.backUpTracks);
        if (keys.length === 0) {
            this.backUpTracks = {};
            return;
        } else {
            this.tracks = clone(this.backUpTracks);
            this.voicePlaylist = [];
            keys.forEach((i) => {
                this.voicePlaylist.push(i);
            });
            this.voicePlaylist.sort((a, b) => a - b);
            this.backUpTracks = {};
        }
    }
}
