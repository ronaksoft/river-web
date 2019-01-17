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

interface IAudioItem {
    downloaded: boolean;
    duration: number;
    event: IAudioEvent;
    fileId: string;
    fnQueue: { [key: number]: any };
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
    private playlist: number[] = [];
    private currentTrack: number = 0;
    private playerInterval: any = null;
    private fileRepo: FileRepo;
    private lastObjectUrl: string = '';

    private constructor() {
        this.audio = document.createElement('audio');
        this.fileRepo = FileRepo.getInstance();
    }

    public setInstantVoice(blob: Blob, callback?: any) {
        this.prepareInstantAudio(blob, callback);
    }

    public addToPlaylist(messageId: number, fileId: string, downloaded: boolean) {
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
            };
            this.playlist.push(messageId);
            if (this.playlist.length > 1) {
                this.playlist.sort();
            }
        } else {
            this.tracks[messageId].downloaded = downloaded;
            this.tracks[messageId].fileId = fileId;
        }
    }

    public clearPlaylist() {
        URL.revokeObjectURL(this.lastObjectUrl);
        this.tracks = {};
        this.playlist = [];
        // @ts-ignore
        this.audio = null;
    }

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

    public pause(messageId: number) {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.setState(messageId, 'pause');
            this.stopPlayerInterval();
        }
    }

    public stop(messageId: number) {
        if (this.audio) {
            if (!this.audio.paused) {
                this.audio.pause();
            }
            this.setState(messageId, 'pause', 0);
            this.stopPlayerInterval();
        }
    }

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

    public remove(id: number) {
        if (this.tracks.hasOwnProperty(id)) {
            delete this.tracks[id];
        }
    }

    private prepareTrack(messageId: number) {
        if (!this.tracks.hasOwnProperty(messageId)) {
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
            this.callHandlers(messageId, this.tracks[messageId].event);
        }
    }

    private callHandlers(messageId: number, event: IAudioEvent) {
        if (!this.tracks.hasOwnProperty(messageId)) {
            return;
        }
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
}
