/*
    Creation Time: 2019 - April - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {merge} from 'lodash';

export interface IDownloadSettings {
    chat_photos: boolean;
    chat_videos: boolean;
    chat_voices: boolean;
    download_all: boolean;
    group_photos: boolean;
    group_videos: boolean;
    group_voices: boolean;
}

const downloadSettingsKey = 'river.settings.download';

const defaultValues: IDownloadSettings = {
    chat_photos: false,
    chat_videos: false,
    chat_voices: false,
    download_all: false,
    group_photos: false,
    group_videos: false,
    group_voices: false,
};

export default class DownloadManger {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DownloadManger();
        }

        return this.instance;
    }

    private static instance: DownloadManger;
    private downloadSettings: IDownloadSettings;

    private constructor() {
        this.getLocalStorageDownloadSettings();
    }

    public getDownloadSettings() {
        return this.downloadSettings;
    }

    public setDownloadSettings(data: IDownloadSettings) {
        this.storeDownloadSettings(data);
    }

    private storeDownloadSettings(data: IDownloadSettings) {
        this.downloadSettings = merge(defaultValues, data);
        const serializedData = JSON.stringify(data);
        localStorage.setItem(downloadSettingsKey, serializedData);
    }

    private getLocalStorageDownloadSettings() {
        const serializedData = localStorage.getItem(downloadSettingsKey);
        if (serializedData) {
            this.downloadSettings = merge(defaultValues, JSON.parse(serializedData));
        } else {
            this.downloadSettings = Object.assign({}, defaultValues);
        }
    }
}
