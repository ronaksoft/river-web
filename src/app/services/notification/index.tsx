/*
    Creation Time: 2018 - Nov - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import firebase from 'firebase';
import ElectronService, {FCMCredentials} from "../electron";
import {C_LOCALSTORAGE} from "../sdk/const";

export default class NotificationService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationService();
        }

        return this.instance;
    }

    private static instance: NotificationService;
    private readonly app: firebase.app.App | undefined;
    private readonly messaging: firebase.messaging.Messaging | undefined;
    private electronService: ElectronService;
    private readonly useElectron: boolean = false;

    private constructor() {
        if (!window.Notification) {
            return;
        }
        this.electronService = ElectronService.getInstance();
        if (ElectronService.isElectron()) {
            this.useElectron = ElectronService.hasFCMSupport();
        } else {
            try {
                this.app = firebase.initializeApp({
                    apiKey: "AIzaSyASXB-kW-qY-JqEEe0L3uXzRRnxDHHQx-M",
                    appId: "1:1012919192766:web:8d7a9f9badcf9c341362ef",
                    authDomain: "river-chat.firebaseapp.com",
                    databaseURL: "https://river-chat.firebaseio.com",
                    measurementId: "G-3JG2S2R7LQ",
                    messagingSenderId: "1012919192766",
                    projectId: "river-chat",
                    storageBucket: "river-chat.appspot.com",
                });
            } catch (e) {
                window.console.debug(e);
            }

            if (firebase.messaging.isSupported()) {
                this.messaging = firebase.messaging(this.app);
                this.requestPermission();
                this.messaging.onMessage((data) => {
                    // window.console.debug(data);
                });
            } else {
                this.requestPermission();
            }
        }
    }

    public initToken(): Promise<any> {
        if (this.useElectron) {
            const fcmCredentials = localStorage.getItem(C_LOCALSTORAGE.FCMCredentials);
            let fcmCredentialsObj: FCMCredentials | undefined;
            if (fcmCredentials) {
                try {
                    fcmCredentialsObj = JSON.parse(fcmCredentials);
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            return this.electronService.initFCM(fcmCredentialsObj).then((res) => {
                localStorage.setItem(C_LOCALSTORAGE.FCMCredentials, JSON.stringify(res));
                return res?.fcm?.token;
            });
        } else {
            if (ElectronService.isElectron()) {
                return Promise.reject();
            }
            return new Promise((resolve, reject) => {
                if (!this.messaging) {
                    reject();
                    return;
                }
                this.messaging.getToken().then((currentToken) => {
                    if (currentToken) {
                        resolve(currentToken);
                        // sendTokenToServer(currentToken);
                        // updateUIForPushEnabled(currentToken);
                    } else {
                        // Show permission request.
                        // console.log('No Instance ID token available. Request permission to generate one.');
                        // Show permission UI.
                        // updateUIForPushPermissionRequired();
                        // setTokenSentToServer(false);
                        reject(null);
                    }
                }).catch((err) => {
                    window.console.debug('An error occurred while retrieving token. ', err);
                    // showToken('Error retrieving Instance ID token. ', err);
                    // setTokenSentToServer(false);
                    reject(err);
                });
            });
        }
    }

    private requestPermission() {
        if (!window.Notification) {
            return;
        }
        try {
            Notification.requestPermission().then(() => {
                window.console.warn('Notification permission granted.');
                // TODO(developer): Retrieve an Instance ID token for use with FCM.
                // ...
            }).catch((err) => {
                window.console.info('Unable to get permission to notify.', err);
            });
        } catch (e) {
            window.console.info('Unable to get permission to notify.', e);
        }
    }
}
