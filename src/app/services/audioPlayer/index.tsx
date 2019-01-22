/*
    Creation Time: 2019 - Jan - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileRepo from '../../repository/file';

export interface IAudioEvent {
    currentTime: number;
    currentTrack: number;
    progress: number;
    state: 'play' | 'pause' | 'seek_play' | 'seek_pause';
}

export interface IAudioInfo {
    fast: boolean;
    messageId: number;
    peerId: string;
    userId: string;
}

interface IAudioItem {
    downloaded: boolean;
    duration: number;
    event: IAudioEvent;
    fileId: string;
    fnQueue: { [key: number]: any };
    peerId?: string;
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

    private audio: HTMLAudioElement;
    private fnIndex: number = 0;
    private tracks: { [key: number]: IAudioItem } = {};
    private listeners: { [key: number]: any } = {};
    private backUpTracks: { [key: number]: IAudioItem } = {};
    private playlist: number[] = [];
    private currentTrack: number = 0;
    private playerInterval: any = null;
    private fileRepo: FileRepo;
    private lastObjectUrl: string = '';
    /* Set audio state */
    private playingFromPeerId: string | undefined;
    private fastEnable: boolean;

    private constructor() {
        this.audio = document.createElement('audio');
        this.fileRepo = FileRepo.getInstance();
    }

    /* Set instant audio file with blob
    *  This feature mainly being used in previewing recorded voice!
    * */
    public setInstantVoice(blob: Blob, callback?: any) {
        this.prepareInstantAudio(blob, callback);
    }

    /* Add audio to playlist */
    public addToPlaylist(messageId: number, peerId: string, fileId: string, userId: string, downloaded: boolean) {
        if (this.playingFromPeerId && this.playingFromPeerId !== peerId) {
            if (!this.backUpTracks.hasOwnProperty(messageId)) {
                this.backUpTracks[messageId] = {
                    downloaded,
                    duration: 0,
                    event: {
                        currentTime: 0,
                        currentTrack: 0,
                        progress: 0,
                        state: 'pause',
                    },
                    fileId,
                    fnQueue: [],
                    peerId,
                    userId,
                };
            } else {
                this.backUpTracks[messageId].downloaded = downloaded;
                this.backUpTracks[messageId].peerId = peerId;
                this.backUpTracks[messageId].fileId = fileId;
                this.backUpTracks[messageId].userId = userId;
            }
        } else {
            if (!this.tracks.hasOwnProperty(messageId)) {
                this.tracks[messageId] = {
                    downloaded,
                    duration: 0,
                    event: {
                        currentTime: 0,
                        currentTrack: 0,
                        progress: 0,
                        state: 'pause',
                    },
                    fileId,
                    fnQueue: [],
                    peerId,
                    userId,
                };
                this.playlist.push(messageId);
                if (this.playlist.length > 1) {
                    this.playlist.sort();
                }
            } else {
                this.tracks[messageId].downloaded = downloaded;
                this.tracks[messageId].peerId = peerId;
                this.tracks[messageId].fileId = fileId;
                this.tracks[messageId].userId = userId;
            }
        }
    }

    public clearPlaylist() {
        URL.revokeObjectURL(this.lastObjectUrl);
        this.tracks = {};
        this.playlist = [];
        // @ts-ignore
        this.audio = null;
    }

    /* Fast play rate */
    public fast(enable: boolean) {
        this.fastEnable = enable;
        if (this.fastEnable) {
            if (this.audio && !this.audio.paused) {
                this.audio.playbackRate = 2.0;
            } else if (this.audio) {
                this.audio.playbackRate = 1.0;
            }
        }
    }

    /* Play audio */
    public play(messageId: number) {
        // TODO: fix bad instant bug
        if (this.currentTrack !== messageId && messageId !== C_INSTANT_AUDIO) {
            URL.revokeObjectURL(this.lastObjectUrl);
            this.stop(this.currentTrack);
            this.prepareTrack(messageId);
        } else {
            if (!this.audio) {
                return false;
            }
            this.audio.play().then(() => {
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
                        this.next();
                    }
                };
            });
        }
        return true;
    }

    /* Pause audio */
    public pause(messageId: number) {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
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
    public next() {
        if (this.currentTrack > 0) {
            const index = this.playlist.indexOf(this.currentTrack);
            const nextIndex = index + 1;
            if (index > -1 && this.playlist.length > nextIndex) {
                if (this.tracks.hasOwnProperty(this.playlist[nextIndex]) && this.tracks[this.playlist[nextIndex]].downloaded) {
                    this.play(this.playlist[nextIndex]);
                }
            }
        }
    }

    /* Prev audio */
    public prev() {
        if (this.currentTrack > 0) {
            const index = this.playlist.indexOf(this.currentTrack);
            const prevIndex = index - 1;
            if (index > -1 && prevIndex >= 0) {
                if (this.tracks.hasOwnProperty(this.playlist[prevIndex]) && this.tracks[this.playlist[prevIndex]].downloaded) {
                    this.play(this.playlist[prevIndex]);
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
        if (!this.tracks.hasOwnProperty(messageId)) {
            this.tracks[messageId] = {
                downloaded: false,
                duration: 0,
                event: {
                    currentTime: 0,
                    currentTrack: 0,
                    progress: 0,
                    state: 'pause',
                },
                fileId: '',
                fnQueue: [],
                userId: '',
            };
            this.playlist.push(messageId);
            if (this.playlist.length > 1) {
                this.playlist.sort();
            }
        }
        this.tracks[messageId].fnQueue[this.fnIndex] = fn;
        fn(this.tracks[messageId].event);
        return () => {
            if (this.tracks.hasOwnProperty(messageId)) {
                delete this.tracks[messageId].fnQueue[this.fnIndex];
            }
        };
    }

    /* AudioPlayer global event listener */
    public globalListen(fn: (info: IAudioInfo, e: IAudioEvent) => void): (() => void) | null {
        this.fnIndex++;
        const index = this.fnIndex;
        this.listeners[index] = fn;
        return () => {
            if (this.listeners.hasOwnProperty(index)) {
                delete this.listeners[index];
            }
        };
    }

    /* AudioPlayer remove track */
    public remove(id: number) {
        if (this.tracks.hasOwnProperty(id)) {
            delete this.tracks[id];
        }
    }

    /* Get audio from database and prepare it for playing */
    private prepareTrack(messageId: number) {
        if (!this.tracks.hasOwnProperty(messageId)) {
            if (!this.backUpTracks.hasOwnProperty(messageId)) {
                this.copyFromBackup();
                this.prepareTrack(messageId);
            }
            return;
        }
        const fileId = this.tracks[messageId].fileId;
        this.fileRepo.get(fileId).then((res) => {
            if (res) {
                this.audio.src = URL.createObjectURL(res.data);
                this.lastObjectUrl = this.audio.src;
                this.audio.onloadedmetadata = (e) => {
                    if (this.tracks.hasOwnProperty(messageId)) {
                        this.tracks[messageId].duration = this.audio.duration;
                    }
                };
                this.audio.onloadeddata = (e) => {
                    this.currentTrack = messageId;
                    this.play(messageId);
                };
                this.audio.load();
            }
        });
    }

    /* Prepare instant audio */
    private prepareInstantAudio(blob: Blob, callback?: any) {
        this.audio.src = URL.createObjectURL(blob);
        this.audio.onloadedmetadata = () => {
            if (this.tracks.hasOwnProperty(C_INSTANT_AUDIO)) {
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
            }
            if (progress !== undefined) {
                this.tracks[messageId].event.progress = progress;
            }
            if (this.audio) {
                this.tracks[messageId].event.currentTime = this.audio.currentTime;
            }
            this.tracks[messageId].event.currentTrack = this.currentTrack;
            if (state === 'play') {
                this.playingFromPeerId = this.tracks[messageId].peerId;
            } else {
                this.playingFromPeerId = undefined;
            }
            this.callHandlers(messageId, this.tracks[messageId].event);
        }
    }

    /* Call registered handlers */
    private callHandlers(messageId: number, event: IAudioEvent) {
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
                    peerId: this.tracks[messageId].peerId,
                    userId: this.tracks[messageId].userId,
                }, event);
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
            this.tracks = this.backUpTracks;
            this.playlist = [];
            keys.forEach((i) => {
                this.playlist.push(i);
            });
            this.playlist.sort();
            this.backUpTracks = {};
        }
    }
}
