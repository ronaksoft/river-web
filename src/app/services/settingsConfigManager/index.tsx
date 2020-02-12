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

export interface INotificationSettings {
    count_muted: boolean;
}

const downloadSettingsKey = 'river.settings.download';

const notificationSettingsKey = 'river.settings.notification';

const defaultDownloadValues: IDownloadSettings = {
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

const defaultNotificationValues: INotificationSettings = {
    count_muted: true,
};

export default class SettingsConfigManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SettingsConfigManager();
        }

        return this.instance;
    }

    private static instance: SettingsConfigManager;
    private downloadSettings: IDownloadSettings = Object.assign({}, defaultDownloadValues);
    private notificationSettings: INotificationSettings = Object.assign({}, defaultNotificationValues);

    private constructor() {
        this.getLocalStorageDownloadSettings();
        this.getLocalStorageNotificationSettings();
    }

    public getDownloadSettings() {
        return this.downloadSettings;
    }

    public setDownloadSettings(data: IDownloadSettings) {
        this.storeDownloadSettings(data);
    }

    public getNotificationSettings() {
        return this.notificationSettings;
    }

    public setNotificationSettings(data: INotificationSettings) {
        this.storeNotificationSettings(data);
    }

    private storeDownloadSettings(data: IDownloadSettings) {
        this.downloadSettings = kMerge(defaultDownloadValues, data);
        const serializedData = JSON.stringify(data);
        localStorage.setItem(downloadSettingsKey, serializedData);
    }

    private getLocalStorageDownloadSettings() {
        const serializedData = localStorage.getItem(downloadSettingsKey);
        if (serializedData) {
            this.downloadSettings = kMerge(defaultDownloadValues, JSON.parse(serializedData));
        } else {
            this.downloadSettings = Object.assign({}, defaultDownloadValues);
        }
    }

    private storeNotificationSettings(data: INotificationSettings) {
        this.notificationSettings = kMerge(defaultDownloadValues, data);
        const serializedData = JSON.stringify(data);
        localStorage.setItem(notificationSettingsKey, serializedData);
    }

    private getLocalStorageNotificationSettings() {
        const serializedData = localStorage.getItem(notificationSettingsKey);
        if (serializedData) {
            this.notificationSettings = kMerge(defaultNotificationValues, JSON.parse(serializedData));
        } else {
            this.notificationSettings = Object.assign({}, defaultNotificationValues);
        }
    }
}
