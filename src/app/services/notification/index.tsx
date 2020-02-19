/*
    Creation Time: 2018 - Nov - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as firebase from 'firebase';

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

    private constructor() {
        try {
            this.app = firebase.initializeApp({
                apiKey: "AIzaSyAxXaCNUveWAy2fxxv824mFe1n53sLUSL4",
                appId: "river.im",
                authDomain: "river-chat.firebaseapp.com",
                databaseURL: "https://river-chat.firebaseio.com",
                messagingSenderId: "1012919192766",
                projectId: "river-chat",
                storageBucket: "river-chat.appspot.com",
            });
        } catch (e) {
            window.console.debug(e);
        }

        if (firebase.messaging.isSupported()) {
            this.messaging = firebase.messaging(this.app);
            this.messaging.usePublicVapidKey('BFxf-8XLrMr4ebwFjejZh1j9vQGTlEnJ_S9_1-cZbvZKXedCQomb7oAEd_eYHKwJlc1iJ7yAvQ_eOSzN9UbFPKM');

            this.messaging.requestPermission().then(() => {
                window.console.warn('Notification permission granted.');
                // TODO(developer): Retrieve an Instance ID token for use with FCM.
                // ...
            }).catch((err) => {
                window.console.info('Unable to get permission to notify.', err);
            });

            this.messaging.onMessage((data) => {
                window.console.debug(data);
            });
        } else {
            // @ts-ignore
            if (window.Notification) {
                Notification.requestPermission();
            }
        }
    }

    public initToken(): Promise<any> {
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
                    reject(currentToken);
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
