/*
    Creation Time: 2019 - April - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {kMerge} from "../utilities/kDash";

export interface IDownloadSettings {
    auto_save_files: boolean;
    chat_files: boolean;
    chat_photos: boolean;
    chat_videos: boolean;
    chat_voices: boolean;
    download_all: boolean;
    group_files: boolean;
    group_photos: boolean;
    group_videos: boolean;
    group_voices: boolean;
}

const downloadSettingsKey = 'river.settings.download';

const defaultValues: IDownloadSettings = {
    auto_save_files: true,
    chat_files: false,
    chat_photos: true,
    chat_videos: false,
    chat_voices: true,
    download_all: false,
    group_files: false,
    group_photos: true,
    group_videos: false,
    group_voices: false,
};

export default class DownloadManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DownloadManager();
        }

        return this.instance;
    }

    private static instance: DownloadManager;
    private downloadSettings: IDownloadSettings = Object.assign({}, defaultValues);

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
        this.downloadSettings = kMerge(defaultValues, data);
        const serializedData = JSON.stringify(data);
        localStorage.setItem(downloadSettingsKey, serializedData);
    }

    private getLocalStorageDownloadSettings() {
        const serializedData = localStorage.getItem(downloadSettingsKey);
        if (serializedData) {
            this.downloadSettings = kMerge(defaultValues, JSON.parse(serializedData));
        } else {
            this.downloadSettings = Object.assign({}, defaultValues);
        }
    }
}
