/*
    Creation Time: 2021 - Feb - 1
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import {merge} from "lodash";

interface IConfig {
    fftSize: number;
    intervalTimeout: number;
    maxVal?: number;
    minDecibels: number;
    sampleAmount: number;
    smoothingTimeConstant: number;
}

export default class VoiceActivityDetection {
    private audioContext: AudioContext | undefined;
    private audioAnalyserInterval: any;
    private audioStream: MediaStream | undefined;
    private activityFn: any = undefined;
    private active: boolean = false;
    private readonly config: IConfig = {
        fftSize: 128,
        intervalTimeout: 767,
        minDecibels: -70,
        sampleAmount: 10,
        smoothingTimeConstant: 0.3,
    };

    public constructor(config?: Partial<IConfig>) {
        if (config) {
            this.config = merge(this.config, config);
        }
    }

    public destroy(stopStream: boolean) {
        clearInterval(this.audioAnalyserInterval);
        if (this.audioStream && stopStream) {
            this.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        if (this.audioContext) {
            try {
                this.audioContext.close();
                this.audioContext = undefined;
            } catch (e) {
                window.console.log(e);
            }
        }
        this.active = false;
    }

    public setStream(stream: MediaStream, active: boolean) {
        this.audioStream = stream;
        this.active = active;
        return this.initAudioAnalyzer();
    }

    public setActive(active: boolean) {
        this.active = active;
    }

    public onActivity(fn: (val: number) => void) {
        this.activityFn = fn;
    }

    private initAudioAnalyzer() {
        if (!window.AudioContext) {
            return Promise.reject('no AudioContext');
        }
        const tracks = this.audioStream.getAudioTracks();
        if (tracks.length === 0) {
            return Promise.reject('no audio track');
        }
        if (this.audioAnalyserInterval) {
            clearInterval(this.audioAnalyserInterval);
        }
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        const audioAnalyser = this.audioContext.createAnalyser();
        audioAnalyser.minDecibels = this.config.minDecibels;
        audioAnalyser.fftSize = this.config.fftSize;
        audioAnalyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
        source.connect(audioAnalyser);
        const data = new Uint8Array(audioAnalyser.frequencyBinCount);
        const analyze = () => {
            if (!this.active) {
                return;
            }
            audioAnalyser.getByteFrequencyData(data);
            this.normalizeAnalyze(data);
        };
        this.audioAnalyserInterval = setInterval(analyze, this.config.intervalTimeout);
        analyze();
        return Promise.resolve();
    }

    private normalizeAnalyze(data: Uint8Array) {
        const t = this.config.sampleAmount;
        const len = data.length;
        const step = Math.floor(len / t);
        let val = 0;
        for (let i = 0; i < t; i++) {
            val += data[i * step];
        }
        val = val / t;
        if (this.config.maxVal) {
            val = Math.min(val, this.config.maxVal);
        }
        if (this.activityFn) {
            this.activityFn(val);
        }
    }
}
